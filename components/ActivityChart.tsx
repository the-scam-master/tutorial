import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ActivityData {
  date: string;
  count: number;
  isToday: boolean;
}

interface ActivityChartProps {
  data: ActivityData[];
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>7-Day Activity</Text>
      <View style={styles.chart}>
        {data.map((item, index) => {
          const height = Math.max((item.count / maxCount) * 60, 4);
          const opacity = item.count === 0 ? 0.2 : 0.8;
          
          return (
            <View key={index} style={styles.barContainer}>
              <View 
                style={[
                  styles.bar, 
                  { 
                    height,
                    backgroundColor: item.isToday ? '#3B82F6' : '#8B5CF6',
                    opacity 
                  }
                ]} 
              />
              <Text style={styles.barLabel}>{item.date.split(' ')[1]}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
    paddingHorizontal: 8,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 10,
    color: '#9CA3AF',
  },
});