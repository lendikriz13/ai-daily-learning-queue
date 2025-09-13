'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Filter, X, Check, Bookmark } from 'lucide-react';


export interface FilterState {
  sourceType: string;
  tags: string[];
  hideConsumed: boolean;
  sortBy: 'score' | 'estimatedTime' | 'dateAdded';
  showBookmarked: boolean;
}

interface FiltersBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableTags: string[];
  availableSourceTypes: string[];
  itemCount: number;
  totalCount: number;
}

interface ExtendedFiltersBarProps extends FiltersBarProps {
  isDarkMode: boolean;
}

export default function FiltersBar({ 
  filters, 
  onFiltersChange, 
  availableTags, 
  availableSourceTypes,
  itemCount, 
  totalCount,
  isDarkMode 
}: ExtendedFiltersBarProps) {
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [isSourceTypeOpen, setIsSourceTypeOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  
  const tagsRef = useRef<HTMLDivElement>(null);
  const sourceTypeRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  const sourceTypes = ['All', ...availableSourceTypes];
  const sortOptions = [
    { value: 'score', label: 'Score (High → Low)' },
    { value: 'estimatedTime', label: 'Time (Short → Long)' },
    { value: 'dateAdded', label: 'Date Added (New → Old)' }
  ];

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (tagsRef.current && !tagsRef.current.contains(event.target as Node)) {
        setIsTagsOpen(false);
      }
      if (sourceTypeRef.current && !sourceTypeRef.current.contains(event.target as Node)) {
        setIsSourceTypeOpen(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSourceTypeChange = (sourceType: string) => {
    onFiltersChange({
      ...filters,
      sourceType: sourceType === 'All' ? '' : sourceType
    });
    setIsSourceTypeOpen(false);
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    
    onFiltersChange({
      ...filters,
      tags: newTags
    });
  };

  const handleHideConsumedToggle = () => {
    onFiltersChange({
      ...filters,
      hideConsumed: !filters.hideConsumed
    });
  };

  const handleSortChange = (sortBy: 'score' | 'estimatedTime' | 'dateAdded') => {
    onFiltersChange({
      ...filters,
      sortBy
    });
    setIsSortOpen(false);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      sourceType: '',
      tags: [],
      hideConsumed: false,
      sortBy: 'score',
      showBookmarked: false
    });
  };

  const hasActiveFilters = filters.sourceType !== '' || filters.tags.length > 0 || filters.hideConsumed || filters.showBookmarked;

  const brandColors = {
    primary: '#2C3E50',
    secondary: '#5DADE2',
    accent: '#F8F9FA'
  };

  return (
    <div className={`border-b px-4 py-4 sticky top-16 z-40 backdrop-blur-sm transition-all duration-200 ${
      isDarkMode 
        ? 'bg-gray-900/95 border-gray-700' 
        : 'bg-white/95 border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header with filter icon and results count */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Filter className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            <span className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Filters
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm px-3 py-1 rounded-full transition-all duration-200 hover:scale-105"
                style={{ 
                  backgroundColor: brandColors.secondary + '20',
                  color: brandColors.secondary 
                }}
              >
                <X className="w-3 h-3 inline mr-1" />
                Clear all
              </button>
            )}
          </div>
          <div className={`text-sm font-medium px-3 py-1 rounded-full ${
            isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
          }`}>
            {itemCount} of {totalCount} items
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Source Type Filter */}
          <div className="relative" ref={sourceTypeRef}>
            <button
              onClick={() => setIsSourceTypeOpen(!isSourceTypeOpen)}
              className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <span className="text-sm text-gray-700 truncate">
                {filters.sourceType || 'All Sources'}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isSourceTypeOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isSourceTypeOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {sourceTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleSourceTypeChange(type)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tags Filter */}
          <div className="relative" ref={tagsRef}>
            <button
              onClick={() => setIsTagsOpen(!isTagsOpen)}
              className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <span className="text-sm text-gray-700 truncate">
                {filters.tags.length === 0 
                  ? 'All Tags' 
                  : filters.tags.length === 1 
                    ? filters.tags[0]
                    : `${filters.tags.length} tags selected`
                }
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isTagsOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isTagsOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {availableTags.map((tag) => (
                  <label
                    key={tag}
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-lg last:rounded-b-lg"
                  >
                    <input
                      type="checkbox"
                      checked={filters.tags.includes(tag)}
                      onChange={() => handleTagToggle(tag)}
                      className="sr-only"
                    />
                    <div className="flex items-center justify-between w-full">
                      <span>{tag}</span>
                      {filters.tags.includes(tag) && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                  </label>
                ))}
                {availableTags.length === 0 && (
                  <div className="px-3 py-2 text-sm text-gray-500">No tags available</div>
                )}
              </div>
            )}
          </div>

          {/* Hide Consumed Toggle */}
          <div>
            <label className={`flex items-center px-3 py-2 border rounded-lg shadow-sm hover:bg-gray-50 cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-600 hover:bg-gray-700' 
                : 'bg-white border-gray-300'
            }`}>
              <input
                type="checkbox"
                checked={filters.hideConsumed}
                onChange={handleHideConsumedToggle}
                className="sr-only"
              />
              <div className={`w-4 h-4 border-2 rounded mr-2 flex items-center justify-center ${
                filters.hideConsumed 
                  ? 'bg-blue-600 border-blue-600' 
                  : isDarkMode ? 'border-gray-400' : 'border-gray-300'
              }`}>
                {filters.hideConsumed && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Hide Consumed</span>
            </label>
          </div>

          {/* Show Bookmarked Toggle */}
          <div>
            <label className={`flex items-center px-3 py-2 border rounded-lg shadow-sm hover:bg-gray-50 cursor-pointer focus-within:ring-2 focus-within:ring-yellow-500 focus-within:border-transparent ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-600 hover:bg-gray-700' 
                : 'bg-white border-gray-300'
            }`}>
              <input
                type="checkbox"
                checked={filters.showBookmarked}
                onChange={() => onFiltersChange({ ...filters, showBookmarked: !filters.showBookmarked })}
                className="sr-only"
              />
              <div className={`w-4 h-4 border-2 rounded mr-2 flex items-center justify-center ${
                filters.showBookmarked 
                  ? 'bg-yellow-500 border-yellow-500' 
                  : isDarkMode ? 'border-gray-400' : 'border-gray-300'
              }`}>
                {filters.showBookmarked && (
                  <Bookmark className="w-3 h-3 text-white fill-current" />
                )}
              </div>
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Show Bookmarked</span>
            </label>
          </div>

          {/* Sort By Filter */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <span className="text-sm text-gray-700 truncate">
                Sort: {sortOptions.find(opt => opt.value === filters.sortBy)?.label.split(' ')[0]}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isSortOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value as 'score' | 'estimatedTime' | 'dateAdded')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-3">
            {filters.sourceType && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                Source: {filters.sourceType}
                <button
                  onClick={() => onFiltersChange({ ...filters, sourceType: '' })}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
              >
                {tag}
                <button
                  onClick={() => handleTagToggle(tag)}
                  className="hover:bg-green-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {filters.hideConsumed && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                Hide Consumed
                <button
                  onClick={handleHideConsumedToggle}
                  className="hover:bg-purple-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.showBookmarked && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                Show Bookmarked
                <button
                  onClick={() => onFiltersChange({ ...filters, showBookmarked: false })}
                  className="hover:bg-yellow-200 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}