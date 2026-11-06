/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Sliders,
  Sparkles,
  Play,
  Settings2,
} from 'lucide-react';
import { socket } from '../services/socket';
import { numberToPersianWords, SoundEngine } from '../utils/audio';

export type AnnounceStyle = 'full' | 'short' | 'double';

export interface UseVoiceCallerOptions {
  roomId?: string;
  isMuted?: boolean;
  initialSpeed?: number;
  initialStyle?: AnnounceStyle;
  playChimeFirst?: boolean;
  onNumberAnnounced?: (num: number) => void;
}

/**
 * Custom hook that listens for the 'room:number_drawn' Socket.io event
 * and automatically announces numbers (1-90) in Persian using Web Speech API.
 */
export function useVoiceCaller(options: UseVoiceCallerOptions = {}) {
  const {
    roomId,
    isMuted: propMuted = false,
    initialSpeed = 0.95,
    initialStyle = 'full',
    playChimeFirst = true,
    onNumberAnnounced,
  } = options;

  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(propMuted);
  const [speechSpeed, setSpeechSpeed] = useState<number>(initialSpeed);
  const [announceStyle, setAnnounceStyle] = useState<AnnounceStyle>(initialStyle);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');

  const lastAnnouncedNumRef = useRef<number | null>(null);

  // Sync mute state if prop changes
  useEffect(() => {
    setIsMuted(propMuted);
  }, [propMuted]);

  // Load browser voices
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);

      const fa = voices.find(
        (v) =>
          v.lang.startsWith('fa') ||
          v.lang.includes('IR') ||
          v.name.toLowerCase().includes('persian') ||
          v.name.toLowerCase().includes('farsi')
      );
      if (fa && !selectedVoiceURI) {
        setSelectedVoiceURI(fa.voiceURI);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, [selectedVoiceURI]);

  // Format Persian phrase for the number
  const getSpeechText = useCallback(
    (num: number): string => {
      const words = numberToPersianWords(num);
      if (announceStyle === 'short') {
        return words;
      }
      if (announceStyle === 'double' && num >= 10) {
        const tens = Math.floor(num / 10);
        const ones = num % 10;
        const onesWords = numberToPersianWords(ones);
        const tensWords = numberToPersianWords(tens);
        return `${tensWords}، ${onesWords}، ${words}`;
      }
      return `عدد ${words}، ${num}`;
    },
    [announceStyle]
  );

  // Announce the number using Web Speech API
  const speakNumber = useCallback(
    (num: number) => {
      if (isMuted || typeof window === 'undefined' || num < 1 || num > 90) return;

      // Play opening chime
      if (playChimeFirst) {
        SoundEngine.playBallDrawnChime();
      }

      if (!window.speechSynthesis) return;

      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        window.speechSynthesis.cancel();

        const text = getSpeechText(num);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'fa-IR';
        utterance.rate = speechSpeed;
        utterance.pitch = 1.0;

        const voices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
        const customVoice = voices.find((v) => v.voiceURI === selectedVoiceURI);
        const defaultFaVoice = voices.find(
          (v) =>
            v.lang.startsWith('fa') ||
            v.lang.includes('IR') ||
            v.name.toLowerCase().includes('persian') ||
            v.name.toLowerCase().includes('farsi')
        );

        if (customVoice) {
          utterance.voice = customVoice;
        } else if (defaultFaVoice) {
          utterance.voice = defaultFaVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          setIsSpeaking(false);
          onNumberAnnounced?.(num);
        };
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('SpeechSynthesis error:', err);
        setIsSpeaking(false);
      }
    },
    [isMuted, playChimeFirst, getSpeechText, speechSpeed, availableVoices, selectedVoiceURI, onNumberAnnounced]
  );

  // Socket listener for 'room:number_drawn'
  useEffect(() => {
    function handleNumberDrawn(data: { roomId?: string; number: number; drawnNumbers?: number[] }) {
      // If roomId is specified, verify it matches
      if (roomId && data.roomId && data.roomId !== roomId) {
        return;
      }

      const num = data.number;
      if (num && num !== lastAnnouncedNumRef.current) {
        lastAnnouncedNumRef.current = num;
        setCurrentNumber(num);
        if (data.drawnNumbers) {
          setDrawnNumbers(data.drawnNumbers);
        } else {
          setDrawnNumbers((prev) => [...prev, num]);
        }
        speakNumber(num);
      }
    }

    socket.on('room:number_drawn', handleNumberDrawn);

    return () => {
      socket.off('room:number_drawn', handleNumberDrawn);
    };
  }, [roomId, speakNumber]);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    SoundEngine.setMuted(next);
  };

  const replay = () => {
    if (currentNumber) {
      speakNumber(currentNumber);
    }
  };

  return {
    currentNumber,
    drawnNumbers,
    isSpeaking,
    isMuted,
    toggleMute,
    speechSpeed,
    setSpeechSpeed,
    announceStyle,
    setAnnounceStyle,
    speakNumber,
    replay,
  };
}

