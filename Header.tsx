
import React, { useState } from 'react';
import { AppMode, UserProfile } from '../types';

interface HeaderProps {
  onTitleClick: () => void;
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
  onLogout: () => void;
  user: UserProfile | null;
}

const Header: React.FC<HeaderProps> = ({ onTitleClick, currentMode, setMode, onLogout, user }) => {
  const [clickCount, setClickCount] = useState(0);

  const handleTitleClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 5) {
      onTitleClick();
      setClickCount(0);
    }
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 glass sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-xl font-black text-white shadow-lg shadow-purple-900/40">
          غ
        </div>
        <h1 
          className="text-xl font-extrabold tracking-tight cursor-pointer select-none bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400"
          onClick={handleTitleClick}
        >
          غيث الموريتاني
        </h1>
      </div>

      {user && (
        <div className="flex items-center gap-2">
          {user.isSubscribed && (
            <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/20">
              مـشترك
            </span>
          )}
          <button 
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
            title="تسجيل الخروج"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
