// Web Audio API Synthesizer for Scouting Sounds: Whistle, Clapping, Morse & Melodies

class ScoutAudioEngine {
  private ctx: AudioContext | null = null;
  private currentMorseStop: (() => void) | null = null;
  private currentSongStop: (() => void) | null = null;

  private getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Authentic Scout Whistle sound using dual tuned oscillators with flutter modulation
   */
  public playWhistle(type: 'pendek' | 'panjang' | 'kumpul' | 'awas' | 'bahaya' = 'pendek') {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const playTone = (startTime: number, duration: number) => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const lfo = ctx.createOscillator(); // flutter / warble
      const lfoGain = ctx.createGain();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Scout whistle frequencies
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(2700, startTime);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(2950, startTime);

      // Flutter LFO (creates the rolling pea in whistle sound)
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(32, startTime);
      lfoGain.gain.setValueAtTime(120, startTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      lfoGain.connect(osc2.frequency);

      // Bandpass shaping
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2850, startTime);
      filter.Q.setValueAtTime(2.5, startTime);

      // Attack & decay envelope
      gainNode.gain.setValueAtTime(0.001, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.35, startTime + 0.04);
      gainNode.gain.setValueAtTime(0.35, startTime + duration - 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      lfo.start(startTime);
      osc1.start(startTime);
      osc2.start(startTime);

      lfo.stop(startTime + duration);
      osc1.stop(startTime + duration);
      osc2.stop(startTime + duration);
    };

    if (type === 'pendek') {
      playTone(now, 0.22);
    } else if (type === 'panjang') {
      playTone(now, 0.75);
    } else if (type === 'kumpul') {
      // Tiupan Kumpul: . . -
      playTone(now, 0.18);
      playTone(now + 0.3, 0.18);
      playTone(now + 0.6, 0.65);
    } else if (type === 'awas') {
      // Tiupan Awas: . . . . .
      for (let i = 0; i < 5; i++) {
        playTone(now + i * 0.22, 0.12);
      }
    } else if (type === 'bahaya') {
      // Tiupan Bahaya: - - -
      playTone(now, 0.5);
      playTone(now + 0.65, 0.5);
      playTone(now + 1.3, 0.8);
    }
  }

