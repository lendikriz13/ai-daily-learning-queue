'use client';

import { useState, useEffect, useMemo } from 'react';
import { Sparkles, TrendingUp, Clock, Star, BookOpen, Target } from 'lucide-react';

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

interface RecommendationsEngineProps {
  items: Item[];
  bookmarkedItems: Set<string>;
  consumedItems: string[];
  isDarkMode: boolean;
  onItemClick: (item: Item) => void;
}

interface Recommendation {
  item: Item;
  reason: string;
  confidence: number;
  category: 'trending' | 'personalized' | 'quick_wins' | 'deep_dive';
}

export default function RecommendationsEngine({
  items,
  bookmarkedItems,
  consumedItems,
  isDarkMode,
  onItemClick
}: RecommendationsEngineProps) {
  const [userPreferences, setUserPreferences] = useState({
    preferredTags: [] as string[],
    preferredSourceTypes: [] as string[],
    preferredTimeRange: 'medium' as 'short' | 'medium' | 'long',
    learningGoals: [] as string[]
  });

  // Load user preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('ai-dashboard-preferences');
    if (savedPreferences) {
      setUserPreferences(JSON.parse(savedPreferences));
    } else {
      // Initialize preferences based on user behavior
      analyzeUserBehavior();
    }
  }, [bookmarkedItems, consumedItems]);

  const analyzeUserBehavior = () => {
    const bookmarkedItemsArray = items.filter(item => bookmarkedItems.has(item.id));
    const consumedItemsArray = items.filter(item => consumedItems.includes(item.id));
    const engagedItems = [...bookmarkedItemsArray, ...consumedItemsArray];

    // Extract preferred tags
    const tagFrequency: { [key: string]: number } = {};
    engagedItems.forEach(item => {
      item.tags.forEach(tag => {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
      });
    });
    const preferredTags = Object.entries(tagFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);

    // Extract preferred source types
    const sourceTypeFrequency: { [key: string]: number } = {};
    engagedItems.forEach(item => {
      sourceTypeFrequency[item.sourceType] = (sourceTypeFrequency[item.sourceType] || 0) + 1;
    });
    const preferredSourceTypes = Object.entries(sourceTypeFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type);

    // Determine preferred time range
    const avgTime = engagedItems.reduce((sum, item) => sum + (item.estimatedTime || 10), 0) / engagedItems.length;
    const preferredTimeRange: 'short' | 'medium' | 'long' = avgTime < 10 ? 'short' : avgTime > 30 ? 'long' : 'medium';

    const newPreferences = {
      preferredTags,
      preferredSourceTypes,
      preferredTimeRange,
      learningGoals: ['AI/ML', 'Professional Development', 'Technology Trends']
    };

    setUserPreferences(newPreferences);
    localStorage.setItem('ai-dashboard-preferences', JSON.stringify(newPreferences));
  };

  const generateRecommendations = useMemo((): Recommendation[] => {
    const unconsumedItems = items.filter(item => !item.consumed && !bookmarkedItems.has(item.id));
    const recommendations: Recommendation[] = [];

    // Trending items (high score, recent)
    const trendingItems = unconsumedItems
      .filter(item => item.score && item.score >= 8)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 3);

    trendingItems.forEach(item => {
      recommendations.push({
        item,
        reason: `High-rated content (${item.score}/10) that's trending in the community`,
        confidence: 0.9,
        category: 'trending'
      });
    });

    // Personalized recommendations based on preferences
    const personalizedItems = unconsumedItems
      .filter(item => {
        const hasPreferredTag = item.tags.some(tag => userPreferences.preferredTags.includes(tag));
        const hasPreferredSource = userPreferences.preferredSourceTypes.includes(item.sourceType);
        return hasPreferredTag || hasPreferredSource;
      })
      .sort((a, b) => {
        const aTagMatch = a.tags.filter(tag => userPreferences.preferredTags.includes(tag)).length;
        const bTagMatch = b.tags.filter(tag => userPreferences.preferredTags.includes(tag)).length;
        return bTagMatch - aTagMatch;
      })
      .slice(0, 4);

    personalizedItems.forEach(item => {
      const matchingTags = item.tags.filter(tag => userPreferences.preferredTags.includes(tag));
      const reason = matchingTags.length > 0 
        ? `Matches your interests in ${matchingTags.slice(0, 2).join(', ')}`
        : `${item.sourceType} content based on your preferences`;
      
      recommendations.push({
        item,
        reason,
        confidence: 0.8,
        category: 'personalized'
      });
    });

    // Quick wins (short reading time, high value)
    const quickWinItems = unconsumedItems
      .filter(item => item.estimatedTime && item.estimatedTime <= 10 && item.score && item.score >= 7)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 3);

    quickWinItems.forEach(item => {
      recommendations.push({
        item,
        reason: `Quick ${item.estimatedTime}min read with high impact (${item.score}/10)`,
        confidence: 0.7,
        category: 'quick_wins'
      });
    });

    // Deep dive recommendations (longer content, comprehensive)
    const deepDiveItems = unconsumedItems
      .filter(item => item.estimatedTime && item.estimatedTime >= 20)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 2);

    deepDiveItems.forEach(item => {
      recommendations.push({
        item,
        reason: `Comprehensive ${item.estimatedTime}min deep dive for thorough understanding`,
        confidence: 0.6,
        category: 'deep_dive'
      });
    });

    // Remove duplicates and sort by confidence
    const uniqueRecommendations = recommendations.filter((rec, index, self) => 
      index === self.findIndex(r => r.item.id === rec.item.id)
    );

    return uniqueRecommendations.sort((a, b) => b.confidence - a.confidence).slice(0, 8);
  }, [items, bookmarkedItems, consumedItems, userPreferences]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'trending': return <TrendingUp className="w-4 h-4" />;
      case 'personalized': return <Target className="w-4 h-4" />;
      case 'quick_wins': return <Clock className="w-4 h-4" />;
      case 'deep_dive': return <BookOpen className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'trending': return 'text-red-500 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'personalized': return 'text-blue-500 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case 'quick_wins': return 'text-green-500 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'deep_dive': return 'text-purple-500 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'trending': return 'Trending';
      case 'personalized': return 'For You';
      case 'quick_wins': return 'Quick Win';
      case 'deep_dive': return 'Deep Dive';
      default: return 'Recommended';
    }
  };

  if (generateRecommendations.length === 0) {
    return null;
  }

  return (
    <div className={`rounded-xl border p-6 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className={`w-5 h-5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-500'}`} />
        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          AI Recommendations
        </h2>
        <span className={`text-sm px-2 py-1 rounded-full ${
          isDarkMode ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {generateRecommendations.length} suggestions
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {generateRecommendations.map((rec) => (
          <div
            key={rec.item.id}
            onClick={() => onItemClick(rec.item)}
            className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
              isDarkMode 
                ? 'bg-gray-700/50 border-gray-600 hover:border-gray-500' 
                : 'bg-gray-50 border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(rec.category)}`}>
                {getCategoryIcon(rec.category)}
                {getCategoryLabel(rec.category)}
              </div>
              <div className="flex items-center gap-1">
                <Star className={`w-3 h-3 ${
                  rec.item.score && rec.item.score >= 7 ? 'text-yellow-500 fill-current' : 
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {rec.item.score ?? 'N/A'}
                </span>
              </div>
            </div>

            <h3 className={`font-semibold text-sm mb-2 line-clamp-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {rec.item.title}
            </h3>

            <p className={`text-xs mb-2 ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`}>
              {rec.reason}
            </p>

            <div className="flex items-center justify-between">
              <span className={`text-xs px-2 py-1 rounded ${
                isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}>
                {rec.item.sourceType}
              </span>
              {rec.item.estimatedTime && (
                <div className="flex items-center gap-1">
                  <Clock className={`w-3 h-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {rec.item.estimatedTime}m
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className={`mt-4 p-3 rounded-lg ${
        isDarkMode ? 'bg-gray-700/30' : 'bg-blue-50'
      }`}>
        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          💡 Recommendations improve as you bookmark and consume more content. 
          Based on your preferences: {userPreferences.preferredTags.slice(0, 3).join(', ')}
        </p>
      </div>
    </div>
  );
}
