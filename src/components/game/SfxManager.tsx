import { useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { useGame } from '@/game/GameContext';

// Different click sound configurations
const CLICK_SOUNDS = [
  { freq: 800, dur: 0.06, type: 'sine' as OscillatorType },
  { freq: 1000, dur: 0.05, type: 'square' as OscillatorType },
  { freq: 600, dur: 0.08, type: 'triangle' as OscillatorType },
  { freq: 1200, dur: 0.04, type: 'sine' as OscillatorType },
  { freq: 900, dur: 0.07, type: 'triangle' as OscillatorType },
];

const SUCCESS_SOUND = [
  { freq: 523, delay: 0, dur: 0.1 },
  { freq: 659, delay: 0.08, dur: 0.1 },
  { freq: 784, delay: 0.16, dur: 0.15 },
];

const WARNING_SOUND = [
  { freq: 300, delay: 0, dur: 0.15 },
  { freq: 250, delay: 0.12, dur: 0.2 },
];

const PURCHASE_SOUND = [
  { freq: 440, delay: 0, dur: 0.06 },
  { freq: 660, delay: 0.05, dur: 0.06 },
  { freq: 880, delay: 0.1, dur: 0.1 },
];

interface SfxContextType {
  playClick: () => void;
  playSuccess: () => void;
  playWarning: () => void;
  playPurchase: () => void;
}

const SfxContext = createContext<SfxContextType | null>(null);

export function useSfx() {
  return useContext(SfxContext);
}

export default function SfxManager({ children }: { children: React.ReactNode }) {
  const { state } = useGame();
  const ctxRef = useRef<AudioContext | null>(null);
  const clickIndexRef = useRef(0);

  const getCtx = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const playTone = useCallback((freq: number, dur: number, delay: number = 0, type: OscillatorType = 'sine', vol: number = 0.08) => {
    if (!state.sfxEnabled) return;
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + dur);
    } catch {}
  }, [state.sfxEnabled, getCtx]);

  const playClick = useCallback(() => {
    if (!state.sfxEnabled) return;
    const sound = CLICK_SOUNDS[clickIndexRef.current % CLICK_SOUNDS.length];
    clickIndexRef.current++;
    playTone(sound.freq, sound.dur, 0, sound.type, 0.06);
  }, [state.sfxEnabled, playTone]);

  const playSuccess = useCallback(() => {
    if (!state.sfxEnabled) return;
    SUCCESS_SOUND.forEach(s => playTone(s.freq, s.dur, s.delay, 'sine', 0.07));
  }, [state.sfxEnabled, playTone]);

  const playWarning = useCallback(() => {
    if (!state.sfxEnabled) return;
    WARNING_SOUND.forEach(s => playTone(s.freq, s.dur, s.delay, 'triangle', 0.06));
  }, [state.sfxEnabled, playTone]);

  const playPurchase = useCallback(() => {
    if (!state.sfxEnabled) return;
    PURCHASE_SOUND.forEach(s => playTone(s.freq, s.dur, s.delay, 'sine', 0.07));
  }, [state.sfxEnabled, playTone]);

  // Global click listener for SFX + sparkle animation
  useEffect(() => {
    if (!state.sfxEnabled) return;
    
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('[role="option"]') || target.closest('[data-clickable]')) {
        playClick();
        createSparkle(e.clientX, e.clientY);
      }
    };

    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [state.sfxEnabled, playClick]);

  return (
    <SfxContext.Provider value={{ playClick, playSuccess, playWarning, playPurchase }}>
      {children}
    </SfxContext.Provider>
  );
}

// Sparkle/particle animation on click
function createSparkle(x: number, y: number) {
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
  const particleCount = 6 + Math.floor(Math.random() * 4);
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = 4 + Math.random() * 6;
    const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
    const velocity = 30 + Math.random() * 50;
    const dx = Math.cos(angle) * velocity;
    const dy = Math.sin(angle) * velocity;
    
    particle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      pointer-events: none;
      z-index: 99999;
      transform: translate(-50%, -50%);
      transition: none;
    `;
    
    document.body.appendChild(particle);
    
    // Animate
    const start = performance.now();
    const duration = 400 + Math.random() * 200;
    
    function animate(now: number) {
      const elapsed = now - start;
      const progress = elapsed / duration;
      if (progress >= 1) {
        particle.remove();
        return;
      }
      const eased = 1 - Math.pow(1 - progress, 3);
      const gravity = progress * progress * 60;
      particle.style.left = `${x + dx * eased}px`;
      particle.style.top = `${y + dy * eased + gravity}px`;
      particle.style.opacity = `${1 - progress}`;
      particle.style.transform = `translate(-50%, -50%) scale(${1 - progress * 0.5}) rotate(${progress * 360}deg)`;
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }
}
