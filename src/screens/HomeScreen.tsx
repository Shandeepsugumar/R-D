import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface CardProps {
  title: string;
  description: string;
  icon: string;
  onPress: () => void;
  color: string;
}

const EmotionCard: React.FC<CardProps> = ({ title, description, icon, onPress, color }) => {
  return (
    <TouchableOpacity style={[styles.card, { borderLeftColor: color }]} onPress={onPress}>
      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Text style={[styles.icon, { color }]}>{icon}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDescription}>{description}</Text>
        </View>
        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>→</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();

  const navigateToSpeechEmotion = () => {
    navigation.navigate('SpeechEmotion' as never);
  };

  const navigateToHeartRateEmotion = () => {
    navigation.navigate('HeartRateEmotion' as never);
  };

  const navigateToFusionEmotion = () => {
    navigation.navigate('FusionEmotion' as never);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Emotion Recognition</Text>
        <Text style={styles.subtitle}>
          Choose your preferred method to analyze emotions
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        <EmotionCard
          title="Speech Emotion Recognition"
          description="Analyze emotions through speech patterns and vocal characteristics"
          icon="🎤"
          onPress={navigateToSpeechEmotion}
          color="#4A90E2"
        />

        <EmotionCard
          title="Heart Rate Emotion Recognition"
          description="Monitor emotional states through heart rate variability patterns"
          icon="💓"
          onPress={navigateToHeartRateEmotion}
          color="#E74C3C"
        />

        <EmotionCard
          title="Fusion Emotion Recognition"
          description="Combined analysis using both voice and heart rate for enhanced accuracy"
          icon="🔗"
          onPress={navigateToFusionEmotion}
          color="#9B59B6"
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Select a recognition method to get started
        </Text>
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
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingTop: 30,
    gap: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 5,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  icon: {
    fontSize: 24,
  },
  textContainer: {
    flex: 1,
    paddingRight: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 20,
    color: '#BDC3C7',
    fontWeight: 'bold',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#95A5A6',
    fontStyle: 'italic',
  },
});

export default HomeScreen;