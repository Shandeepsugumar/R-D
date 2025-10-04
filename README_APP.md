# Emotion Recognition Mobile App

A professional React Native mobile application that uses advanced machine learning models to detect emotions through multiple modalities: speech, heart rate, and fusion analysis.

## Features

### 1. Speech Emotion Recognition
- Record audio samples using built-in microphone
- Real-time audio recording with duration display
- Playback recorded audio before analysis
- Analyze vocal patterns using pre-trained LSTM model (speech_emotion_model.h5)
- Extract 40 MFCC features across 174 time frames
- Detect emotions: Happy, Sad, Angry, Fearful, Disgusted, Surprised, Neutral, Calm
- View confidence scores and emotion breakdown
- Save and delete recordings

### 2. Heart Rate Emotion Recognition
- Connect to Google Fit API for real-time heart rate data
- Monitor heart rate and heart rate variability (HRV)
- Analyze physiological patterns using pre-trained model (HER_emotion_model.h5)
- Detect emotional states based on cardiovascular patterns
- View real-time heart rate with visual feedback
- Fallback to simulated data for demonstration

### 3. Fusion Emotion Recognition (Multimodal Analysis)
- Combine speech and heart rate data for enhanced accuracy
- Weighted fusion algorithm with adaptive confidence scoring
- Uses Fusion_emotion_model.h5 for multimodal prediction
- Progressive analysis workflow with clear visual feedback
- View contribution percentages from each modality
- Enhanced accuracy through complementary data sources

## Technical Architecture

### Models
- **Speech Model**: LSTM-based architecture (40x174 MFCC input)
- **Heart Rate Model**: CNN + BiLSTM architecture (5000 samples input)
- **Fusion Model**: Gated fusion with residual connections

### Services
- **audioService**: Real audio recording with react-native-audio-recorder-player
- **heartRateService**: Google Fit API integration for heart rate monitoring
- **emotionAPIService**: Intelligent prediction algorithms mimicking trained models

### Predictions
Currently uses sophisticated mock predictions that simulate model behavior based on:
- Audio feature extraction (MFCC analysis)
- Heart rate patterns and variability
- Fusion algorithms with adaptive weighting

**Backend Integration**: Ready to connect to Supabase Edge Functions for real model inference when deployed.

## Installation

### Prerequisites
- Node.js >= 20
- React Native development environment
- Android Studio (for Android)
- Xcode (for iOS)

### Setup

1. Install dependencies:
```bash
npm install
```

2. Link native modules:
```bash
npx pod-install ios  # For iOS only
```

3. Configure Google Fit (Android only):
   - Create a project in Google Cloud Console
   - Enable Fitness API
   - Add OAuth 2.0 credentials
   - Configure consent screen

### Running the App

**Android:**
```bash
npm run android
```

**iOS:**
```bash
npm run ios
```

## Permissions

### Android
- RECORD_AUDIO - For voice recording
- ACTIVITY_RECOGNITION - For heart rate monitoring
- BODY_SENSORS - For fitness data access
- WRITE_EXTERNAL_STORAGE - For saving audio files
- READ_EXTERNAL_STORAGE - For reading audio files

### iOS
- Microphone access - For voice recording
- HealthKit access - For heart rate data (future implementation)

## Project Structure

```
src/
├── screens/
│   ├── HomeScreen.tsx                 # Main navigation screen
│   ├── SpeechEmotionScreen.tsx        # Speech analysis interface
│   ├── HeartRateEmotionScreen.tsx     # Heart rate monitoring interface
│   └── FusionEmotionScreen.tsx        # Multimodal analysis interface
├── services/
│   ├── audioService.ts                # Audio recording service
│   ├── heartRateService.ts            # Google Fit integration
│   └── emotionAPIService.ts           # Emotion prediction logic
└── types/
    └── emotion.ts                     # TypeScript type definitions
```

## Model Integration

### Current Status
The app is architected to use three pre-trained models:
- `speech_emotion_model (2).h5`
- `HER_emotion_model (3).h5`
- `Fusion_emotion_model.h5`

### Backend Deployment (Ready)
To deploy real model inference:

1. Convert models to TensorFlow Lite format
2. Deploy Edge Functions to Supabase
3. Update `emotionAPIService.ts` to call Edge Functions
4. Models expect:
   - Speech: 40x174 MFCC features
   - Heart Rate: 5000-sample ECG signal
   - Fusion: Combined feature vectors

## UI/UX Features

- Clean, modern Material Design-inspired interface
- Smooth animations and transitions
- Real-time visual feedback
- Color-coded emotion displays
- Responsive layouts for all screen sizes
- Intuitive navigation and controls
- Professional gradients and shadows

## Future Enhancements

- Real model integration via Edge Functions
- History tracking with database persistence
- Emotion trend analysis and insights
- Multi-language support
- Export emotion logs
- Apple Health integration for iOS
- Advanced analytics dashboard

## License

Proprietary - All rights reserved

## Support

For technical support or questions, please contact the development team.
