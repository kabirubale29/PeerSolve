-- ============================================================================
-- PEERSOLVE DATABASE SCHEMA
-- PostgreSQL with pgvector, Row Level Security, and Atomic Triggers
-- ============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Custom ENUM types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('junior', 'senior');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE question_status AS ENUM ('open', 'solved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE ai_review_status AS ENUM ('reviewed', 'needs_review', 'potential_issue', 'unavailable');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE vote_target_type AS ENUM ('question', 'answer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE vote_type AS ENUM ('up', 'down');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('pending', 'reviewed', 'resolved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    year INT NOT NULL CHECK (year >= 1 AND year <= 6),
    branch TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'junior',
    reputation INT NOT NULL DEFAULT 0,
    avatar_url TEXT,
    bio TEXT DEFAULT '',
    subjects TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. QUESTIONS Table
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT DEFAULT '',
    tags TEXT[] DEFAULT '{}',
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    status question_status NOT NULL DEFAULT 'open',
    views INT NOT NULL DEFAULT 0,
    upvote_count INT NOT NULL DEFAULT 0,
    downvote_count INT NOT NULL DEFAULT 0,
    embedding vector(768),
    related_question_ids UUID[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ANSWERS Table
CREATE TABLE IF NOT EXISTS answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    ai_status ai_review_status NOT NULL DEFAULT 'unavailable',
    ai_feedback TEXT DEFAULT '',
    is_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    upvote_count INT NOT NULL DEFAULT 0,
    downvote_count INT NOT NULL DEFAULT 0,
    report_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. VOTES Table (Enforces unique vote per user per target)
CREATE TABLE IF NOT EXISTS votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    target_type vote_target_type NOT NULL,
    target_id UUID NOT NULL,
    vote_type vote_type NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_vote UNIQUE (user_id, target_type, target_id)
);

-- 7. COMMENTS Table (Flat, lightweight clarification on answers)
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    answer_id UUID NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. REPORTS Table (Abuse prevention: 1 report per user per answer)
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    answer_id UUID NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
    reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    proof TEXT DEFAULT '',
    status report_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_report UNIQUE (reporter_id, answer_id)
);

-- 9. NOTIFICATIONS Table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT DEFAULT '',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. BADGES & USER_BADGES Tables
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_badge UNIQUE (user_id, badge_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);
CREATE INDEX IF NOT EXISTS idx_questions_status ON questions(status);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_user_id ON answers(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_target ON votes(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_comments_answer_id ON comments(answer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, is_read);

-- Vector index for pgvector cosine distance
CREATE INDEX IF NOT EXISTS idx_questions_embedding ON questions USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);

-- ============================================================================
-- ATOMIC REPUTATION & VOTE TRIGGERS (PostgreSQL Trigger Logic)
-- Reputation rules:
--   Question receives upvote: +2
--   Question receives downvote: 0 (or downvote not penalized on questions)
--   Answer receives upvote: +5
--   Answer receives downvote: -2
--   Answer is accepted: +25
-- ============================================================================

-- Function: Recalculate and update votes & reputation on vote change
CREATE OR REPLACE FUNCTION handle_vote_change()
RETURNS TRIGGER AS $$
DECLARE
    target_author_id UUID;
    is_author_vote BOOLEAN;
    rep_delta INT := 0;
    old_upvotes INT;
    old_downvotes INT;
BEGIN
    -- Determine target author and prevent self-voting at DB level
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        IF NEW.target_type = 'question' THEN
            SELECT user_id INTO target_author_id FROM questions WHERE id = NEW.target_id;
        ELSE
            SELECT user_id INTO target_author_id FROM answers WHERE id = NEW.target_id;
        END IF;

        IF target_author_id = NEW.user_id THEN
            RAISE EXCEPTION 'Users cannot vote on their own content';
        END IF;
    END IF;

    -- Calculate count deltas and reputation
    -- On INSERT:
    IF TG_OP = 'INSERT' THEN
        IF NEW.target_type = 'question' THEN
            IF NEW.vote_type = 'up' THEN
                UPDATE questions SET upvote_count = upvote_count + 1 WHERE id = NEW.target_id;
                UPDATE profiles SET reputation = reputation + 2 WHERE id = target_author_id;
            ELSE
                UPDATE questions SET downvote_count = downvote_count + 1 WHERE id = NEW.target_id;
            END IF;
        ELSE -- answer
            IF NEW.vote_type = 'up' THEN
                UPDATE answers SET upvote_count = upvote_count + 1 WHERE id = NEW.target_id;
                UPDATE profiles SET reputation = reputation + 5 WHERE id = target_author_id;
            ELSE
                UPDATE answers SET downvote_count = downvote_count + 1 WHERE id = NEW.target_id;
                UPDATE profiles SET reputation = GREATEST(0, reputation - 2) WHERE id = target_author_id;
            END IF;
        END IF;
        RETURN NEW;
    END IF;

    -- On UPDATE (flipped vote):
    IF TG_OP = 'UPDATE' THEN
        IF OLD.vote_type <> NEW.vote_type THEN
            IF NEW.target_type = 'question' THEN
                IF NEW.vote_type = 'up' THEN -- down -> up
                    UPDATE questions SET upvote_count = upvote_count + 1, downvote_count = GREATEST(0, downvote_count - 1) WHERE id = NEW.target_id;
                    UPDATE profiles SET reputation = reputation + 2 WHERE id = target_author_id;
                ELSE -- up -> down
                    UPDATE questions SET upvote_count = GREATEST(0, upvote_count - 1), downvote_count = downvote_count + 1 WHERE id = NEW.target_id;
                    UPDATE profiles SET reputation = GREATEST(0, reputation - 2) WHERE id = target_author_id;
                END IF;
            ELSE -- answer
                IF NEW.vote_type = 'up' THEN -- down -> up
                    UPDATE answers SET upvote_count = upvote_count + 1, downvote_count = GREATEST(0, downvote_count - 1) WHERE id = NEW.target_id;
                    UPDATE profiles SET reputation = reputation + 7 WHERE id = target_author_id; -- undo -2 and add +5
                ELSE -- up -> down
                    UPDATE answers SET upvote_count = GREATEST(0, upvote_count - 1), downvote_count = downvote_count + 1 WHERE id = NEW.target_id;
                    UPDATE profiles SET reputation = GREATEST(0, reputation - 7) WHERE id = target_author_id; -- undo +5 and add -2
                END IF;
            END IF;
        END IF;
        RETURN NEW;
    END IF;

    -- On DELETE (removed vote):
    IF TG_OP = 'DELETE' THEN
        IF OLD.target_type = 'question' THEN
            SELECT user_id INTO target_author_id FROM questions WHERE id = OLD.target_id;
            IF OLD.vote_type = 'up' THEN
                UPDATE questions SET upvote_count = GREATEST(0, upvote_count - 1) WHERE id = OLD.target_id;
                UPDATE profiles SET reputation = GREATEST(0, reputation - 2) WHERE id = target_author_id;
            ELSE
                UPDATE questions SET downvote_count = GREATEST(0, downvote_count - 1) WHERE id = OLD.target_id;
            END IF;
        ELSE -- answer
            SELECT user_id INTO target_author_id FROM answers WHERE id = OLD.target_id;
            IF OLD.vote_type = 'up' THEN
                UPDATE answers SET upvote_count = GREATEST(0, upvote_count - 1) WHERE id = OLD.target_id;
                UPDATE profiles SET reputation = GREATEST(0, reputation - 5) WHERE id = target_author_id;
            ELSE
                UPDATE answers SET downvote_count = GREATEST(0, downvote_count - 1) WHERE id = OLD.target_id;
                UPDATE profiles SET reputation = reputation + 2 WHERE id = target_author_id;
            END IF;
        END IF;
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_handle_vote_change ON votes;
CREATE TRIGGER trigger_handle_vote_change
AFTER INSERT OR UPDATE OR DELETE ON votes
FOR EACH ROW EXECUTE FUNCTION handle_vote_change();

-- Function: Handle Answer Accept & Reputation (+25)
CREATE OR REPLACE FUNCTION handle_answer_accepted()
RETURNS TRIGGER AS $$
DECLARE
    q_author_id UUID;
    q_title TEXT;
BEGIN
    SELECT user_id, title INTO q_author_id, q_title FROM questions WHERE id = NEW.question_id;

    -- Prevent self-accepting answer
    IF NEW.is_accepted = TRUE AND q_author_id = NEW.user_id THEN
        RAISE EXCEPTION 'You cannot accept your own answer to your own question';
    END IF;

    IF OLD.is_accepted = FALSE AND NEW.is_accepted = TRUE THEN
        -- Mark question as solved
        UPDATE questions SET status = 'solved', updated_at = NOW() WHERE id = NEW.question_id;
        -- Award +25 reputation to answerer
        UPDATE profiles SET reputation = reputation + 25 WHERE id = NEW.user_id;
        -- Create notification for answerer
        INSERT INTO notifications (user_id, type, message, link_url)
        VALUES (
            NEW.user_id,
            'accepted',
            'Your answer on "' || SUBSTRING(q_title, 1, 40) || '..." was accepted! (+25 Rep)',
            '/question/' || NEW.question_id
        );
    ELSIF OLD.is_accepted = TRUE AND NEW.is_accepted = FALSE THEN
        -- Mark question open
        UPDATE questions SET status = 'open', updated_at = NOW() WHERE id = NEW.question_id;
        -- Deduct 25 reputation
        UPDATE profiles SET reputation = GREATEST(0, reputation - 25) WHERE id = NEW.user_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_handle_answer_accepted ON answers;
CREATE TRIGGER trigger_handle_answer_accepted
AFTER UPDATE OF is_accepted ON answers
FOR EACH ROW EXECUTE FUNCTION handle_answer_accepted();

-- Function: Handle Report count and Under Review flag
CREATE OR REPLACE FUNCTION handle_report_inserted()
RETURNS TRIGGER AS $$
DECLARE
    ans_author_id UUID;
    q_id UUID;
    current_reports INT;
BEGIN
    SELECT user_id, question_id INTO ans_author_id, q_id FROM answers WHERE id = NEW.answer_id;

    UPDATE answers 
    SET report_count = report_count + 1 
    WHERE id = NEW.answer_id
    RETURNING report_count INTO current_reports;

    -- Notify answer author of report
    INSERT INTO notifications (user_id, type, message, link_url)
    VALUES (
        ans_author_id,
        'reported',
        'Your answer was reported by a community member for review. You can edit it if needed.',
        '/question/' || q_id
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_handle_report_inserted ON reports;
CREATE TRIGGER trigger_handle_report_inserted
AFTER INSERT ON reports
FOR EACH ROW EXECUTE FUNCTION handle_report_inserted();

-- ============================================================================
-- SIMILAR QUESTIONS RPC FUNCTION (pgvector Cosine Distance)
-- ============================================================================
CREATE OR REPLACE FUNCTION match_questions (
  query_embedding vector(768),
  match_threshold float DEFAULT 0.55,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  subject TEXT,
  status question_status,
  similarity float
)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    q.id,
    q.title,
    q.description,
    q.subject,
    q.status,
    (1 - (q.embedding <=> query_embedding))::float AS similarity
  FROM questions q
  WHERE q.embedding IS NOT NULL
    AND (1 - (q.embedding <=> query_embedding)) > match_threshold
  ORDER BY q.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can read all profiles; users can update only their own profile
CREATE POLICY "Public can view profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Questions: Public can read questions; authenticated users can insert; owners can update/delete
CREATE POLICY "Public can view questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create questions" ON questions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own questions" ON questions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own questions" ON questions FOR DELETE USING (auth.uid() = user_id);

-- Answers: Public can read answers; authenticated users can insert; owners can update/delete
CREATE POLICY "Public can view answers" ON answers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create answers" ON answers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own answers" ON answers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own answers" ON answers FOR DELETE USING (auth.uid() = user_id);

-- Votes: Public can read votes; users manage their own votes
CREATE POLICY "Public can view votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Users can insert own votes" ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own votes" ON votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own votes" ON votes FOR DELETE USING (auth.uid() = user_id);

-- Comments: Public can read comments; authenticated users insert; owners delete
CREATE POLICY "Public can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Reports: Authenticated users can insert reports; users can read own reports
CREATE POLICY "Users can insert reports" ON reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can view own reports" ON reports FOR SELECT USING (auth.uid() = reporter_id);

-- Notifications: Users can only see and update their own notifications
CREATE POLICY "Users view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Badges: Public can view badges and user_badges
CREATE POLICY "Public can view badges" ON badges FOR SELECT USING (true);
CREATE POLICY "Public can view user_badges" ON user_badges FOR SELECT USING (true);
