/**
 * Audio notification utility using Web Audio API
 * Generates pleasant, elegant salon chimes without external MP3 dependencies
 */

class AudioManager {
  private ctx: AudioContext | null = null;
  private isUnlocked: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlock(): void {
    if (this.isUnlocked) return;
    const ctx = this.getContext();
    if (ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => {
          this.isUnlocked = true;
        }).catch(() => {});
      } else {
        this.isUnlocked = true;
      }
    }
  }

  /**
   * Play an elegant 4-note bell chime when a new customer reservation arrives
   * Melody: C5 -> E5 -> G5 -> C6 (sparkling luxury chime)
   */
  public playNewReservationChime(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [
        { freq: 523.25, time: 0.00, dur: 0.35, gain: 0.25 }, // C5
        { freq: 659.25, time: 0.12, dur: 0.35, gain: 0.30 }, // E5
        { freq: 783.99, time: 0.24, dur: 0.40, gain: 0.35 }, // G5
        { freq: 1046.50, time: 0.36, dur: 0.70, gain: 0.40 }, // C6 (high chime)
      ];

      notes.forEach(({ freq, time, dur, gain: targetGain }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + time);

        // Add subtle vibrato / harmonic shimmer
        gain.gain.setValueAtTime(0, now + time);
        gain.gain.linearRampToValueAtTime(targetGain, now + time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + dur + 0.05);
      });
    } catch (e) {
      console.warn('Web Audio playback error:', e);
    }
  }

  /**
   * Play a warm cheerful 2-note chime when customer's reservation is approved
   * Melody: G5 -> C6
   */
  public playApprovedChime(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [
        { freq: 783.99, time: 0.00, dur: 0.30, gain: 0.30 },
        { freq: 1046.50, time: 0.15, dur: 0.60, gain: 0.40 },
      ];

      notes.forEach(({ freq, time, dur, gain: targetGain }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + time);

        gain.gain.setValueAtTime(0, now + time);
        gain.gain.linearRampToValueAtTime(targetGain, now + time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + time);
        osc.stop(now + time + dur + 0.05);
      });
    } catch (e) {
      console.warn('Web Audio playback error:', e);
    }
  }
}

export const audioManager = new AudioManager();

// Auto unlock on first user gesture
if (typeof window !== 'undefined') {
  const unlockEvents = ['click', 'touchstart', 'keydown'];
  const handleGesture = () => {
    audioManager.unlock();
    unlockEvents.forEach(evt => window.removeEventListener(evt, handleGesture));
  };
  unlockEvents.forEach(evt => window.addEventListener(evt, handleGesture, { passive: true }));
}
