import React from 'react';
import { Link } from 'react-router-dom';

export default function BrandLogo({ size = 'md', showTagline = false, linkTo = '/' }) {
  const iconSize = size === 'lg' ? 'w-11 h-11' : size === 'sm' ? 'w-8 h-8' : 'w-9 h-9';
  const textSize = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-lg' : 'text-xl';

  const logoContent = (
    <div className="flex items-center gap-2.5 group select-none">
      {/* Stylized P Logo Icon matching Image 3 */}
      <div className={`${iconSize} rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center text-white shadow-md shadow-amber-600/20 group-hover:scale-105 transition-transform flex-shrink-0 relative overflow-hidden`}>
        {/* SVG stylized P with lightbulb & book */}
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-1.5">
          {/* Outer P stalk with book curve */}
          <path
            d="M12 8C12 6.89543 12.8954 6 14 6H28C34.6274 6 40 11.3726 40 18C40 24.6274 34.6274 30 28 30H20V40C20 41.1046 19.1046 42 18 42H14C12.8954 42 12 41.1046 12 40V8Z"
            fill="#1E1B18"
          />
          {/* Inner speech bubble / lightbulb circle */}
          <circle cx="28" cy="18" r="7" fill="#FFFDF8" />
          {/* Lightbulb bulb */}
          <path
            d="M28 14C26.3431 14 25 15.3431 25 17C25 18.15 25.65 19.15 26.6 19.65V20.5C26.6 20.78 26.82 21 27.1 21H28.9C29.18 21 29.4 20.78 29.4 20.5V19.65C30.35 19.15 31 18.15 31 17C31 15.3431 29.6569 14 28 14Z"
            fill="#D97706"
          />
          {/* Open Book curve highlight */}
          <path
            d="M12 28C14.5 28 18 30 20 33V42C17.5 39 14 38 12 38V28Z"
            fill="#F59E0B"
          />
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col">
        <span className={`font-serif font-extrabold tracking-tight text-slate-900 leading-none ${textSize}`}>
          Peer<span className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 bg-clip-text text-transparent font-serif">Solve</span>
        </span>
        {showTagline && (
          <span className="text-[10px] text-slate-500 font-medium tracking-wide mt-0.5">
            Ask. Answer. Learn Together.
          </span>
        )}
      </div>
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo}>{logoContent}</Link>;
  }
  return logoContent;
}
