'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import Card from '@/components/Card';
import FiltersBar, { FilterState } from '@/components/FiltersBar';
import Analytics from '@/components/Analytics';
import AboutModal from '@/components/AboutModal';
import SearchBar from '@/components/SearchBar';
import ItemDetailModal from '@/components/ItemDetailModal';
import RecommendationsEngine from '@/components/RecommendationsEngine';
import LearningStreaks from '@/components/LearningStreaks';
import ExportShare from '@/components/ExportShare';
import SavedViews from '@/components/SavedViews';
import { useDarkMode } from '@/components/DarkModeToggle';

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
  link: string | null;
}

export default function HomePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isItemDetailModalOpen, setIsItemDetailModalOpen] = useState(false);
  const [bookmarkedItems, setBookmarkedItems] = useState<Set<string>>(new Set());
  const [consumedItemIds, setConsumedItemIds] = useState<string[]>([]);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('ai-dashboard-bookmarks');
    if (savedBookmarks) {
      setBookmarkedItems(new Set(JSON.parse(savedBookmarks)));
    }
  }, []);

  // Save bookmarks to localStorage whenever bookmarks change
  useEffect(() => {
    localStorage.setItem('ai-dashboard-bookmarks', JSON.stringify(Array.from(bookmarkedItems)));
  }, [bookmarkedItems]);
  
  // Dark mode state
  const { isDarkMode, setIsDarkMode } = useDarkMode();
  
  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    sourceType: '',
    tags: [],
    hideConsumed: false,
    sortBy: 'score',
    showBookmarked: false
  });

  // Fetch data from API
  useEffect(() => {
    async function fetchItems() {
      try {
        setLoading(true);
        const response = await fetch('/api/notion');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch items: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Handle both array response and object with items property
        let itemsArray;
        if (Array.isArray(data)) {
          itemsArray = data;
        } else if (data.items && Array.isArray(data.items)) {
          itemsArray = data.items;
        } else {
          console.error('API did not return valid data:', data);
          itemsArray = [];
        }
        
        setItems(itemsArray);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  // Get unique tags from all items
  const availableTags = useMemo(() => {
    const allTags = items.flatMap(item => item.tags || []);
    return [...new Set(allTags)].sort();
  }, [items]);

  // Get unique source types from all items
  const availableSourceTypes = useMemo(() => {
    const allSourceTypes = items.map(item => item.sourceType || '');
    return [...new Set(allSourceTypes)].filter(type => type).sort();
  }, [items]);

  // Apply filters,  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter(item => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          item.title.toLowerCase().includes(query) ||
          item.summary.toLowerCase().includes(query) ||
          item.whyItMatters.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Source type filter
      if (filters.sourceType && item.sourceType !== filters.sourceType) {
        return false;
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => 
          item.tags.includes(tag)
        );
        if (!hasMatchingTag) return false;
      }

      // Hide consumed filter
      if (filters.hideConsumed && item.consumed) {
        return false;
      }

      // Show bookmarked filter
      if (filters.showBookmarked && !bookmarkedItems.has(item.id)) {
        return false;
      }

      return true;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'score':
          // Handle null scores - put them at the end
          if (a.score === null && b.score === null) return 0;
          if (a.score === null) return 1;
          if (b.score === null) return -1;
          return b.score - a.score; // Highest to lowest
          
        case 'estimatedTime':
          // Handle null times - put them at the end
          if (a.estimatedTime === null && b.estimatedTime === null) return 0;
          if (a.estimatedTime === null) return 1;
          if (b.estimatedTime === null) return -1;
          return a.estimatedTime - b.estimatedTime; // Shortest to longest
          
        case 'dateAdded':
          // Handle null dates - put them at the end
          if (!a.dateAdded && !b.dateAdded) return 0;
          if (!a.dateAdded) return 1;
          if (!b.dateAdded) return -1;
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(); // Newest to oldest
          
        default:
          return 0;
      }
    });

    return filtered;
  }, [items, filters, searchQuery]);

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleDarkModeToggle = (isDark: boolean) => {
    setIsDarkMode(isDark);
  };

  const handleAboutClick = () => {
    setIsAboutModalOpen(true);
  };

  const handleItemClick = (item: Item) => {
    setSelectedItem(item);
    setIsItemDetailModalOpen(true);
  };

  const handleCardClick = (item: Item) => {
    setSelectedItem(item);
    setIsItemDetailModalOpen(true);
  };

  const handleToggleConsumed = (itemId: string, consumed: boolean) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, consumed } : item
      )
    );
    
    // Update consumed items list for streaks
    setConsumedItemIds(prev => {
      if (consumed && !prev.includes(itemId)) {
        return [...prev, itemId];
      } else if (!consumed) {
        return prev.filter(id => id !== itemId);
      }
      return prev;
    });
  };

  const handleToggleBookmark = (itemId: string) => {
    setBookmarkedItems(prev => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(itemId)) {
        newBookmarks.delete(itemId);
      } else {
        newBookmarks.add(itemId);
      }
      return newBookmarks;
    });
  };

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors duration-200 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
      }`}>
        <Header 
          isDarkMode={isDarkMode}
          onDarkModeToggle={handleDarkModeToggle}
          onAboutClick={handleAboutClick}
        />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className={`ml-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Loading items...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen transition-colors duration-200 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
      }`}>
        <Header 
          isDarkMode={isDarkMode}
          onDarkModeToggle={handleDarkModeToggle}
          onAboutClick={handleAboutClick}
        />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className={`border rounded-lg p-4 ${
            isDarkMode 
              ? 'bg-red-900/20 border-red-800 text-red-200' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <h3 className="font-medium">Error loading items</h3>
            <p className="mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
    }`}>
      <Header 
        isDarkMode={isDarkMode}
        onDarkModeToggle={handleDarkModeToggle}
        onAboutClick={handleAboutClick}
      />
      
      <FiltersBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        availableTags={availableTags}
        availableSourceTypes={availableSourceTypes}
        itemCount={filteredAndSortedItems.length}
        totalCount={items.length}
        isDarkMode={isDarkMode}
      />

      {/* Analytics Section */}
      <div className="mb-8">
        <Analytics 
          items={filteredAndSortedItems} 
          isDarkMode={isDarkMode}
        />
      </div>

      {/* AI Recommendations */}
      <div className="mb-8">
        <RecommendationsEngine
          items={items}
          bookmarkedItems={bookmarkedItems}
          consumedItems={consumedItemIds}
          isDarkMode={isDarkMode}
          onItemClick={handleItemClick}
        />
      </div>

      {/* Learning Streaks & Gamification */}
      <div className="mb-8">
        <LearningStreaks
          consumedItems={consumedItemIds}
          bookmarkedItems={bookmarkedItems}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Saved Views */}
      <div className="mb-8">
        <SavedViews
          currentFilters={filters}
          onApplyFilters={setFilters}
          isDarkMode={isDarkMode}
        />
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Export & Share */}
        <div className="mb-6 flex justify-end">
          <ExportShare
            items={items}
            bookmarkedItems={bookmarkedItems}
            isDarkMode={isDarkMode}
          />
        </div>

        {filteredAndSortedItems.length === 0 ? (
          <div className={`text-center py-12 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <div className={`text-lg mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {items.length === 0 ? 'No items found' : 'No items match your current filters'}
            </div>
            {items.length > 0 && (
              <button
                onClick={() => {
                  setFilters({
                    sourceType: '',
                    tags: [],
                    hideConsumed: false,
                    sortBy: 'score',
                    showBookmarked: false
                  });
                  setSearchQuery('');
                }}
                className="text-blue-500 hover:text-blue-600 text-sm underline transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedItems.map((item) => (
              <Card
                key={item.id}
                {...item}
                isDarkMode={isDarkMode}
                isBookmarked={bookmarkedItems.has(item.id)}
                onToggleBookmark={handleToggleBookmark}
                onClick={() => {
                  setSelectedItem(item);
                  setIsItemDetailModalOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </main>

      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        isDarkMode={isDarkMode}
      />

      <ItemDetailModal
        item={selectedItem}
        isOpen={isItemDetailModalOpen}
        onClose={() => {
          setIsItemDetailModalOpen(false);
          setSelectedItem(null);
        }}
        isDarkMode={isDarkMode}
        externalUrl={selectedItem?.link || undefined}
        onToggleConsumed={handleToggleConsumed}
        isBookmarked={selectedItem ? bookmarkedItems.has(selectedItem.id) : false}
        onToggleBookmark={handleToggleBookmark}
      />
    </div>
  );
}