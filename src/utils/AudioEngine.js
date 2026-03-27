/**
 * [AUDIO ENGINE] - Real-time Microphone Capture & Analysis
 */
export default class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.stream = null;
    this.source = null;
    this.dataArray = null;
    this.atmosphere = null;
    this.atmosphereGain = null;
  }

  async init() {
    if (this.audioContext) return;
    
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.source.connect(this.analyser);
      
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
    } catch (err) {
      console.error('Microphone access denied:', err);
      throw err;
    }
  }

  getFrequencyData() {
    if (!this.analyser) return new Uint8Array(0);
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }

  getRMS() {
    if (!this.analyser) return 0;
    this.analyser.getByteFrequencyData(this.dataArray);
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
        sum += (this.dataArray[i] * this.dataArray[i]);
    }
    const rms = Math.sqrt(sum / this.dataArray.length);
    return rms;
  }

  /**
   * Converts RMS/Volume to Virtual cmH2O Pressure.
   * Formula: Pressure = RMS * 0.25 (Virtual mapping)
   */
  getPressureCmH2O() {
    const rms = this.getRMS();
    return (rms * 0.25).toFixed(1);
  }

  initAtmosphere() {
    if (!this.audioContext) this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    this.atmosphereGain = this.audioContext.createGain();
    this.atmosphereGain.gain.value = 0;
    this.atmosphereGain.connect(this.audioContext.destination);

    // Simple Brown Noise / Bowl sound simulation
    const bufferSize = 2 * this.audioContext.sampleRate;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // volume adjustment
    }

    this.atmosphere = this.audioContext.createBufferSource();
    this.atmosphere.buffer = noiseBuffer;
    this.atmosphere.loop = true;
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    
    this.atmosphere.connect(filter);
    filter.connect(this.atmosphereGain);
    this.atmosphere.start();
  }

  setAtmosphereVolume(val) {
    if (this.atmosphereGain) {
      this.atmosphereGain.gain.setTargetAtTime(val, this.audioContext.currentTime, 0.1);
    }
  }

  stopAtmosphere() {
    if (this.atmosphere) {
      this.atmosphere.stop();
      this.atmosphere = null;
    }
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.audioContext = null;
    this.analyser = null;
  }
}
