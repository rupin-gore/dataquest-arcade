// Web Audio API Sound Effects Synthesizer - 100% offline & procedural
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.initAudio = this.initAudio.bind(this);
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  initAudio() {
    this.init();
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.15) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio error", e);
    }
  }

  // Click UI sound
  playClick() {
    this.playTone(800, 'triangle', 0.05, 0.08);
  }

  // XP Gain Sound (Pleasant rising high chime)
  playXpGain() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.15, 0.12);
      }, idx * 60);
    });
  }

  // Challenge Completed Fanfare
  playSuccess() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [
      { f: 440.00, t: 0.1 },  // A4
      { f: 554.37, t: 0.1 },  // C#5
      { f: 659.25, t: 0.12 }, // E5
      { f: 880.00, t: 0.35 }  // A5
    ];
    let time = 0;
    notes.forEach(n => {
      setTimeout(() => {
        this.playTone(n.f, 'triangle', n.t, 0.2);
      }, time * 1000);
      time += 0.09;
    });
  }

  // Level Up Major Fanfare
  playLevelUp() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const chord = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    chord.forEach((f, i) => {
      setTimeout(() => {
        this.playTone(f, 'sine', 0.4, 0.15);
      }, i * 70);
    });
  }

  // Error / Warning Buzz
  playError() {
    this.playTone(180, 'sawtooth', 0.18, 0.15);
  }
}

export const sound = new SoundEngine();
