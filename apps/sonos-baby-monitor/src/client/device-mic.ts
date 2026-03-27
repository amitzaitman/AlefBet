// Client-side audio monitoring using the device's built-in microphone
// (phone, tablet, laptop). Uses Web Audio API — works in Safari on iPhone.

export class DeviceMic {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private dataArray: Uint8Array | null = null;

  get isRunning(): boolean {
    return this.audioContext !== null && this.stream !== null;
  }

  async start(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;

    const source = this.audioContext.createMediaStreamSource(this.stream);
    source.connect(this.analyser);

    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
  }

  stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.analyser = null;
    this.dataArray = null;
  }

  /** Returns 0–100 representing current loudness (RMS mapped to dB scale) */
  getLevel(): number {
    if (!this.analyser || !this.dataArray) return 0;
    this.analyser.getByteTimeDomainData(this.dataArray as Uint8Array<ArrayBuffer>);

    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      const v = (this.dataArray[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / this.dataArray.length);
    const db = 20 * Math.log10(Math.max(rms, 0.0001));
    // Map -60dB..0dB → 0..100
    return Math.max(0, Math.min(100, ((db + 60) / 60) * 100));
  }

  /** Returns frequency bin data for visualizer */
  getFrequencyData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(0);
    const freqData = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(freqData);
    return freqData;
  }
}
