import { useEffect, useRef, useCallback } from 'react';
import { useGame } from '@/game/GameContext';

const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, B4 = 493.88, C5 = 523.25;
const D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99;
const A3 = 220.00, B3 = 246.94, G3 = 196.00, F3 = 174.61, E3 = 164.81;

const SHOP_MELODY: [number, number][] = [
  [E4, 1], [G4, 1], [A4, 1], [B4, 1],
  [A4, 1], [G4, 1], [E4, 2],
  [E4, 1], [G4, 1], [A4, 1], [B4, 1],
  [C5, 2], [B4, 1], [A4, 1],
  [G4, 1], [A4, 1], [B4, 1], [G4, 1],
  [E4, 2], [D4, 1], [E4, 1],
  [G4, 1], [E4, 1], [D4, 1], [C4, 1],
  [D4, 2], [0, 2],
  [E4, 1], [G4, 1], [A4, 1], [B4, 1],
  [A4, 1], [G4, 1], [E4, 2],
  [E4, 1], [G4, 1], [A4, 1], [B4, 1],
  [C5, 2], [D5, 1], [C5, 1],
  [B4, 1], [A4, 1], [G4, 1], [A4, 1],
  [B4, 2], [G4, 1], [E4, 1],
  [D4, 1], [E4, 1], [G4, 1], [E4, 1],
  [D4, 2], [0, 2],
  [C5, 1], [B4, 1], [A4, 1], [G4, 1],
  [A4, 2], [B4, 1], [A4, 1],
  [G4, 1], [E4, 1], [G4, 1], [A4, 1],
  [B4, 2], [0, 2],
  [C5, 1], [B4, 1], [A4, 1], [G4, 1],
  [E4, 2], [D4, 1], [E4, 1],
  [G4, 1.5], [E4, 0.5], [D4, 1], [C4, 1],
  [D4, 2], [0, 2],
];

const SHOP_BASS: [number, number][] = [
  [C4/2, 4], [G3, 4], [A3, 4], [E3, 4],
  [F3, 4], [C4/2, 4], [G3, 4], [D4/2, 4],
  [C4/2, 4], [G3, 4], [A3, 4], [E3, 4],
  [F3, 4], [C4/2, 4], [G3, 4], [D4/2, 4],
  [A3, 4], [E3, 4], [F3, 4], [C4/2, 4],
  [G3, 4], [D4/2, 4], [A3, 4], [G3, 4],
];

// Multiple event melodies — picked based on event.effect so each random event has its own song.
const EVENT_MELODIES: Record<string, [number, number][]> = {
  // Upbeat / cheerful — viral, holiday, lucky_day, food_festival
  upbeat: [
    [E5, 0.5], [D5, 0.5], [C5, 0.5], [D5, 0.5],
    [E5, 1], [E5, 1], [E5, 1], [0, 1],
    [D5, 0.5], [D5, 0.5], [D5, 1], [E5, 0.5], [G5, 0.5], [G5, 1],
    [E5, 0.5], [D5, 0.5], [C5, 0.5], [D5, 0.5],
    [E5, 1], [E5, 1], [E5, 0.5], [D5, 0.5],
    [D5, 1], [E5, 1], [D5, 1], [C5, 1],
    [C5, 2], [0, 2],
  ],
  // Tense / suspense — inspection, expensive_supplier, rain
  tense: [
    [A4, 0.5], [B4, 0.5], [C5, 0.5], [B4, 0.5],
    [A4, 1], [G4, 1], [A4, 2],
    [C5, 0.5], [D5, 0.5], [E5, 1], [D5, 0.5], [C5, 0.5],
    [B4, 1], [A4, 1], [B4, 2],
    [E5, 0.5], [D5, 0.5], [C5, 0.5], [B4, 0.5],
    [A4, 2], [G4, 1], [A4, 1],
    [A4, 2], [0, 2],
  ],
  // Magical / sparkly — gem_rain, viral
  magical: [
    [G5, 0.5], [F5, 0.5], [E5, 0.5], [F5, 0.5],
    [G5, 1], [E5, 0.5], [G5, 0.5], [C5, 1],
    [D5, 0.5], [E5, 0.5], [F5, 0.5], [G5, 0.5],
    [A4, 1], [G5, 1], [F5, 1], [E5, 1],
    [D5, 0.5], [E5, 0.5], [F5, 0.5], [G5, 0.5],
    [E5, 2], [C5, 2],
  ],
  // Cheap / discount — cheap_supplier
  cheap: [
    [C5, 0.5], [E5, 0.5], [G5, 0.5], [E5, 0.5],
    [C5, 1], [G4, 1], [C5, 2],
    [D5, 0.5], [F5, 0.5], [A4, 0.5], [F5, 0.5],
    [D5, 1], [A4, 1], [D5, 2],
    [E5, 1], [G5, 1], [F5, 1], [E5, 1],
    [C5, 2], [0, 2],
  ],
  // Party — employee_party
  party: [
    [G4, 0.5], [B4, 0.5], [D5, 0.5], [G5, 0.5],
    [E5, 1], [D5, 0.5], [C5, 0.5], [B4, 1],
    [A4, 0.5], [C5, 0.5], [E5, 0.5], [A4, 0.5],
    [G4, 1], [B4, 0.5], [D5, 0.5], [G5, 1],
    [F5, 0.5], [E5, 0.5], [D5, 0.5], [C5, 0.5],
    [B4, 1], [G4, 1], [G4, 2],
  ],
};

