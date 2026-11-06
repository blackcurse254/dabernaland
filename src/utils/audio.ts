/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Convert 1-90 numbers to Persian words
export function numberToPersianWords(num: number): string {
  if (num < 1 || num > 90) return num.toString();

  const ones = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
  const teens = ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'];
  const tens = ['', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];

  if (num < 10) return ones[num];
  if (num >= 10 && num < 20) return teens[num - 10];
  
  const ten = Math.floor(num / 10);
  const one = num % 10;

  if (one === 0) return tens[ten];
  return `${tens[ten]} و ${ones[one]}`;
}

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const SoundEngine = {
  isMuted: false,

  setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('deberna_muted', muted ? 'true' : 'false');
    } catch {
      // Ignore
    }
  },

  getMuted(): boolean {
    try {
      return localStorage.getItem('deberna_muted') === 'true';
    } catch {
      return false;
    }
  },

  // Synthesize Persian speech for the drawn number
  speakNumber(num: number) {
    if (this.isMuted || typeof window === 'undefined') return;

    try {
      const words = numberToPersianWords(num);
      const textToSpeak = `عدد ${words}، ${num}`;

      if (window.speechSynthesis) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.cancel(); // Stop any pending speech

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'fa-IR';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const faVoice = voices.find(
          (v) =>
            v.lang.startsWith('fa') ||
            v.lang.includes('IR') ||
            v.name.toLowerCase().includes('persian') ||
            v.name.toLowerCase().includes('farsi')
        );
        if (faVoice) {
          utterance.voice = faVoice;
        }

        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  },

  // Test Persian Voice announcement
  testPersianVoice() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance('خوش آمدید به بازی آنلاین دبرنا لند! عدد پنجاه و چهار، ۵۴');
      utterance.lang = 'fa-IR';
      utterance.rate = 0.95;
      utterance.pitch = 1.05;
      const voices = window.speechSynthesis.getVoices();
      const faVoice = voices.find((v) => v.lang.startsWith('fa') || v.lang.includes('IR') || v.name.includes('Persian') || v.name.includes('Farsi'));
      if (faVoice) utterance.voice = faVoice;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Voice test error:', e);
    }
  },

  // Ball drop chime
  playBallDrawnChime() {
    if (this.isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  },

  // Ticket number marked sound
  playMarkSound() {
    if (this.isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
    osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.1); // C6

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  },

  // Victory Fanfare
  playWinFanfare() {
    if (this.isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

      gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + idx * 0.12);
      osc.stop(ctx.currentTime + idx * 0.12 + 0.35);
    });
  },

  // Wheel click tick
  playTick() {
    if (this.isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(900, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  },

  // Button Click
  playClick() {
    if (this.isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  },
};