  /**
   * Realistic acoustic handclap sound using filtered white noise burst
   */
  public playSingleClap(timeOffset = 0) {
    const ctx = this.getContext();
    const startTime = ctx.currentTime + timeOffset;

    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1100, startTime);
    filter.Q.setValueAtTime(1.8, startTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.075);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    whiteNoise.start(startTime);
    whiteNoise.stop(startTime + 0.08);
  }

  /**
   * Full authentic "Tepuk Pramuka" rhythm:
   * (Prok Prok Prok) - (Prok Prok Prok) - (Prok Prok Prok Prok Prok Prok Prok!)
   */
  public playTepukPramuka(onDone?: () => void) {
    const tempo = 0.16; // 160ms between claps
    // Set 1: 3 claps
    this.playSingleClap(0);
    this.playSingleClap(tempo);
    this.playSingleClap(tempo * 2);

    // Pause
    const set2Start = tempo * 4;
    // Set 2: 3 claps
    this.playSingleClap(set2Start);
    this.playSingleClap(set2Start + tempo);
    this.playSingleClap(set2Start + tempo * 2);

    // Pause
    const set3Start = set2Start + tempo * 4;
    // Set 3: 7 claps
    for (let i = 0; i < 7; i++) {
      this.playSingleClap(set3Start + i * tempo);
    }

    const totalDuration = (set3Start + 7 * tempo) * 1000;
    if (onDone) {
      setTimeout(onDone, totalDuration + 100);
    }
  }

  /**
   * Morse Sound Generator with visual callback synchronization
   */
  public playMorse(
    morseString: string,
    wpm = 14,
    onSymbol?: (symbol: string, index: number) => void,
    onComplete?: () => void
  ) {
    this.stopMorse();
    const ctx = this.getContext();
    const dotDuration = 1.2 / wpm; // seconds per dot
    const dashDuration = dotDuration * 3;
    const symbolGap = dotDuration;
    const letterGap = dotDuration * 3;
    const wordGap = dotDuration * 7;

    let isCancelled = false;
    this.currentMorseStop = () => {
      isCancelled = true;
    };

    let currentTime = ctx.currentTime + 0.05;
    const symbols = morseString.split('');

    const playTone = (duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(750, currentTime);

      // soft attack and release to avoid audio click
      gain.gain.setValueAtTime(0.001, currentTime);
      gain.gain.linearRampToValueAtTime(0.3, currentTime + 0.008);
      gain.gain.setValueAtTime(0.3, currentTime + duration - 0.008);
      gain.gain.linearRampToValueAtTime(0.001, currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(currentTime);
      osc.stop(currentTime + duration);
    };

    symbols.forEach((char, index) => {
      const scheduledTime = currentTime;
      if (char === '.') {
        playTone(dotDuration);
        const delayMs = Math.max(0, (scheduledTime - ctx.currentTime) * 1000);
        setTimeout(() => {
          if (!isCancelled && onSymbol) onSymbol('.', index);
        }, delayMs);
        currentTime += dotDuration + symbolGap;
      } else if (char === '-' || char === '—') {
        playTone(dashDuration);
        const delayMs = Math.max(0, (scheduledTime - ctx.currentTime) * 1000);
        setTimeout(() => {
          if (!isCancelled && onSymbol) onSymbol('-', index);
        }, delayMs);
        currentTime += dashDuration + symbolGap;
      } else if (char === ' ') {
        currentTime += letterGap;
        const delayMs = Math.max(0, (scheduledTime - ctx.currentTime) * 1000);
        setTimeout(() => {
          if (!isCancelled && onSymbol) onSymbol(' ', index);
        }, delayMs);
      } else if (char === '/' || char === '|') {
        currentTime += wordGap;
        const delayMs = Math.max(0, (scheduledTime - ctx.currentTime) * 1000);
        setTimeout(() => {
          if (!isCancelled && onSymbol) onSymbol('/', index);
        }, delayMs);
      }
    });

    const totalDurationMs = Math.max(0, (currentTime - ctx.currentTime) * 1000);
    setTimeout(() => {
      if (!isCancelled) {
        if (onComplete) onComplete();
        this.currentMorseStop = null;
      }
    }, totalDurationMs + 50);
  }

  public stopMorse() {
    if (this.currentMorseStop) {
      this.currentMorseStop();
      this.currentMorseStop = null;
    }
  }

  /**
   * Telegraph Key Sandbox: start tone when pressed down, stop when released
   */
  private telegraphOsc: OscillatorNode | null = null;
  private telegraphGain: GainNode | null = null;

  public startTelegraphTone() {
    if (this.telegraphOsc) return;
    const ctx = this.getContext();
    this.telegraphOsc = ctx.createOscillator();
    this.telegraphGain = ctx.createGain();

    this.telegraphOsc.type = 'sine';
    this.telegraphOsc.frequency.setValueAtTime(750, ctx.currentTime);

    this.telegraphGain.gain.setValueAtTime(0.001, ctx.currentTime);
    this.telegraphGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.008);

    this.telegraphOsc.connect(this.telegraphGain);
    this.telegraphGain.connect(ctx.destination);
    this.telegraphOsc.start();
  }

  public stopTelegraphTone() {
    if (!this.telegraphOsc || !this.telegraphGain) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;
    this.telegraphGain.gain.linearRampToValueAtTime(0.001, now + 0.01);
    this.telegraphOsc.stop(now + 0.015);
    this.telegraphOsc = null;
    this.telegraphGain = null;
  }

  /**
   * Note frequency lookup helper
   */
  private noteFreq(note: string): number {
    const freqs: Record<string, number> = {
      C4: 261.63,
      D4: 293.66,
      E4: 329.63,
      F4: 349.23,
      G4: 392.0,
      A4: 440.0,
      B4: 493.88,
      C5: 523.25,
      D5: 587.33,
      E5: 659.25,
      F5: 698.46,
      G5: 783.99,
      A5: 880.0,
      REST: 0,
    };
    return freqs[note] || 440;
  }

  /**
   * Play Scout Song Melodies (Hymne Pramuka, Api Unggun, etc.)
   */
  public playMelody(
    notes: { note: string; dur: number }[],
    tempoBpm = 100,
    onNote?: (index: number) => void,
    onDone?: () => void
  ) {
    this.stopMelody();
    const ctx = this.getContext();
    let isCancelled = false;
    this.currentSongStop = () => {
      isCancelled = true;
    };

    const beatDuration = 60 / tempoBpm;
    let currentTime = ctx.currentTime + 0.05;

    notes.forEach((item, index) => {
      const scheduledTime = currentTime;
      const freq = this.noteFreq(item.note);
      const noteSeconds = item.dur * beatDuration;

      if (freq > 0) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle'; // warmer brass/woodwind tone
        osc.frequency.setValueAtTime(freq, currentTime);

        gain.gain.setValueAtTime(0.001, currentTime);
        gain.gain.linearRampToValueAtTime(0.28, currentTime + 0.02);
        gain.gain.setValueAtTime(0.28, currentTime + noteSeconds - 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, currentTime + noteSeconds);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(currentTime);
        osc.stop(currentTime + noteSeconds);
      }

      const delayMs = Math.max(0, (scheduledTime - ctx.currentTime) * 1000);
      setTimeout(() => {
        if (!isCancelled && onNote) onNote(index);
      }, delayMs);

      currentTime += noteSeconds;
    });

    const totalDurationMs = Math.max(0, (currentTime - ctx.currentTime) * 1000);
    setTimeout(() => {
      if (!isCancelled) {
        if (onDone) onDone();
        this.currentSongStop = null;
      }
    }, totalDurationMs + 80);
  }

  public stopMelody() {
    if (this.currentSongStop) {
      this.currentSongStop();
      this.currentSongStop = null;
    }
  }

  /**
   * Sound effect for Correct answer: pleasant ascending crystal chime (C5 -> E5 -> G5 -> C6)
   */
  public playCorrectSound() {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const playChimeNote = (freq: number, startTime: number, duration: number, gainLevel = 0.3) => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, startTime);

      // Add octave harmonic shimmer
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 2, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(gainLevel, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(startTime);
      osc2.start(startTime);
      osc1.stop(startTime + duration);
      osc2.stop(startTime + duration);
    };

    playChimeNote(523.25, now, 0.22, 0.28); // C5
    playChimeNote(659.25, now + 0.08, 0.25, 0.32); // E5
    playChimeNote(783.99, now + 0.16, 0.3, 0.35); // G5
    playChimeNote(1046.5, now + 0.26, 0.55, 0.38); // C6 Sparkle
  }

  /**
   * Sound effect for Wrong answer: authentic dual-tone game-show buzz thud (BZZ-BZZ)
   */
  public playWrongSound() {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const playBuzz = (startTime: number, duration: number) => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      // Low detuned sawtooth for authentic buzzer buzz
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(160, startTime);
      osc1.frequency.exponentialRampToValueAtTime(110, startTime + duration);

      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(168, startTime);
      osc2.frequency.exponentialRampToValueAtTime(115, startTime + duration);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(startTime);
      osc2.start(startTime);
      osc1.stop(startTime + duration);
      osc2.stop(startTime + duration);
    };

    playBuzz(now, 0.16);
    playBuzz(now + 0.19, 0.26);
  }
}

export const scoutAudio = new ScoutAudioEngine();
