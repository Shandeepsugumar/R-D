/**
 * Emotion Recognition Mobile App
 * Navigation-based React Native App
 *
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import { SpeechEmotionScreen } from './src/screens/SpeechEmotionScreen';
import { HeartRateEmotionScreen } from './src/screens/HeartRateEmotionScreen';
import { FusionEmotionScreen } from './src/screens/FusionEmotionScreen';

export type RootStackParamList = {
  Home: undefined;
  SpeechEmotion: undefined;
  HeartRateEmotion: undefined;
  FusionEmotion: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="#FFFFFF"
      />
            <NavigationContainer>
        <Stack.Navigator
          id={undefined}
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#F8F9FA' },
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ title: 'Emotion Recognition' }}
          />
          <Stack.Screen 
            name="SpeechEmotion" 
            component={SpeechEmotionScreen}
            options={{ title: 'Speech Emotion' }}
          />
          <Stack.Screen 
            name="HeartRateEmotion" 
            component={HeartRateEmotionScreen}
            options={{ title: 'Heart Rate Emotion' }}
          />
          <Stack.Screen 
            name="FusionEmotion" 
            component={FusionEmotionScreen}
            options={{ title: 'Fusion Emotion' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
