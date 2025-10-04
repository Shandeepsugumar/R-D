import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { audioService } from '../services/audioService';
import { heartRateService, HeartRateReading } from '../services/heartRateService';
import { emotionAPIService } from '../services/emotionAPIService';
import { FusionEmotionResult, EmotionType } from '../types/emotion';

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

type AnalysisStep = 'idle' | 'monitoring_heart' | 'recording_speech' | 'analyzing' | 'complete';

export const FusionEmotionScreen: React.FC = () => {
  const [step, setStep] = useState<AnalysisStep>('idle');
  const [heartRate, setHeartRate] = useState<number>(0);
  const [variability, setVariability] = useState<number>(0);
  const [audioUri, setAudioUri] = useState<string>('');
  const [result, setResult] = useState<FusionEmotionResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const handleStartAnalysis = async () => {
    setStep('monitoring_heart');
    setProgress(0.15);
    setResult(null);

    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      await heartRateService.startMonitoring();

      const unsubscribe = heartRateService.subscribe((reading: HeartRateReading) => {
        setHeartRate(reading.heartRate);
        setVariability(reading.variability || 0);
      });

      await new Promise(resolve => setTimeout(resolve, 5000));
      heartRateService.stopMonitoring();
      unsubscribe();

      if (heartRate === 0) {
        setHeartRate(75);
        setVariability(35);
      }

      setStep('recording_speech');
      setProgress(0.4);

      await new Promise(resolve => setTimeout(resolve, 500));

      await audioService.startRecording();

      await new Promise(resolve => setTimeout(resolve, 500));

      setStep('recording_speech');
      setProgress(0.6);

      await new Promise(resolve => setTimeout(resolve, 3000));

      const recording = await audioService.stopRecording();
      setAudioUri(recording.uri);

      setStep('analyzing');
      setProgress(0.8);

      const fusionResult = await emotionAPIService.predictFusionEmotion(
        recording.uri,
        heartRate,
        variability
      );

      setResult(fusionResult);
      setProgress(1);
      setStep('complete');

      await emotionAPIService.saveEmotionPrediction(
        fusionResult.emotion,
        fusionResult.confidence,
        'fusion',
        {
          heartRate,
          variability,
          audioPath: recording.uri,
          speechContribution: fusionResult.speechContribution,
          heartRateContribution: fusionResult.heartRateContribution,
        }
      );
    } catch (error) {
      console.error('Fusion analysis error:', error);
      setStep('idle');
      setProgress(0);
    }
  };

  const handleReset = () => {
    setStep('idle');
    setProgress(0);
    setResult(null);
    setHeartRate(0);
    setVariability(0);
    setAudioUri('');
  };

  const getStepMessage = (): string => {
    switch (step) {
      case 'monitoring_heart':
        return 'Monitoring your heart rate...';
      case 'recording_speech':
        return 'Recording your voice... Speak now!';
      case 'analyzing':
        return 'Analyzing multimodal data...';
      case 'complete':
        return 'Analysis complete!';
      default:
        return 'Ready to analyze your emotion';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Fusion Emotion Analysis</Text>
        <Text style={styles.subtitle}>
          Combined analysis of speech and heart rate for enhanced accuracy
        </Text>

        <View style={styles.progressContainer}>
          <Text style={styles.progressLabel}>{getStepMessage()}</Text>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{(progress * 100).toFixed(0)}%</Text>
        </View>

        {step === 'idle' && (
          <TouchableOpacity style={styles.startButton} onPress={handleStartAnalysis}>
            <Text style={styles.startButtonText}>🚀 Start Fusion Analysis</Text>
          </TouchableOpacity>
        )}

        {step !== 'idle' && step !== 'complete' && (
          <View style={styles.processingContainer}>
            <View style={styles.iconContainer}>
              <Text style={styles.processingIcon}>
                {step === 'monitoring_heart' ? '❤️' : step === 'recording_speech' ? '🎤' : '🧠'}
              </Text>
            </View>
            {(step === 'monitoring_heart' || heartRate > 0) && (
              <View style={styles.dataCard}>
                <Text style={styles.dataLabel}>Heart Rate</Text>
                <Text style={styles.dataValue}>{heartRate} BPM</Text>
              </View>
            )}
          </View>
        )}

        {result && step === 'complete' && (
          <View style={styles.resultContainer}>
            <View
              style={[
                styles.emotionBadge,
                { backgroundColor: EMOTION_COLORS[result.emotion] },
              ]}
            >
              <Text style={styles.emotionEmoji}>{EMOTION_EMOJIS[result.emotion]}</Text>
              <Text style={styles.emotionLabel}>
                {result.emotion.charAt(0).toUpperCase() + result.emotion.slice(1)}
              </Text>
              <Text style={styles.fusionBadge}>Multimodal Fusion</Text>
            </View>

            <View style={styles.confidenceContainer}>
              <Text style={styles.confidenceLabel}>Fusion Confidence</Text>
              <View style={styles.confidenceBar}>
                <View
                  style={[
                    styles.confidenceFill,
                    {
                      width: `${result.confidence * 100}%`,
                      backgroundColor: EMOTION_COLORS[result.emotion],
                    },
                  ]}
                />
              </View>
              <Text style={styles.confidenceText}>
                {(result.confidence * 100).toFixed(1)}%
              </Text>
            </View>

            <View style={styles.contributionContainer}>
              <Text style={styles.contributionTitle}>Modality Contributions</Text>

              <View style={styles.contributionRow}>
                <View style={styles.contributionIcon}>
                  <Text style={styles.contributionEmoji}>🎤</Text>
                </View>
                <View style={styles.contributionContent}>
                  <Text style={styles.contributionLabel}>Speech Analysis</Text>
                  <View style={styles.contributionBarContainer}>
                    <View
                      style={[
                        styles.contributionBar,
                        { width: `${result.speechContribution * 100}%`, backgroundColor: '#3498DB' },
                      ]}
                    />
                  </View>
                </View>
                <Text style={styles.contributionValue}>
                  {(result.speechContribution * 100).toFixed(0)}%
                </Text>
              </View>

              <View style={styles.contributionRow}>
                <View style={styles.contributionIcon}>
                  <Text style={styles.contributionEmoji}>❤️</Text>
                </View>
                <View style={styles.contributionContent}>
                  <Text style={styles.contributionLabel}>Heart Rate Analysis</Text>
                  <View style={styles.contributionBarContainer}>
                    <View
                      style={[
                        styles.contributionBar,
                        { width: `${result.heartRateContribution * 100}%`, backgroundColor: '#E74C3C' },
                      ]}
                    />
                  </View>
                </View>
                <Text style={styles.contributionValue}>
                  {(result.heartRateContribution * 100).toFixed(0)}%
                </Text>
              </View>
            </View>

            <View style={styles.metricsContainer}>
              <View style={styles.metricCard}>
                <Text style={styles.metricIcon}>❤️</Text>
                <Text style={styles.metricLabel}>Heart Rate</Text>
                <Text style={styles.metricValue}>{heartRate}</Text>
                <Text style={styles.metricUnit}>BPM</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricIcon}>📊</Text>
                <Text style={styles.metricLabel}>HRV</Text>
                <Text style={styles.metricValue}>{variability.toFixed(1)}</Text>
                <Text style={styles.metricUnit}>ms</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricIcon}>🎯</Text>
                <Text style={styles.metricLabel}>Fusion Score</Text>
                <Text style={styles.metricValue}>{(result.fusionScore * 100).toFixed(0)}</Text>
                <Text style={styles.metricUnit}>%</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Analyze Again</Text>
            </TouchableOpacity>
          </View>
        )}
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
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  progressContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressLabel: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#ECF0F1',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#9B59B6',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'right',
  },
  startButton: {
    backgroundColor: '#9B59B6',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  processingContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  iconContainer: {
    marginBottom: 20,
  },
  processingIcon: {
    fontSize: 80,
  },
  dataCard: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    minWidth: 160,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dataLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  dataValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
  resultContainer: {
    marginTop: 20,
  },
  emotionBadge: {
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  emotionEmoji: {
    fontSize: 80,
    marginBottom: 10,
  },
  emotionLabel: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  fusionBadge: {
    fontSize: 14,
    color: '#FFF',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  confidenceContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  confidenceLabel: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 10,
  },
  confidenceBar: {
    height: 20,
    backgroundColor: '#ECF0F1',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 10,
  },
  confidenceText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'right',
  },
  contributionContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contributionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  contributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  contributionIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contributionEmoji: {
    fontSize: 28,
  },
  contributionContent: {
    flex: 1,
    marginRight: 12,
  },
  contributionLabel: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 6,
  },
  contributionBarContainer: {
    height: 10,
    backgroundColor: '#ECF0F1',
    borderRadius: 5,
    overflow: 'hidden',
  },
  contributionBar: {
    height: '100%',
    borderRadius: 5,
  },
  contributionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    width: 50,
    textAlign: 'right',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
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
  metricIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  metricUnit: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  resetButton: {
    backgroundColor: '#3498DB',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  resetButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
