'use client';

import React, { useState } from "react";
import { Clock, Star, Calendar, ExternalLink, Check, Circle, Bookmark, CheckCircle2 } from 'lucide-react';

interface CardProps {
  id: string;
  title: string;
  sourceType: string;
  summary: string;
  whyItMatters: string;
  tags: string[];
  score: number | null;
  estimatedTime: number | null;
  consumed: boolean;
  dateAdded: string | null;
  publicationDate: string | null;
  isDarkMode?: boolean;
  onClick?: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
}

export default function Card({
  id,
  title,
  sourceType,
  summary,
  whyItMatters,
  tags,
  score,
  estimatedTime,
  consumed,
  dateAdded,
  publicationDate,
  isDarkMode = false,
  onClick,
  isBookmarked = false,
  onToggleBookmark,
}: CardProps) {
  const [isConsumed, setIsConsumed] = useState(consumed);
  const [isHovered, setIsHovered] = useState(false);

  const brandColors = {
    primary: '#2C3E50',
    secondary: '#5DADE2',
    accent: '#F8F9FA'
  };

  const handleToggleConsumed = () => {
    setIsConsumed(!isConsumed);
    // TODO: Sync with Notion API when ready
  };

  const getSourceTypeColor = (type: string) => {
    const colors = {
      'News': 'bg-red-100 text-red-700 border-red-200',
      'Research': 'bg-purple-100 text-purple-700 border-purple-200',
      'Blog': 'bg-green-100 text-green-700 border-green-200',
      'Podcast': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Video': 'bg-blue-100 text-blue-700 border-blue-200',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const cardClass = `group relative rounded-xl border-2 transition-all duration-300 cursor-pointer ${
    isDarkMode 
      ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
      : 'bg-white border-gray-200 hover:border-gray-300'
  } ${isHovered ? 'shadow-2xl transform -translate-y-1' : 'shadow-lg'} ${
    isConsumed ? 'opacity-75' : ''
  }`;

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent modal opening when clicking action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onClick?.();
  };

  return (
    <div 
      className={cardClass}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Consumed Status Overlay */}
      {isConsumed && (
        <div className="absolute top-3 right-3 z-10">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className={`text-lg font-bold leading-tight mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            } ${isConsumed ? 'line-through' : ''}`}>
              {title}
            </h3>
            <span className={`inline-block text-xs px-3 py-1 rounded-full border font-medium ${
              isDarkMode ? 'bg-gray-700 text-gray-300 border-gray-600' : getSourceTypeColor(sourceType)
            }`}>
              {sourceType}
            </span>
          </div>
        </div>

        {/* Summary */}
        <p className={`text-sm leading-relaxed mb-3 ${
          isDarkMode ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {summary}
        </p>

        {/* Why It Matters */}
        <div className={`p-3 rounded-lg mb-4 border-l-4 ${
          isDarkMode 
            ? 'bg-gray-700/50 border-l-blue-400' 
            : 'bg-blue-50 border-l-blue-400'
        }`}>
          <p className={`text-xs font-medium mb-1 ${
            isDarkMode ? 'text-blue-300' : 'text-blue-700'
          }`}>
            Why It Matters
          </p>
          <p className={`text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {whyItMatters}
          </p>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => (
              <span
                key={tag}
                className={`text-xs px-2 py-1 rounded-md font-medium ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300' 
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            {/* Score */}
            <div className="flex items-center space-x-1">
              <Star className={`w-4 h-4 ${
                score && score >= 7 ? 'text-yellow-500 fill-current' : 
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <span className={`text-sm font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {score ?? 'N/A'}
              </span>
            </div>

            {/* Estimated Time */}
            <div className="flex items-center space-x-1">
              <Clock className={`w-4 h-4 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} />
              <span className={`text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {estimatedTime ?? '?'}m
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggleBookmark?.(id)}
              className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                isBookmarked 
                  ? 'text-yellow-500 hover:bg-yellow-100 dark:hover:bg-yellow-900/20' 
                  : isDarkMode 
                    ? 'text-gray-400 hover:text-yellow-400 hover:bg-gray-700' 
                    : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100'
              }`}
              title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={handleToggleConsumed}
              className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                isConsumed 
                  ? 'text-green-500 hover:bg-green-100 dark:hover:bg-green-900/20' 
                  : isDarkMode 
                    ? 'text-gray-400 hover:text-green-400 hover:bg-gray-700' 
                    : 'text-gray-400 hover:text-green-500 hover:bg-gray-100'
              }`}
              title={isConsumed ? 'Mark as unread' : 'Mark as consumed'}
            >
              {isConsumed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
            </button>

            <button
              className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-700' 
                  : 'text-gray-400 hover:text-blue-500 hover:bg-gray-100'
              }`}
              title="Open external link"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Hover Gradient Border */}
      <div className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none ${
        isHovered ? 'opacity-20' : ''
      }`} />
    </div>
  );
}
