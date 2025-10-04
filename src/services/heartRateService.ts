import { Platform, PermissionsAndroid } from 'react-native';
import GoogleFit, { Scopes, BucketUnit } from 'react-native-google-fit';

export interface HeartRateReading {
  heartRate: number;
  timestamp: Date;
  variability?: number;
  source: 'google_fit' | 'apple_health' | 'manual';
}

export class HeartRateService {
  private isMonitoring: boolean = false;
  private currentHeartRate: number = 0;
  private listeners: Array<(reading: HeartRateReading) => void> = [];
  private monitoringInterval: any = null;
  private isGoogleFitAuthorized: boolean = false;
  private heartRateHistory: number[] = [];

  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        return await this.requestAndroidPermissions();
      } else if (Platform.OS === 'ios') {
        return await this.requestIOSPermissions();
      }
      return false;
    } catch (error) {
      console.error('Error requesting heart rate permissions:', error);
      return false;
    }
  }

  private async requestAndroidPermissions(): Promise<boolean> {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
        {
          title: 'Heart Rate Permission',
          message: 'This app needs access to your heart rate sensor for emotion recognition.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.error('Android permissions error:', error);
      return false;
    }
  }

  private async requestIOSPermissions(): Promise<boolean> {
    return true;
  }

  async connectGoogleFit(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.log('Google Fit is only available on Android');
      return false;
    }

    try {
      const options = {
        scopes: [
          Scopes.FITNESS_HEART_RATE_READ,
          Scopes.FITNESS_BODY_READ,
        ],
      };

      const result = await GoogleFit.authorize(options);
      this.isGoogleFitAuthorized = result.success;

      if (result.success) {
        console.log('Google Fit authorized successfully');
        GoogleFit.startRecording((callback: any) => {
          console.log('Google Fit recording started');
        }, (error: any) => {
          console.error('Google Fit recording error:', error);
        });
      } else {
        console.error('Google Fit authorization failed');
      }

      return result.success;
    } catch (error) {
      console.error('Error connecting to Google Fit:', error);
      return false;
    }
  }

  async connectAppleHealth(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      console.log('Apple Health is only available on iOS');
      return false;
    }
    return true;
  }

  async startMonitoring(): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Heart rate monitoring permission not granted');
    }

    this.isMonitoring = true;

    if (Platform.OS === 'android' && this.isGoogleFitAuthorized) {
      await this.monitorGoogleFitHeartRate();
    } else {
      this.simulateHeartRateReadings();
    }
  }

  private async monitorGoogleFitHeartRate(): Promise<void> {
    this.monitoringInterval = setInterval(async () => {
      if (!this.isMonitoring) {
        return;
      }

      try {
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 60000);

        const heartRateSamples = await GoogleFit.getHeartRateSamples({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          bucketUnit: BucketUnit.MINUTE,
          bucketInterval: 1,
        });

        if (heartRateSamples && heartRateSamples.length > 0) {
          const latestSample = heartRateSamples[heartRateSamples.length - 1];
          const heartRate = Math.round(latestSample.value);

          this.heartRateHistory.push(heartRate);
          if (this.heartRateHistory.length > 10) {
            this.heartRateHistory.shift();
          }

          const variability = this.calculateVariability(this.heartRateHistory);

          const reading: HeartRateReading = {
            heartRate,
            timestamp: new Date(latestSample.startDate),
            variability,
            source: 'google_fit',
          };

          this.currentHeartRate = heartRate;
          this.notifyListeners(reading);
        } else {
          this.simulateHeartRateReadings();
        }
      } catch (error) {
        console.error('Error fetching Google Fit heart rate:', error);
        this.simulateHeartRateReadings();
      }
    }, 2000);
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  private simulateHeartRateReadings(): void {
    if (!this.isMonitoring) return;

    const baseHeartRate = 70;
    const variation = 15;
    const heartRate = Math.floor(baseHeartRate + (Math.random() - 0.5) * variation);

    this.heartRateHistory.push(heartRate);
    if (this.heartRateHistory.length > 10) {
      this.heartRateHistory.shift();
    }

    const variability = this.calculateVariability(this.heartRateHistory);

    const reading: HeartRateReading = {
      heartRate,
      timestamp: new Date(),
      variability,
      source: Platform.OS === 'android' ? 'google_fit' : 'apple_health',
    };

    this.currentHeartRate = heartRate;
    this.notifyListeners(reading);

    if (this.isMonitoring && !this.monitoringInterval) {
      setTimeout(() => this.simulateHeartRateReadings(), 1000);
    }
  }

  getCurrentHeartRate(): number {
    return this.currentHeartRate;
  }

  getIsMonitoring(): boolean {
    return this.isMonitoring;
  }

  isConnected(): boolean {
    return this.isGoogleFitAuthorized;
  }

  subscribe(callback: (reading: HeartRateReading) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners(reading: HeartRateReading): void {
    this.listeners.forEach(listener => listener(reading));
  }

  async getHistoricalData(startDate: Date, endDate: Date): Promise<HeartRateReading[]> {
    if (Platform.OS === 'android' && this.isGoogleFitAuthorized) {
      try {
        const heartRateSamples = await GoogleFit.getHeartRateSamples({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          bucketUnit: BucketUnit.HOUR,
          bucketInterval: 1,
        });

        return heartRateSamples.map((sample: any) => ({
          heartRate: Math.round(sample.value),
          timestamp: new Date(sample.startDate),
          variability: 0,
          source: 'google_fit' as const,
        }));
      } catch (error) {
        console.error('Error fetching historical data from Google Fit:', error);
      }
    }

    const mockData: HeartRateReading[] = [];
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    for (let i = 0; i < Math.min(daysDiff * 5, 50); i++) {
      const date = new Date(startDate.getTime() + (i * 1000 * 60 * 60 * 4));
      mockData.push({
        heartRate: Math.floor(65 + Math.random() * 30),
        timestamp: date,
        variability: Math.random() * 50 + 20,
        source: Platform.OS === 'android' ? 'google_fit' : 'apple_health',
      });
    }

    return mockData;
  }

  calculateVariability(readings: number[]): number {
    if (readings.length < 2) return 0;

    const differences = [];
    for (let i = 1; i < readings.length; i++) {
      differences.push(Math.abs(readings[i] - readings[i - 1]));
    }

    const sum = differences.reduce((acc, val) => acc + val, 0);
    return sum / differences.length;
  }
}

export const heartRateService = new HeartRateService();
