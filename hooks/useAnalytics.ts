import { useState, useEffect, useMemo } from 'react';
import { Analytics } from '@/types';
import { StorageService } from '@/services/storage';

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<Analytics>({
    totalSessions: 0,
    totalMessages: 0,
    streakDays: 0,
    topicFrequency: {},
    dailyActivity: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await StorageService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setError('Failed to load analytics data');
      setAnalytics({
        totalSessions: 0,
        totalMessages: 0,
        streakDays: 0,
        topicFrequency: {},
        dailyActivity: {},
      });
    } finally {
      setLoading(false);
    }
  };

  // Memoized derived data to prevent recalculation on every render
  const topTopics = useMemo(() => {
    try {
      return Object.entries(analytics.topicFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([topic, count]) => ({ topic, count }));
    } catch (error) {
      console.error('Error getting top topics:', error);
      return [];
    }
  }, [analytics.topicFrequency]);

  const recentActivity = useMemo(() => {
    try {
      const activity = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        const count = analytics.dailyActivity[dateKey] || 0;
        
        activity.push({
          date: date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
          count,
          isToday: i === 0,
        });
      }
      
      return activity;
    } catch (error) {
      console.error('Error getting recent activity:', error);
      return [];
    }
  }, [analytics.dailyActivity]);

  const insights = useMemo(() => {
    try {
      const insights = [];
      
      if (analytics.streakDays > 0) {
        insights.push({
          type: 'streak',
          title: 'Study Streak',
          value: `${analytics.streakDays} day${analytics.streakDays > 1 ? 's' : ''}`,
          color: '#10B981',
        });
      }
      
      if (analytics.totalSessions > 0) {
        const avgMessages = Math.round(analytics.totalMessages / analytics.totalSessions);
        insights.push({
          type: 'avg_messages',
          title: 'Avg. Questions per Session',
          value: avgMessages.toString(),
          color: '#3B82F6',
        });
      }
      
      if (topTopics.length > 0) {
        insights.push({
          type: 'top_topic',
          title: 'Most Studied Topic',
          value: topTopics[0].topic,
          color: '#8B5CF6',
        });
      }
      
      if (analytics.totalSessions > 0) {
        insights.push({
          type: 'sessions',
          title: 'Total Sessions',
          value: analytics.totalSessions.toString(),
          color: '#F59E0B',
        });
      }
      
      return insights;
    } catch (error) {
      console.error('Error getting study insights:', error);
      return [];
    }
  }, [analytics, topTopics]);

  const refreshAnalytics = async () => {
    await loadAnalytics();
  };

  return {
    analytics,
    loading,
    error,
    topTopics,
    recentActivity,
    insights,
    refreshAnalytics,
  };
};
