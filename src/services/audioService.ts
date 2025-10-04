import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { PermissionsAndroid, Platform } from 'react-native';
import RNFS from 'react-native-fs';

export interface AudioRecordingResult {
  uri: string;
  duration: number;
  size: number;
}

export class AudioRecordingService {
  private audioRecorderPlayer: any;
  private isRecording: boolean = false;
  private recordingPath: string = '';
  private startTime: number = 0;
  private currentRecordingUri: string = '';

  constructor() {
    this.audioRecorderPlayer = new AudioRecorderPlayer();
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]);

        return (
          grants['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED &&
          grants['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.error('Permission request error:', err);
        return false;
      }
    }
    return true;
  }

  async startRecording(): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Recording permissions not granted');
      }

      this.startTime = Date.now();
      const timestamp = new Date().getTime();
      this.recordingPath = Platform.select({
        ios: `emotion_recording_${timestamp}.m4a`,
        android: `${RNFS.CachesDirectoryPath}/emotion_recording_${timestamp}.wav`,
      }) || '';

      const uri = await this.audioRecorderPlayer.startRecorder(this.recordingPath);
      this.currentRecordingUri = uri;
      this.isRecording = true;

      this.audioRecorderPlayer.addRecordBackListener((e) => {
        return;
      });

      console.log('Audio recording started:', uri);
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  async stopRecording(): Promise<AudioRecordingResult> {
    if (!this.isRecording) {
      throw new Error('No active recording to stop');
    }

    try {
      const result = await this.audioRecorderPlayer.stopRecorder();
      this.audioRecorderPlayer.removeRecordBackListener();
      this.isRecording = false;

      const duration = Date.now() - this.startTime;

      let size = 0;
      try {
        const fileInfo = await RNFS.stat(this.currentRecordingUri);
        size = fileInfo.size;
      } catch (error) {
        console.error('Failed to get file size:', error);
        size = Math.floor(duration * 0.016);
      }

      console.log('Audio recording stopped:', result);

      return {
        uri: this.currentRecordingUri,
        duration: duration / 1000,
        size: size,
      };
    } catch (error) {
      console.error('Failed to stop recording:', error);
      this.isRecording = false;
      throw error;
    }
  }

  async getDuration(): Promise<number> {
    if (this.isRecording) {
      return (Date.now() - this.startTime) / 1000;
    }
    return 0;
  }

  async pauseRecording(): Promise<void> {
    try {
      await this.audioRecorderPlayer.pauseRecorder();
      console.log('Recording paused');
    } catch (error) {
      console.error('Failed to pause recording:', error);
    }
  }

  async resumeRecording(): Promise<void> {
    try {
      await this.audioRecorderPlayer.resumeRecorder();
      console.log('Recording resumed');
    } catch (error) {
      console.error('Failed to resume recording:', error);
    }
  }

  async playRecording(uri: string): Promise<void> {
    try {
      console.log('Playing recording:', uri);
      await this.audioRecorderPlayer.startPlayer(uri);
      this.audioRecorderPlayer.addPlayBackListener((e) => {
        if (e.currentPosition === e.duration) {
          this.audioRecorderPlayer.stopPlayer();
        }
      });
    } catch (error) {
      console.error('Failed to play recording:', error);
      throw error;
    }
  }

  async stopPlaying(): Promise<void> {
    try {
      await this.audioRecorderPlayer.stopPlayer();
      this.audioRecorderPlayer.removePlayBackListener();
      console.log('Playback stopped');
    } catch (error) {
      console.error('Failed to stop playback:', error);
    }
  }

  getIsRecording(): boolean {
    return this.isRecording;
  }

  async deleteRecording(uri: string): Promise<void> {
    try {
      await RNFS.unlink(uri);
      console.log('Recording deleted:', uri);
    } catch (error) {
      console.error('Failed to delete recording:', error);
    }
  }

  cleanup(): void {
    if (this.isRecording) {
      this.audioRecorderPlayer.stopRecorder();
    }
    this.audioRecorderPlayer.removeRecordBackListener();
    this.audioRecorderPlayer.removePlayBackListener();
    this.isRecording = false;
    this.startTime = 0;
    this.recordingPath = '';
    this.currentRecordingUri = '';
  }
}

export const audioService = new AudioRecordingService();
