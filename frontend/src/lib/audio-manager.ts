/**
 * Life RPG Adaptive Audio Engine
 * Pure procedural Web Audio API synthesis: 100% royalty-free, zero-latency, zero-bandwidth, zero 404 risks.
 * Supports:
 * - Ambient Calm Music (soothing pentatonic modal pads & crystalline arpeggios)
 * - Battle Combat Music (driving 128 BPM rhythmic synth bass, percussion pulses & heroic lead)
 * - Dynamic 400ms-800ms smooth crossfades
 * - Hit, Defeat, Fanfare, Level-Up, Achievement, and Coin SFX
 * - Browser autoplay compliance with automatic unlock on first user interaction
 */

export type AudioState = "MUTED" | "AMBIENT" | "BATTLE" | "VICTORY" | "IDLE";

class AudioManager {
  private ctx: AudioContext | null = null;
  private isUnlocked: boolean = false;
  private currentState: AudioState = "AMBIENT";

  // Master & Channel Gains
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private battleGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  // Track Loop Intervals / Timers
  private ambientTimer: ReturnType<typeof setInterval> | null = null;
  private battleTimer: ReturnType<typeof setInterval> | null = null;

  // Settings
  private volume: number = 0.5;
  private isMuted: boolean = false;
  private isBgmEnabled: boolean = true;
  private isSfxEnabled: boolean = true;

  constructor() {
    if (typeof window !== "undefined") {
      // Auto-unlock on first pointer interaction to comply with browser autoplay policy
      const unlock = () => {
        this.unlockContext();
        window.removeEventListener("pointerdown", unlock);
        window.removeEventListener("keydown", unlock);
      };
      window.addEventListener("pointerdown", unlock, { once: true });
      window.addEventListener("keydown", unlock, { once: true });
    }
  }

  /**
   * Initializes or resumes the AudioContext upon user gesture.
   */
  public unlockContext(): AudioContext | null {
    if (typeof window === "undefined") return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;

      this.ctx = new AudioCtx();

      // Master Node
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Ambient Node
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      // Battle Node
      this.battleGain = this.ctx.createGain();
      this.battleGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.battleGain.connect(this.masterGain);

      // SFX Node
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.isUnlocked = true;
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.linearRampToValueAtTime(muted ? 0 : this.volume, now + 0.1);
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.linearRampToValueAtTime(this.volume, now + 0.1);
  }

  public setBgmEnabled(enabled: boolean) {
    this.isBgmEnabled = enabled;
    if (!enabled) {
      this.stopAllBgm();
    } else {
      if (this.currentState === "BATTLE") {
        this.startBattleMusic();
      } else {
        this.startAmbientMusic();
      }
    }
  }

  public setSfxEnabled(enabled: boolean) {
    this.isSfxEnabled = enabled;
  }

  public getCurrentState(): AudioState {
    return this.currentState;
  }

  public getCurrentTrack(): "ambient" | "battle" | "idle" {
    if (this.currentState === "BATTLE") return "battle";
    if (this.currentState === "AMBIENT") return "ambient";
    return "idle";
  }

  // =========================================================================
  // CALM AMBIENT MUSIC (Rich, Peaceful, Multi-Track Fantasy Soundtrack)
  // =========================================================================

  public startAmbientMusic() {
    if (!this.isBgmEnabled) return;
    this.unlockContext();
    if (!this.ctx || !this.ambientGain) return;

    // If exploration music is already actively playing, keep it flowing continuously!
    if (this.currentState === "AMBIENT" && this.ambientTimer) {
      const now = this.ctx.currentTime;
      this.ambientGain.gain.cancelScheduledValues(now);
      this.ambientGain.gain.linearRampToValueAtTime(0.5, now + 0.3);
      return;
    }

    this.currentState = "AMBIENT";
    const now = this.ctx.currentTime;

    // Smooth warm crossfade: fade in ambient over 1.2s, fade out battle over 1.0s
    this.ambientGain.gain.cancelScheduledValues(now);
    this.ambientGain.gain.linearRampToValueAtTime(0.5, now + 1.2);

    if (this.battleGain) {
      this.battleGain.gain.cancelScheduledValues(now);
      this.battleGain.gain.linearRampToValueAtTime(0, now + 1.0);
    }

    if (this.battleTimer) {
      clearInterval(this.battleTimer);
      this.battleTimer = null;
    }

    if (!this.ambientTimer) {
      this.schedulePeacefulFantasySuite();
      this.ambientTimer = setInterval(() => {
        this.schedulePeacefulFantasySuite();
      }, 16000); // 8-bar progression @ 2.0s per bar = 16 seconds loop
    }
  }

