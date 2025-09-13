'use client';

import React from "react";
import { Info } from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';

interface HeaderProps {
  isDarkMode: boolean;
  onDarkModeToggle: (isDark: boolean) => void;
  onAboutClick: () => void;
}

export default function Header({ isDarkMode, onDarkModeToggle, onAboutClick }: HeaderProps) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <header className={`flex justify-between items-center p-4 md:p-6 shadow-lg sticky top-0 z-50 transition-all duration-200 ${
      isDarkMode 
        ? 'bg-gray-900 text-white border-b border-gray-700' 
        : 'bg-white text-gray-900 border-b border-gray-200'
    }`}>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold" style={{ color: '#2C3E50' }}>
              AI Daily Learning Queue
            </h1>
            <p className={`text-xs md:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Intelligent Content Curation
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <span className={`hidden md:block text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {today}
        </span>
        <button
          onClick={onAboutClick}
          className={`p-2 rounded-lg transition-all duration-200 hover:scale-105 ${
            isDarkMode
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
          aria-label="About this dashboard"
        >
          <Info className="w-5 h-5" />
        </button>
        <DarkModeToggle isDarkMode={isDarkMode} onToggle={onDarkModeToggle} />
      </div>
    </header>
  );
}
