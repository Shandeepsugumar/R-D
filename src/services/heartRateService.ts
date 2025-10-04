import { Platform } from 'react-native';

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
      const { PermissionsAndroid } = require('react-native');
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BODY_SENSORS,
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

  async startMonitoring(): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Heart rate monitoring permission not granted');
    }

    this.isMonitoring = true;
    this.simulateHeartRateReadings();
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
  }

  private simulateHeartRateReadings(): void {
    if (!this.isMonitoring) return;

    const baseHeartRate = 70;
    const variation = 15;
    const heartRate = Math.floor(baseHeartRate + (Math.random() - 0.5) * variation);

    const reading: HeartRateReading = {
      heartRate,
      timestamp: new Date(),
      variability: Math.random() * 50 + 20,
      source: Platform.OS === 'android' ? 'google_fit' : 'apple_health',
    };

    this.currentHeartRate = heartRate;
    this.notifyListeners(reading);

    setTimeout(() => this.simulateHeartRateReadings(), 1000);
  }

  getCurrentHeartRate(): number {
    return this.currentHeartRate;
  }

  getIsMonitoring(): boolean {
    return this.isMonitoring;
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

  async connectGoogleFit(): Promise<boolean> {
    return true;
  }

  async connectAppleHealth(): Promise<boolean> {
    return true;
  }
}

export const heartRateService = new HeartRateService();
