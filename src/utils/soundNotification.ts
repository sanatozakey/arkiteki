/**
 * Sound notification utility using the Web Audio API.
 * Synthesizes a subtle, pleasant harmonic completion chime
 * without requiring external MP3 asset downloads.
 */

const SOUND_STORAGE_KEY = 'arkiteki_sound_enabled';

let memoryStorage: Record<string, string> = {};

/**
 * Checks if sound notifications are enabled (default: true)
 */
export function isSoundNotificationEnabled(): boolean {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(SOUND_STORAGE_KEY);
      if (stored === null) return true;
      return stored === 'true';
    }
    const val = memoryStorage[SOUND_STORAGE_KEY];
    return val === undefined ? true : val === 'true';
  } catch {
    return true;
  }
}

/**
 * Toggles sound notifications on/off
 */
export function setSoundNotificationEnabled(enabled: boolean): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SOUND_STORAGE_KEY, enabled ? 'true' : 'false');
    }
    memoryStorage[SOUND_STORAGE_KEY] = enabled ? 'true' : 'false';
  } catch (err) {
    console.warn('Failed to persist sound preference', err);
  }
}

/**
 * Plays a soft, pleasant completion chime (two-tone harmonic arpeggio, ~240ms).
 * Strictly plays once upon genuine task completion.
 * Never throws errors if browser autoplay policies block audio.
 */
export function playCompletionChime(): void {
  if (!isSoundNotificationEnabled()) return;
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // Resume context if suspended by browser interaction rules
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Master gain node with soft volume
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.08, now);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    masterGain.connect(ctx.destination);

    // Tone 1: Gentle root note (E5 = 659.25 Hz)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.12);

    const gain1 = ctx.createGain();
    gain1.gain.setValueAtTime(0.8, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc1.connect(gain1);
    gain1.connect(masterGain);

    // Tone 2: Harmonic resolution note (B5 = 987.77 Hz) slightly offset
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.08);

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.setValueAtTime(0.9, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(masterGain);

    osc1.start(now);
    osc1.stop(now + 0.25);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.35);

    // Clean up AudioContext after sound finishes
    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 450);
  } catch (err) {
    // Autoplay or audio subsystem issue - fail silently
    console.debug('Completion sound suppressed:', err);
  }
}