export interface VoiceCallerProps {
  roomId?: string;
  currentNumber?: number | null;
  drawnNumbers?: number[];
  isMuted?: boolean;
  onToggleMute?: () => void;
  variant?: 'stage' | 'compact' | 'floating';
  autoAnnounce?: boolean;
  className?: string;
}

export const VoiceCaller: React.FC<VoiceCallerProps> = ({
  roomId,
  currentNumber: propNumber,
  drawnNumbers: propDrawn,
  isMuted: propMuted = false,
  onToggleMute,
  variant = 'stage',
  autoAnnounce = true,
  className = '',
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [playChimeFirst, setPlayChimeFirst] = useState(true);

  // Use the room:number_drawn listener hook
  const {
    currentNumber: hookNumber,
    isSpeaking,
    isMuted: hookMuted,
    toggleMute: hookToggleMute,
    speechSpeed,
    setSpeechSpeed,
    announceStyle,
    setAnnounceStyle,
    speakNumber,
    replay,
  } = useVoiceCaller({
    roomId,
    isMuted: propMuted,
    playChimeFirst,
  });

  // Effective number from hook or prop
  const activeNumber = propNumber ?? hookNumber;
  const isMuted = onToggleMute ? propMuted : hookMuted;
  const handleToggleMute = onToggleMute || hookToggleMute;

  // Manual trigger if propNumber changes from outside while not connected to socket
  const lastPropNumRef = useRef<number | null>(null);
  useEffect(() => {
    if (
      autoAnnounce &&
      propNumber &&
      propNumber > 0 &&
      propNumber !== lastPropNumRef.current &&
      propNumber !== hookNumber
    ) {
      lastPropNumRef.current = propNumber;
      speakNumber(propNumber);
    }
  }, [propNumber, autoAnnounce, hookNumber, speakNumber]);

  const handleTestVoice = () => {
    speakNumber(activeNumber || 54);
  };

  const persianWordName = activeNumber ? numberToPersianWords(activeNumber) : null;

  // ---------------------------------------------------------------------------
  // COMPACT VARIANT
  // ---------------------------------------------------------------------------
  if (variant === 'compact') {
    return (
      <div
        className={`inline-flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-2xl ${className}`}
      >
        <button
          onClick={handleToggleMute}
          className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
            isMuted ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-300'
          }`}
          title={isMuted ? 'روشن کردن صدای گوینده' : 'قطع صدا'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>

        <div className="text-xs font-bold text-slate-200">
          {persianWordName ? `«${persianWordName}»` : 'گوینده فارسی آماده'}
        </div>

        {activeNumber && !isMuted && (
          <button
            onClick={replay}
            className="w-7 h-7 rounded-xl bg-purple-600/30 text-purple-300 hover:bg-purple-600/50 flex items-center justify-center"
            title="پخش مجدد صدای عدد"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // STAGE VARIANT (Main visual card)
  // ---------------------------------------------------------------------------
  return (
    <div className={`relative card-3d rounded-2xl p-3 border border-amber-500/30 text-right ${className}`}>
      <div className="flex items-center justify-between gap-3">
        {/* Right side: Speaker status & Visualizer */}
        <div className="flex items-center gap-2.5">
          {/* Animated Equalizer Wave when speaking */}
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              isMuted
                ? 'bg-rose-950/60 border border-rose-500/30 text-rose-400'
                : isSpeaking
                ? 'bg-amber-500/25 border border-amber-400 text-amber-300 glow-gold'
                : 'bg-[#1a1406] border border-amber-500/40 text-amber-300'
            }`}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : isSpeaking ? (
              <div className="flex items-end justify-center gap-0.5 h-4 w-4">
                <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
                <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s] h-4" />
                <span className="w-1 bg-amber-400 rounded-full animate-bounce h-2" />
              </div>
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white">گوینده فارسی اعداد دبرنا</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
                TTS
              </span>
            </div>
            <div className="text-[11px] font-bold text-[#FFE600] mt-0.5">
              {activeNumber ? (
                <span>
                  شماره جاری: <strong>«{persianWordName}»</strong> ({activeNumber})
                </span>
              ) : (
                <span className="text-slate-400 font-normal">در انتظار قرعه‌کشی شماره بعدی...</span>
              )}
            </div>
          </div>
        </div>

        {/* Left side: Quick Controls (Mute, Replay, Settings) */}
        <div className="flex items-center gap-1.5">
          {/* Replay Button */}
          <button
            onClick={replay}
            disabled={!activeNumber}
            className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-40 active:scale-95 shadow-sm"
            title="پخش مجدد صدای فارسی این شماره"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">پخش مجدد</span>
          </button>

          {/* Mute Toggle */}
          <button
            onClick={handleToggleMute}
            className={`p-1.5 rounded-xl border transition-colors ${
              isMuted
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
            }`}
            title={isMuted ? 'روشن کردن صدای گوینده' : 'قطع صدای گوینده'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Voice Settings Dropdown Toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-xl border transition-colors ${
              showSettings
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="تنظیمات گوینده صوتی"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable Voice Settings Drawer */}
      {showSettings && (
        <div className="mt-3 pt-3 border-t border-slate-800 text-xs space-y-3 animate-fade-in bg-slate-950/70 p-3 rounded-xl border border-slate-850">
          <div className="flex items-center justify-between text-slate-300 font-bold">
            <span className="flex items-center gap-1.5 text-amber-300">
              <Sliders className="w-3.5 h-3.5" />
              تنظیمات گوینده صوتی اعداد
            </span>
            <button
              onClick={handleTestVoice}
              className="px-2.5 py-1 rounded-lg btn-3d-purple text-white text-[10px] font-black flex items-center gap-1"
            >
              <Play className="w-3 h-3 fill-current" />
              تست صدا
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            {/* 1. Speech Speed */}
            <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400 mb-1">سرعت خوانش:</div>
              <div className="flex items-center gap-1">
                {[
                  { label: 'آرام', speed: 0.8 },
                  { label: 'عادی', speed: 0.95 },
                  { label: 'سریع', speed: 1.15 },
                ].map((s) => (
                  <button
                    key={s.speed}
                    onClick={() => setSpeechSpeed(s.speed)}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      speechSpeed === s.speed
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-sm'
                        : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Announcement Style */}
            <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400 mb-1">نحوه خواندن:</div>
              <div className="flex items-center gap-1">
                {[
                  { label: 'کامل', style: 'full' as AnnounceStyle },
                  { label: 'فقط عدد', style: 'short' as AnnounceStyle },
                  { label: 'دو رقمی', style: 'double' as AnnounceStyle },
                ].map((st) => (
                  <button
                    key={st.style}
                    onClick={() => setAnnounceStyle(st.style)}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      announceStyle === st.style
                        ? 'bg-purple-600 text-white font-black shadow-sm'
                        : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Opening Chime Toggle */}
            <div className="bg-slate-900/90 p-2 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-300 font-bold">زنگ هشدار قبل از خواندن</div>
                <div className="text-[9px] text-slate-500">افکت صوتی قبل از عدد</div>
              </div>
              <input
                type="checkbox"
                checked={playChimeFirst}
                onChange={(e) => setPlayChimeFirst(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 bg-slate-950 border-slate-700 focus:ring-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
