'use client';

import { useMemo } from 'react';
import { Clock, TrendingUp, Hash, Target, BarChart3 } from 'lucide-react';

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

interface AnalyticsProps {
  items: Item[];
  isDarkMode: boolean;
}

export default function Analytics({ items, isDarkMode }: AnalyticsProps) {
  const analytics = useMemo(() => {
    // Total items
    const totalItems = items.length;
    
    // Total estimated time
    const totalTime = items.reduce((sum, item) => sum + (item.estimatedTime || 0), 0);
    
    // Average score (ignoring nulls)
    const itemsWithScores = items.filter(item => item.score !== null);
    const averageScore = itemsWithScores.length > 0 
      ? itemsWithScores.reduce((sum, item) => sum + (item.score || 0), 0) / itemsWithScores.length
      : 0;
    
    // Top 5 most common tags
    const tagCounts: { [key: string]: number } = {};
    items.forEach(item => {
      item.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const topTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));
    
    // Items by source type
    const sourceTypeCounts: { [key: string]: number } = {};
    items.forEach(item => {
      sourceTypeCounts[item.sourceType] = (sourceTypeCounts[item.sourceType] || 0) + 1;
    });
    const sourceTypeData = Object.entries(sourceTypeCounts)
      .map(([sourceType, count]) => ({ sourceType, count }))
      .sort((a, b) => b.count - a.count);
    
    return {
      totalItems,
      totalTime,
      averageScore,
      topTags,
      sourceTypeData
    };
  }, [items]);

  const colors = {
    primary: '#2C3E50',
    secondary: '#5DADE2',
    accent: '#F8F9FA',
    success: '#27AE60',
    warning: '#F39C12',
    danger: '#E74C3C'
  };

  const chartColors = [colors.primary, colors.secondary, colors.success, colors.warning, colors.danger];

  const cardClass = `p-6 rounded-xl shadow-lg border transition-all duration-200 hover:shadow-xl ${
    isDarkMode 
      ? 'bg-gray-800 border-gray-700 text-white' 
      : 'bg-white border-gray-200 text-gray-900'
  }`;

  const textSecondaryClass = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const textMutedClass = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className="mb-8">
      <div className="mb-6">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Analytics & Insights
        </h2>
        <p className={textSecondaryClass}>
          Overview of your learning queue performance and trends
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Items */}
        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <div>
              <p className={textMutedClass}>Total Items</p>
              <p className="text-3xl font-bold" style={{ color: colors.primary }}>
                {analytics.totalItems}
              </p>
            </div>
            <Hash className="w-8 h-8" style={{ color: colors.primary }} />
          </div>
        </div>

        {/* Total Time */}
        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <div>
              <p className={textMutedClass}>Total Time</p>
              <p className="text-3xl font-bold" style={{ color: colors.secondary }}>
                {Math.round(analytics.totalTime)}m
              </p>
            </div>
            <Clock className="w-8 h-8" style={{ color: colors.secondary }} />
          </div>
        </div>

        {/* Average Score */}
        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <div>
              <p className={textMutedClass}>Avg Score</p>
              <p className="text-3xl font-bold" style={{ color: colors.success }}>
                {analytics.averageScore.toFixed(1)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8" style={{ color: colors.success }} />
          </div>
        </div>

        {/* Completion Rate */}
        <div className={cardClass}>
          <div className="flex items-center justify-between">
            <div>
              <p className={textMutedClass}>Completed</p>
              <p className="text-3xl font-bold" style={{ color: colors.warning }}>
                {analytics.totalItems > 0 
                  ? Math.round((items.filter(item => item.consumed).length / analytics.totalItems) * 100)
                  : 0}%
              </p>
            </div>
            <Target className="w-8 h-8" style={{ color: colors.warning }} />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Source Type Distribution */}
        <div className={cardClass}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Items by Source Type
          </h3>
          <div className="h-64 flex items-end justify-between space-x-2 p-4">
            {analytics.sourceTypeData.map((item, index) => {
              const maxCount = Math.max(...analytics.sourceTypeData.map(d => d.count));
              const height = (item.count / maxCount) * 100;
              return (
                <div key={item.sourceType} className="flex flex-col items-center flex-1">
                  <div className="w-full flex flex-col items-center">
                    <span className={`text-xs mb-2 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {item.count}
                    </span>
                    <div 
                      className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80"
                      style={{ 
                        height: `${height}%`,
                        backgroundColor: chartColors[index % chartColors.length],
                        minHeight: '20px'
                      }}
                    />
                  </div>
                  <span className={`text-xs mt-2 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.sourceType}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Tags */}
        <div className={cardClass}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Top 5 Tags
          </h3>
          <div className="space-y-3">
            {analytics.topTags.map((tag, index) => (
              <div key={tag.tag} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: chartColors[index % chartColors.length] }}
                  />
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {tag.tag}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={textMutedClass}>{tag.count} items</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(tag.count / analytics.totalItems) * 100}%`,
                        backgroundColor: chartColors[index % chartColors.length]
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {analytics.topTags.length === 0 && (
              <p className={textMutedClass}>No tags available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
