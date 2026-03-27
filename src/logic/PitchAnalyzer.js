import { YIN } from 'pitchfinder';

class PitchAnalyzer {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.mediaStreamSource = null;
    this.detectPitch = null;
    this.isRecording = false;
    this.animationId = null;
    this.onPitchUpdate = null;
  }

  async start(callback) {
    if (this.isRecording) return;
    this.onPitchUpdate = callback;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: {
        echoCancellation: false,
        autoGainControl: false,
        noiseSuppression: false
      } });
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;

      this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
      this.mediaStreamSource.connect(this.analyser);

      this.detectPitch = YIN({ sampleRate: this.audioContext.sampleRate });
      this.isRecording = true;
      this.processAudio();

    } catch (err) {
      console.error("Microphone access check failed:", err);
      if (this.onPitchUpdate) this.onPitchUpdate({ error: "No MIC access" });
    }
  }

  processAudio() {
    if (!this.isRecording) return;
    const buffer = new Float32Array(this.analyser.fftSize);
    this.analyser.getFloatTimeDomainData(buffer);
    
    // Check volume (RMS) to filter out silence
    let sumSquares = 0.0;
    for (let i = 0; i < buffer.length; i++) {
      sumSquares += buffer[i] * buffer[i];
    }
    const rms = Math.sqrt(sumSquares / buffer.length);

    if (rms > 0.01) { // Noise gate threshold
      const pitch = this.detectPitch(buffer);
      if (pitch && pitch > 50 && pitch < 2000) { // Human range + standard instruments
        const { note, octave, cents, isPerfect } = this.getMusicalData(pitch);
        if (this.onPitchUpdate) {
          this.onPitchUpdate({ pitch, note, octave, cents, isPerfect, rms });
        }
      } else {
        if (this.onPitchUpdate) this.onPitchUpdate(null);
      }
    } else {
      if (this.onPitchUpdate) this.onPitchUpdate(null);
    }

    if (this.isRecording) {
      this.animationId = requestAnimationFrame(() => this.processAudio());
    }
  }

  stop() {
    this.isRecording = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.mediaStreamSource) {
      this.mediaStreamSource.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStreamSource.disconnect();
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }

  getMusicalData(frequency) {
    const A4 = 440;
    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    
    // Half steps from A4
    const halfStepsFromA4 = Math.round(12 * Math.log2(frequency / A4));
    
    // Note index (A is index 9 in the array)
    let noteIndex = (9 + halfStepsFromA4) % 12;
    if (noteIndex < 0) noteIndex += 12;
    
    const note = notes[noteIndex];
    
    // Octave (A4 is octave 4, C4 is 9 steps below A4)
    const octave = Math.floor((halfStepsFromA4 + 9) / 12) + 4;
    
    // Exact frequency of the rounded note
    const exactFrequency = A4 * Math.pow(2, halfStepsFromA4 / 12);
    // Cents offset
    const cents = Math.round(1200 * Math.log2(frequency / exactFrequency));
    
    return {
      note,
      octave,
      cents,
      isPerfect: Math.abs(cents) <= 5 // ±5 cents is considered in-tune
    };
  }
}

export default PitchAnalyzer;
