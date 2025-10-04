// Audio service simulation for React Native (no Expo dependencies)
export interface AudioRecordingResult {
  uri: string;
  duration: number;
  size: number;
}

export class AudioRecordingService {
  private isRecording: boolean = false;
  private startTime: number = 0;
  private recordingUri: string = '';

  async requestPermissions(): Promise<boolean> {
    return true;
  }

  async startRecording(): Promise<void> {
    this.isRecording = true;
    this.startTime = Date.now();
    this.recordingUri = `simulated_recording_${this.startTime}.wav`;
    console.log('Audio recording started (simulation)');
  }

  async stopRecording(): Promise<AudioRecordingResult> {
    if (!this.isRecording) {
      throw new Error('No active recording to stop');
    }

    this.isRecording = false;
    const duration = Date.now() - this.startTime;
    
    console.log('Audio recording stopped (simulation)');
    
    return {
      uri: this.recordingUri,
      duration: duration,
      size: Math.floor(duration * 0.1),
    };
  }

  async getDuration(): Promise<number> {
    if (this.isRecording) {
      return Date.now() - this.startTime;
    }
    return 0;
  }

  async pauseRecording(): Promise<void> {
    console.log('Recording paused (simulation)');
  }

  async resumeRecording(): Promise<void> {
    console.log('Recording resumed (simulation)');
  }

  async playRecording(uri: string): Promise<void> {
    console.log(`Playing recording: ${uri} (simulation)`);
  }

  getIsRecording(): boolean {
    return this.isRecording;
  }

  cleanup(): void {
    this.isRecording = false;
    this.startTime = 0;
    this.recordingUri = '';
  }
}

export const audioService = new AudioRecordingService();
