import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { audioService } from '../services/audioService';
import { emotionAPIService } from '../services/emotionAPIService';
import { SpeechEmotionResult, EmotionType } from '../types/emotion';

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

export const SpeechEmotionScreen: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [result, setResult] = useState<SpeechEmotionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(async () => {
        const dur = await audioService.getDuration();
        setDuration(dur);
      }, 100);
    } else {
      setDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const handleStartRecording = async () => {
    try {
      await audioService.startRecording();
      setIsRecording(true);
      setResult(null);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const handleStopRecording = async () => {
    try {
      const recording = await audioService.stopRecording();
      setIsRecording(false);
      setIsAnalyzing(true);

      const emotionResult = await emotionAPIService.predictSpeechEmotion(recording.uri);
      setResult(emotionResult);

      await emotionAPIService.saveEmotionPrediction(
        emotionResult.emotion,
        emotionResult.confidence,
        'speech',
        {
          audioPath: recording.uri,
          duration: recording.duration,
          probabilities: emotionResult.probabilities,
        }
      );

      setIsAnalyzing(false);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsAnalyzing(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Speech Emotion Recognition</Text>
        <Text style={styles.subtitle}>Record your voice to analyze your emotional state</Text>

        <View style={styles.recordingContainer}>
          {isRecording && (
            <View style={styles.durationContainer}>
              <Text style={styles.durationText}>{formatDuration(duration)}</Text>
            </View>
          )}

          <Animated.View
            style={[
              styles.recordButton,
              isRecording && styles.recordingButton,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <TouchableOpacity
              onPress={isRecording ? handleStopRecording : handleStartRecording}
              disabled={isAnalyzing}
              style={styles.recordButtonInner}
            >
              <Text style={styles.recordButtonText}>
                {isRecording ? '⏹' : '🎤'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.instruction}>
            {isRecording ? 'Tap to stop recording' : 'Tap to start recording'}
          </Text>
        </View>

        {isAnalyzing && (
          <View style={styles.analyzingContainer}>
            <Text style={styles.analyzingText}>Analyzing your emotion...</Text>
          </View>
        )}

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

            <View style={styles.probabilitiesContainer}>
              <Text style={styles.probabilitiesTitle}>Emotion Breakdown</Text>
              {Object.entries(result.probabilities)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([emotion, probability]) => (
                  <View key={emotion} style={styles.probabilityRow}>
                    <Text style={styles.probabilityEmoji}>
                      {EMOTION_EMOJIS[emotion as EmotionType]}
                    </Text>
                    <Text style={styles.probabilityLabel}>
                      {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                    </Text>
                    <View style={styles.probabilityBarContainer}>
                      <View
                        style={[
                          styles.probabilityBar,
                          {
                            width: `${probability * 100}%`,
                            backgroundColor: EMOTION_COLORS[emotion as EmotionType],
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.probabilityText}>
                      {(probability * 100).toFixed(1)}%
                    </Text>
                  </View>
                ))}
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
    marginBottom: 40,
  },
  recordingContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  durationContainer: {
    marginBottom: 20,
  },
  durationText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
  recordButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#3498DB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordingButton: {
    backgroundColor: '#E74C3C',
  },
  recordButtonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonText: {
    fontSize: 60,
  },
  instruction: {
    marginTop: 20,
    fontSize: 16,
    color: '#7F8C8D',
  },
  analyzingContainer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyzingText: {
    fontSize: 18,
    color: '#3498DB',
    fontWeight: '600',
  },
  resultContainer: {
    marginTop: 20,
  },
  emotionBadge: {
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 30,
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
  probabilitiesContainer: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  probabilitiesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  probabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  probabilityEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  probabilityLabel: {
    fontSize: 14,
    color: '#2C3E50',
    width: 80,
  },
  probabilityBarContainer: {
    flex: 1,
    height: 12,
    backgroundColor: '#ECF0F1',
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 10,
  },
  probabilityBar: {
    height: '100%',
    borderRadius: 6,
  },
  probabilityText: {
    fontSize: 12,
    color: '#7F8C8D',
    width: 45,
    textAlign: 'right',
  },
});
