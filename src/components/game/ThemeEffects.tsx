import { useGame } from '@/game/GameContext';
import { useEffect, useRef, useCallback } from 'react';
import { GACHA_ITEMS, RARITY_CONFIG } from '@/game/gachaData';

// Click effect emojis per theme
const THEME_CLICK_EFFECTS: Record<string, { emojis: string[]; count: number; spread: number; duration: number }> = {
  theme_ocean: { emojis: ['💧', '🫧', '🐟', '🌊'], count: 4, spread: 60, duration: 800 },
  theme_sakura: { emojis: ['🌸', '🎀', '💮', '✿'], count: 5, spread: 70, duration: 900 },
  theme_forest: { emojis: ['🍃', '🌿', '🍂', '🌱'], count: 4, spread: 55, duration: 750 },
  theme_sunset: { emojis: ['✨', '🌅', '☁️', '🔥'], count: 4, spread: 65, duration: 850 },
  theme_midnight: { emojis: ['⭐', '🌟', '💫', '✨'], count: 6, spread: 80, duration: 1000 },
  theme_candy: { emojis: ['🍬', '🍭', '🎈', '🌈'], count: 5, spread: 70, duration: 800 },
  theme_royal: { emojis: ['👑', '💎', '⚜️', '🏰', '🌹', '✨'], count: 7, spread: 90, duration: 1100 },
  theme_retro: { emojis: ['👾', '🕹️', '💾', '⚡'], count: 5, spread: 65, duration: 850 },
  theme_neon: { emojis: ['⚡', '💡', '🌟', '💫'], count: 5, spread: 75, duration: 900 },
  theme_autumn: { emojis: ['🍂', '🍁', '🌾', '🍄'], count: 4, spread: 60, duration: 800 },
  theme_winter: { emojis: ['❄️', '⛄', '🌨️', '✨'], count: 5, spread: 70, duration: 900 },
  theme_cyberpunk: { emojis: ['⚡', '🔮', '💻', '🌐'], count: 6, spread: 80, duration: 1000 },
  theme_lavender: { emojis: ['💜', '🦋', '✨', '🌸'], count: 4, spread: 60, duration: 800 },
  theme_unemployment: { emojis: ['💤', '😴', '🛋️', '📺', '🍕', '🎮', '🛌'], count: 8, spread: 100, duration: 2000 },
  // v1.6 themes
  theme_galaxy: { emojis: ['🌌', '⭐', '🪐', '☄️', '🌠'], count: 7, spread: 95, duration: 1100 },
  theme_volcano: { emojis: ['🌋', '🔥', '💥', '🪨'], count: 6, spread: 80, duration: 950 },
  theme_emerald: { emojis: ['💚', '✨', '🍀', '💎'], count: 5, spread: 70, duration: 850 },
  theme_pastel: { emojis: ['🎨', '🌈', '🦄', '💗'], count: 5, spread: 65, duration: 850 },
  theme_monochrome: { emojis: ['⚫', '⚪', '◼️', '◻️'], count: 4, spread: 55, duration: 700 },
  theme_steampunk: { emojis: ['⚙️', '🔧', '⏱️', '🎩'], count: 5, spread: 70, duration: 900 },
  theme_aurora: { emojis: ['🌠', '✨', '💫', '🌌'], count: 6, spread: 85, duration: 1000 },
  theme_desert: { emojis: ['🏜️', '🌵', '🐪', '☀️'], count: 4, spread: 60, duration: 800 },
  theme_dragon: { emojis: ['🐉', '🔥', '👑', '💎', '⚡', '🌋', '✨'], count: 9, spread: 110, duration: 1300 },
  // Mythical seasonal exclusives
  theme_sakura_eternal: { emojis: ['🌸', '✨', '🎀', '💮', '🌟', '🦋'], count: 9, spread: 105, duration: 1250 },
  theme_solar_eclipse:  { emojis: ['☀️', '🌑', '🔥', '✨', '🌟', '⚡'], count: 9, spread: 110, duration: 1300 },
  theme_harvest_king:   { emojis: ['🍁', '🍂', '👑', '🌾', '✨', '🍄'], count: 9, spread: 105, duration: 1250 },
  theme_frostbite:      { emojis: ['🧊', '❄️', '✨', '💎', '🌟', '🌌'], count: 9, spread: 110, duration: 1300 },
};

