import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { emotionAPIService } from '../services/emotionAPIService';
import { EmotionType } from '../types/emotion';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const EMOTION_COLORS: Record<EmotionType, string> = {
  happy: '#FFD700',
  sad: '#4682B4',
  angry: '#DC143C',
  fearful: '#9370DB',
  disgusted: '#8B4513',
  surprised: '#FF69B4',
  neutral: '#A9A9A9',
  calm: '#87CEEB',
};

const EMOTION_EMOJIS: Record<EmotionType, string> = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  fearful: '😨',
  disgusted: '🤢',
  surprised: '😲',
  neutral: '😐',
  calm: '😌',
};

const screenWidth = Dimensions.get('window').width;

interface EmotionHistoryItem {
  id: string;
  emotion: EmotionType;
  confidence: number;
  source: 'speech' | 'heart_rate' | 'fusion';
  created_at: string;
  metadata?: any;
}

export const HistoryScreen: React.FC = () => {
  const [history, setHistory] = useState<EmotionHistoryItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filterSource, setFilterSource] = useState<'all' | 'speech' | 'heart_rate' | 'fusion'>('all');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await emotionAPIService.getEmotionHistory(100);
      setHistory(data);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const getFilteredHistory = (): EmotionHistoryItem[] => {
    if (filterSource === 'all') return history;
    return history.filter(item => item.source === filterSource);
  };

  const getEmotionStats = () => {
    const filteredHistory = getFilteredHistory();
    const emotionCounts: Record<string, number> = {};

    filteredHistory.forEach(item => {
      emotionCounts[item.emotion] = (emotionCounts[item.emotion] || 0) + 1;
    });

    return Object.entries(emotionCounts)
      .map(([emotion, count]) => ({
        name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
        population: count,
        color: EMOTION_COLORS[emotion as EmotionType],
        legendFontColor: '#7F8C8D',
        legendFontSize: 12,
      }))
      .sort((a, b) => b.population - a.population);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const getSourceIcon = (source: string): string => {
    switch (source) {
      case 'speech':
        return '🎤';
      case 'heart_rate':
        return '❤️';
      case 'fusion':
        return '🧠';
      default:
        return '📊';
    }
  };

  const getMostFrequentEmotion = (): { emotion: EmotionType; count: number } | null => {
    const stats = getEmotionStats();
    if (stats.length === 0) return null;
    return {
      emotion: stats[0].name.toLowerCase() as EmotionType,
      count: stats[0].population,
    };
  };

  const getTotalAnalyses = (): number => {
    return getFilteredHistory().length;
  };

  const getAverageConfidence = (): number => {
    const filteredHistory = getFilteredHistory();
    if (filteredHistory.length === 0) return 0;
    const sum = filteredHistory.reduce((acc, item) => acc + item.confidence, 0);
    return sum / filteredHistory.length;
  };

  const filteredHistory = getFilteredHistory();
  const emotionStats = getEmotionStats();
  const mostFrequent = getMostFrequentEmotion();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Emotion History</Text>
        <Text style={styles.subtitle}>Track your emotional journey over time</Text>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filterSource === 'all' && styles.filterButtonActive]}
            onPress={() => setFilterSource('all')}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterSource === 'all' && styles.filterButtonTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterSource === 'speech' && styles.filterButtonActive]}
            onPress={() => setFilterSource('speech')}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterSource === 'speech' && styles.filterButtonTextActive,
              ]}
            >
              🎤 Speech
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterSource === 'heart_rate' && styles.filterButtonActive]}
            onPress={() => setFilterSource('heart_rate')}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterSource === 'heart_rate' && styles.filterButtonTextActive,
              ]}
            >
              ❤️ Heart
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterSource === 'fusion' && styles.filterButtonActive]}
            onPress={() => setFilterSource('fusion')}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterSource === 'fusion' && styles.filterButtonTextActive,
              ]}
            >
              🧠 Fusion
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📊</Text>
            <Text style={styles.statValue}>{getTotalAnalyses()}</Text>
            <Text style={styles.statLabel}>Total Analyses</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>
              {mostFrequent ? EMOTION_EMOJIS[mostFrequent.emotion] : '😐'}
            </Text>
            <Text style={styles.statValue}>{mostFrequent ? mostFrequent.count : 0}</Text>
            <Text style={styles.statLabel}>Most Frequent</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🎯</Text>
            <Text style={styles.statValue}>{(getAverageConfidence() * 100).toFixed(0)}%</Text>
            <Text style={styles.statLabel}>Avg Confidence</Text>
          </View>
        </View>

        {emotionStats.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Emotion Distribution</Text>
            <PieChart
              data={emotionStats}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        )}

        <View style={styles.historyListContainer}>
          <Text style={styles.historyTitle}>Recent Activity</Text>

          {filteredHistory.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>No emotion analyses yet</Text>
              <Text style={styles.emptySubtext}>
                Start recording your emotions to see your history
              </Text>
            </View>
          )}

          {filteredHistory.map((item) => (
            <View key={item.id} style={styles.historyItem}>
              <View
                style={[
                  styles.emotionIndicator,
                  { backgroundColor: EMOTION_COLORS[item.emotion] },
                ]}
              >
                <Text style={styles.historyEmoji}>{EMOTION_EMOJIS[item.emotion]}</Text>
              </View>

              <View style={styles.historyContent}>
                <Text style={styles.historyEmotion}>
                  {item.emotion.charAt(0).toUpperCase() + item.emotion.slice(1)}
                </Text>
                <View style={styles.historyMeta}>
                  <Text style={styles.historySource}>{getSourceIcon(item.source)}</Text>
                  <Text style={styles.historyConfidence}>
                    {(item.confidence * 100).toFixed(0)}% confidence
                  </Text>
                  <Text style={styles.historyDivider}>•</Text>
                  <Text style={styles.historyTime}>{formatDate(item.created_at)}</Text>
                </View>
              </View>

              <View
                style={[
                  styles.confidenceBadge,
                  { backgroundColor: EMOTION_COLORS[item.emotion] },
                ]}
              >
                <Text style={styles.confidenceBadgeText}>
                  {(item.confidence * 100).toFixed(0)}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: '#3498DB',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#FFF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  historyListContainer: {
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  emptyContainer: {
    backgroundColor: '#FFF',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emotionIndicator: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyEmoji: {
    fontSize: 28,
  },
  historyContent: {
    flex: 1,
  },
  historyEmotion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historySource: {
    fontSize: 14,
    marginRight: 6,
  },
  historyConfidence: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  historyDivider: {
    fontSize: 12,
    color: '#7F8C8D',
    marginHorizontal: 6,
  },
  historyTime: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  confidenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  confidenceBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
