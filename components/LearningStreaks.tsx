'use client';

import { useState, useEffect } from 'react';
import { Flame, Trophy, Target, Calendar, Award, Zap, Star, TrendingUp } from 'lucide-react';

interface LearningStreaksProps {
  consumedItems: string[];
  bookmarkedItems: Set<string>;
  isDarkMode: boolean;
}

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalItemsConsumed: number;
  weeklyGoal: number;
  weeklyProgress: number;
  lastActivityDate: string | null;
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export default function LearningStreaks({ consumedItems, bookmarkedItems, isDarkMode }: LearningStreaksProps) {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    totalItemsConsumed: 0,
    weeklyGoal: 7,
    weeklyProgress: 0,
    lastActivityDate: null,
    achievements: []
  });

  const [showAchievements, setShowAchievements] = useState(false);

  useEffect(() => {
    loadStreakData();
  }, [consumedItems]);

  const loadStreakData = () => {
    const savedData = localStorage.getItem('ai-dashboard-streaks');
    let data: StreakData = savedData ? JSON.parse(savedData) : {
      currentStreak: 0,
      longestStreak: 0,
      totalItemsConsumed: 0,
      weeklyGoal: 7,
      weeklyProgress: 0,
      lastActivityDate: null,
      achievements: []
    };

    // Update with current consumed items
    data.totalItemsConsumed = consumedItems.length;
    
    // Calculate current streak
    const today = new Date().toDateString();
    const lastActivity = data.lastActivityDate;
    
    if (consumedItems.length > 0) {
      if (!lastActivity || lastActivity !== today) {
        // New activity today
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastActivity === yesterday.toDateString()) {
          // Consecutive day
          data.currentStreak += 1;
        } else if (lastActivity !== today) {
          // New streak or broken streak
          data.currentStreak = 1;
        }
        
        data.lastActivityDate = today;
        data.longestStreak = Math.max(data.longestStreak, data.currentStreak);
      }
    }

    // Calculate weekly progress
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const weeklyConsumed = consumedItems.length; // Simplified for demo
    data.weeklyProgress = Math.min(weeklyConsumed, data.weeklyGoal);

    // Check for new achievements
    checkAchievements(data);

    setStreakData(data);
    localStorage.setItem('ai-dashboard-streaks', JSON.stringify(data));
  };

  const checkAchievements = (data: StreakData) => {
    const newAchievements: Achievement[] = [...data.achievements];
    const today = new Date().toISOString();

    const achievementChecks = [
      {
        id: 'first_read',
        condition: data.totalItemsConsumed >= 1,
        title: 'First Steps',
        description: 'Consumed your first learning item',
        icon: '🎯',
        rarity: 'common' as const
      },
      {
        id: 'streak_3',
        condition: data.currentStreak >= 3,
        title: 'Getting Consistent',
        description: '3-day learning streak',
        icon: '🔥',
        rarity: 'common' as const
      },
      {
        id: 'streak_7',
        condition: data.currentStreak >= 7,
        title: 'Week Warrior',
        description: '7-day learning streak',
        icon: '⚡',
        rarity: 'rare' as const
      },
      {
        id: 'streak_30',
        condition: data.currentStreak >= 30,
        title: 'Learning Legend',
        description: '30-day learning streak',
        icon: '👑',
        rarity: 'legendary' as const
      },
      {
        id: 'bookworm',
        condition: data.totalItemsConsumed >= 50,
        title: 'Bookworm',
        description: 'Consumed 50 learning items',
        icon: '📚',
        rarity: 'rare' as const
      },
      {
        id: 'curator',
        condition: bookmarkedItems.size >= 20,
        title: 'Content Curator',
        description: 'Bookmarked 20 items',
        icon: '⭐',
        rarity: 'rare' as const
      },
      {
        id: 'weekly_goal',
        condition: data.weeklyProgress >= data.weeklyGoal,
        title: 'Goal Crusher',
        description: 'Completed weekly learning goal',
        icon: '🎯',
        rarity: 'common' as const
      }
    ];

    achievementChecks.forEach(check => {
      if (check.condition && !newAchievements.find(a => a.id === check.id)) {
        newAchievements.push({
          id: check.id,
          title: check.title,
          description: check.description,
          icon: check.icon,
          unlockedAt: today,
          rarity: check.rarity
        });
      }
    });

    data.achievements = newAchievements;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
      case 'rare': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case 'epic': return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400';
      case 'legendary': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '👑';
    if (streak >= 14) return '⚡';
    if (streak >= 7) return '🔥';
    if (streak >= 3) return '💪';
    return '🌱';
  };

  return (
    <div className={`rounded-xl border p-6 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Flame className={`w-5 h-5 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`} />
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Learning Streaks
          </h2>
        </div>
        <button
          onClick={() => setShowAchievements(!showAchievements)}
          className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-colors ${
            isDarkMode 
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Trophy className="w-4 h-4" />
          Achievements ({streakData.achievements.length})
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Current Streak */}
        <div className={`p-4 rounded-lg text-center ${
          isDarkMode ? 'bg-orange-900/20' : 'bg-orange-50'
        }`}>
          <div className="text-2xl mb-1">{getStreakEmoji(streakData.currentStreak)}</div>
          <div className={`text-2xl font-bold ${
            isDarkMode ? 'text-orange-400' : 'text-orange-600'
          }`}>
            {streakData.currentStreak}
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Current Streak
          </div>
        </div>

        {/* Longest Streak */}
        <div className={`p-4 rounded-lg text-center ${
          isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50'
        }`}>
          <Trophy className={`w-6 h-6 mx-auto mb-1 ${
            isDarkMode ? 'text-purple-400' : 'text-purple-600'
          }`} />
          <div className={`text-2xl font-bold ${
            isDarkMode ? 'text-purple-400' : 'text-purple-600'
          }`}>
            {streakData.longestStreak}
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Best Streak
          </div>
        </div>

        {/* Total Items */}
        <div className={`p-4 rounded-lg text-center ${
          isDarkMode ? 'bg-green-900/20' : 'bg-green-50'
        }`}>
          <Target className={`w-6 h-6 mx-auto mb-1 ${
            isDarkMode ? 'text-green-400' : 'text-green-600'
          }`} />
          <div className={`text-2xl font-bold ${
            isDarkMode ? 'text-green-400' : 'text-green-600'
          }`}>
            {streakData.totalItemsConsumed}
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Items Read
          </div>
        </div>

        {/* Weekly Progress */}
        <div className={`p-4 rounded-lg text-center ${
          isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
        }`}>
          <Calendar className={`w-6 h-6 mx-auto mb-1 ${
            isDarkMode ? 'text-blue-400' : 'text-blue-600'
          }`} />
          <div className={`text-2xl font-bold ${
            isDarkMode ? 'text-blue-400' : 'text-blue-600'
          }`}>
            {streakData.weeklyProgress}/{streakData.weeklyGoal}
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Weekly Goal
          </div>
        </div>
      </div>

      {/* Weekly Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            This Week's Progress
          </span>
          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {Math.round((streakData.weeklyProgress / streakData.weeklyGoal) * 100)}%
          </span>
        </div>
        <div className={`w-full bg-gray-200 rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : ''}`}>
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((streakData.weeklyProgress / streakData.weeklyGoal) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Achievements Section */}
      {showAchievements && (
        <div className={`border-t pt-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Achievements
          </h3>
          {streakData.achievements.length === 0 ? (
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Start learning to unlock achievements! 🏆
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {streakData.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-3 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-gray-600' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {achievement.title}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${getRarityColor(achievement.rarity)}`}>
                          {achievement.rarity}
                        </span>
                      </div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {achievement.description}
                      </p>
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Motivational Message */}
      <div className={`mt-4 p-3 rounded-lg ${
        isDarkMode ? 'bg-gray-700/30' : 'bg-blue-50'
      }`}>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {streakData.currentStreak === 0 
            ? "🌟 Start your learning journey today! Every expert was once a beginner."
            : streakData.currentStreak < 3
            ? "🔥 Great start! Keep the momentum going to build a strong learning habit."
            : streakData.currentStreak < 7
            ? "💪 You're building consistency! A few more days to reach a week streak."
            : "⚡ Amazing dedication! You're developing a powerful learning habit."
          }
        </p>
      </div>
    </div>
  );
}
