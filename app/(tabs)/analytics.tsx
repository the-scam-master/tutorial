import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useAnalytics } from '@/hooks/useAnalytics';
import { AnalyticsCard } from '@/components/AnalyticsCard';
import { ActivityChart } from '@/components/ActivityChart';
import { TrendingUp, Target, Calendar, RefreshCw, AlertCircle } from 'lucide-react-native';

export default function AnalyticsScreen() {
  const { analytics, loading, error, getTopTopics, getRecentActivity, getStudyInsights, refreshAnalytics } = useAnalytics();
  const topTopics = getTopTopics(5);
  const recentActivity = getRecentActivity(7);
  const insights = getStudyInsights();

  const handleRefresh = () => {
    refreshAnalytics();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Study Analytics</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
            <RefreshCw size={20} color="#3B82F6" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <AlertCircle size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Error Loading Analytics</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Study Analytics</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <RefreshCw size={20} color="#3B82F6" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Key Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Insights</Text>
          {insights.length > 0 ? (
            insights.map((insight, index) => (
              <AnalyticsCard
                key={index}
                title={insight.title}
                value={insight.value}
                color={insight.color}
              />
            ))
          ) : (
            <AnalyticsCard
              title="Start Learning"
              value="0"
              subtitle="Begin chatting to see your study patterns"
              color="#9CA3AF"
            />
          )}
        </View>

        {/* Activity Chart */}
        {analytics.totalSessions > 0 && (
          <View style={styles.section}>
            <AnalyticsCard
              title="Study Activity"
              value=""
              color="#8B5CF6"
            >
              <ActivityChart data={recentActivity} />
            </AnalyticsCard>
          </View>
        )}

        {/* Study Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Study Stats</Text>
          <View style={styles.statsRow}>
            <AnalyticsCard
              title="Total Sessions"
              value={analytics.totalSessions}
              color="#10B981"
            />
            <AnalyticsCard
              title="Questions Asked"
              value={analytics.totalMessages}
              color="#F59E0B"
            />
          </View>
        </View>

        {/* Top Topics */}
        {topTopics.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Most Studied Topics</Text>
            <AnalyticsCard
              title="Topic Frequency"
              value=""
              color="#8B5CF6"
            >
              <View style={styles.topicsList}>
                {topTopics.map((item, index) => (
                  <View key={index} style={styles.topicItem}>
                    <View style={styles.topicRank}>
                      <Text style={styles.topicRankText}>{index + 1}</Text>
                    </View>
                    <View style={styles.topicInfo}>
                      <Text style={styles.topicName}>{item.topic}</Text>
                      <Text style={styles.topicCount}>{item.count} questions</Text>
                    </View>
                  </View>
                ))}
              </View>
            </AnalyticsCard>
          </View>
        )}

        {/* Last Study Date */}
        {analytics.lastStudyDate && (
          <View style={styles.section}>
            <AnalyticsCard
              title="Last Study Session"
              value={new Date(analytics.lastStudyDate).toLocaleDateString()}
              subtitle={`${Math.floor((Date.now() - new Date(analytics.lastStudyDate).getTime()) / (1000 * 60 * 60 * 24))} days ago`}
              color="#6366F1"
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    gap: 8,
  },
  topicsList: {
    marginTop: 16,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  topicRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topicRankText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  topicInfo: {
    flex: 1,
  },
  topicName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textTransform: 'capitalize',
  },
  topicCount: {
    fontSize: 14,
    color: '#6B7280',
  },
});
