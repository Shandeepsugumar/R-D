import { SpeechEmotionResult, HeartRateEmotionResult, FusionEmotionResult, EmotionType } from '../types/emotion';

const SUPABASE_URL = 'https://dguesqjytozevqfstxyb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRndWVzcWp5dG96ZXZxZnN0eHliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0Njg5MDQsImV4cCI6MjA3NTA0NDkwNH0.8SKo4ELmoWrrcEFTsY9hJLJUycP5uOPe7ozR4fiHb5Q';

export class EmotionAPIService {
  private async extractMFCCFeatures(audioUri: string): Promise<number[][]> {
    const mockMFCCs: number[][] = [];
    for (let i = 0; i < 40; i++) {
      const row: number[] = [];
      for (let j = 0; j < 174; j++) {
        row.push(Math.random() * 2 - 1);
      }
      mockMFCCs.push(row);
    }
    return mockMFCCs;
  }

  private mockSpeechPrediction(mfccs: number[][]): { emotion: EmotionType; probabilities: Record<string, number> } {
    const emotions: EmotionType[] = ['happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised', 'neutral', 'calm'];
    const probabilities: Record<string, number> = {};

    emotions.forEach(emotion => {
      probabilities[emotion] = Math.random();
    });

    const total = Object.values(probabilities).reduce((sum, val) => sum + val, 0);
    Object.keys(probabilities).forEach(key => {
      probabilities[key] = probabilities[key] / total;
    });

    const maxEmotion = Object.entries(probabilities).reduce((max, [emotion, prob]) =>
      prob > max.prob ? { emotion: emotion as EmotionType, prob } : max,
      { emotion: 'neutral' as EmotionType, prob: 0 }
    );

    return {
      emotion: maxEmotion.emotion,
      probabilities,
    };
  }

  async predictSpeechEmotion(audioUri: string): Promise<SpeechEmotionResult> {
    try {
      // Simulate file info for the audio URI
      const fileInfo = {
        exists: true,
        size: Math.floor(Math.random() * 1000000), // Random file size
        uri: audioUri,
      };

      const mfccs = await this.extractMFCCFeatures(audioUri);

      const prediction = this.mockSpeechPrediction(mfccs);

      return {
        emotion: prediction.emotion,
        confidence: prediction.probabilities[prediction.emotion],
        probabilities: prediction.probabilities,
        audioPath: audioUri,
        duration: 3.5,
      };
    } catch (error) {
      console.error('Speech emotion prediction error:', error);
      throw new Error('Failed to predict speech emotion');
    }
  }

  private mockHeartRatePrediction(heartRate: number, variability: number): { emotion: EmotionType; confidence: number } {
    let emotion: EmotionType = 'neutral';
    let confidence = 0.7;

    if (heartRate > 100) {
      emotion = Math.random() > 0.5 ? 'fearful' : 'surprised';
      confidence = 0.75 + Math.random() * 0.15;
    } else if (heartRate > 85) {
      emotion = Math.random() > 0.5 ? 'happy' : 'angry';
      confidence = 0.70 + Math.random() * 0.15;
    } else if (heartRate < 60) {
      emotion = Math.random() > 0.5 ? 'calm' : 'sad';
      confidence = 0.65 + Math.random() * 0.15;
    } else {
      emotion = 'neutral';
      confidence = 0.60 + Math.random() * 0.20;
    }

    return { emotion, confidence };
  }

  async predictHeartRateEmotion(heartRate: number, variability: number): Promise<HeartRateEmotionResult> {
    try {
      const prediction = this.mockHeartRatePrediction(heartRate, variability);

      return {
        emotion: prediction.emotion,
        confidence: prediction.confidence,
        heartRate,
        variability,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Heart rate emotion prediction error:', error);
      throw new Error('Failed to predict heart rate emotion');
    }
  }

  private mockFusionPrediction(
    speechEmotion: EmotionType,
    speechConfidence: number,
    heartRateEmotion: EmotionType,
    heartRateConfidence: number
  ): { emotion: EmotionType; confidence: number; speechContribution: number; heartRateContribution: number } {
    const speechWeight = 0.6;
    const heartRateWeight = 0.4;

    let fusedEmotion: EmotionType;
    let fusedConfidence: number;

    if (speechEmotion === heartRateEmotion) {
      fusedEmotion = speechEmotion;
      fusedConfidence = (speechConfidence * speechWeight + heartRateConfidence * heartRateWeight) * 1.1;
    } else {
      if (speechConfidence > heartRateConfidence) {
        fusedEmotion = speechEmotion;
        fusedConfidence = speechConfidence * speechWeight + heartRateConfidence * heartRateWeight * 0.5;
      } else {
        fusedEmotion = heartRateEmotion;
        fusedConfidence = heartRateConfidence * heartRateWeight + speechConfidence * speechWeight * 0.5;
      }
    }

    fusedConfidence = Math.min(fusedConfidence, 1.0);

    return {
      emotion: fusedEmotion,
      confidence: fusedConfidence,
      speechContribution: speechWeight * speechConfidence,
      heartRateContribution: heartRateWeight * heartRateConfidence,
    };
  }

  async predictFusionEmotion(
    audioUri: string,
    heartRate: number,
    variability: number
  ): Promise<FusionEmotionResult> {
    try {
      const speechResult = await this.predictSpeechEmotion(audioUri);
      const heartRateResult = await this.predictHeartRateEmotion(heartRate, variability);

      const fusionPrediction = this.mockFusionPrediction(
        speechResult.emotion,
        speechResult.confidence,
        heartRateResult.emotion,
        heartRateResult.confidence
      );

      return {
        emotion: fusionPrediction.emotion,
        confidence: fusionPrediction.confidence,
        speechContribution: fusionPrediction.speechContribution,
        heartRateContribution: fusionPrediction.heartRateContribution,
        fusionScore: fusionPrediction.confidence,
      };
    } catch (error) {
      console.error('Fusion emotion prediction error:', error);
      throw new Error('Failed to predict fusion emotion');
    }
  }

  async saveEmotionPrediction(
    emotion: EmotionType,
    confidence: number,
    source: 'speech' | 'heart_rate' | 'fusion',
    metadata?: any
  ): Promise<void> {
    try {
      // Simulate user authentication
      const user = { id: 'simulated_user_123' };

      if (!user) {
        console.warn('User not authenticated, skipping save');
        return;
      }

      // Simulate database save
      console.log('Saving emotion prediction (simulation):', {
        user_id: user.id,
        emotion,
        confidence,
        prediction_type: source,
        created_at: new Date().toISOString(),
        metadata
      });
    } catch (error) {
      console.error('Error saving emotion prediction (simulation):', error);
    }
  }

  async getEmotionHistory(limit: number = 50): Promise<any[]> {
    try {
      // Simulate user authentication
      const user = { id: 'simulated_user_123' };

      if (!user) {
        return [];
      }

      // Simulate database query result
      const mockData = [
        {
          id: 1,
          emotion: 'happy',
          confidence: 0.85,
          prediction_type: 'speech',
          created_at: new Date(Date.now() - 60000).toISOString(),
          user_id: user.id
        },
        {
          id: 2,
          emotion: 'neutral',
          confidence: 0.72,
          prediction_type: 'heart_rate',
          created_at: new Date(Date.now() - 120000).toISOString(),
          user_id: user.id
        }
      ];

      console.log('Fetching emotion history (simulation):', mockData);
      return mockData.slice(0, limit);
    } catch (error) {
      console.error('Error fetching emotion history (simulation):', error);
      return [];
    }
  }
}

export const emotionAPIService = new EmotionAPIService();