  /**
   * 8-Bar Peaceful Fantasy Suite:
   * Layer 1: Lush warm string/pad chords (A Minor 9, F Maj 9, C Maj add9, G Sus, Dm 9, Em 7, F Maj 7, Am 7)
   * Layer 2: Plucked Celtic harp arpeggios flowing through chord tones
   * Layer 3: Serene high-register wind flute / ocarina melody with subtle vibrato
   * Layer 4: Soft celestial chime harmonics on key downbeats
   */
  private schedulePeacefulFantasySuite() {
    if (!this.ctx || !this.ambientGain || this.currentState !== "AMBIENT") return;

    const startTime = this.ctx.currentTime;
    const barDuration = 2.0;

    // 8-Bar Chord Definitions (frequencies in Hz)
    const chordProgression = [
      // Bar 0: A minor 9 (Melancholic & Noble)
      { bass: 110.0, pad: [220.0, 261.63, 329.63, 493.88], harp: [220.0, 261.63, 329.63, 493.88] },
      // Bar 1: F Major 9 (Expansive & Warm)
      { bass: 87.31, pad: [174.61, 220.0, 261.63, 392.0], harp: [174.61, 220.0, 261.63, 392.0] },
      // Bar 2: C Major add9 (Bright & Peaceful)
      { bass: 130.81, pad: [196.0, 261.63, 329.63, 587.33], harp: [261.63, 329.63, 392.0, 587.33] },
      // Bar 3: G Suspended 4 / B (Flowing Resolution)
      { bass: 98.0, pad: [196.0, 246.94, 293.66, 392.0], harp: [196.0, 246.94, 293.66, 493.88] },
      // Bar 4: D Minor 9 (Contemplative)
      { bass: 146.83, pad: [220.0, 293.66, 349.23, 523.25], harp: [220.0, 293.66, 349.23, 523.25] },
      // Bar 5: E Minor 7 (Quiet Sanctuary)
      { bass: 82.41, pad: [164.81, 196.0, 246.94, 293.66], harp: [164.81, 196.0, 246.94, 329.63] },
      // Bar 6: F Major 7 (Gentle Sunrise)
      { bass: 87.31, pad: [174.61, 220.0, 261.63, 329.63], harp: [174.61, 220.0, 261.63, 329.63] },
      // Bar 7: A Minor 7 / C (Serene Horizon)
      { bass: 110.0, pad: [220.0, 261.63, 329.63, 392.0], harp: [220.0, 261.63, 329.63, 440.0] },
    ];

    // Flute Melody Phrases (timeOffset in seconds, freq in Hz, duration in seconds)
    const fluteMelody = [
      // Phrase 1 (Bars 0-1): Gentle upward aspiration
      { time: 0.2, freq: 659.25, dur: 0.9 }, // E5
      { time: 1.1, freq: 783.99, dur: 0.8 }, // G5
      { time: 2.0, freq: 880.0, dur: 1.4 },  // A5
      { time: 3.5, freq: 987.77, dur: 0.5 }, // B5

      // Phrase 2 (Bars 2-3): Soothing descent
      { time: 4.1, freq: 1046.5, dur: 1.2 }, // C6
      { time: 5.4, freq: 987.77, dur: 0.7 }, // B5
      { time: 6.2, freq: 783.99, dur: 0.9 }, // G5
      { time: 7.2, freq: 659.25, dur: 1.5 }, // E5

      // Phrase 3 (Bars 4-5): Lyrical flourish
      { time: 8.3, freq: 587.33, dur: 0.7 }, // D5
      { time: 9.1, freq: 698.46, dur: 0.8 }, // F5
      { time: 10.0, freq: 880.0, dur: 1.2 }, // A5
      { time: 11.3, freq: 1046.5, dur: 0.7 },// C6

      // Phrase 4 (Bars 6-7): Calming homecoming
      { time: 12.1, freq: 987.77, dur: 0.8 },// B5
      { time: 13.0, freq: 880.0, dur: 0.9 }, // A5
      { time: 14.0, freq: 659.25, dur: 0.9 },// E5
      { time: 15.0, freq: 440.0, dur: 1.8 }, // A4
    ];

    // Celestial Chimes (Bell harmonics on bars 0, 2, 4, 6)
    const bellChimes = [
      { time: 0.05, freq: 1046.5 }, // C6
      { time: 4.05, freq: 1318.51 }, // E6
      { time: 8.05, freq: 1174.66 }, // D6
      { time: 12.05, freq: 880.0 },  // A5
    ];

    // --- 1. RENDER PAD & BASS CHORDS ---
    chordProgression.forEach((bar, barIdx) => {
      const barTime = startTime + barIdx * barDuration;

      // Bass Drone
      this.playWarmTone(bar.bass, barTime, barDuration + 0.2, 0.035, "sine", 350);

      // Warm Pad Chords
      bar.pad.forEach((freq) => {
        this.playWarmTone(freq, barTime, barDuration + 0.3, 0.022, "triangle", 600);
      });

      // --- 2. RENDER CELTIC HARP ARPEGGIO (4 plucked notes per bar) ---
      bar.harp.forEach((freq, harpIdx) => {
        const harpTime = barTime + harpIdx * 0.48;
        this.playPluckedHarp(freq, harpTime, 0.03);
      });
    });

    // --- 3. RENDER PEACEFUL FLUTE MELODY ---
    fluteMelody.forEach((note) => {
      this.playPeacefulFlute(note.freq, startTime + note.time, note.dur, 0.038);
    });

    // --- 4. RENDER CELESTIAL BELL CHIMES ---
    bellChimes.forEach((bell) => {
      this.playBellChime(bell.freq, startTime + bell.time, 0.02);
    });
  }

