import { useState, useEffect } from 'react';
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

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await StorageService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTopTopics = (limit = 5) => {
    return Object.entries(analytics.topicFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([topic, count]) => ({ topic, count }));
  };

  const getRecentActivity = (days = 7) => {
    const activity = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
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
  };

  const getStudyInsights = () => {
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

    const topTopic = getTopTopics(1)[0];
    if (topTopic) {
      insights.push({
        type: 'top_topic',
        title: 'Most Studied Topic',
        value: topTopic.topic,
        color: '#8B5CF6',
      });
    }

    return insights;
  };

  return {
    analytics,
    loading,
    getTopTopics,
    getRecentActivity,
    getStudyInsights,
    refreshAnalytics: loadAnalytics,
  };
};