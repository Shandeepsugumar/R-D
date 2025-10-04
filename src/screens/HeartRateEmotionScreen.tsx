import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Animated } from 'react-native';
import { heartRateService, HeartRateReading } from '../services/heartRateService';
import { emotionAPIService } from '../services/emotionAPIService';
import { HeartRateEmotionResult, EmotionType } from '../types/emotion';

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

export const HeartRateEmotionScreen: React.FC = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [heartRate, setHeartRate] = useState(0);
  const [variability, setVariability] = useState(0);
  const [result, setResult] = useState<HeartRateEmotionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGoogleFitConnected, setIsGoogleFitConnected] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (isMonitoring) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isMonitoring]);

  const handleConnectGoogleFit = async () => {
    try {
      const connected = await heartRateService.connectGoogleFit();
      if (connected) {
        setIsGoogleFitConnected(true);
        Alert.alert('Success', 'Connected to Google Fit successfully!');
      } else {
        Alert.alert('Error', 'Failed to connect to Google Fit. Please check permissions.');
      }
    } catch (error) {
      console.error('Google Fit connection error:', error);
      Alert.alert('Error', 'Failed to connect to Google Fit.');
    }
  };

  const handleStartMonitoring = async () => {
    try {
      await heartRateService.startMonitoring();
      setIsMonitoring(true);
      setResult(null);

      const unsubscribe = heartRateService.subscribe((reading: HeartRateReading) => {
        setHeartRate(reading.heartRate);
        setVariability(reading.variability || 0);
      });

      setTimeout(() => {
        handleAnalyzeEmotion();
      }, 10000);

      return unsubscribe;
    } catch (error) {
      console.error('Failed to start monitoring:', error);
      Alert.alert('Monitoring Error', 'Failed to start heart rate monitoring. Please check permissions.');
    }
  };

  const handleStopMonitoring = () => {
    heartRateService.stopMonitoring();
    setIsMonitoring(false);
  };

  const handleAnalyzeEmotion = async () => {
    if (heartRate === 0) {
      Alert.alert('No Data', 'Please wait for heart rate data to be collected.');
      return;
    }

    try {
      setIsAnalyzing(true);
      const emotionResult = await emotionAPIService.predictHeartRateEmotion(heartRate, variability);
      setResult(emotionResult);

      await emotionAPIService.saveEmotionPrediction(
        emotionResult.emotion,
        emotionResult.confidence,
        'heart_rate',
        {
          heartRate: emotionResult.heartRate,
          variability: emotionResult.variability,
          timestamp: emotionResult.timestamp,
        }
      );

      setIsAnalyzing(false);
      handleStopMonitoring();
    } catch (error) {
      console.error('Failed to analyze emotion:', error);
      setIsAnalyzing(false);
      Alert.alert('Analysis Error', 'Failed to analyze heart rate emotion.');
    }
  };

  const getHeartRateStatus = (): string => {
    if (heartRate < 60) return 'Low';
    if (heartRate < 100) return 'Normal';
    return 'High';
  };

  const getHeartRateColor = (): string => {
    if (heartRate < 60) return '#3498DB';
    if (heartRate < 100) return '#27AE60';
    return '#E74C3C';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Heart Rate Emotion Recognition</Text>
        <Text style={styles.subtitle}>
          Monitor your heart rate to detect emotional states
        </Text>

        {!isGoogleFitConnected && (
          <View style={styles.connectContainer}>
            <Text style={styles.connectTitle}>Connect to Google Fit</Text>
            <Text style={styles.connectDesc}>
              Connect to Google Fit to access real-time heart rate data from your fitness tracker or smartwatch.
            </Text>
            <TouchableOpacity
              style={styles.connectButton}
              onPress={handleConnectGoogleFit}
            >
              <Text style={styles.connectButtonText}>Connect Google Fit</Text>
            </TouchableOpacity>
            <Text style={styles.simulationNote}>
              Note: If not connected, simulated data will be used for demonstration.
            </Text>
          </View>
        )}

        {isGoogleFitConnected && (
          <View style={styles.connectedBadge}>
            <Text style={styles.connectedText}>✓ Google Fit Connected</Text>
          </View>
        )}

        <Animated.View
          style={[
            styles.heartRateContainer,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <View style={[styles.heartCircle, isMonitoring && styles.monitoring]}>
            <Text style={styles.heartIcon}>💓</Text>
            {heartRate > 0 && (
              <>
                <Text style={[styles.heartRateValue, { color: getHeartRateColor() }]}>
                  {heartRate}
                </Text>
                <Text style={styles.heartRateUnit}>BPM</Text>
                <Text style={[styles.heartRateStatus, { color: getHeartRateColor() }]}>
                  {getHeartRateStatus()}
                </Text>
              </>
            )}
          </View>
        </Animated.View>

        {variability > 0 && (
          <View style={styles.variabilityContainer}>
            <Text style={styles.variabilityLabel}>Heart Rate Variability</Text>
            <Text style={styles.variabilityValue}>{variability.toFixed(1)} ms</Text>
          </View>
        )}

        <View style={styles.buttonsContainer}>
          {!isMonitoring ? (
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartMonitoring}
            >
              <Text style={styles.startButtonText}>Start Monitoring</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={styles.analyzeButton}
                onPress={handleAnalyzeEmotion}
                disabled={isAnalyzing || heartRate === 0}
              >
                <Text style={styles.analyzeButtonText}>
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Emotion'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.stopButton}
                onPress={handleStopMonitoring}
              >
                <Text style={styles.stopButtonText}>Stop Monitoring</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {result && !isAnalyzing && (
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
            </View>

            <View style={styles.confidenceContainer}>
              <Text style={styles.confidenceLabel}>Confidence</Text>
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

            <View style={styles.metricsContainer}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Heart Rate</Text>
                <Text style={styles.metricValue}>{result.heartRate}</Text>
                <Text style={styles.metricUnit}>BPM</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>HRV</Text>
                <Text style={styles.metricValue}>{result.variability.toFixed(1)}</Text>
                <Text style={styles.metricUnit}>ms</Text>
              </View>
            </View>
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
  },
  connectContainer: {
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 16,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  connectTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  connectDesc: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    marginBottom: 20,
  },
  connectButton: {
    backgroundColor: '#DB4437',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  simulationNote: {
    fontSize: 12,
    color: '#95A5A6',
    marginTop: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  connectedBadge: {
    backgroundColor: '#27AE60',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 30,
  },
  connectedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  heartRateContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  heartCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  monitoring: {
    backgroundColor: '#FFE8E8',
    borderColor: '#E74C3C',
    borderWidth: 3,
  },
  heartIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  heartRateValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  heartRateUnit: {
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  heartRateStatus: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
  },
  variabilityContainer: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  variabilityLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  variabilityValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498DB',
  },
  buttonsContainer: {
    gap: 12,
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  startButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  analyzeButton: {
    backgroundColor: '#3498DB',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  analyzeButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  stopButton: {
    backgroundColor: '#95A5A6',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  stopButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
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
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  metricUnit: {
    fontSize: 12,
    color: '#7F8C8D',
  },
});

export default HeartRateEmotionScreen;
