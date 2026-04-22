import { useGame } from '@/game/GameContext';
import { useEffect, useRef } from 'react';

const THEME_DECORATIONS: Record<string, {
  particles: Array<{ emoji: string; count: number; sizeRange: [number, number]; speed: number }>;
  bgGradient?: string;
  overlay?: string;
}> = {
  theme_ocean: {
    particles: [
      { emoji: '🐟', count: 5, sizeRange: [16, 28], speed: 0.3 },
      { emoji: '🐠', count: 3, sizeRange: [18, 26], speed: 0.25 },
      { emoji: '🫧', count: 12, sizeRange: [10, 20], speed: 0.5 },
      { emoji: '🌊', count: 4, sizeRange: [20, 32], speed: 0.15 },
      { emoji: '🐚', count: 3, sizeRange: [14, 22], speed: 0.1 },
    ],
    overlay: 'radial-gradient(ellipse at bottom, rgba(0,100,200,0.08) 0%, transparent 70%)',
  },
  theme_sakura: {
    particles: [
      { emoji: '🌸', count: 15, sizeRange: [14, 24], speed: 0.4 },
      { emoji: '🎀', count: 3, sizeRange: [12, 18], speed: 0.2 },
      { emoji: '🌺', count: 4, sizeRange: [16, 24], speed: 0.15 },
      { emoji: '🦋', count: 2, sizeRange: [16, 22], speed: 0.35 },
    ],
    overlay: 'radial-gradient(ellipse at top right, rgba(255,182,193,0.1) 0%, transparent 60%)',
  },
  theme_forest: {
    particles: [
      { emoji: '🍃', count: 10, sizeRange: [14, 22], speed: 0.35 },
      { emoji: '🌿', count: 5, sizeRange: [16, 26], speed: 0.15 },
      { emoji: '🍂', count: 4, sizeRange: [14, 20], speed: 0.3 },
      { emoji: '🌲', count: 3, sizeRange: [24, 36], speed: 0.05 },
      { emoji: '🐿️', count: 2, sizeRange: [16, 22], speed: 0.2 },
    ],
    overlay: 'radial-gradient(ellipse at bottom left, rgba(34,139,34,0.06) 0%, transparent 60%)',
  },
  theme_sunset: {
    particles: [
      { emoji: '☁️', count: 5, sizeRange: [24, 40], speed: 0.1 },
      { emoji: '🌅', count: 2, sizeRange: [20, 30], speed: 0.05 },
      { emoji: '🕊️', count: 3, sizeRange: [16, 24], speed: 0.3 },
      { emoji: '✨', count: 6, sizeRange: [10, 16], speed: 0.4 },
    ],
    overlay: 'linear-gradient(180deg, rgba(255,140,0,0.06) 0%, rgba(148,0,211,0.04) 100%)',
  },
  theme_midnight: {
    particles: [
      { emoji: '⭐', count: 12, sizeRange: [8, 16], speed: 0.15 },
      { emoji: '🌟', count: 5, sizeRange: [12, 20], speed: 0.1 },
      { emoji: '🏙️', count: 3, sizeRange: [28, 44], speed: 0.02 },
      { emoji: '🌃', count: 2, sizeRange: [24, 36], speed: 0.03 },
      { emoji: '💫', count: 4, sizeRange: [10, 16], speed: 0.25 },
    ],
    overlay: 'radial-gradient(ellipse at top, rgba(75,0,130,0.08) 0%, transparent 70%)',
  },
  theme_candy: {
    particles: [
      { emoji: '🍭', count: 5, sizeRange: [16, 26], speed: 0.25 },
      { emoji: '🍬', count: 6, sizeRange: [14, 22], speed: 0.3 },
      { emoji: '🧁', count: 3, sizeRange: [16, 24], speed: 0.15 },
      { emoji: '🎈', count: 4, sizeRange: [18, 28], speed: 0.35 },
      { emoji: '🌈', count: 2, sizeRange: [24, 36], speed: 0.05 },
    ],
    overlay: 'radial-gradient(circle at center, rgba(255,105,180,0.06) 0%, transparent 60%)',
  },
  theme_royal: {
    particles: [
      { emoji: '👑', count: 4, sizeRange: [16, 26], speed: 0.15 },
      { emoji: '💎', count: 5, sizeRange: [12, 20], speed: 0.2 },
      { emoji: '⚜️', count: 4, sizeRange: [14, 22], speed: 0.1 },
      { emoji: '🏆', count: 2, sizeRange: [18, 28], speed: 0.08 },
      { emoji: '✨', count: 8, sizeRange: [8, 14], speed: 0.4 },
    ],
    overlay: 'radial-gradient(ellipse at bottom right, rgba(218,165,32,0.08) 0%, transparent 60%)',
  },
  theme_retro: {
    particles: [
      { emoji: '🕹️', count: 3, sizeRange: [16, 24], speed: 0.2 },
      { emoji: '👾', count: 5, sizeRange: [14, 22], speed: 0.3 },
      { emoji: '🎮', count: 3, sizeRange: [16, 24], speed: 0.15 },
      { emoji: '💾', count: 3, sizeRange: [12, 20], speed: 0.25 },
      { emoji: '📺', count: 2, sizeRange: [20, 30], speed: 0.08 },
    ],
    overlay: 'linear-gradient(135deg, rgba(255,0,100,0.04) 0%, rgba(0,200,255,0.04) 100%)',
  },
  theme_neon: {
    particles: [
      { emoji: '💡', count: 6, sizeRange: [12, 20], speed: 0.3 },
      { emoji: '⚡', count: 8, sizeRange: [10, 18], speed: 0.4 },
      { emoji: '🌟', count: 5, sizeRange: [14, 22], speed: 0.2 },
      { emoji: '💫', count: 4, sizeRange: [12, 18], speed: 0.35 },
    ],
    overlay: 'radial-gradient(ellipse at center, rgba(0,255,200,0.06) 0%, transparent 60%)',
  },
  theme_autumn: {
    particles: [
      { emoji: '🍂', count: 12, sizeRange: [14, 24], speed: 0.35 },
      { emoji: '🍁', count: 8, sizeRange: [16, 26], speed: 0.3 },
      { emoji: '🌾', count: 4, sizeRange: [18, 28], speed: 0.1 },
      { emoji: '🎃', count: 2, sizeRange: [20, 30], speed: 0.05 },
    ],
    overlay: 'radial-gradient(ellipse at bottom, rgba(200,100,0,0.06) 0%, transparent 60%)',
  },
  theme_winter: {
    particles: [
      { emoji: '❄️', count: 15, sizeRange: [10, 20], speed: 0.3 },
      { emoji: '⛄', count: 2, sizeRange: [22, 34], speed: 0.05 },
      { emoji: '🌨️', count: 4, sizeRange: [16, 24], speed: 0.2 },
      { emoji: '✨', count: 8, sizeRange: [8, 14], speed: 0.4 },
    ],
    overlay: 'radial-gradient(ellipse at top, rgba(180,220,255,0.08) 0%, transparent 60%)',
  },
  theme_cyberpunk: {
    particles: [
      { emoji: '🤖', count: 3, sizeRange: [18, 28], speed: 0.15 },
      { emoji: '💻', count: 4, sizeRange: [14, 22], speed: 0.2 },
      { emoji: '⚡', count: 6, sizeRange: [10, 18], speed: 0.4 },
      { emoji: '🔮', count: 3, sizeRange: [14, 22], speed: 0.25 },
      { emoji: '🌐', count: 3, sizeRange: [16, 24], speed: 0.1 },
    ],
    overlay: 'linear-gradient(135deg, rgba(0,200,255,0.05) 0%, rgba(255,0,100,0.05) 100%)',
  },
  theme_lavender: {
    particles: [
      { emoji: '💜', count: 6, sizeRange: [12, 20], speed: 0.25 },
      { emoji: '🦋', count: 4, sizeRange: [14, 22], speed: 0.3 },
      { emoji: '✨', count: 8, sizeRange: [8, 14], speed: 0.35 },
      { emoji: '🌸', count: 5, sizeRange: [14, 22], speed: 0.2 },
    ],
    overlay: 'radial-gradient(ellipse at top right, rgba(180,130,255,0.08) 0%, transparent 60%)',
  },
};

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  emoji: string;
  dx: number;
  dy: number;
  opacity: number;
  rotation: number;
  rotSpeed: number;
}

