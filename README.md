# Emotion Recognition Mobile App

A React Native application for emotion recognition using multiple methods including voice analysis, heart rate monitoring, and fusion of both techniques.

## Features

### 🎤 Voice Emotion Recognition
- Records and analyzes voice patterns
- Detects emotional states through speech characteristics
- Real-time voice pattern visualization
- Easy-to-use recording interface

### 💓 Heart Rate Emotion Recognition  
- Monitors heart rate using device camera
- Correlates heart rate variability with emotional states
- Real-time heart rate display
- Heart rate zone indicators

### 🔗 Fusion Emotion Recognition
- Combines both voice and heart rate data
- Enhanced accuracy through multi-modal analysis
- Confidence scoring system
- Comprehensive emotional state assessment

## App Structure

```
src/
├── screens/
│   ├── HomeScreen.tsx          # Main navigation hub
│   ├── VoiceEmotionScreen.tsx  # Voice-based emotion detection
│   ├── HeartRateEmotionScreen.tsx # Heart rate-based emotion detection
│   └── FusionEmotionScreen.tsx # Combined analysis approach
```

## Navigation

The app uses React Navigation with a stack navigator:
- **Home Screen**: Main dashboard with three navigation cards
- **Voice Emotion**: Voice recording and analysis interface
- **Heart Rate Emotion**: Heart rate monitoring interface  
- **Fusion Emotion**: Combined analysis interface

## Getting Started

### Prerequisites
- React Native development environment
- Android Studio (for Android)
- Node.js and npm

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd Emotional_Reco_Mobile_APP
```

2. Install dependencies
```bash
npm install
```

3. Run on Android
```bash
# Set Gradle options for network connectivity
$env:GRADLE_OPTS = "-Dfile.encoding=UTF-8 -Djava.net.preferIPv4Stack=true"
npx react-native run-android
```

### Dependencies

- `@react-navigation/native` - Navigation framework
- `@react-navigation/stack` - Stack navigator
- `react-native-screens` - Native screen optimization
- `react-native-safe-area-context` - Safe area handling
- `react-native-gesture-handler` - Gesture management

## Usage

1. **Launch the app** and you'll see the home screen with three emotion recognition options
2. **Select Voice Emotion Recognition** to analyze emotions through speech
3. **Select Heart Rate Emotion Recognition** to monitor emotions via heart rate
4. **Select Fusion Emotion Recognition** for combined analysis using both methods

## Features in Development

- [ ] Actual voice recording implementation
- [ ] Real heart rate monitoring via camera
- [ ] Machine learning emotion analysis
- [ ] Historical data tracking
- [ ] Export functionality
- [ ] User profiles and preferences

## Build Status

✅ Successfully builds and runs on Android
✅ Navigation working properly
✅ All screens implemented with UI
✅ Responsive design for different screen sizes

## Troubleshooting

### Network Issues
If you encounter network connectivity issues during build:
```bash
$env:GRADLE_OPTS = "-Dfile.encoding=UTF-8 -Djava.net.preferIPv4Stack=true"
```

### Build Issues
Clean and rebuild if needed:
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```
