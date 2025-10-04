export type EmotionType =
  | 'happy'
  | 'sad'
  | 'angry'
  | 'fearful'
  | 'disgusted'
  | 'surprised'
  | 'neutral'
  | 'calm';

export interface EmotionPrediction {
  emotion: EmotionType;
  confidence: number;
  timestamp: Date;
  source: 'speech' | 'heart_rate' | 'fusion';
}

export interface SpeechEmotionResult {
  emotion: EmotionType;
  confidence: number;
  probabilities: Record<string, number>;
  audioPath: string;
  duration: number;
}

export interface HeartRateEmotionResult {
  emotion: EmotionType;
  confidence: number;
  heartRate: number;
  variability: number;
  timestamp: Date;
}

export interface FusionEmotionResult {
  emotion: EmotionType;
  confidence: number;
  speechContribution: number;
  heartRateContribution: number;
  fusionScore: number;
}

export interface EmotionHistory {
  id: string;
  userId: string;
  emotion: EmotionType;
  confidence: number;
  source: 'speech' | 'heart_rate' | 'fusion';
  metadata?: any;
  createdAt: Date;
}