  /**
   * Helper: Warm Synth Tone (for Pads and Bass)
   */
  private playWarmTone(freq: number, start: number, duration: number, peakGain: number, type: OscillatorType, filterFreq: number) {
    if (!this.ctx || !this.ambientGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(filterFreq, start);
    filter.frequency.linearRampToValueAtTime(filterFreq + 150, start + duration * 0.5);
    filter.frequency.linearRampToValueAtTime(filterFreq, start + duration);

    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(peakGain, start + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.0008, start + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ambientGain);

    osc.start(start);
    osc.stop(start + duration);
  }

  /**
   * Helper: Plucked Celtic Harp (Short attack, soft wooden pluck decay)
   */
  private playPluckedHarp(freq: number, start: number, peakGain: number) {
    if (!this.ctx || !this.ambientGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, start);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1400, start);
    filter.frequency.exponentialRampToValueAtTime(400, start + 0.9);

    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(peakGain, start + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0005, start + 0.95);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ambientGain);

    osc.start(start);
    osc.stop(start + 1.0);
  }

  /**
   * Helper: Peaceful Wind Flute with gentle vibrato (LFO)
   */
  private playPeacefulFlute(freq: number, start: number, duration: number, peakGain: number) {
    if (!this.ctx || !this.ambientGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    // Subtle LFO vibrato (4.8 Hz gentle modulation)
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(4.8, start);
    lfoGain.gain.setValueAtTime(3.5, start); // 3.5 Hz vibrato depth
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, start);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(freq * 1.5, start);
    filter.Q.setValueAtTime(1.8, start);

    // Soft breath attack & lyrical decay
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(peakGain, start + 0.15);
    gain.gain.setValueAtTime(peakGain * 0.9, start + duration - 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0005, start + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ambientGain);

    lfo.start(start);
    osc.start(start);
    lfo.stop(start + duration);
    osc.stop(start + duration);
  }

  /**
   * Helper: Celestial Glass Bell Chime
   */
  private playBellChime(freq: number, start: number, peakGain: number) {
    if (!this.ctx || !this.ambientGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(peakGain, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0002, start + 1.8);

    osc.connect(gain);
    gain.connect(this.ambientGain);

    osc.start(start);
    osc.stop(start + 1.9);
  }

  // BATTLE COMBAT MUSIC
  // =========================================================================

  public startBattleMusic() {
    if (!this.isBgmEnabled) return;
    this.unlockContext();
    if (!this.ctx || !this.battleGain) return;

    if (this.currentState === "BATTLE" && this.battleTimer) {
      return;
    }

    this.currentState = "BATTLE";
    const now = this.ctx.currentTime;

    // Smooth crossfade: bring battle gain up to 0.55 over 800ms, bring ambient down to 0 over 800ms
    this.battleGain.gain.cancelScheduledValues(now);
    this.battleGain.gain.linearRampToValueAtTime(0.55, now + 0.8);

    if (this.ambientGain) {
      this.ambientGain.gain.cancelScheduledValues(now);
      this.ambientGain.gain.linearRampToValueAtTime(0, now + 0.8);
    }

    if (this.ambientTimer) {
      clearInterval(this.ambientTimer);
      this.ambientTimer = null;
    }

    if (!this.battleTimer) {
      this.scheduleBattleLoop();
      this.battleTimer = setInterval(() => {
        this.scheduleBattleLoop();
      }, 3750); // 8 beats at 128 BPM = ~3.75s
    }
  }

  private scheduleBattleLoop() {
    if (!this.ctx || !this.battleGain || this.currentState !== "BATTLE") return;

    const startTime = this.ctx.currentTime;
    const bpm = 128;
    const beatSec = 60 / bpm; // ~0.468s per beat

    // 8-beat driving combat loop
    for (let beat = 0; beat < 8; beat++) {
      const beatTime = startTime + beat * beatSec;

      // 1. Kick/Percussion on beats 0, 2, 4, 6
      if (beat % 2 === 0) {
        this.playDrumPulse(beatTime, 120, 45, 0.22);
      }

      // 2. Snare snap on beats 1, 3, 5, 7
      if (beat % 2 === 1) {
        this.playSnareSnap(beatTime, 0.16);
      }

      // 3. Driving rhythmic bassline (E minor / D minor heroic combat)
      const bassNotes = [73.42, 73.42, 82.41, 73.42, 98.0, 87.31, 73.42, 110.0];
      const bassFreq = bassNotes[beat % bassNotes.length];
      this.playSynthBass(beatTime, bassFreq, beatSec * 0.85);

      // 4. Heroic Brass / Synth Lead arpeggio
      const leadNotes = [293.66, 329.63, 392.0, 440.0, 523.25, 440.0, 392.0, 329.63];
      const leadFreq = leadNotes[beat % leadNotes.length];
      this.playLeadNote(beatTime, leadFreq, beatSec * 0.5);
    }
  }

  private playDrumPulse(time: number, startFreq: number, endFreq: number, vol: number) {
    if (!this.ctx || !this.battleGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + 0.12);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    osc.connect(gain);
    gain.connect(this.battleGain);

    osc.start(time);
    osc.stop(time + 0.16);
  }

  private playSnareSnap(time: number, vol: number) {
    if (!this.ctx || !this.battleGain) return;
    // Noise buffer for snap
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(1000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.battleGain);

    noise.start(time);
    noise.stop(time + 0.11);
  }

  private playSynthBass(time: number, freq: number, duration: number) {
    if (!this.ctx || !this.battleGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, time);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(320, time);
    filter.frequency.linearRampToValueAtTime(160, time + duration);

    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.battleGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private playLeadNote(time: number, freq: number, duration: number) {
    if (!this.ctx || !this.battleGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.06, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.battleGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  public stopAllBgm() {
    if (this.ambientTimer) {
      clearInterval(this.ambientTimer);
      this.ambientTimer = null;
    }
    if (this.battleTimer) {
      clearInterval(this.battleTimer);
      this.battleTimer = null;
    }
    if (this.ctx) {
      const now = this.ctx.currentTime;
      if (this.ambientGain) {
        this.ambientGain.gain.cancelScheduledValues(now);
        this.ambientGain.gain.linearRampToValueAtTime(0, now + 0.2);
      }
      if (this.battleGain) {
        this.battleGain.gain.cancelScheduledValues(now);
        this.battleGain.gain.linearRampToValueAtTime(0, now + 0.2);
      }
    }
    this.currentState = "IDLE";
  }

  // =========================================================================
  // SOUND EFFECTS (SFX)
  // =========================================================================

  /**
   * Weapon Impact Strike sound effect
   */
  public playHitSound() {
    if (!this.isSfxEnabled || this.isMuted) return;
    this.unlockContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;

    // Sub thump
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.18);

    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.21);

    // Blade clash noise
    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(2400, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + 0.09);
  }

  /**
   * Heavy Sword Swing / Slash SFX for Vanguard
   */
  public playSwordSlash() {
    if (!this.isSfxEnabled || this.isMuted) return;
    this.unlockContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Whoosh filter sweep
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(3200, now + 0.08);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.15);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    noise.start(now);
    noise.stop(now + 0.16);
  }

  /**
   * Fast Dual Blade Flurry SFX for Shadow Blade
   */
  public playDualBladeCombo() {
    if (!this.isSfxEnabled || this.isMuted) return;
    this.unlockContext();
    if (!this.ctx || !this.sfxGain) return;

    [0, 0.09].forEach((delay) => {
      const now = this.ctx!.currentTime + delay;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.08);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(now);
      osc.stop(now + 0.09);
    });
  }

  /**
   * Magic Spell Charge & Projectile Launch SFX for Arcane Weaver
   */
  public playMagicCast() {
    if (!this.isSfxEnabled || this.isMuted) return;
    this.unlockContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.18);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.23);
  }

  /**
   * Magic Projectile Impact Explosion SFX
   */
  public playMagicImpact() {
    if (!this.isSfxEnabled || this.isMuted) return;
    this.unlockContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.28);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.31);
  }

  /**
   * Bow String Release & Arrow Whistle SFX for Mystic Huntress
   */
  public playBowShot() {
    if (!this.isSfxEnabled || this.isMuted) return;
    this.unlockContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // String snap
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  /**
   * Monster Strike / Beast Claw SFX for Enemy Attack
   */
  /**
   * Heavy Greatsword Cleave & Clash SFX for Valen Vanguard
   */
  public playHeavySwordSlash() {
    if (!this.isSfxEnabled || this.isMuted) return;
    this.unlockContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Whoosh swoosh
    const whooshOsc = this.ctx.createOscillator();
    const whooshGain = this.ctx.createGain();
    whooshOsc.type = 'sawtooth';
    whooshOsc.frequency.setValueAtTime(450, now);
    whooshOsc.frequency.exponentialRampToValueAtTime(90, now + 0.18);
    whooshGain.gain.setValueAtTime(0.35, now);
    whooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    whooshOsc.connect(whooshGain);
    whooshGain.connect(this.sfxGain);
    whooshOsc.start(now);
    whooshOsc.stop(now + 0.22);

    // Heavy blade metal crunch
    const crunchOsc = this.ctx.createOscillator();
    const crunchGain = this.ctx.createGain();
    crunchOsc.type = 'triangle';
    crunchOsc.frequency.setValueAtTime(140, now + 0.05);
    crunchOsc.frequency.exponentialRampToValueAtTime(40, now + 0.35);
    crunchGain.gain.setValueAtTime(0.5, now + 0.05);
    crunchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    crunchOsc.connect(crunchGain);
    crunchGain.connect(this.sfxGain);
    crunchOsc.start(now + 0.05);
    crunchOsc.stop(now + 0.4);
  }

  /**
   * Arrow Puncture Impact SFX for Aria Mystic Huntress
   */
  public playArrowImpact() {
    if (!this.isSfxEnabled || this.isMuted) return;
    this.unlockContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Sharp snap puncture
    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snapOsc.type = 'triangle';
    snapOsc.frequency.setValueAtTime(880, now);
    snapOsc.frequency.exponentialRampToValueAtTime(120, now + 0.12);
    snapGain.gain.setValueAtTime(0.4, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    snapOsc.connect(snapGain);
    snapGain.connect(this.sfxGain);
    snapOsc.start(now);
    snapOsc.stop(now + 0.16);
  }

  /**
   * Enemy Heavy Counterattack Strike SFX
   */
  public playEnemyCounterImpact() {
    if (!this.isSfxEnabled || this.isMuted) return;
    this.unlockContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.32);
    gain.gain.setValueAtTime(0.45, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.38);
  }

  /**
   * Deep guttural monster roar / alien growl with bass presence and resonance
   */
  public playEnemyRoar() {
    if (!this.isSfxEnabled || this.isMuted) return;
    this.unlockContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Sub-bass rumble
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = "sawtooth";
    subOsc.frequency.setValueAtTime(85, now);
    subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.6);
    subGain.gain.setValueAtTime(0.5, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(now);
    subOsc.stop(now + 0.7);

    // Distorted growl vocalization
    const roarOsc = this.ctx.createOscillator();
    const roarGain = this.ctx.createGain();
    roarOsc.type = "sawtooth";
    roarOsc.frequency.setValueAtTime(140, now);
    roarOsc.frequency.linearRampToValueAtTime(95, now + 0.25);
    roarOsc.frequency.exponentialRampToValueAtTime(45, now + 0.55);
    roarGain.gain.setValueAtTime(0.35, now);
    roarGain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);
    roarOsc.connect(roarGain);
    roarGain.connect(this.sfxGain);
    roarOsc.start(now);
    roarOsc.stop(now + 0.6);
  }

  /**
   * Painful monster grunt / alien hurt reaction when hit
   */
  public playEnemyHurt() {
    if (!this.isSfxEnabled || this.isMuted) return;
    this.unlockContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
    gain.gain.setValueAtTime(0.42, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  /**
   * Cataclysmic monster death roar when boss reaches 0 HP
   */
  public playEnemyDeathRoar() {
    if (!this.isSfxEnabled || this.isMuted) return;
    this.unlockContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(70, now + 0.4);
    osc.frequency.exponentialRampToValueAtTime(25, now + 1.1);
    gain.gain.setValueAtTime(0.55, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.15);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 1.2);
  }

  public playEnemyAttack() {
    if (!this.isSfxEnabled || this.isMuted) return;
    this.unlockContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.2);

    gain.gain.setValueAtTime(0.38, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.24);
  }

  /**
   * Critical Finisher Strike with Screen Shake Rumble
   */
  public playFinisherImpact() {
    if (!this.isSfxEnabled || this.isMuted) return;
    this.unlockContext();
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    // Low sub rumble
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(120, now);
    subOsc.frequency.exponentialRampToValueAtTime(25, now + 0.45);
    subGain.gain.setValueAtTime(0.65, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(now);
    subOsc.stop(now + 0.52);

    // High metal clash
    const clashOsc = this.ctx.createOscillator();
    const clashGain = this.ctx.createGain();
    clashOsc.type = "sawtooth";
    clashOsc.frequency.setValueAtTime(1800, now);
    clashOsc.frequency.exponentialRampToValueAtTime(400, now + 0.25);
    clashGain.gain.setValueAtTime(0.4, now);
    clashGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    clashOsc.connect(clashGain);
    clashGain.connect(this.sfxGain);
    clashOsc.start(now);
    clashOsc.stop(now + 0.3);
  }

  /**
   * Enemy Defeat / Dissolve sound effect
   */
  public playDefeatSound() {
    if (!this.isSfxEnabled || this.isMuted) return;
    this.unlockContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.45);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.52);
  }

  /**
   * Victory Fanfare Stinger
   */
  public playFanfare() {
    if (!this.isSfxEnabled || this.isMuted) return;
    this.unlockContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const notes = [
      { f: 523.25, d: 0.12, offset: 0.0 }, // C5
      { f: 659.25, d: 0.12, offset: 0.12 }, // E5
      { f: 783.99, d: 0.14, offset: 0.24 }, // G5
      { f: 1046.5, d: 0.45, offset: 0.38 }, // C6
    ];

    notes.forEach((note) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(note.f, now + note.offset);

      gain.gain.setValueAtTime(0.3, now + note.offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.offset + note.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + note.offset);
      osc.stop(now + note.offset + note.d + 0.02);
    });
  }

  /**
   * Level-Up Triumph sound
   */
  public playLevelUpSound() {
    if (!this.isSfxEnabled || this.isMuted) return;
    this.unlockContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const chord = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    chord.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.2, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.65);
    });
  }

  /**
   * Achievement Unlock chime
   */
  public playAchievementSound() {
    if (!this.isSfxEnabled || this.isMuted) return;
    this.unlockContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const chime = [880.0, 1174.66, 1760.0];
    chime.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.18, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.5);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.55);
    });
  }

  /**
   * Gold Coin Pouch purchase jingle
   */
  public playCoinSound() {
    if (!this.isSfxEnabled || this.isMuted) return;
    this.unlockContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const pings = [1975.53, 2637.02];
    pings.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.22, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.22);
    });
  }
  /**
   * Agile Hero Dodge / Dash Whoosh SFX
   */
  public playHeroDodge() {
    if (!this.isSfxEnabled || this.isMuted) return;
    this.unlockContext();
    if (!this.ctx || !this.sfxGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.25);

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(250, now + 0.25);
      filter.Q.value = 3.0;

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // Audio autoplay policy fallback
    }
  }

}

export const audioManager = new AudioManager();
