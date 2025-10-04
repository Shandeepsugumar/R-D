import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const HeartRateEmotionScreen: React.FC = () => {
  const navigation = useNavigation();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [heartRate, setHeartRate] = useState(0);
  const [emotionState, setEmotionState] = useState('Neutral');

  useEffect(() => {
    let interval: any;
    if (isMonitoring) {
      interval = setInterval(() => {
        const simulatedRate = Math.floor(Math.random() * (100 - 60) + 60);
        setHeartRate(simulatedRate);
        
        if (simulatedRate > 90) {
          setEmotionState('Excited/Stressed');
        } else if (simulatedRate < 70) {
          setEmotionState('Calm/Relaxed');
        } else {
          setEmotionState('Neutral');
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring]);

  const startMonitoring = () => {
    setIsMonitoring(true);
    Alert.alert('Monitoring Started', 'Heart rate monitoring simulation started');
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    setHeartRate(0);
    setEmotionState('Neutral');
    Alert.alert('Monitoring Stopped', 'Heart rate monitoring stopped');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Heart Rate Emotion Recognition</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.heartContainer}>
          <View style={[styles.heartCircle, isMonitoring && styles.monitoring]}>
            <Text style={styles.heartIcon}>💓</Text>
          </View>
          {isMonitoring && (
            <View style={styles.heartRateDisplay}>
              <Text style={styles.heartRateValue}>{heartRate}</Text>
              <Text style={styles.heartRateUnit}>BPM</Text>
            </View>
          )}
        </View>

        <View style={styles.emotionContainer}>
          <Text style={styles.emotionLabel}>Current Emotion:</Text>
          <Text style={styles.emotionValue}>{emotionState}</Text>
        </View>

        <View style={styles.buttonsContainer}>
          {!isMonitoring ? (
            <TouchableOpacity style={styles.startButton} onPress={startMonitoring}>
              <Text style={styles.startButtonText}>Start Monitoring</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.stopButton} onPress={stopMonitoring}>
              <Text style={styles.stopButtonText}>Stop Monitoring</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>Instructions:</Text>
          <Text style={styles.instructionsText}>
            This is a simulation of heart rate monitoring.{'\n'}
            In real implementation, this would use device sensors.{'\n'}
            The emotion is detected based on heart rate patterns.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  heartContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  heartCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  monitoring: {
    backgroundColor: '#FFE8E8',
    borderColor: '#E74C3C',
    borderWidth: 2,
  },
  heartIcon: {
    fontSize: 40,
  },
  heartRateDisplay: {
    alignItems: 'center',
    marginTop: 20,
  },
  heartRateValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
  heartRateUnit: {
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  emotionContainer: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emotionLabel: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 5,
  },
  emotionValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
  buttonsContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: '#E74C3C',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  stopButton: {
    backgroundColor: '#95A5A6',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
});

export default HeartRateEmotionScreen;
