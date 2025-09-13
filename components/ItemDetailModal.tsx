'use client';

import { useState, useEffect } from 'react';
import { X, Star, Clock, Calendar, ExternalLink, Edit3, Save, CheckCircle2, Circle, Bookmark, Tag } from 'lucide-react';

interface Item {
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
}

interface ItemDetailModalProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  externalUrl?: string;
  onToggleConsumed?: (itemId: string, consumed: boolean) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (itemId: string) => void;
}

export default function ItemDetailModal({ 
  item, 
  isOpen, 
  onClose, 
  isDarkMode, 
  externalUrl,
  onToggleConsumed,
  isBookmarked = false,
  onToggleBookmark
}: ItemDetailModalProps) {
  const [notes, setNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isConsumed, setIsConsumed] = useState(false);

  // Load notes from localStorage when item changes
  useEffect(() => {
    if (item) {
      const savedNotes = localStorage.getItem(`notes-${item.id}`);
      setNotes(savedNotes || '');
      setIsConsumed(item.consumed);
    }
  }, [item]);

  // Save notes to localStorage
  const saveNotes = () => {
    if (item) {
      localStorage.setItem(`notes-${item.id}`, notes);
      setIsEditingNotes(false);
      // Auto-bookmark when notes are added
      if (notes.trim() && !isBookmarked) {
        onToggleBookmark?.(item.id);
      }
    }
  };

  const handleToggleConsumed = () => {
    if (item) {
      const newConsumedState = !isConsumed;
      setIsConsumed(newConsumedState);
      onToggleConsumed?.(item.id, newConsumedState);
    }
  };

  const handleExternalLinkClick = () => {
    if (externalUrl) {
      window.open(externalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const getButtonText = (sourceType: string) => {
    const buttonTexts = {
      'News': 'Read Full Article',
      'Research': 'Read Full Paper',
      'Blog': 'Read Full Post',
      'Podcast': 'Listen to Full Episode',
      'Video': 'Watch Full Video',
    };
    return buttonTexts[sourceType as keyof typeof buttonTexts] || 'View Full Content';
  };

  const getSourceTypeColor = (type: string) => {
    const colors = {
      'News': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
      'Research': 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
      'Blog': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
      'Podcast': 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
      'Video': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
      <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`sticky top-0 z-10 px-6 py-4 border-b backdrop-blur-sm ${
          isDarkMode 
            ? 'bg-gray-800/95 border-gray-700' 
            : 'bg-white/95 border-gray-200'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-3 mb-2">
                <span className={`inline-block text-xs px-3 py-1 rounded-full border font-medium ${getSourceTypeColor(item.sourceType)}`}>
                  {item.sourceType}
                </span>
                {isConsumed && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full dark:bg-green-900/20 dark:text-green-300">
                    <CheckCircle2 className="w-3 h-3" />
                    Completed
                  </span>
                )}
              </div>
              <h1 className={`text-2xl font-bold leading-tight ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              } ${isConsumed ? 'line-through opacity-75' : ''}`}>
                {item.title}
              </h1>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 pb-8 space-y-6">
            {/* Metadata Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Star className={`w-4 h-4 ${
                  item.score && item.score >= 7 ? 'text-yellow-500 fill-current' : 
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Score: {item.score ?? 'N/A'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {item.estimatedTime ?? '?'} min read
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Added: {formatDate(item.dateAdded)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Published: {formatDate(item.publicationDate)}
                </span>
              </div>
            </div>

            {/* Tags */}
            {item.tags.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Tag className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tags
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        isDarkMode 
                          ? 'bg-gray-700 text-gray-300' 
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            <div>
              <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Summary
              </h3>
              <p className={`text-base leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {item.summary}
              </p>
            </div>

            {/* Why It Matters */}
            <div className={`p-4 rounded-lg border-l-4 border-l-blue-400 ${
              isDarkMode 
                ? 'bg-gray-700/50' 
                : 'bg-blue-50'
            }`}>
              <h3 className={`text-lg font-semibold mb-3 ${
                isDarkMode ? 'text-blue-300' : 'text-blue-700'
              }`}>
                Why It Matters
              </h3>
              <p className={`text-base leading-relaxed ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {item.whyItMatters}
              </p>
            </div>

            {/* Notes Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Personal Notes
                </h3>
                {!isEditingNotes ? (
                  <button
                    onClick={() => setIsEditingNotes(true)}
                    className={`flex items-center gap-2 px-3 py-1 text-sm rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'text-blue-400 hover:bg-gray-700' 
                        : 'text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <Edit3 className="w-4 h-4" />
                    {notes ? 'Edit' : 'Add Notes'}
                  </button>
                ) : (
                  <button
                    onClick={saveNotes}
                    className={`flex items-center gap-2 px-3 py-1 text-sm rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'text-green-400 hover:bg-gray-700' 
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                )}
              </div>
              
              {isEditingNotes ? (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your thoughts, insights, or key takeaways..."
                  className={`w-full h-32 p-3 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                  autoFocus
                />
              ) : (
                <div className={`p-3 rounded-lg border min-h-[80px] ${
                  isDarkMode 
                    ? 'bg-gray-700/50 border-gray-600 text-gray-300' 
                    : 'bg-gray-50 border-gray-200 text-gray-700'
                }`}>
                  {notes || (
                    <span className={`italic ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      No notes yet. Click "Add Notes" to capture your thoughts.
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`sticky bottom-0 px-6 py-4 border-t backdrop-blur-sm ${
          isDarkMode 
            ? 'bg-gray-800/95 border-gray-700' 
            : 'bg-white/95 border-gray-200'
        }`}>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => onToggleBookmark?.(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isBookmarked 
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:hover:bg-yellow-900/30' 
                  : isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              {isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}
            </button>

            <button
              onClick={handleToggleConsumed}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isConsumed 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-300 dark:hover:bg-green-900/30' 
                  : isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isConsumed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
              {isConsumed ? 'Mark as Unread' : 'Mark as Consumed'}
            </button>

            {externalUrl && (
              <button
                onClick={handleExternalLinkClick}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                {getButtonText(item.sourceType)}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
