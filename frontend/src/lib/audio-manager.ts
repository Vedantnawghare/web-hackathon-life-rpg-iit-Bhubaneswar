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

export type AudioState = "MUTED" | "AMBIENT" | "BATTLE" | "VICTORY";

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

  // =========================================================================
  // CALM AMBIENT MUSIC
  // =========================================================================

  public startAmbientMusic() {
    if (!this.isBgmEnabled) return;
    this.unlockContext();
    if (!this.ctx || !this.ambientGain) return;

    this.currentState = "AMBIENT";
    const now = this.ctx.currentTime;

    // Crossfade: bring ambient gain up to 0.45, bring battle gain down to 0
    this.ambientGain.gain.cancelScheduledValues(now);
    this.ambientGain.gain.linearRampToValueAtTime(0.45, now + 0.8);

    if (this.battleGain) {
      this.battleGain.gain.cancelScheduledValues(now);
      this.battleGain.gain.linearRampToValueAtTime(0, now + 0.8);
    }

    if (!this.ambientTimer) {
      this.scheduleAmbientChordProgression();
      this.ambientTimer = setInterval(() => {
        this.scheduleAmbientChordProgression();
      }, 7200);
    }
  }

  private scheduleAmbientChordProgression() {
    if (!this.ctx || !this.ambientGain || this.currentState !== "AMBIENT") return;

    // Pentatonic chord steps in D Dorian / F Major (soothing, warm, magical)
    const chords = [
      [220.0, 261.63, 329.63, 392.0], // A3, C4, E4, G4
      [174.61, 220.0, 261.63, 329.63], // F3, A3, C4, E4
      [196.0, 246.94, 293.66, 392.0], // G3, B3, D4, G4
      [146.83, 220.0, 293.66, 349.23], // D3, A3, D4, F4
    ];

    const startTime = this.ctx.currentTime;
    chords.forEach((chord, chordIdx) => {
      const chordTime = startTime + chordIdx * 1.8;

      chord.forEach((freq, noteIdx) => {
        if (!this.ctx || !this.ambientGain) return;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        // Warm triangle and sine oscillators
        osc.type = noteIdx % 2 === 0 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(freq, chordTime);

        // Low-pass filter for cozy, gentle presence
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(550, chordTime);
        filter.frequency.linearRampToValueAtTime(750, chordTime + 0.9);
        filter.frequency.linearRampToValueAtTime(500, chordTime + 1.8);

        // Soft envelope: slow attack, warm sustain, gentle release
        noteGain.gain.setValueAtTime(0, chordTime);
        noteGain.gain.linearRampToValueAtTime(0.045, chordTime + 0.4);
        noteGain.gain.exponentialRampToValueAtTime(0.001, chordTime + 1.75);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.ambientGain);

        osc.start(chordTime);
        osc.stop(chordTime + 1.8);
      });
    });
  }

  // =========================================================================
  // BATTLE COMBAT MUSIC
  // =========================================================================

  public startBattleMusic() {
    if (!this.isBgmEnabled) return;
    this.unlockContext();
    if (!this.ctx || !this.battleGain) return;

    this.currentState = "BATTLE";
    const now = this.ctx.currentTime;

    // Crossfade: bring battle gain up to 0.55 within 400ms, bring ambient down to 0
    this.battleGain.gain.cancelScheduledValues(now);
    this.battleGain.gain.linearRampToValueAtTime(0.55, now + 0.4);

    if (this.ambientGain) {
      this.ambientGain.gain.cancelScheduledValues(now);
      this.ambientGain.gain.linearRampToValueAtTime(0, now + 0.4);
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
      if (this.ambientGain) this.ambientGain.gain.linearRampToValueAtTime(0, now + 0.2);
      if (this.battleGain) this.battleGain.gain.linearRampToValueAtTime(0, now + 0.2);
    }
    this.currentState = "MUTED";
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
}

export const audioManager = new AudioManager();