// Map event effect → melody key
const EFFECT_TO_MELODY: Record<string, keyof typeof EVENT_MELODIES> = {
  cheap_supplier: 'cheap',
  expensive_supplier: 'tense',
  viral: 'magical',
  inspection: 'tense',
  holiday: 'upbeat',
  rain: 'tense',
  employee_party: 'party',
  gem_rain: 'magical',
  lucky_day: 'upbeat',
  food_festival: 'party',
  sale_rush: 'upbeat',
};

const BEAT_DURATION = 0.22;
const EVENT_BEAT_DURATION = 0.16;

export default function MusicPlayer() {
  const { state } = useGame();
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const isPlayingRef = useRef(false);
  const melodyTimeoutRef = useRef<number | null>(null);
  const bassTimeoutRef = useRef<number | null>(null);
  const volumeRef = useRef(state.musicVolume ?? 0.5);
  const hasEventRef = useRef(!!state.activeEvent);
  const eventEffectRef = useRef<string | null>(state.activeEvent?.effect ?? null);
  const loopRef = useRef(state.musicLoop ?? true);
  const startMusicRef = useRef<() => void>(() => {});
  
  volumeRef.current = state.musicVolume ?? 0.5;
  hasEventRef.current = !!state.activeEvent;
  eventEffectRef.current = state.activeEvent?.effect ?? null;
  loopRef.current = state.musicLoop ?? true;

  const playNote = useCallback((frequency: number, duration: number, volume: number, waveform: OscillatorType = 'triangle') => {
    const ctx = audioCtxRef.current;
    const masterGain = gainRef.current;
    if (!ctx || !masterGain || ctx.state !== 'running' || frequency <= 0) return;

    const scaledVolume = volume * volumeRef.current * 2;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = waveform;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(scaledVolume, ctx.currentTime + 0.03);
    gain.gain.setValueAtTime(scaledVolume * 0.7, ctx.currentTime + duration * 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }, []);

  const stopMelody = useCallback(() => {
    if (melodyTimeoutRef.current) { clearTimeout(melodyTimeoutRef.current); melodyTimeoutRef.current = null; }
    if (bassTimeoutRef.current) { clearTimeout(bassTimeoutRef.current); bassTimeoutRef.current = null; }
  }, []);

  const playMelodySequence = useCallback((melody: [number, number][], beatDur: number, volume: number, waveform: OscillatorType, onComplete: () => void) => {
    let noteIdx = 0;
    
    const playNext = () => {
      if (!isPlayingRef.current || !audioCtxRef.current || audioCtxRef.current.state !== 'running') return;
      if (noteIdx >= melody.length) {
        onComplete();
        return;
      }
      
      const [freq, beats] = melody[noteIdx];
      const dur = beats * beatDur;
      if (freq > 0) playNote(freq, dur * 0.9, volume, waveform);
      noteIdx++;
      melodyTimeoutRef.current = window.setTimeout(playNext, dur * 1000);
    };
    
    playNext();
  }, [playNote]);

  const playBassSequence = useCallback((bass: [number, number][], beatDur: number, volume: number, onComplete: () => void) => {
    let noteIdx = 0;
    
    const playNext = () => {
      if (!isPlayingRef.current || !audioCtxRef.current || audioCtxRef.current.state !== 'running') return;
      if (noteIdx >= bass.length) {
        onComplete();
        return;
      }
      
      const [freq, beats] = bass[noteIdx];
      const dur = beats * beatDur;
      if (freq > 0) playNote(freq, dur * 0.85, volume, 'sine');
      noteIdx++;
      bassTimeoutRef.current = window.setTimeout(playNext, dur * 1000);
    };
    
    playNext();
  }, [playNote]);

  const startMusic = useCallback(() => {
    if (!isPlayingRef.current) return;
    stopMelody();

    const hasEvent = hasEventRef.current;
    const effect = eventEffectRef.current;
    // Pick the right event melody based on the active event's effect; fallback to upbeat
    const eventMelody = (effect && EFFECT_TO_MELODY[effect])
      ? EVENT_MELODIES[EFFECT_TO_MELODY[effect]]
      : EVENT_MELODIES.upbeat;
    const melody = hasEvent ? eventMelody : SHOP_MELODY;
    const beatDur = hasEvent ? EVENT_BEAT_DURATION : BEAT_DURATION;
    const vol = hasEvent ? 0.06 : 0.05;
    // Vary waveform per event-flavor for sonic variety
    const eventWaveform: OscillatorType = effect && (EFFECT_TO_MELODY[effect] === 'magical' || EFFECT_TO_MELODY[effect] === 'party')
      ? 'sawtooth'
      : EFFECT_TO_MELODY[effect ?? ''] === 'tense' ? 'square' : 'triangle';
    const waveform: OscillatorType = hasEvent ? eventWaveform : 'triangle';

    const onMelodyComplete = () => {
      if (loopRef.current && isPlayingRef.current) {
        startMusicRef.current();
      }
    };

    playMelodySequence(melody, beatDur, vol, waveform, onMelodyComplete);

    if (!hasEvent) {
      playBassSequence(SHOP_BASS, beatDur, 0.025, () => {});
    }
  }, [stopMelody, playMelodySequence, playBassSequence]);
  startMusicRef.current = startMusic;

  useEffect(() => {
    if (gainRef.current && audioCtxRef.current) {
      gainRef.current.gain.setValueAtTime(0.3 + (state.musicVolume ?? 0.5) * 0.7, audioCtxRef.current.currentTime);
    }
  }, [state.musicVolume]);

  const ensureAudioRunning = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
        resolve(true);
        return;
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().then(() => resolve(true)).catch(() => resolve(false));
        return;
      }
      // Create new context
      try {
        const ctx = new AudioContext();
        const gain = ctx.createGain();
        const vol = volumeRef.current;
        gain.gain.setValueAtTime(0.3 + vol * 0.7, ctx.currentTime);
        gain.connect(ctx.destination);
        audioCtxRef.current = ctx;
        gainRef.current = gain;
        if (ctx.state === 'suspended') {
          ctx.resume().then(() => resolve(true)).catch(() => resolve(false));
        } else {
          resolve(true);
        }
      } catch (e) {
        console.log('Audio not supported');
        resolve(false);
      }
    });
  }, []);

  const stopMusic = useCallback(() => {
    stopMelody();
    isPlayingRef.current = false;
    if (audioCtxRef.current) { audioCtxRef.current.close().catch(() => {}); audioCtxRef.current = null; }
  }, [stopMelody]);

  // Start music on first user interaction or when enabled
  useEffect(() => {
    if (!state.musicEnabled || !state.gameStarted) return;

    let cancelled = false;

    const tryStart = async () => {
      if (cancelled || isPlayingRef.current) return;
      const running = await ensureAudioRunning();
      if (running && !cancelled) {
        isPlayingRef.current = true;
        startMusic();
      }
    };

    // Try immediately (works if user already interacted)
    tryStart();

    // Also listen for user interaction to resume
    const handleInteraction = () => {
      if (cancelled) return;
      tryStart();
    };

    document.addEventListener('click', handleInteraction);
    document.addEventListener('keydown', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);

    return () => {
      cancelled = true;
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, [state.musicEnabled, state.gameStarted, ensureAudioRunning, startMusic]);

  // Stop when disabled
  useEffect(() => {
    if (!state.musicEnabled || !state.gameStarted) stopMusic();
    return () => stopMusic();
  }, [state.musicEnabled, state.gameStarted, stopMusic]);

  // Resume on click when suspended
  useEffect(() => {
    if (!state.musicEnabled || !state.gameStarted) return;
    const resume = async () => {
      if (audioCtxRef.current?.state === 'suspended') {
        await audioCtxRef.current.resume();
        // If music should be playing but isn't, restart
        if (isPlayingRef.current && !melodyTimeoutRef.current) {
          startMusic();
        }
      }
    };
    document.addEventListener('click', resume);
    return () => document.removeEventListener('click', resume);
  }, [state.musicEnabled, state.gameStarted, startMusic]);

  // Switch music when event starts/ends OR when the event type changes (so each event has its own song)
  useEffect(() => {
    if (!state.musicEnabled || !isPlayingRef.current) return;
    stopMelody();
    setTimeout(() => startMusic(), 50);
  }, [state.activeEvent?.effect, state.musicEnabled, stopMelody, startMusic]);

  return null;
}