// GUI enhancement CSS per theme (injected dynamically)
const THEME_GUI_STYLES: Record<string, string> = {
  theme_ocean: `
    .theme-card { border-color: hsl(200 60% 70% / 0.3) !important; }
    .theme-card:hover { box-shadow: 0 0 20px hsl(200 80% 50% / 0.15); }
    .theme-glow { text-shadow: 0 0 8px hsl(200 80% 60% / 0.4); }
  `,
  theme_sakura: `
    .theme-card { border-color: hsl(340 70% 75% / 0.3) !important; border-radius: 1rem !important; }
    .theme-card:hover { box-shadow: 0 0 24px hsl(340 80% 65% / 0.2); transform: translateY(-1px); }
    .theme-glow { text-shadow: 0 0 8px hsl(340 80% 65% / 0.4); }
  `,
  theme_forest: `
    .theme-card { border-color: hsl(145 50% 50% / 0.3) !important; }
    .theme-card:hover { box-shadow: 0 0 16px hsl(145 60% 40% / 0.15); }
    .theme-glow { text-shadow: 0 0 6px hsl(145 60% 45% / 0.3); }
  `,
  theme_sunset: `
    .theme-card { border-color: hsl(25 80% 60% / 0.3) !important; }
    .theme-card:hover { box-shadow: 0 0 24px hsl(25 90% 55% / 0.2), 0 0 48px hsl(280 50% 50% / 0.1); }
    .theme-glow { text-shadow: 0 0 10px hsl(25 90% 55% / 0.5); }
  `,
  theme_midnight: `
    :root { --background: 250 30% 12% !important; --card: 250 25% 16% !important; --foreground: 260 30% 90% !important; --muted: 250 20% 22% !important; --muted-foreground: 260 20% 65% !important; }
    :root:not(.dark) .theme-card { background: hsl(250 25% 16%) !important; color: hsl(260 30% 90%) !important; border-color: hsl(260 40% 30% / 0.5) !important; }
    :root:not(.dark) { color-scheme: dark; }
    .theme-card { border-color: hsl(260 60% 50% / 0.3) !important; }
    .theme-card:hover { box-shadow: 0 0 30px hsl(260 85% 65% / 0.2), 0 0 60px hsl(180 80% 55% / 0.1); }
    .theme-glow { text-shadow: 0 0 12px hsl(260 85% 65% / 0.6), 0 0 24px hsl(300 80% 60% / 0.3); }
    @keyframes theme-neon-pulse { 0%, 100% { opacity: 0.7; } 50% { opacity: 1; } }
    .theme-card { animation: theme-neon-pulse 3s ease-in-out infinite; }
  `,
  theme_candy: `
    .theme-card { border-color: hsl(300 60% 65% / 0.3) !important; border-radius: 1.25rem !important; }
    .theme-card:hover { box-shadow: 0 0 20px hsl(300 75% 60% / 0.2), 0 0 40px hsl(50 80% 55% / 0.1); transform: scale(1.01); }
    .theme-glow { text-shadow: 0 0 8px hsl(300 75% 60% / 0.4); }
  `,
  // MYTHICAL: Royal — Crimson + gold kerajaan. Light mode high-contrast (dark text on warm cream).
  theme_royal: `
    /* Light-mode readability boost: warm cream bg, deep maroon text, gold accents */
    :root:not(.dark) { --foreground: 0 60% 16% !important; --muted-foreground: 0 35% 28% !important; }
    :root:not(.dark) .theme-card { background-image: linear-gradient(135deg, hsl(40 70% 96%) 0%, hsl(45 80% 92%) 50%, hsl(40 70% 96%) 100%) !important; color: hsl(0 60% 14%) !important; border-color: hsl(0 75% 38% / 0.55) !important; }
    .dark .theme-card { background-image: linear-gradient(135deg, hsl(0 70% 14% / 0.5) 0%, hsl(45 60% 22% / 0.32) 50%, hsl(0 70% 14% / 0.5) 100%) !important; }
    .theme-card { border-color: hsl(45 90% 50% / 0.55) !important; border-width: 2px !important; }
    .theme-card:hover { box-shadow: 0 8px 40px hsl(45 95% 50% / 0.35), 0 0 0 1px hsl(45 95% 60% / 0.5), inset 0 1px 0 hsl(45 95% 80% / 0.4); transform: translateY(-2px); }
    /* Glow text: red-gold gradient + strong contrast */
    .theme-glow {
      background: linear-gradient(135deg, hsl(0 80% 38%) 0%, hsl(45 95% 45%) 50%, hsl(0 80% 38%) 100%);
      -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
      text-shadow: none;
      filter: drop-shadow(0 1px 2px hsl(0 80% 30% / 0.5));
      letter-spacing: 0.03em; font-weight: 800;
    }
    .dark .theme-glow {
      background: linear-gradient(135deg, hsl(45 100% 65%) 0%, hsl(15 95% 55%) 50%, hsl(45 100% 65%) 100%);
      -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 0 14px hsl(45 95% 55% / 0.6)) drop-shadow(0 0 28px hsl(0 80% 45% / 0.3));
    }
    @keyframes theme-royal-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    @keyframes theme-royal-crown-pulse { 0%, 100% { transform: scale(1) rotate(-5deg); opacity: 0.9; filter: drop-shadow(0 0 6px hsl(45 95% 55%)); } 50% { transform: scale(1.2) rotate(5deg); opacity: 1; filter: drop-shadow(0 0 14px hsl(45 95% 65%)) drop-shadow(0 0 4px hsl(0 80% 45%)); } }
    .theme-card::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent 25%, hsl(45 100% 75% / 0.18) 50%, transparent 75%); background-size: 200% 100%; animation: theme-royal-shimmer 4s ease-in-out infinite; pointer-events: none; border-radius: inherit; mix-blend-mode: overlay; }
    .theme-card::before { content: '👑'; position: absolute; top: -10px; right: 8px; font-size: 16px; animation: theme-royal-crown-pulse 2.6s ease-in-out infinite; pointer-events: none; z-index: 2; }
    .theme-card { position: relative; overflow: hidden; font-family: 'Georgia', 'Cinzel', serif; }
    button.theme-card:hover, .theme-card button:hover { box-shadow: 0 0 24px hsl(0 80% 50% / 0.45), 0 0 4px hsl(45 95% 55% / 0.6); }
  `,
  theme_retro: `
    .theme-card { border-color: hsl(330 70% 50% / 0.3) !important; border-radius: 4px !important; border-style: solid !important; }
    .theme-card:hover { box-shadow: 4px 4px 0 hsl(195 75% 42% / 0.3); transform: translate(-2px, -2px); }
    .theme-glow { text-shadow: 2px 2px 0 hsl(330 70% 50% / 0.3), -1px -1px 0 hsl(195 75% 42% / 0.3); }
    @keyframes theme-retro-scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
  `,
  theme_neon: `
    .theme-card { border-color: hsl(160 100% 45% / 0.3) !important; }
    .theme-card:hover { box-shadow: 0 0 20px hsl(160 100% 50% / 0.3), 0 0 40px hsl(290 90% 55% / 0.15); }
    .theme-glow { text-shadow: 0 0 10px hsl(160 100% 50% / 0.6), 0 0 20px hsl(290 90% 60% / 0.3); }
    @keyframes theme-neon-flicker { 0%, 95%, 100% { opacity: 1; } 96% { opacity: 0.8; } 97% { opacity: 1; } 98% { opacity: 0.6; } }
    .theme-glow { animation: theme-neon-flicker 5s ease-in-out infinite; }
  `,
  theme_autumn: `
    .theme-card { border-color: hsl(25 65% 50% / 0.3) !important; }
    .theme-card:hover { box-shadow: 0 0 16px hsl(25 85% 48% / 0.15); }
    .theme-glow { text-shadow: 0 0 6px hsl(25 85% 48% / 0.3); }
  `,
  theme_winter: `
    .theme-card { border-color: hsl(205 60% 70% / 0.3) !important; }
    .theme-card:hover { box-shadow: 0 0 24px hsl(205 80% 55% / 0.15), 0 0 48px hsl(210 70% 65% / 0.08); }
    .theme-glow { text-shadow: 0 0 8px hsl(205 80% 65% / 0.4); }
    @keyframes theme-frost-sparkle { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
    .theme-card::before { content: '✨'; position: absolute; top: 4px; right: 8px; font-size: 10px; animation: theme-frost-sparkle 2s ease-in-out infinite; pointer-events: none; }
    .theme-card { position: relative; }
  `,
  theme_cyberpunk: `
    .theme-card { border-color: hsl(195 100% 50% / 0.4) !important; border-left-width: 3px !important; clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px)); }
    .theme-card:hover { box-shadow: 0 0 25px hsl(195 100% 55% / 0.3), 0 0 50px hsl(340 90% 60% / 0.15); }
    .theme-glow { text-shadow: 0 0 10px hsl(195 100% 55% / 0.6), 0 0 20px hsl(340 90% 60% / 0.3); }
    @keyframes theme-glitch { 0%, 92%, 100% { transform: none; } 93% { transform: translate(-2px, 1px); } 95% { transform: translate(2px, -1px); } 97% { transform: translate(-1px, -1px); } }
    .theme-glow { animation: theme-glitch 4s ease-in-out infinite; }
    .theme-card { transition: all 0.15s ease; }
  `,
  theme_lavender: `
    .theme-card { border-color: hsl(270 40% 65% / 0.3) !important; border-radius: 1rem !important; }
    .theme-card:hover { box-shadow: 0 0 20px hsl(270 60% 60% / 0.15); }
    .theme-glow { text-shadow: 0 0 8px hsl(270 60% 60% / 0.3); }
  `,
  theme_unemployment: `
    :root { filter: saturate(0.6) brightness(0.97); }
    .theme-card { border-color: hsl(220 10% 45% / 0.35) !important; border-style: dashed !important; opacity: 0.92; transform: rotate(-0.3deg); }
    .theme-card:nth-child(even) { transform: rotate(0.3deg); }
    .theme-card:hover { box-shadow: 0 2px 8px hsl(220 10% 30% / 0.2); transform: rotate(0deg) translateY(1px); transition: transform 0.6s ease; }
    .theme-glow { text-shadow: 0 1px 2px hsl(220 15% 20% / 0.4); color: hsl(220 12% 55%) !important; font-style: italic; letter-spacing: -0.01em; }
    @keyframes theme-unemployment-yawn { 0%, 90%, 100% { transform: scale(1); } 92% { transform: scale(1.02, 0.98); } 95% { transform: scale(0.98, 1.02); } }
    @keyframes theme-unemployment-zzz { 0% { transform: translate(0, 0) rotate(0deg); opacity: 0; } 20% { opacity: 0.7; } 100% { transform: translate(20px, -40px) rotate(15deg); opacity: 0; } }
    @keyframes theme-unemployment-drift { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-3px) rotate(0.5deg); } }
    body { animation: theme-unemployment-yawn 8s ease-in-out infinite; }
    .theme-card::before { content: '💤'; position: fixed; font-size: 16px; pointer-events: none; opacity: 0; animation: theme-unemployment-zzz 4s ease-out infinite; left: var(--zzz-x, 50%); top: var(--zzz-y, 50%); z-index: 1; }
    button { transition: all 0.4s ease !important; }
    button:hover { animation: theme-unemployment-drift 2s ease-in-out infinite; }
    /* Unique mythical aura */
    .theme-card { background-image: repeating-linear-gradient(45deg, transparent, transparent 10px, hsl(220 10% 50% / 0.03) 10px, hsl(220 10% 50% / 0.03) 11px) !important; }
    /* Sleepy cursor trail effect handled via JS */
  `,
  // === v1.6 NEW THEME GUI STYLES ===
  theme_galaxy: `
    .theme-card { border-color: hsl(270 80% 60% / 0.4) !important; background-image: radial-gradient(ellipse at top right, hsl(270 80% 50% / 0.06) 0%, transparent 60%) !important; }
    .theme-card:hover { box-shadow: 0 0 28px hsl(270 90% 65% / 0.3), 0 0 56px hsl(310 85% 60% / 0.15); transform: translateY(-1px); }
    .theme-glow { text-shadow: 0 0 12px hsl(270 90% 65% / 0.6), 0 0 24px hsl(310 85% 60% / 0.3); }
    @keyframes theme-galaxy-twinkle { 0%, 100% { opacity: 0.7; filter: brightness(1); } 50% { opacity: 1; filter: brightness(1.2); } }
    .theme-card::before { content: '✦'; position: absolute; top: 4px; right: 8px; font-size: 11px; color: hsl(310 90% 70%); animation: theme-galaxy-twinkle 2.5s ease-in-out infinite; pointer-events: none; }
    .theme-card { position: relative; }
  `,
  theme_volcano: `
    .theme-card { border-color: hsl(15 90% 50% / 0.35) !important; border-bottom-width: 2px !important; }
    .theme-card:hover { box-shadow: 0 4px 20px hsl(15 95% 50% / 0.3), 0 0 40px hsl(0 80% 45% / 0.15); }
    .theme-glow { text-shadow: 0 0 10px hsl(15 95% 55% / 0.5), 0 2px 0 hsl(0 80% 40% / 0.4); }
    @keyframes theme-volcano-ember { 0%, 100% { transform: translateY(0); opacity: 0.8; } 50% { transform: translateY(-2px); opacity: 1; } }
    .theme-card::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, hsl(15 95% 55% / 0.6), transparent); animation: theme-volcano-ember 2s ease-in-out infinite; pointer-events: none; }
    .theme-card { position: relative; }
  `,
  theme_emerald: `
    .theme-card { border-color: hsl(155 75% 45% / 0.35) !important; }
    .theme-card:hover { box-shadow: 0 0 22px hsl(155 80% 50% / 0.25); transform: translateY(-1px); }
    .theme-glow { text-shadow: 0 0 8px hsl(155 80% 50% / 0.5); }
  `,
  theme_pastel: `
    .theme-card { border-color: hsl(340 55% 80% / 0.4) !important; border-radius: 1.5rem !important; }
    .theme-card:hover { box-shadow: 0 0 24px hsl(340 70% 80% / 0.3), 0 0 12px hsl(200 60% 80% / 0.2); transform: scale(1.005); }
    .theme-glow { text-shadow: 0 0 6px hsl(340 70% 80% / 0.5); font-weight: 500; }
  `,
  theme_monochrome: `
    .theme-card { border-color: hsl(0 0% 30% / 0.4) !important; border-radius: 0.25rem !important; border-width: 1px !important; }
    .theme-card:hover { box-shadow: 4px 4px 0 hsl(0 0% 20% / 0.3); transform: translate(-2px, -2px); }
    .theme-glow { text-shadow: 1px 1px 0 hsl(0 0% 20% / 0.4); letter-spacing: 0.04em; text-transform: uppercase; font-size: 0.95em; }
  `,
  theme_steampunk: `
    .theme-card { border-color: hsl(30 60% 45% / 0.5) !important; border-width: 2px !important; border-style: double !important; background-image: linear-gradient(135deg, hsl(30 30% 30% / 0.03) 0%, transparent 50%) !important; }
    .theme-card:hover { box-shadow: 0 0 18px hsl(30 70% 45% / 0.3), inset 0 0 0 1px hsl(40 75% 50% / 0.2); }
    .theme-glow { text-shadow: 0 0 8px hsl(40 75% 50% / 0.5), 1px 1px 2px rgba(0,0,0,0.3); font-family: 'Georgia', serif; }
    @keyframes theme-steampunk-gear { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .theme-card::before { content: '⚙'; position: absolute; top: 4px; right: 6px; font-size: 11px; color: hsl(40 75% 55% / 0.5); animation: theme-steampunk-gear 8s linear infinite; pointer-events: none; }
    .theme-card { position: relative; }
  `,
  theme_aurora: `
    .theme-card { border-color: hsl(170 80% 50% / 0.35) !important; }
    .theme-card:hover { box-shadow: 0 0 30px hsl(170 90% 55% / 0.25), 0 0 60px hsl(270 85% 65% / 0.15); }
    .theme-glow { text-shadow: 0 0 10px hsl(170 90% 55% / 0.5), 0 0 20px hsl(270 85% 65% / 0.3); }
    @keyframes theme-aurora-wave { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
    .theme-card::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent 0%, hsl(170 80% 60% / 0.06) 33%, hsl(270 80% 65% / 0.06) 66%, transparent 100%); background-size: 300% 100%; animation: theme-aurora-wave 6s ease-in-out infinite; pointer-events: none; border-radius: inherit; }
    .theme-card { position: relative; overflow: hidden; }
  `,
  theme_desert: `
    .theme-card { border-color: hsl(40 75% 50% / 0.3) !important; }
    .theme-card:hover { box-shadow: 0 0 18px hsl(40 80% 50% / 0.2); }
    .theme-glow { text-shadow: 0 0 8px hsl(40 85% 55% / 0.4); }
  `,
  // MYTHICAL: Dragon — Rich crimson + gold side dragons + softened breath aura.
  // Light mode now styled distinctly: warm parchment + faint orange glow, similar spirit to dark but brighter.
  theme_dragon: `
    /* Light: warm parchment with gold-orange glow on cards (distinct from dark, but same family) */
    :root:not(.dark) { --foreground: 0 65% 18% !important; --muted-foreground: 15 40% 32% !important; }
    :root:not(.dark) .theme-card { background-image: linear-gradient(135deg, hsl(35 75% 95%) 0%, hsl(20 70% 92%) 50%, hsl(40 80% 95%) 100%) !important; border-color: hsl(15 85% 45% / 0.55) !important; }
    .dark .theme-card { background-image: linear-gradient(135deg, hsl(0 80% 14% / 0.4) 0%, hsl(40 70% 22% / 0.25) 50%, hsl(0 80% 14% / 0.4) 100%) !important; }
    .theme-card { border-width: 2px !important; }
    .theme-card:hover { box-shadow: 0 0 28px hsl(15 90% 50% / 0.35), 0 0 56px hsl(40 95% 55% / 0.2), inset 0 0 0 1px hsl(40 95% 55% / 0.4); transform: translateY(-1px); }
    .theme-glow {
      background: linear-gradient(135deg, hsl(0 80% 40%) 0%, hsl(35 95% 48%) 50%, hsl(0 80% 40%) 100%);
      -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 1px 2px hsl(0 80% 30% / 0.4));
      font-weight: 800; letter-spacing: 0.02em;
    }
    .dark .theme-glow {
      background: linear-gradient(135deg, hsl(40 100% 60%) 0%, hsl(15 95% 55%) 50%, hsl(40 100% 60%) 100%);
      -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 0 12px hsl(15 90% 50% / 0.6)) drop-shadow(0 0 24px hsl(40 95% 55% / 0.4));
    }
    @keyframes theme-dragon-breath { 0%, 100% { background-position: -200% 0; opacity: 0.25; } 50% { opacity: 0.5; } 100% { background-position: 200% 0; } }
    @keyframes theme-dragon-side-float-l { 0%, 100% { transform: translateY(-50%) translateX(0) rotate(-8deg); opacity: 0.6; } 50% { transform: translateY(-50%) translateX(-3px) rotate(-12deg); opacity: 0.85; } }
    .theme-card::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent 35%, hsl(15 95% 55% / 0.1) 50%, transparent 65%); background-size: 200% 100%; animation: theme-dragon-breath 5s ease-in-out infinite; pointer-events: none; border-radius: inherit; mix-blend-mode: screen; }
    .theme-card::before { content: '🐉'; position: absolute; left: -8px; top: 50%; font-size: 18px; opacity: 0.6; animation: theme-dragon-side-float-l 4s ease-in-out infinite; pointer-events: none; filter: drop-shadow(0 0 6px hsl(15 90% 50% / 0.6)); z-index: 1; }
    .theme-card { position: relative; overflow: visible; }
    body::before { content: ''; pointer-events: none; position: fixed; inset: 0; background: radial-gradient(circle at 0% 30%, hsl(15 90% 45% / 0.07) 0%, transparent 25%), radial-gradient(circle at 100% 70%, hsl(40 95% 50% / 0.06) 0%, transparent 25%); z-index: 0; }
    body::after { content: '🐲   🐉'; position: fixed; left: 8px; top: 50%; transform: translateY(-50%); writing-mode: vertical-rl; font-size: 32px; opacity: 0.2; pointer-events: none; letter-spacing: 80px; z-index: 0; filter: drop-shadow(0 0 12px hsl(15 90% 50% / 0.5)); animation: theme-dragon-side-float-l 6s ease-in-out infinite; }
  `,

  // === MYTHICAL SEASONAL THEMES (rich GUI + ambient FX) ===

  // 🌸 SAKURA ETERNAL — pink+gold blossom shimmer, falling petals
  theme_sakura_eternal: `
    :root:not(.dark) { --foreground: 335 60% 22% !important; }
    :root:not(.dark) .theme-card { background-image: linear-gradient(135deg, hsl(335 80% 97%) 0%, hsl(45 80% 96%) 50%, hsl(335 80% 97%) 100%) !important; border-color: hsl(335 85% 60% / 0.55) !important; }
    .dark .theme-card { background-image: linear-gradient(135deg, hsl(335 60% 14% / 0.45) 0%, hsl(45 60% 18% / 0.25) 50%, hsl(335 60% 14% / 0.45) 100%) !important; }
    .theme-card { border-width: 2px !important; border-radius: 1.25rem !important; position: relative; overflow: hidden; }
    .theme-card:hover { box-shadow: 0 8px 36px hsl(335 90% 60% / 0.35), 0 0 0 1px hsl(45 90% 60% / 0.45), inset 0 1px 0 hsl(335 90% 80% / 0.5); transform: translateY(-2px); }
    .theme-glow {
      background: linear-gradient(135deg, hsl(335 85% 50%) 0%, hsl(45 95% 50%) 50%, hsl(335 85% 50%) 100%);
      -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 1px 2px hsl(335 70% 35% / 0.4));
      font-weight: 800; letter-spacing: 0.02em;
    }
    .dark .theme-glow { filter: drop-shadow(0 0 14px hsl(335 90% 65% / 0.6)) drop-shadow(0 0 28px hsl(45 95% 60% / 0.3)); }
    @keyframes theme-sakura-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    @keyframes theme-sakura-petal-spin { 0%, 100% { transform: rotate(-12deg) scale(1); opacity: 0.85; } 50% { transform: rotate(12deg) scale(1.15); opacity: 1; } }
    .theme-card::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent 25%, hsl(335 95% 80% / 0.18) 50%, transparent 75%); background-size: 200% 100%; animation: theme-sakura-shimmer 4.5s ease-in-out infinite; pointer-events: none; border-radius: inherit; mix-blend-mode: overlay; }
    .theme-card::before { content: '🌸'; position: absolute; top: -8px; right: 8px; font-size: 16px; animation: theme-sakura-petal-spin 3s ease-in-out infinite; pointer-events: none; filter: drop-shadow(0 0 8px hsl(335 95% 70%)); z-index: 2; }
    body::before { content: ''; pointer-events: none; position: fixed; inset: 0; background: radial-gradient(circle at 15% 20%, hsl(335 90% 70% / 0.08) 0%, transparent 30%), radial-gradient(circle at 85% 80%, hsl(45 95% 65% / 0.06) 0%, transparent 30%); z-index: 0; }
  `,

  // 🌞 SOLAR ECLIPSE — fiery orange-gold corona with pulsing glow
  theme_solar_eclipse: `
    :root:not(.dark) { --foreground: 20 65% 18% !important; }
    :root:not(.dark) .theme-card { background-image: radial-gradient(ellipse at top, hsl(45 85% 95%) 0%, hsl(20 75% 92%) 100%) !important; border-color: hsl(40 100% 50% / 0.55) !important; }
    .dark .theme-card { background-image: radial-gradient(ellipse at top, hsl(40 80% 18% / 0.4) 0%, hsl(0 60% 8% / 0.5) 100%) !important; }
    .theme-card { border-width: 2px !important; position: relative; overflow: hidden; }
    .theme-card:hover { box-shadow: 0 0 32px hsl(40 100% 55% / 0.4), 0 0 64px hsl(15 95% 50% / 0.2), inset 0 0 0 1px hsl(40 100% 60% / 0.5); transform: translateY(-2px) scale(1.005); }
    .theme-glow {
      background: linear-gradient(135deg, hsl(15 95% 48%) 0%, hsl(45 100% 50%) 50%, hsl(15 95% 48%) 100%);
      -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 1px 2px hsl(15 80% 30% / 0.5));
      font-weight: 800; letter-spacing: 0.03em;
    }
    .dark .theme-glow { filter: drop-shadow(0 0 14px hsl(40 100% 60% / 0.7)) drop-shadow(0 0 28px hsl(15 95% 50% / 0.4)); }
    @keyframes theme-eclipse-corona { 0%, 100% { box-shadow: 0 0 0 hsl(40 100% 55% / 0); } 50% { box-shadow: 0 0 24px hsl(40 100% 55% / 0.35), 0 0 48px hsl(15 95% 50% / 0.2); } }
    @keyframes theme-eclipse-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .theme-card { animation: theme-eclipse-corona 5s ease-in-out infinite; }
    .theme-card::before { content: '🌞'; position: absolute; top: -10px; right: 8px; font-size: 18px; animation: theme-eclipse-spin 18s linear infinite; pointer-events: none; filter: drop-shadow(0 0 10px hsl(40 100% 55%)); z-index: 2; }
    .theme-card::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent 30%, hsl(45 100% 70% / 0.12) 50%, transparent 70%); background-size: 200% 100%; animation: theme-sakura-shimmer 6s ease-in-out infinite; pointer-events: none; border-radius: inherit; }
    body::before { content: ''; pointer-events: none; position: fixed; inset: 0; background: radial-gradient(circle at 50% 0%, hsl(40 100% 55% / 0.08) 0%, transparent 35%); z-index: 0; }
  `,

  // 🍁 HARVEST KING — autumn gold + amber, royal harvest crown
  theme_harvest_king: `
    :root:not(.dark) { --foreground: 20 65% 18% !important; }
    :root:not(.dark) .theme-card { background-image: linear-gradient(135deg, hsl(35 70% 95%) 0%, hsl(20 75% 92%) 50%, hsl(35 70% 95%) 100%) !important; border-color: hsl(20 90% 45% / 0.55) !important; }
    .dark .theme-card { background-image: linear-gradient(135deg, hsl(20 70% 14% / 0.45) 0%, hsl(40 60% 20% / 0.3) 50%, hsl(20 70% 14% / 0.45) 100%) !important; }
    .theme-card { border-width: 2px !important; position: relative; overflow: hidden; }
    .theme-card:hover { box-shadow: 0 8px 32px hsl(20 90% 45% / 0.35), 0 0 0 1px hsl(40 95% 55% / 0.5), inset 0 1px 0 hsl(40 95% 70% / 0.4); transform: translateY(-2px); }
    .theme-glow {
      background: linear-gradient(135deg, hsl(20 90% 38%) 0%, hsl(40 95% 45%) 50%, hsl(20 90% 38%) 100%);
      -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 1px 2px hsl(20 80% 25% / 0.5));
      font-weight: 800; letter-spacing: 0.03em;
    }
    .dark .theme-glow { filter: drop-shadow(0 0 14px hsl(40 95% 55% / 0.6)) drop-shadow(0 0 28px hsl(20 90% 50% / 0.3)); }
    @keyframes theme-harvest-leaf-drift { 0%, 100% { transform: translateY(0) rotate(-8deg); opacity: 0.85; } 50% { transform: translateY(-3px) rotate(8deg); opacity: 1; } }
    .theme-card::before { content: '🍁'; position: absolute; top: -8px; right: 8px; font-size: 16px; animation: theme-harvest-leaf-drift 3s ease-in-out infinite; pointer-events: none; filter: drop-shadow(0 0 6px hsl(20 95% 50%)); z-index: 2; }
    .theme-card::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent 25%, hsl(40 100% 65% / 0.16) 50%, transparent 75%); background-size: 200% 100%; animation: theme-sakura-shimmer 5s ease-in-out infinite; pointer-events: none; border-radius: inherit; mix-blend-mode: overlay; }
    body::before { content: ''; pointer-events: none; position: fixed; inset: 0; background: radial-gradient(circle at 20% 80%, hsl(20 90% 45% / 0.07) 0%, transparent 30%), radial-gradient(circle at 80% 20%, hsl(40 95% 50% / 0.06) 0%, transparent 30%); z-index: 0; }
  `,

  // 🧊 FROSTBITE AURORA — icy cyan + aurora purple, crystalline
  theme_frostbite: `
    :root:not(.dark) { --foreground: 215 60% 18% !important; }
    :root:not(.dark) .theme-card { background-image: linear-gradient(135deg, hsl(195 80% 96%) 0%, hsl(270 60% 96%) 50%, hsl(195 80% 96%) 100%) !important; border-color: hsl(195 95% 50% / 0.55) !important; }
    .dark .theme-card { background-image: linear-gradient(135deg, hsl(215 70% 12% / 0.5) 0%, hsl(270 60% 16% / 0.3) 50%, hsl(215 70% 12% / 0.5) 100%) !important; }
    .theme-card { border-width: 2px !important; position: relative; overflow: hidden; }
    .theme-card:hover { box-shadow: 0 8px 36px hsl(195 95% 55% / 0.35), 0 0 0 1px hsl(270 80% 65% / 0.4), inset 0 1px 0 hsl(195 95% 80% / 0.5); transform: translateY(-2px); }
    .theme-glow {
      background: linear-gradient(135deg, hsl(195 90% 42%) 0%, hsl(270 75% 55%) 50%, hsl(195 90% 42%) 100%);
      -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 1px 2px hsl(215 70% 25% / 0.4));
      font-weight: 800; letter-spacing: 0.03em;
    }
    .dark .theme-glow { filter: drop-shadow(0 0 14px hsl(195 100% 60% / 0.6)) drop-shadow(0 0 28px hsl(270 85% 65% / 0.4)); }
    @keyframes theme-frost-aurora { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
    @keyframes theme-frost-sparkle-mythic { 0%, 100% { opacity: 0.7; transform: scale(1) rotate(0deg); } 50% { opacity: 1; transform: scale(1.2) rotate(20deg); } }
    .theme-card::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent 0%, hsl(195 95% 65% / 0.12) 33%, hsl(270 85% 65% / 0.12) 66%, transparent 100%); background-size: 300% 100%; animation: theme-frost-aurora 6s ease-in-out infinite; pointer-events: none; border-radius: inherit; }
    .theme-card::before { content: '❄'; position: absolute; top: -6px; right: 8px; font-size: 16px; animation: theme-frost-sparkle-mythic 2.5s ease-in-out infinite; pointer-events: none; filter: drop-shadow(0 0 8px hsl(195 100% 70%)); z-index: 2; color: hsl(195 100% 50%); }
    body::before { content: ''; pointer-events: none; position: fixed; inset: 0; background: radial-gradient(circle at 25% 25%, hsl(195 95% 60% / 0.08) 0%, transparent 30%), radial-gradient(circle at 75% 75%, hsl(270 85% 65% / 0.07) 0%, transparent 30%); z-index: 0; }
  `,
};

