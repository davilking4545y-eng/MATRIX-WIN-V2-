// Web Audio API Synthesizer for Matrix Win V2 Sound FX

class SoundFX {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Lazy initialize on first interaction
  }

  private getContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      } catch {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        this.ctx.resume().catch(() => {});
      } catch {}
    }
    return this.ctx;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  // High-tech terminal blip
  public playClick(freq = 800) {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Audio context might be restricted before gesture
    }
  }

  // Strike pulse tick
  public playTick() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch {
      // Ignore audio error
    }
  }

  // Countdown locking pulse (pitch scales with urgency)
  public playCountdownTick(remainingSec: number) {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';

      // Higher pitch as we get closer to 0
      const baseFreq = remainingSec <= 2 ? 880 : 540;
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch {
      // Ignore audio error
    }
  }

  // Win harmonic cyber chord
  public playWin(isJackpot = false) {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = isJackpot ? [523.25, 659.25, 783.99, 1046.5, 1318.51] : [440, 554.37, 659.25, 880];
      const duration = isJackpot ? 0.45 : 0.28;

      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = isJackpot ? 'sawtooth' : 'sine';

        const startTime = ctx.currentTime + index * 0.05;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.07, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch {
      // Ignore
    }
  }

  // Loss low cyber buzz
  public playLoss() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch {
      // Ignore
    }
  }

  // Sci-Fi access granted chime
  public playAccessGranted() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.08, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.25);
      });
    } catch {}
  }

  // Triumphant Grand Jackpot Fanfare
  public playJackpotFanfare() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      // Arpeggio + triumphant chords: C5, E5, G5, C6, E6, G6
      const freqs = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        const start = now + i * 0.07;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.1, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.6);
      });
    } catch {}
  }
}

export const soundFx = new SoundFX();

/**
 * Speech synthesis voice announcement:
 * Custom voice message based on role:
 * For Owner: "WELCOME BOSS, RUP ADHIKARY. ACCESS GRANTED TO MATRIX WIN V2"
 * For Normal Member: "WELCOME TO MATRIX WIN V2"
 */
export function speakWelcomeMatrix(isOwner: boolean = false): void {
  if (typeof window === 'undefined') return;

  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // cancel any ongoing speech
      const text = isOwner
        ? 'WELCOME BOSS, RUP ADHIKARY. ACCESS GRANTED TO MATRIX WIN V2'
        : 'WELCOME TO MATRIX WIN V2';
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = isOwner ? 0.92 : 0.95;
      utterance.pitch = isOwner ? 1.0 : 1.05;
      utterance.volume = 1;

      // Prefer a natural, clear English voice
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const preferred =
          voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Arthur'))) ||
          voices.find((v) => v.lang.startsWith('en'));
        if (preferred) {
          utterance.voice = preferred;
        }
      }

      window.speechSynthesis.speak(utterance);
    }
  } catch (err) {
    console.warn('Speech synthesis invocation note:', err);
  }
}

/**
 * Voice Announcement for Round Outcome:
 * WIN / JACKPOT / LOSS
 */
export function speakOutcomeAnnouncement(
  status: 'JACKPOT' | 'WIN' | 'LOSS',
  issueNumber: string,
  actualNumber?: number,
  actualSize?: string
): void {
  if (typeof window === 'undefined') return;

  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech

      const shortIssue = issueNumber ? issueNumber.slice(-4) : '';
      let text = '';

      if (status === 'JACKPOT') {
        text = `JACKPOT HIT! Direct number ${actualNumber !== undefined ? actualNumber : ''} matched on period ${shortIssue}! Incredible win!`;
      } else if (status === 'WIN') {
        text = `WINNER! Target ${actualSize || ''} won on period ${shortIssue}! Prediction successful!`;
      } else {
        text = `ROUND LOSS on period ${shortIssue}. Result was ${actualSize || ''} ${actualNumber !== undefined ? actualNumber : ''}. Recalibrating matrix.`;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = status === 'JACKPOT' ? 0.96 : 0.98;
      utterance.pitch = status === 'JACKPOT' ? 1.15 : status === 'WIN' ? 1.05 : 0.92;
      utterance.volume = 1;

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const preferred =
          voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Arthur'))) ||
          voices.find((v) => v.lang.startsWith('en'));
        if (preferred) {
          utterance.voice = preferred;
        }
      }

      window.speechSynthesis.speak(utterance);
    }
  } catch (err) {
    console.warn('Speech synthesis outcome note:', err);
  }
}