export default function ThemeBackground() {
  const { state } = useGame();
  const canvasRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);

  const themeId = state.equippedTheme;
  const decoration = themeId ? THEME_DECORATIONS[themeId] : null;

  useEffect(() => {
    if (!decoration || !canvasRef.current) {
      particlesRef.current = [];
      cancelAnimationFrame(animRef.current);
      return;
    }

    // Create particles
    const particles: Particle[] = [];
    decoration.particles.forEach(cfg => {
      for (let i = 0; i < cfg.count; i++) {
        const size = cfg.sizeRange[0] + Math.random() * (cfg.sizeRange[1] - cfg.sizeRange[0]);
        particles.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
          size,
          speed: cfg.speed * (0.5 + Math.random()),
          emoji: cfg.emoji,
          dx: (Math.random() - 0.5) * cfg.speed,
          dy: -cfg.speed * 0.3 + Math.random() * cfg.speed * 0.2,
          opacity: 0.15 + Math.random() * 0.25,
          rotation: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 2,
        });
      }
    });
    particlesRef.current = particles;

    // Render particles as DOM elements
    const container = canvasRef.current;
    container.innerHTML = '';
    
    const elements: HTMLSpanElement[] = particles.map(p => {
      const el = document.createElement('span');
      el.textContent = p.emoji;
      el.style.cssText = `
        position: absolute;
        font-size: ${p.size}px;
        pointer-events: none;
        user-select: none;
        opacity: ${p.opacity};
        left: ${p.x}%;
        top: ${p.y}%;
        transform: rotate(${p.rotation}deg);
        transition: none;
        will-change: transform, left, top;
      `;
      container.appendChild(el);
      return el;
    });

    let lastTime = performance.now();
    function animate(now: number) {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      particles.forEach((p, i) => {
        p.x += p.dx * dt * 10;
        p.y += p.dy * dt * 10;
        p.rotation += p.rotSpeed * dt * 30;

        // Wrap around
        if (p.x > 105) p.x = -5;
        if (p.x < -5) p.x = 105;
        if (p.y > 105) p.y = -5;
        if (p.y < -5) p.y = 105;

        const el = elements[i];
        if (el) {
          el.style.left = `${p.x}%`;
          el.style.top = `${p.y}%`;
          el.style.transform = `rotate(${p.rotation}deg)`;
        }
      });

      animRef.current = requestAnimationFrame(animate);
    }
    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      container.innerHTML = '';
    };
  }, [themeId]);

  if (!decoration) return null;

  return (
    <>
      {decoration.overlay && (
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{ background: decoration.overlay }}
        />
      )}
      <div
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      />
    </>
  );
}