export default function ThemeEffects() {
  const { state } = useGame();
  const styleRef = useRef<HTMLStyleElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const themeId = state.equippedTheme;
  const themeItem = themeId ? GACHA_ITEMS.find(i => i.id === themeId) : null;
  const rarity = themeItem?.rarity || 'common';

  // Inject GUI styles
  useEffect(() => {
    if (styleRef.current) {
      styleRef.current.remove();
      styleRef.current = null;
    }
    if (themeId && THEME_GUI_STYLES[themeId]) {
      const style = document.createElement('style');
      style.setAttribute('data-theme-effects', themeId);
      style.textContent = THEME_GUI_STYLES[themeId];
      document.head.appendChild(style);
      styleRef.current = style;
    }
    return () => {
      if (styleRef.current) {
        styleRef.current.remove();
        styleRef.current = null;
      }
    };
  }, [themeId]);

  // Click particle effects
  const handleClick = useCallback((e: MouseEvent) => {
    if (!themeId || !THEME_CLICK_EFFECTS[themeId]) return;
    const config = THEME_CLICK_EFFECTS[themeId];

    // Scale by rarity (mythical > legendary > epic > rare > common)
    const rarityScale = rarity === 'mythical' ? 1.8 : rarity === 'legendary' ? 1.5 : rarity === 'epic' ? 1.2 : rarity === 'rare' ? 1.0 : 0.7;
    const count = Math.ceil(config.count * rarityScale);

    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.textContent = config.emojis[Math.floor(Math.random() * config.emojis.length)];
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const dist = config.spread * rarityScale * (0.5 + Math.random() * 0.5);
      const size = rarity === 'mythical' ? 24 : rarity === 'legendary' ? 20 : rarity === 'epic' ? 17 : rarity === 'rare' ? 14 : 12;
      
      el.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        font-size: ${size}px;
        pointer-events: none;
        z-index: 9999;
        transition: all ${config.duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
        opacity: 1;
      `;
      document.body.appendChild(el);

      requestAnimationFrame(() => {
        if (themeId === 'theme_unemployment') {
          // Mythical unique: lazy upward drift instead of explosion
          el.style.transform = `translate(${Math.cos(angle) * dist * 0.4 + (Math.random() - 0.5) * 30}px, ${-80 - Math.random() * 40}px) scale(0.5) rotate(${(Math.random() - 0.5) * 30}deg)`;
        } else {
          el.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist - 30}px) scale(0.3) rotate(${Math.random() * 360}deg)`;
        }
        el.style.opacity = '0';
      });

      setTimeout(() => el.remove(), config.duration + 50);
    }
  }, [themeId, rarity]);

  useEffect(() => {
    if (!themeId) return;
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [themeId, handleClick]);

  // Mythical unique passive: ambient floating Z's for unemployment theme
  useEffect(() => {
    if (themeId !== 'theme_unemployment') return;
    const interval = setInterval(() => {
      const z = document.createElement('span');
      const symbols = ['💤', 'z', 'Z', '😴'];
      z.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      const startX = Math.random() * window.innerWidth;
      z.style.cssText = `
        position: fixed;
        left: ${startX}px;
        top: ${window.innerHeight + 20}px;
        font-size: ${14 + Math.random() * 14}px;
        pointer-events: none;
        z-index: 9998;
        opacity: 0;
        color: hsl(220 15% 50% / 0.6);
        transition: transform 6s linear, opacity 1.5s ease-in-out;
        font-family: cursive;
      `;
      document.body.appendChild(z);
      requestAnimationFrame(() => {
        z.style.opacity = '0.6';
        z.style.transform = `translate(${(Math.random() - 0.5) * 80}px, -${window.innerHeight + 60}px) rotate(${(Math.random() - 0.5) * 40}deg)`;
      });
      setTimeout(() => { z.style.opacity = '0'; }, 4500);
      setTimeout(() => z.remove(), 6500);
    }, 1200);
    return () => clearInterval(interval);
  }, [themeId]);

  // Mythical unique passive: ambient drifting fire embers + occasional dragon roar shimmer for Dragon theme
  useEffect(() => {
    if (themeId !== 'theme_dragon') return;

    // Floating embers from bottom edges
    const emberInterval = setInterval(() => {
      const ember = document.createElement('span');
      const glyphs = ['🔥', '✨', '🔸', '🟠'];
      ember.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      // Spawn near left or right edge — not center, less in-your-face
      const fromLeft = Math.random() < 0.5;
      const startX = fromLeft
        ? Math.random() * (window.innerWidth * 0.18)
        : window.innerWidth - Math.random() * (window.innerWidth * 0.18);
      ember.style.cssText = `
        position: fixed;
        left: ${startX}px;
        top: ${window.innerHeight + 10}px;
        font-size: ${10 + Math.random() * 10}px;
        pointer-events: none;
        z-index: 9998;
        opacity: 0;
        filter: drop-shadow(0 0 6px hsl(15 95% 55% / 0.7));
        transition: transform 5s ease-out, opacity 1.2s ease-in-out;
      `;
      document.body.appendChild(ember);
      requestAnimationFrame(() => {
        ember.style.opacity = '0.85';
        const driftX = (fromLeft ? 1 : -1) * (10 + Math.random() * 30);
        ember.style.transform = `translate(${driftX}px, -${window.innerHeight * 0.7 + Math.random() * 100}px) scale(${0.6 + Math.random() * 0.4}) rotate(${(Math.random() - 0.5) * 60}deg)`;
      });
      setTimeout(() => { ember.style.opacity = '0'; }, 3800);
      setTimeout(() => ember.remove(), 5200);
    }, 700);

    // Periodic faint "dragon roar" — golden flash overlay every ~12s
    const roarInterval = setInterval(() => {
      const flash = document.createElement('div');
      flash.style.cssText = `
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 9997;
        background: radial-gradient(ellipse at center, hsl(40 95% 55% / 0.08) 0%, hsl(15 90% 45% / 0.04) 40%, transparent 70%);
        opacity: 0;
        transition: opacity 1.4s ease-in-out;
      `;
      document.body.appendChild(flash);
      requestAnimationFrame(() => { flash.style.opacity = '1'; });
      setTimeout(() => { flash.style.opacity = '0'; }, 700);
      setTimeout(() => flash.remove(), 2200);
    }, 12000);

    return () => {
      clearInterval(emberInterval);
      clearInterval(roarInterval);
    };
  }, [themeId]);

  // Mythical unique passive: ambient particles for Royal & seasonal mythicals
  useEffect(() => {
    type Conf = { glyphs: string[]; intervalMs: number; color: string; flashColor?: string; flashEveryMs?: number; fromTop?: boolean };
    const CONFIGS: Record<string, Conf> = {
      theme_royal:          { glyphs: ['👑', '✨', '💎', '⚜️'], intervalMs: 1100, color: 'hsl(45 95% 60%)',  flashColor: 'hsl(45 100% 60% / 0.08)', flashEveryMs: 14000 },
      theme_sakura_eternal: { glyphs: ['🌸', '✿', '🌟', '🎀'], intervalMs: 800,  color: 'hsl(335 90% 70%)', flashColor: 'hsl(335 90% 70% / 0.07)', flashEveryMs: 15000, fromTop: true },
      theme_solar_eclipse:  { glyphs: ['☀️', '🔥', '✨', '⚡'], intervalMs: 750,  color: 'hsl(40 100% 60%)', flashColor: 'hsl(40 100% 55% / 0.1)',  flashEveryMs: 11000 },
      theme_harvest_king:   { glyphs: ['🍁', '🍂', '🌾', '✨'], intervalMs: 850,  color: 'hsl(20 90% 50%)',  flashColor: 'hsl(40 95% 55% / 0.08)',  flashEveryMs: 13000, fromTop: true },
      theme_frostbite:      { glyphs: ['❄️', '✨', '🧊', '💎'], intervalMs: 700,  color: 'hsl(195 100% 65%)',flashColor: 'hsl(195 100% 60% / 0.08)',flashEveryMs: 12000, fromTop: true },
    };
    if (!themeId || !CONFIGS[themeId]) return;
    const conf = CONFIGS[themeId];

    const partInterval = setInterval(() => {
      const p = document.createElement('span');
      p.textContent = conf.glyphs[Math.floor(Math.random() * conf.glyphs.length)];
      const startX = Math.random() * window.innerWidth;
      const startY = conf.fromTop ? -20 : window.innerHeight + 10;
      p.style.cssText = `
        position: fixed;
        left: ${startX}px;
        top: ${startY}px;
        font-size: ${12 + Math.random() * 14}px;
        pointer-events: none;
        z-index: 9998;
        opacity: 0;
        filter: drop-shadow(0 0 6px ${conf.color});
        transition: transform ${conf.fromTop ? 7 : 5}s linear, opacity 1.2s ease-in-out;
      `;
      document.body.appendChild(p);
      requestAnimationFrame(() => {
        p.style.opacity = '0.85';
        const driftX = (Math.random() - 0.5) * 120;
        const driftY = conf.fromTop ? window.innerHeight + 80 : -(window.innerHeight * 0.7 + Math.random() * 100);
        p.style.transform = `translate(${driftX}px, ${driftY}px) rotate(${(Math.random() - 0.5) * 360}deg)`;
      });
      setTimeout(() => { p.style.opacity = '0'; }, conf.fromTop ? 5800 : 3800);
      setTimeout(() => p.remove(), conf.fromTop ? 7200 : 5200);
    }, conf.intervalMs);

    let flashInterval: ReturnType<typeof setInterval> | null = null;
    if (conf.flashColor && conf.flashEveryMs) {
      flashInterval = setInterval(() => {
        const flash = document.createElement('div');
        flash.style.cssText = `
          position: fixed; inset: 0; pointer-events: none; z-index: 9997;
          background: radial-gradient(ellipse at center, ${conf.flashColor} 0%, transparent 70%);
          opacity: 0; transition: opacity 1.4s ease-in-out;
        `;
        document.body.appendChild(flash);
        requestAnimationFrame(() => { flash.style.opacity = '1'; });
        setTimeout(() => { flash.style.opacity = '0'; }, 800);
        setTimeout(() => flash.remove(), 2400);
      }, conf.flashEveryMs);
    }

    return () => {
      clearInterval(partInterval);
      if (flashInterval) clearInterval(flashInterval);
    };
  }, [themeId]);

  // Add theme-card class to all Card components — but EXCLUDE Radix overlays (dialogs, popovers, dropdowns, tooltips, sheets, alerts)
  // Those use position: fixed + transform: translate(-50%, -50%) and our theme transforms break them.
  useEffect(() => {
    if (!themeId) {
      // Remove theme-card classes
      document.querySelectorAll('.theme-card').forEach(el => el.classList.remove('theme-card'));
      document.querySelectorAll('.theme-glow').forEach(el => el.classList.remove('theme-glow'));
      return;
    }

    const isInsideOverlay = (el: Element): boolean => {
      // Walk up parents: any Radix portal content uses role="dialog" / role="menu" / data-radix-* / data-state attributes on positioned wrappers
      let cur: Element | null = el;
      while (cur && cur !== document.body) {
        const role = cur.getAttribute('role');
        if (role === 'dialog' || role === 'alertdialog' || role === 'menu' || role === 'tooltip' || role === 'listbox') return true;
        const cls = cur.className;
        if (typeof cls === 'string' && (
          cls.includes('DialogContent') ||
          cls.includes('PopoverContent') ||
          cls.includes('DropdownMenuContent')
        )) return true;
        // Radix portals
        if (cur.hasAttribute('data-radix-popper-content-wrapper')) return true;
        if (cur.hasAttribute('data-radix-portal')) return true;
        cur = cur.parentElement;
      }
      return false;
    };

    const addClasses = () => {
      document.querySelectorAll('[class*="rounded-lg"][class*="border"]').forEach(el => {
        if (isInsideOverlay(el)) {
          el.classList.remove('theme-card');
          return;
        }
        if (!el.classList.contains('theme-card')) el.classList.add('theme-card');
      });
      document.querySelectorAll('.font-heading').forEach(el => {
        if (isInsideOverlay(el)) {
          el.classList.remove('theme-glow');
          return;
        }
        if (!el.classList.contains('theme-glow')) el.classList.add('theme-glow');
      });
    };

    addClasses();
    const observer = new MutationObserver(addClasses);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [themeId]);

  return null;
}
