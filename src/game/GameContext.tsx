import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import { PRODUCTS, EMPLOYEE_TYPES, UPGRADES, SHELF_TYPES, BRANCH_TYPES, EMPLOYEE_NAMES, PRESTIGE_BONUSES, getUpgradeCost, getBranchCost, generatePriceMultiplier, getDemandMultiplier, getEmployeeLevelXP, getEmployeeLevelBonus, isNightTime, getSeasonForDay, getSeasonProductMultiplier, SEASONS, REPUTATION_CAP } from './gameData';
import { GACHA_ITEMS, GACHA_COST_GEMS, GACHA_COST_MONEY, rollGacha } from './gachaData';

export interface ShelfState {
  id: string;
  shelfTypeId: string;
  productId: string | null;
  currentStock: number;
  capacity: number;
  customSellPrice: number;
  customerTimer: number;
  // Real-world timestamp (ms) of the last price change — enforces 3-min cooldown
  lastPriceChangeAt?: number;
}

export interface EmployeeState {
  id: string;
  typeId: string;
  name: string;
  hiredAt: number;
  level: number;
  xp: number;
  mood: number;
}

export interface BranchState {
  id: string;
  typeId: string;
  level: number;
  name: string;
}

export interface DaySummary {
  day: number;
  revenue: number;
  expenses: number;
  profit: number;
  itemsSold: number;
  customersServed: number;
  branchIncome: number;
  itemsSoldByProduct: Record<string, number>;
}

export interface ActiveBuff {
  itemId: string;
  stat: string;
  multiplier: number;
  ticksLeft: number;
}

export interface GameState {
  money: number;
  totalEarned: number;
  totalSpent: number;
  reputation: number;
  shelves: ShelfState[];
  maxShelves: number;
  employees: EmployeeState[];
  upgrades: Record<string, number>;
  stock: Record<string, number>;
  customersServed: number;
  itemsSold: number;
  day: number;
  tickCount: number;
  ticksInDay: number;
  gameHour: number;
  storeName: string;
  notifications: { id: string; text: string; type: 'success' | 'warning' | 'info' }[];
  marketPrices: Record<string, number>;
  priceEpoch: number;
  achievements: string[];
  activeEvent: { id: string; name: string; emoji: string; description: string; ticksLeft: number; effect: string } | null;
  branches: BranchState[];
  daySummary: DaySummary | null;
  showDaySummary: boolean;
  dayRevenue: number;
  dayExpenses: number;
  dayItemsSold: number;
  dayCustomers: number;
  dayBranchIncome: number;
  dayItemsByProduct: Record<string, number>;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  musicVolume: number;
  musicLoop: boolean;
  gameStarted: boolean;
  shopOpen: boolean;
  // Prestige
  prestigeLevel: number;
  prestigePoints: number;
  prestigeUpgrades: Record<string, number>;
  // Gacha
  gems: number;
  gachaInventory: string[];
  activeBuffs: ActiveBuff[];
  equippedTheme: string | null;
  equippedCosmetic: string | null;
  equippedTitle: string | null;
  // Income tracking
  recentIncome: number[];
  // Side jobs
  sideJobs: SideJobState[];
  sideJobCooldown: number;
  // Choice events
  choiceEvent: ChoiceEventInstance | null;
  // New tracking fields
  playTimeTicks: number;
  eventsEncountered: number;
  nightSales: number;
  sideJobsCompleted: number;
  hasBankrupted: boolean;
  lowestPriceBuys: number;
  // v2.3 — Daily login bonus & offline tracking
  lastDailyClaimAt?: number;       // ms timestamp of last daily bonus claim
  dailyStreak?: number;            // consecutive days claimed
  lastSessionEndAt?: number;       // ms timestamp game was last seen
  // v2.5 — Happy Hour boost (player-triggered 2x sales for 60s, 5min cooldown)
  lastHappyHourAt?: number;
}

export interface ChoiceEventInstance {
  id: string;
  eventId: string;
  correctOptionIndex: number;
}

export interface SideJobState {
  id: string;
  jobId: string;
  progress: number;
  target: number;
  reward: number;
  gemReward: number;
  startedAt: number;
  expiresAt: number;
}

// Day starts at 6:00 AM. Each tick = 1 minute game time.
// 6AM to 6AM next day = 24 hours = 1440 minutes = 1440 ticks
const TICKS_PER_DAY = 1440;
const TICK_INTERVAL = 1000; // ms — 1 game minute = 1 real second
const DAY_START_HOUR = 6; // Game day starts at 6 AM

const INITIAL_STATE: GameState = {
  money: 525,
  totalEarned: 0,
  totalSpent: 0,
  reputation: 10,
  shelves: [],
  maxShelves: 4,
  employees: [],
  upgrades: {},
  stock: {},
  customersServed: 0,
  itemsSold: 0,
  day: 1,
  tickCount: 0,
  ticksInDay: 0,
  gameHour: DAY_START_HOUR,
  storeName: 'Supermarket Saya',
  notifications: [],
  marketPrices: {},
  priceEpoch: 0,
  achievements: [],
  activeEvent: null,
  branches: [],
  daySummary: null,
  showDaySummary: false,
  dayRevenue: 0,
  dayExpenses: 0,
  dayItemsSold: 0,
  dayCustomers: 0,
  dayBranchIncome: 0,
  dayItemsByProduct: {},
  musicEnabled: true,
  sfxEnabled: true,
  musicVolume: 0.5,
  musicLoop: true,
  gameStarted: false,
  shopOpen: true,
  prestigeLevel: 0,
  prestigePoints: 0,
  prestigeUpgrades: {},
  gems: 0,
  gachaInventory: [],
  activeBuffs: [],
  equippedTheme: null,
  equippedCosmetic: null,
  equippedTitle: null,
  recentIncome: [],
  sideJobs: [],
  sideJobCooldown: 0,
  choiceEvent: null,
  playTimeTicks: 0,
  eventsEncountered: 0,
  nightSales: 0,
  sideJobsCompleted: 0,
  hasBankrupted: false,
  lowestPriceBuys: 0,
};

type Action =
  | { type: 'BUY_STOCK'; productId: string; amount: number }
  | { type: 'BUY_SHELF'; shelfTypeId: string }
  | { type: 'ASSIGN_PRODUCT'; shelfId: string; productId: string }
  | { type: 'RESTOCK_SHELF'; shelfId: string; amount: number }
  | { type: 'RESTOCK_ALL_SHELVES' }
  | { type: 'SMART_PRICE_ALL' }
  | { type: 'ACTIVATE_HAPPY_HOUR' }
  | { type: 'HIRE_EMPLOYEE'; typeId: string }
  | { type: 'FIRE_EMPLOYEE'; employeeId: string }
  | { type: 'BUY_UPGRADE'; upgradeId: string }
  | { type: 'SET_SELL_PRICE'; shelfId: string; price: number }
  | { type: 'GAME_TICK' }
  | { type: 'SET_STORE_NAME'; name: string }
  | { type: 'DISMISS_NOTIFICATION'; id: string }
  | { type: 'LOAD_STATE'; state: GameState }
  | { type: 'BUY_BRANCH'; branchTypeId: string }
  | { type: 'UPGRADE_BRANCH'; branchId: string }
  | { type: 'BOOST_EMPLOYEE_MOOD'; employeeId: string }
  | { type: 'DISMISS_DAY_SUMMARY' }
  | { type: 'TOGGLE_MUSIC' }
  | { type: 'TOGGLE_SFX' }
  | { type: 'SET_MUSIC_VOLUME'; volume: number }
  | { type: 'TOGGLE_MUSIC_LOOP' }
  | { type: 'START_GAME' }
  | { type: 'CLOSE_SHOP' }
  | { type: 'OPEN_SHOP' }
  | { type: 'PRESTIGE' }
  | { type: 'BUY_PRESTIGE_UPGRADE'; upgradeId: string }
  | { type: 'GACHA_SPIN'; currency: 'gems' | 'money'; count: number; rolledItemIds: string[] }
  | { type: 'ACTIVATE_BUFF'; itemId: string }
  | { type: 'EQUIP_THEME'; itemId: string }
  | { type: 'EQUIP_COSMETIC'; itemId: string }
  | { type: 'EQUIP_TITLE'; itemId: string }
  | { type: 'ADMIN_SET_MONEY'; amount: number }
  | { type: 'ADMIN_SET_GEMS'; amount: number }
  | { type: 'ADMIN_UNLOCK_ALL_GACHA' }
  | { type: 'ADMIN_MAX_REPUTATION' }
  | { type: 'ADMIN_MAX_PRESTIGE' }
  | { type: 'ACCEPT_SIDE_JOB'; jobId: string }
  | { type: 'COMPLETE_SIDE_JOB'; sideJobId: string }
  | { type: 'GENERATE_SIDE_JOBS' }
  | { type: 'ANSWER_CHOICE_EVENT'; optionIndex: number }
  | { type: 'DISMISS_CHOICE_EVENT' }
  | { type: 'REMOVE_SHELF'; shelfId: string }
  | { type: 'REMOVE_BRANCH'; branchId: string }
  | { type: 'BUY_LIMITED_ITEM'; itemId: string; cost: number; currency: 'gems' | 'money' }
  | { type: 'CLAIM_DAILY_BONUS'; money: number; gems: number; streak: number }
  | { type: 'CLAIM_OFFLINE_REWARD'; money: number; minutes: number }
  | { type: 'SKIP_DAY' };

function addNotification(state: GameState, text: string, type: 'success' | 'warning' | 'info'): GameState {
  const id = Date.now().toString() + Math.random();
  const notifications = [...state.notifications, { id, text, type }].slice(-5);
  return { ...state, notifications };
}

function getMarketBuyPrice(productId: string, state: GameState): number {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return 0;
  const multiplier = state.marketPrices[productId] || 1;
  let eventMult = 1;
  if (state.activeEvent?.effect === 'cheap_supplier') eventMult = 0.7;
  if (state.activeEvent?.effect === 'expensive_supplier') eventMult = 1.4;
  return Math.max(1, Math.round(product.baseBuyCost * multiplier * eventMult));
}

function getPrestigeMultiplier(state: GameState, type: string): number {
  return (state.prestigeUpgrades?.[type] || 0);
}

function getBuffMultiplier(state: GameState, stat: string): number {
  let mult = 1;
  (state.activeBuffs || []).forEach(buff => {
    if (buff.stat === stat || buff.stat === 'all') {
      mult *= buff.multiplier;
    }
  });
  return mult;
}

export function getMultipliers(state: GameState) {
  const managers = state.employees.filter(e => e.typeId === 'manager');
  const cashiers = state.employees.filter(e => e.typeId === 'cashier');
  const acLevel = state.upgrades['ac'] || 0;
  const posLevel = state.upgrades['pos'] || 0;
  const billboardLevel = state.upgrades['billboard'] || 0;
  const loyaltyLevel = state.upgrades['loyalty'] || 0;
  const parkingLevel = state.upgrades['parking'] || 0;
  const deliveryLevel = state.upgrades['delivery'] || 0;
  const selfCheckoutLevel = state.upgrades['self_checkout'] || 0;
  const playgroundLevel = state.upgrades['playground'] || 0;

  const managerBonus = managers.reduce((sum, m) => sum + 0.1 * getEmployeeLevelBonus(m.level), 0);
  const cashierBonus = cashiers.reduce((sum, c) => sum + 0.2 * getEmployeeLevelBonus(c.level), 0);

  const prestigeProfit = 1 + getPrestigeMultiplier(state, 'profit_boost') * 0.1;
  const prestigeSpeed = 1 + getPrestigeMultiplier(state, 'speed_boost') * 0.1;
  const prestigeCustomer = 1 + getPrestigeMultiplier(state, 'customer_boost') * 0.1;

  const buffProfit = getBuffMultiplier(state, 'profit');
  const buffSpeed = getBuffMultiplier(state, 'speed');
  const buffCustomer = getBuffMultiplier(state, 'customer');

  const profitMultiplier = (1 + managerBonus) * prestigeProfit * buffProfit;
  const sellSpeedMultiplier = (1 + cashierBonus + acLevel * 0.15 + posLevel * 0.25 + selfCheckoutLevel * 0.3 + deliveryLevel * 0.15) * prestigeSpeed * buffSpeed;
  const customerMultiplier = (1 + billboardLevel * 0.05 + loyaltyLevel * 0.1 + parkingLevel * 0.2 + playgroundLevel * 0.15) * prestigeCustomer * buffCustomer;

  return { profitMultiplier, sellSpeedMultiplier, customerMultiplier };
}

const ACHIEVEMENT_DEFS = [
  { id: 'first_sale', check: (s: GameState) => s.itemsSold >= 1 },
  { id: 'hundred_sales', check: (s: GameState) => s.itemsSold >= 100 },
  { id: 'thousand_sales', check: (s: GameState) => s.itemsSold >= 1000 },
  { id: 'ten_thousand_sales', check: (s: GameState) => s.itemsSold >= 10000 },
  { id: 'first_employee', check: (s: GameState) => s.employees.length >= 1 },
  { id: 'team_of_5', check: (s: GameState) => s.employees.length >= 5 },
  { id: 'team_of_10', check: (s: GameState) => s.employees.length >= 10 },
  { id: 'all_employee_types', check: (s: GameState) => {
    const types = new Set(s.employees.map(e => e.typeId));
    return types.size >= EMPLOYEE_TYPES.length;
  }},
  { id: 'rich_1k', check: (s: GameState) => s.money >= 1000 },
  { id: 'rich_10k', check: (s: GameState) => s.money >= 10000 },
  { id: 'rich_100k', check: (s: GameState) => s.money >= 100000 },
  { id: 'rich_500k', check: (s: GameState) => s.money >= 500000 },
  { id: 'rich_1m', check: (s: GameState) => s.money >= 1000000 },
  { id: 'rep_50', check: (s: GameState) => s.reputation >= 50 },
  { id: 'rep_200', check: (s: GameState) => s.reputation >= 200 },
  { id: 'rep_500', check: (s: GameState) => s.reputation >= 500 },
  { id: 'rep_max', check: (s: GameState) => s.reputation >= 1000 },
  { id: 'rep_legend', check: (s: GameState) => s.reputation >= 100_000 },
  { id: 'rep_god', check: (s: GameState) => s.reputation >= 1_000_000 },
  { id: 'day_7', check: (s: GameState) => s.day >= 7 },
  { id: 'day_30', check: (s: GameState) => s.day >= 30 },
  { id: 'day_100', check: (s: GameState) => s.day >= 100 },
  { id: 'day_365', check: (s: GameState) => s.day >= 365 },
  { id: 'full_shelves', check: (s: GameState) => s.shelves.length >= 4 },
  { id: 'shelves_10', check: (s: GameState) => s.shelves.length >= 10 },
  { id: 'shelves_20', check: (s: GameState) => s.shelves.length >= 20 },
  { id: 'first_branch', check: (s: GameState) => s.branches.length >= 1 },
  { id: 'empire', check: (s: GameState) => s.branches.length >= 5 },
  { id: 'ten_branches', check: (s: GameState) => s.branches.length >= 10 },
  { id: 'twenty_branches', check: (s: GameState) => s.branches.length >= 20 },
  { id: 'fifty_branches', check: (s: GameState) => s.branches.length >= 50 },
  { id: 'max_employee', check: (s: GameState) => s.employees.some(e => e.level >= 10) },
  { id: 'all_max_employees', check: (s: GameState) => s.employees.length >= 3 && s.employees.every(e => e.level >= 10) },
  { id: 'millionaire', check: (s: GameState) => s.totalEarned >= 1000000 },
  { id: 'billionaire', check: (s: GameState) => s.totalEarned >= 1000000000 },
  { id: 'first_prestige', check: (s: GameState) => (s.prestigeLevel || 0) >= 1 },
  { id: 'prestige_5', check: (s: GameState) => (s.prestigeLevel || 0) >= 5 },
  { id: 'prestige_10', check: (s: GameState) => (s.prestigeLevel || 0) >= 10 },
  { id: 'gacha_collector', check: (s: GameState) => (s.gachaInventory || []).length >= 10 },
  { id: 'gacha_collector_50', check: (s: GameState) => (s.gachaInventory || []).length >= 50 },
  { id: 'legendary_pull', check: (s: GameState) => (s.gachaInventory || []).some(id => GACHA_ITEMS.find(i => i.id === id)?.rarity === 'legendary') },
  { id: 'gem_hoarder', check: (s: GameState) => (s.gems || 0) >= 100 },
  { id: 'gem_master', check: (s: GameState) => (s.gems || 0) >= 500 },
  { id: 'gem_god', check: (s: GameState) => (s.gems || 0) >= 1000 },
  { id: 'stock_hoarder', check: (s: GameState) => Object.values(s.stock).reduce((a, b) => a + b, 0) >= 1000 },
  { id: 'speed_demon', check: (s: GameState) => { const m = getMultipliers(s); return m.sellSpeedMultiplier >= 5; } },
  { id: 'profit_king', check: (s: GameState) => { const m = getMultipliers(s); return m.profitMultiplier >= 5; } },
  { id: 'bankrupt_survivor', check: (s: GameState) => s.hasBankrupted === true },
  { id: 'night_trader', check: (s: GameState) => (s.nightSales || 0) >= 500 },
  { id: 'unemployment', check: (s: GameState) => (s.playTimeTicks || 0) >= 360000 }, // 100 hours
  { id: 'early_bird', check: (s: GameState) => s.gameHour >= 6 && s.gameHour < 7 && s.shopOpen },
  { id: 'no_shelf_profit', check: (s: GameState) => s.shelves.length === 0 && s.totalEarned >= 1000 },
  { id: 'full_stock_all', check: (s: GameState) => s.shelves.length >= 4 && s.shelves.every(sh => sh.currentStock >= sh.capacity * 0.9) },
  { id: 'event_master', check: (s: GameState) => (s.eventsEncountered || 0) >= 50 },
  { id: 'side_hustle', check: (s: GameState) => (s.sideJobsCompleted || 0) >= 5 },
  { id: 'big_spender', check: (s: GameState) => s.totalSpent >= 500000 },
  { id: 'market_timer', check: (s: GameState) => (s.lowestPriceBuys || 0) >= 10 },
];

export const SIDE_JOB_DEFS = [
  { id: 'delivery', name: '📦 Kurir Paket', emoji: '📦', description: 'Antar 10 paket ke pelanggan.', target: 10, baseReward: 120, gemReward: 1, duration: 700 },
  { id: 'cleaning', name: '🧹 Bersih-Bersih', emoji: '🧹', description: 'Bersihkan 5 area di mall.', target: 5, baseReward: 90, gemReward: 0, duration: 500 },
  { id: 'survey', name: '📋 Survey Pelanggan', emoji: '📋', description: 'Survey 15 pelanggan.', target: 15, baseReward: 180, gemReward: 1, duration: 900 },
  { id: 'flyer', name: '📰 Sebar Brosur', emoji: '📰', description: 'Sebar 20 brosur di kota.', target: 20, baseReward: 150, gemReward: 1, duration: 800 },
  { id: 'cooking', name: '🍳 Masak Pesanan', emoji: '🍳', description: 'Masak 8 pesanan catering.', target: 8, baseReward: 220, gemReward: 1, duration: 650 },
  { id: 'tutoring', name: '📚 Les Privat', emoji: '📚', description: 'Ajar 3 murid les.', target: 3, baseReward: 200, gemReward: 1, duration: 600 },
  { id: 'freelance', name: '💻 Freelance IT', emoji: '💻', description: 'Selesaikan 5 proyek IT.', target: 5, baseReward: 280, gemReward: 2, duration: 1000 },
  { id: 'farming', name: '🌾 Panen Kebun', emoji: '🌾', description: 'Panen 12 tanaman.', target: 12, baseReward: 100, gemReward: 0, duration: 600 },
  { id: 'fishing', name: '🎣 Memancing', emoji: '🎣', description: 'Tangkap 6 ikan.', target: 6, baseReward: 130, gemReward: 1, duration: 650 },
  { id: 'photography', name: '📸 Foto Produk', emoji: '📸', description: 'Foto 10 produk untuk klien.', target: 10, baseReward: 250, gemReward: 1, duration: 800 },
  { id: 'mystery_shop', name: '🕵️ Mystery Shopper', emoji: '🕵️', description: 'Kunjungi 4 toko pesaing.', target: 4, baseReward: 320, gemReward: 2, duration: 900 },
  { id: 'repair', name: '🔧 Reparasi Mesin', emoji: '🔧', description: 'Perbaiki 3 mesin rusak.', target: 3, baseReward: 380, gemReward: 2, duration: 1000 },
];

function generateRandomSideJobs(day: number): typeof SIDE_JOB_DEFS[number][] {
  const shuffled = [...SIDE_JOB_DEFS].sort(() => Math.random() - 0.5);
  const count = Math.min(3 + Math.floor(day / 7), 5);
  return shuffled.slice(0, count);
}


  const RANDOM_EVENTS = [
  { id: 'cheap_supplier', name: 'Supplier Murah', emoji: '📦', description: 'Supplier memberikan diskon 30%!', duration: 90, effect: 'cheap_supplier' },
  { id: 'expensive_supplier', name: 'Harga Naik!', emoji: '📈', description: 'Harga supplier naik 40%!', duration: 60, effect: 'expensive_supplier' },
  { id: 'viral', name: 'Viral di Medsos!', emoji: '📱', description: 'Toko kamu viral! +20 reputasi.', duration: 40, effect: 'viral' },
  { id: 'inspection', name: 'Inspeksi Kesehatan', emoji: '🔍', description: 'Inspektur datang! Kebersihan diperiksa.', duration: 30, effect: 'inspection' },
  { id: 'holiday', name: 'Hari Libur!', emoji: '🎉', description: 'Hari libur! Pelanggan 2x lebih banyak!', duration: 80, effect: 'holiday' },
  { id: 'rain', name: 'Hujan Deras', emoji: '🌧️', description: 'Hujan deras! Pelanggan berkurang 30%.', duration: 50, effect: 'rain' },
  { id: 'employee_party', name: 'Pesta Pegawai', emoji: '🎊', description: 'Pegawai senang! Mood +20.', duration: 20, effect: 'employee_party' },
  { id: 'gem_rain', name: 'Hujan Gems!', emoji: '💎', description: 'Gems bonus! +5 gems!', duration: 10, effect: 'gem_rain' },
  { id: 'lucky_day', name: 'Hari Keberuntungan', emoji: '🍀', description: 'Semua profit +30% hari ini!', duration: 100, effect: 'lucky_day' },
  { id: 'food_festival', name: 'Festival Makanan', emoji: '🎪', description: 'Festival! Pelanggan +50%, produk makanan laris!', duration: 70, effect: 'food_festival' },
];

export interface ChoiceEventDef {
  id: string;
  emoji: string;
  title: string;
  description: string;
  options: { label: string; description: string }[];
  // correctIndex is determined randomly at spawn time
  rewards: { money: number; gems: number; reputation: number; description: string };
  penalties: { money: number; reputation: number; description: string };
}

export const CHOICE_EVENTS: ChoiceEventDef[] = [
  {
    id: 'suspicious_supplier', emoji: '🕵️', title: 'Supplier Mencurigakan',
    description: 'Seseorang menawarkan stok murah tapi terlihat mencurigakan. Apa yang kamu lakukan?',
    options: [
      { label: 'Terima tawaran', description: 'Harga murah, tapi berisiko...' },
      { label: 'Tolak dengan sopan', description: 'Lebih aman, tapi kehilangan peluang.' },
      { label: 'Laporkan ke polisi', description: 'Warga negara yang baik!' },
    ],
    rewards: { money: 500, gems: 3, reputation: 10, description: 'Keputusan tepat! Kamu mendapat bonus!' },
    penalties: { money: -300, reputation: -5, description: 'Pilihan buruk! Kamu rugi!' },
  },
  {
    id: 'celebrity_visit', emoji: '⭐', title: 'Selebriti Berkunjung!',
    description: 'Seorang selebriti masuk ke tokomu! Bagaimana kamu menyambutnya?',
    options: [
      { label: 'Layani biasa saja', description: 'Perlakukan seperti pelanggan biasa.' },
      { label: 'Beri diskon spesial', description: 'Mungkin dia akan promosikan toko!' },
      { label: 'Minta foto bareng', description: 'Bisa viral di medsos!' },
    ],
    rewards: { money: 800, gems: 5, reputation: 20, description: 'Selebriti terkesan! Toko jadi viral!' },
    penalties: { money: 0, reputation: -10, description: 'Selebriti kecewa dan posting review buruk...' },
  },
  {
    id: 'power_outage', emoji: '⚡', title: 'Listrik Padam!',
    description: 'Listrik toko tiba-tiba padam! Apa langkah selanjutnya?',
    options: [
      { label: 'Nyalakan genset', description: 'Mahal tapi toko tetap buka.' },
      { label: 'Tutup sementara', description: 'Hemat tapi kehilangan pelanggan.' },
      { label: 'Jual pakai lilin', description: 'Suasana romantis! ...atau menakutkan?' },
    ],
    rewards: { money: 300, gems: 2, reputation: 15, description: 'Pilihan cerdas! Pelanggan senang!' },
    penalties: { money: -200, reputation: -8, description: 'Keputusan kurang tepat. Ada kerugian.' },
  },
  {
    id: 'competitor_spy', emoji: '🔍', title: 'Mata-Mata Pesaing!',
    description: 'Kamu menemukan seseorang mencatat harga-harga di tokomu. Bagaimana reaksimu?',
    options: [
      { label: 'Usir dari toko', description: 'Langsung tendang keluar!' },
      { label: 'Pura-pura tidak tahu', description: 'Biarkan saja, tidak masalah.' },
      { label: 'Ajak kerja sama', description: 'Jadikan teman, bukan musuh!' },
    ],
    rewards: { money: 600, gems: 4, reputation: 15, description: 'Strategi brilian! Hasilnya positif!' },
    penalties: { money: -100, reputation: -12, description: 'Pesaing memanfaatkan situasi...' },
  },
  {
    id: 'charity_request', emoji: '❤️', title: 'Permintaan Donasi',
    description: 'Yayasan amal minta sumbangan produk. Apa yang kamu lakukan?',
    options: [
      { label: 'Donasi banyak', description: 'Beri sumbangan besar!' },
      { label: 'Donasi sedikit', description: 'Beri secukupnya saja.' },
      { label: 'Tolak halus', description: 'Bisnis dulu, amal nanti.' },
    ],
    rewards: { money: 200, gems: 5, reputation: 25, description: 'Kemurahan hatimu diapresiasi! Reputasi naik!' },
    penalties: { money: -400, reputation: -3, description: 'Masyarakat kecewa dengan pilihanmu.' },
  },
  {
    id: 'food_critic', emoji: '🍽️', title: 'Kritikus Makanan Datang!',
    description: 'Kritikus terkenal sedang menilai produkmu. Apa strategimu?',
    options: [
      { label: 'Tunjukkan produk terbaik', description: 'Pamerkan yang terbaik!' },
      { label: 'Bersikap natural', description: 'Biarkan produk bicara sendiri.' },
      { label: 'Beri sampel gratis', description: 'Suap halus via perut!' },
    ],
    rewards: { money: 1000, gems: 5, reputation: 30, description: 'Review bintang 5! Pelanggan membanjir!' },
    penalties: { money: -150, reputation: -15, description: 'Review buruk dipublikasikan...' },
  },
  {
    id: 'mysterious_box', emoji: '📦', title: 'Paket Misterius',
    description: 'Ada paket tanpa nama pengirim di depan toko. Apa yang kamu lakukan?',
    options: [
      { label: 'Buka langsung', description: 'Penasaran!' },
      { label: 'Periksa dulu', description: 'Hati-hati tidak ada salahnya.' },
      { label: 'Abaikan', description: 'Tidak mau ambil risiko.' },
    ],
    rewards: { money: 700, gems: 8, reputation: 5, description: 'Isinya hadiah dari pelanggan setia! Jackpot!' },
    penalties: { money: -250, reputation: -5, description: 'Ternyata isinya mengecewakan...' },
  },
  {
    id: 'weather_bet', emoji: '🌤️', title: 'Ramalan Cuaca',
    description: 'Besok diprediksi hujan besar. Mau siapkan apa?',
    options: [
      { label: 'Stok payung & jas hujan', description: 'Jual perlengkapan hujan!' },
      { label: 'Promo delivery', description: 'Orang malas keluar saat hujan.' },
      { label: 'Biasa saja', description: 'Ramalan sering meleset.' },
    ],
    rewards: { money: 400, gems: 2, reputation: 10, description: 'Prediksi tepat! Penjualan melonjak!' },
    penalties: { money: -200, reputation: -3, description: 'Ramalannya salah, stokmu nganggur.' },
  },
  {
    id: 'employee_conflict', emoji: '😤', title: 'Konflik Pegawai!',
    description: 'Dua pegawai bertengkar di depan pelanggan! Apa tindakanmu?',
    options: [
      { label: 'Tegur keduanya', description: 'Beri peringatan tegas.' },
      { label: 'Mediasi pribadi', description: 'Bicara baik-baik di ruang belakang.' },
      { label: 'Biarkan selesai sendiri', description: 'Mereka dewasa, bisa handle sendiri.' },
    ],
    rewards: { money: 0, gems: 2, reputation: 15, description: 'Konflik terselesaikan! Mood pegawai membaik!' },
    penalties: { money: 0, reputation: -20, description: 'Pelanggan kabur melihat drama...' },
  },
  {
    id: 'investment_offer', emoji: '💰', title: 'Tawaran Investasi',
    description: 'Seorang investor menawarkan kerjasama. Syaratnya?',
    options: [
      { label: 'Terima 100%', description: 'Modal besar masuk!' },
      { label: 'Negosiasi', description: 'Cari kesepakatan yang adil.' },
      { label: 'Tolak', description: 'Lebih baik mandiri.' },
    ],
    rewards: { money: 2000, gems: 10, reputation: 20, description: 'Deal menguntungkan! Bisnis berkembang pesat!' },
    penalties: { money: -500, reputation: -10, description: 'Keputusan salah, ada kerugian finansial.' },
  },
];

function generateMarketPrices(epoch: number): Record<string, number> {
  const prices: Record<string, number> = {};
  PRODUCTS.forEach((p, i) => {
    prices[p.id] = generatePriceMultiplier(epoch * 100 + i * 7);
  });
  return prices;
}

function checkAchievements(state: GameState): GameState {
  let newState = state;
  for (const ach of ACHIEVEMENT_DEFS) {
    if (!state.achievements.includes(ach.id) && ach.check(state)) {
      let gemReward = 2;
      let extraMsg = '';
      
      // Special achievement rewards
      if (ach.id === 'unemployment') {
        gemReward = 50;
        // Grant special theme + title
        const inv = [...(newState.gachaInventory || [])];
        if (!inv.includes('theme_unemployment')) inv.push('theme_unemployment');
        if (!inv.includes('title_neet')) inv.push('title_neet');
        newState = { ...newState, gachaInventory: inv };
        extraMsg = ' 🎁 Bonus: Tema & Gelar "NEET" unlocked!';
      } else if (ach.id === 'billionaire') {
        gemReward = 100;
        extraMsg = ' 🎁 Bonus besar!';
      } else if (ach.id === 'rep_max') {
        gemReward = 20;
      } else if (ach.id === 'day_365') {
        gemReward = 30;
      } else if (ach.id === 'fifty_branches') {
        gemReward = 25;
      } else if (ach.id === 'prestige_10') {
        gemReward = 50;
      }
      
      newState = addNotification(
        { ...newState, achievements: [...newState.achievements, ach.id], gems: (newState.gems || 0) + gemReward },
        `🏅 Achievement: ${ach.id}! +${gemReward}💎${extraMsg}`,
        'success'
      );
    }
  }

  // Auto-grant conditional titles when their condition becomes true.
  // These are excluded from gacha rolls, so the only way to get them is here.
  const inv = newState.gachaInventory || [];
  const ownedSet = new Set(inv);
  const newlyGranted: string[] = [];
  for (const item of GACHA_ITEMS) {
    if (item.type !== 'title' || !item.unlockCondition) continue;
    if (ownedSet.has(item.id)) continue;
    try {
      if (item.unlockCondition.check(newState as unknown as Record<string, unknown>)) {
        newlyGranted.push(item.id);
      }
    } catch {
      // ignore broken checks
    }
  }
  if (newlyGranted.length > 0) {
    newState = { ...newState, gachaInventory: [...inv, ...newlyGranted] };
    for (const id of newlyGranted) {
      const it = GACHA_ITEMS.find(i => i.id === id);
      if (it) newState = addNotification(newState, `🏷️ Gelar baru terbuka: ${it.name}!`, 'success');
    }
  }

  return newState;
}

function processEndOfDay(state: GameState, totalRevenue: number, totalSold: number, branchIncome: number, cafeIncome: number, itemsByProduct: Record<string, number>): GameState {
  let newState = { ...state };
  let salaryPaid = 0;
  
  state.employees.forEach(emp => {
    const empType = EMPLOYEE_TYPES.find(e => e.id === emp.typeId);
    if (empType) salaryPaid += empType.baseSalary;
  });

  const summary: DaySummary = {
    day: state.day,
    revenue: state.dayRevenue + totalRevenue + cafeIncome + branchIncome,
    expenses: state.dayExpenses + salaryPaid,
    profit: (state.dayRevenue + totalRevenue + cafeIncome + branchIncome) - (state.dayExpenses + salaryPaid),
    itemsSold: state.dayItemsSold + totalSold,
    customersServed: state.dayCustomers + (totalSold > 0 ? 1 : 0),
    branchIncome: state.dayBranchIncome + branchIncome,
    itemsSoldByProduct: itemsByProduct,
  };

  // Gems earned per day: base 1, bonus for good days
  let gemsEarned = 1;
  if (summary.profit > 1000) gemsEarned += 1;
  if (summary.profit > 5000) gemsEarned += 1;
  if (summary.profit > 20000) gemsEarned += 2;

  newState.daySummary = summary;
  newState.showDaySummary = true;
  newState.day = state.day + 1;
  newState.ticksInDay = 0;
  newState.gameHour = DAY_START_HOUR;
  newState.dayRevenue = 0;
  newState.dayExpenses = 0;
  newState.dayItemsSold = 0;
  newState.dayCustomers = 0;
  newState.dayBranchIncome = 0;
  newState.dayItemsByProduct = {};
  newState.money = (newState.money || state.money) - salaryPaid;
  newState.shopOpen = true;
  newState.gems = (newState.gems || 0) + gemsEarned;

  // Season change notification
  const oldSeason = getSeasonForDay(state.day);
  const newSeason = getSeasonForDay(newState.day);
  if (oldSeason !== newSeason) {
    const info = SEASONS[newSeason];
    newState = addNotification(newState, `${info.emoji} Musim berubah ke ${info.name}! ${info.description}`, 'success');
  }

  return newState;
}

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...INITIAL_STATE, ...action.state, notifications: [] };

    case 'START_GAME':
      return { ...state, gameStarted: true };

    case 'TOGGLE_MUSIC':
      return { ...state, musicEnabled: !state.musicEnabled };

    case 'TOGGLE_SFX':
      return { ...state, sfxEnabled: !state.sfxEnabled };

    case 'SET_MUSIC_VOLUME':
      return { ...state, musicVolume: Math.max(0, Math.min(1, action.volume)) };

    case 'TOGGLE_MUSIC_LOOP':
      return { ...state, musicLoop: !state.musicLoop };

    case 'DISMISS_DAY_SUMMARY':
      return { ...state, showDaySummary: false, daySummary: null };

    case 'ANSWER_CHOICE_EVENT': {
      if (!state.choiceEvent) return state;
      const evt = CHOICE_EVENTS.find(e => e.id === state.choiceEvent!.eventId);
      if (!evt) return { ...state, choiceEvent: null };
      const isCorrect = action.optionIndex === state.choiceEvent.correctOptionIndex;
      if (isCorrect) {
        return addNotification({
          ...state,
          choiceEvent: null,
          money: Math.max(0, state.money + evt.rewards.money),
          gems: (state.gems || 0) + evt.rewards.gems,
          reputation: Math.min(REPUTATION_CAP, Math.max(0, state.reputation + evt.rewards.reputation)),
        }, `✅ ${evt.rewards.description} +$${evt.rewards.money} +${evt.rewards.gems}💎`, 'success');
      } else {
        return addNotification({
          ...state,
          choiceEvent: null,
          money: Math.max(0, state.money + evt.penalties.money),
          reputation: Math.min(REPUTATION_CAP, Math.max(0, state.reputation + evt.penalties.reputation)),
        }, `❌ ${evt.penalties.description}`, 'warning');
      }
    }

    case 'DISMISS_CHOICE_EVENT':
      return { ...state, choiceEvent: null };

    case 'SKIP_DAY': {
      // Skip to end of day immediately
      return addNotification({
        ...state,
        shopOpen: false,
        ticksInDay: 1430, // almost end of day, will trigger day change on next ticks
      }, '⏭️ Melewati hari... waktu berjalan cepat!', 'info');
    }

    case 'CLOSE_SHOP': {
      if (!state.shopOpen) return state;
      return addNotification({ ...state, shopOpen: false }, '🔒 Toko ditutup! Menunggu pergantian hari...', 'info');
    }

    case 'OPEN_SHOP':
      return { ...state, shopOpen: true };

    // === v2.3 — DAILY LOGIN BONUS & OFFLINE REWARD ===
    case 'CLAIM_DAILY_BONUS': {
      const next = {
        ...state,
        money: state.money + action.money,
        gems: (state.gems || 0) + action.gems,
        lastDailyClaimAt: Date.now(),
        dailyStreak: action.streak,
      };
      return addNotification(next, `🎁 Daily Bonus! +$${action.money} +${action.gems}💎 (streak ${action.streak}🔥)`, 'success');
    }

    case 'CLAIM_OFFLINE_REWARD': {
      const next = { ...state, money: state.money + action.money, lastSessionEndAt: Date.now() };
      return addNotification(next, `💤 Offline reward (${action.minutes}m): +$${Math.floor(action.money)}`, 'success');
    }

    // === GACHA ACTIONS ===
    case 'GACHA_SPIN': {
      const count = action.count;
      const discount = count >= 10 ? 0.9 : 1;
      const items = action.rolledItemIds;
      if (action.currency === 'gems') {
        const cost = Math.floor(GACHA_COST_GEMS * count * discount);
        if ((state.gems || 0) < cost) return addNotification(state, 'Gems tidak cukup!', 'warning');
        return addNotification({
          ...state,
          gems: (state.gems || 0) - cost,
          gachaInventory: [...(state.gachaInventory || []), ...items],
        }, `🎰 Dapat ${count} item baru!`, 'success');
      } else {
        const cost = Math.floor(GACHA_COST_MONEY * count * discount);
        if (state.money < cost) return addNotification(state, 'Uang tidak cukup!', 'warning');
        return addNotification({
          ...state,
          money: state.money - cost,
          totalSpent: state.totalSpent + cost,
          gachaInventory: [...(state.gachaInventory || []), ...items],
        }, `🎰 Dapat ${count} item baru!`, 'success');
      }
    }

    case 'BUY_LIMITED_ITEM': {
      const item = GACHA_ITEMS.find(i => i.id === action.itemId);
      if (!item) return addNotification(state, 'Item tidak ditemukan!', 'warning');
      const currentSeason = getSeasonForDay(state.day);
      if (item.exclusiveSeason && item.exclusiveSeason !== currentSeason) {
        return addNotification(state, '⏰ Item ini bukan untuk musim sekarang!', 'warning');
      }
      if ((state.gachaInventory || []).includes(action.itemId)) {
        return addNotification(state, 'Kamu sudah punya item ini!', 'warning');
      }
      if (action.currency === 'gems') {
        if ((state.gems || 0) < action.cost) return addNotification(state, 'Gems tidak cukup!', 'warning');
        return addNotification({
          ...state,
          gems: (state.gems || 0) - action.cost,
          gachaInventory: [...(state.gachaInventory || []), action.itemId],
        }, `🎁 Dapat ${item.name}!`, 'success');
      } else {
        if (state.money < action.cost) return addNotification(state, 'Uang tidak cukup!', 'warning');
        return addNotification({
          ...state,
          money: state.money - action.cost,
          totalSpent: state.totalSpent + action.cost,
          gachaInventory: [...(state.gachaInventory || []), action.itemId],
        }, `🎁 Dapat ${item.name}!`, 'success');
      }
    }

    case 'ACTIVATE_BUFF': {
      const item = GACHA_ITEMS.find(i => i.id === action.itemId);
      if (!item || !item.buffEffect) return state;
      const inv = [...(state.gachaInventory || [])];
      const idx = inv.indexOf(action.itemId);
      if (idx === -1) return addNotification(state, 'Item tidak ditemukan!', 'warning');
      inv.splice(idx, 1); // Remove one copy
      const newBuff: ActiveBuff = {
        itemId: action.itemId,
        stat: item.buffEffect.stat,
        multiplier: item.buffEffect.multiplier,
        ticksLeft: item.buffEffect.durationTicks,
      };
      return addNotification({
        ...state,
        gachaInventory: inv,
        activeBuffs: [...(state.activeBuffs || []), newBuff],
      }, `⚡ ${item.name} diaktifkan!`, 'success');
    }

    case 'EQUIP_THEME':
      return { ...state, equippedTheme: action.itemId || null };

    case 'EQUIP_COSMETIC':
      return { ...state, equippedCosmetic: action.itemId || null };

    case 'EQUIP_TITLE':
      return { ...state, equippedTitle: action.itemId || null };

    // === ADMIN ACTIONS ===
    case 'ADMIN_SET_MONEY':
      return { ...state, money: action.amount };
    case 'ADMIN_SET_GEMS':
      return { ...state, gems: action.amount };
    case 'ADMIN_UNLOCK_ALL_GACHA': {
      const allItemIds = GACHA_ITEMS.map(i => i.id);
      const existing = new Set(state.gachaInventory || []);
      const toAdd = allItemIds.filter(id => !existing.has(id));
      return addNotification({
        ...state,
        gachaInventory: [...(state.gachaInventory || []), ...toAdd],
      }, `🎰 Semua item gacha di-unlock! +${toAdd.length} item`, 'success');
    }
    case 'ADMIN_MAX_REPUTATION':
      return { ...state, reputation: 1000 };
    case 'ADMIN_MAX_PRESTIGE':
      return { ...state, prestigeLevel: 99, prestigePoints: 999 };

    // === SIDE JOB ACTIONS ===
    case 'GENERATE_SIDE_JOBS': {
      if ((state.sideJobCooldown || 0) > 0) return addNotification(state, 'Tunggu sebentar sebelum generate job baru!', 'warning');
      const available = generateRandomSideJobs(state.day);
      const newJobs: SideJobState[] = available.map(j => ({
        id: Date.now().toString() + Math.random() + j.id,
        jobId: j.id,
        progress: 0,
        target: j.target + Math.floor(state.day * 0.5),
        // +25% base money reward (gems unchanged) + slight day-scale boost
        reward: Math.floor(j.baseReward * (1 + state.day * 0.03) * 0.6 * 1.25),
        gemReward: Math.max(0, j.gemReward - (j.gemReward > 1 ? 1 : 0)),
        startedAt: state.tickCount,
        // -18% duration (was duration * 5, now duration * 4.1)
        expiresAt: state.tickCount + Math.floor(j.duration * 4.1) + state.day * 8,
      }));
      // Random cooldown between 120-300 seconds
      const randomCooldown = 120 + Math.floor(Math.random() * 180);
      return { ...state, sideJobs: newJobs, sideJobCooldown: randomCooldown };
    }

    case 'ACCEPT_SIDE_JOB': {
      const job = (state.sideJobs || []).find(j => j.id === action.jobId);
      if (!job) return state;
      // Progress increments automatically each tick
      return addNotification(state, `💼 Job diterima! Kerjakan sebelum waktu habis.`, 'info');
    }

    case 'COMPLETE_SIDE_JOB': {
      const job = (state.sideJobs || []).find(j => j.id === action.sideJobId);
      if (!job || job.progress < job.target) return addNotification(state, 'Job belum selesai!', 'warning');
      return addNotification({
        ...state,
        money: state.money + job.reward,
        totalEarned: state.totalEarned + job.reward,
        gems: (state.gems || 0) + job.gemReward,
        sideJobs: (state.sideJobs || []).filter(j => j.id !== action.sideJobId),
        sideJobsCompleted: (state.sideJobsCompleted || 0) + 1,
      }, `✅ Job selesai! +$${job.reward}${job.gemReward > 0 ? ` +${job.gemReward}💎` : ''}`, 'success');
    }


    case 'PRESTIGE': {
      const pointsEarned = Math.floor(Math.sqrt(state.totalEarned / 10_000));
      if (pointsEarned <= 0) return addNotification(state, 'Belum cukup pendapatan untuk prestige!', 'warning');
      
      const startMoneyBonus = (state.prestigeUpgrades?.['start_money'] || 0) * 500;
      const startRepBonus = (state.prestigeUpgrades?.['start_rep'] || 0) * 5;
      
      return addNotification({
        ...INITIAL_STATE,
        gameStarted: true,
        money: 525 + startMoneyBonus,
        reputation: 10 + startRepBonus,
        prestigeLevel: (state.prestigeLevel || 0) + 1,
        prestigePoints: (state.prestigePoints || 0) + pointsEarned,
        prestigeUpgrades: { ...(state.prestigeUpgrades || {}) },
        storeName: state.storeName,
        musicEnabled: state.musicEnabled,
        musicVolume: state.musicVolume,
        musicLoop: state.musicLoop,
        sfxEnabled: state.sfxEnabled,
        marketPrices: generateMarketPrices(0),
        // Keep gacha items across prestige!
        gems: state.gems || 0,
        gachaInventory: state.gachaInventory || [],
        equippedTheme: state.equippedTheme,
        equippedCosmetic: state.equippedCosmetic,
        equippedTitle: state.equippedTitle,
        // Preserve tracking stats across prestige
        playTimeTicks: state.playTimeTicks || 0,
        eventsEncountered: state.eventsEncountered || 0,
        nightSales: state.nightSales || 0,
        sideJobsCompleted: state.sideJobsCompleted || 0,
        hasBankrupted: state.hasBankrupted || false,
        lowestPriceBuys: state.lowestPriceBuys || 0,
        achievements: state.achievements || [],
      }, `👑 Prestige! +${pointsEarned} poin prestige!`, 'success');
    }

    case 'BUY_PRESTIGE_UPGRADE': {
      const bonus = PRESTIGE_BONUSES.find(b => b.id === action.upgradeId);
      if (!bonus) return state;
      const currentLevel = (state.prestigeUpgrades || {})[action.upgradeId] || 0;
      if (currentLevel >= bonus.maxLevel) return addNotification(state, 'Sudah level maksimal!', 'warning');
      if ((state.prestigePoints || 0) < bonus.costPerLevel) return addNotification(state, 'Poin prestige tidak cukup!', 'warning');
      return addNotification({
        ...state,
        prestigePoints: (state.prestigePoints || 0) - bonus.costPerLevel,
        prestigeUpgrades: { ...(state.prestigeUpgrades || {}), [action.upgradeId]: currentLevel + 1 },
      }, `💎 ${bonus.name} level ${currentLevel + 1}!`, 'success');
    }

    case 'BUY_STOCK': {
      const buyPrice = getMarketBuyPrice(action.productId, state);
      const cost = buyPrice * action.amount;
      if (state.money < cost) return addNotification(state, 'Uang tidak cukup!', 'warning');
      const product = PRODUCTS.find(p => p.id === action.productId);
      const marketMult = state.marketPrices[action.productId] || 1;
      const isLowPrice = marketMult < 0.85;
      return {
        ...state,
        money: state.money - cost,
        totalSpent: state.totalSpent + cost,
        dayExpenses: state.dayExpenses + cost,
        stock: { ...state.stock, [action.productId]: (state.stock[action.productId] || 0) + action.amount },
        lowestPriceBuys: (state.lowestPriceBuys || 0) + (isLowPrice ? 1 : 0),
      };
    }

    case 'BUY_SHELF': {
      const shelfType = SHELF_TYPES.find(s => s.id === action.shelfTypeId);
      if (!shelfType) return state;
      if (state.shelves.length >= state.maxShelves) return addNotification(state, 'Slot rak penuh! Upgrade toko dulu.', 'warning');
      if (state.money < shelfType.cost) return addNotification(state, 'Uang tidak cukup!', 'warning');
      const newShelf: ShelfState = {
        id: Date.now().toString() + Math.random(),
        shelfTypeId: action.shelfTypeId,
        productId: null,
        currentStock: 0,
        capacity: shelfType.capacity * 20,
        customSellPrice: 0,
        customerTimer: 0,
      };
      return {
        ...state,
        money: state.money - shelfType.cost,
        totalSpent: state.totalSpent + shelfType.cost,
        dayExpenses: state.dayExpenses + shelfType.cost,
        shelves: [...state.shelves, newShelf],
      };
    }

    case 'REMOVE_SHELF': {
      const shelf = state.shelves.find(s => s.id === action.shelfId);
      if (!shelf) return state;
      const shelfType = SHELF_TYPES.find(s => s.id === shelf.shelfTypeId);
      const refund = shelfType ? Math.floor(shelfType.cost * 0.5) : 0;
      // Return remaining stock to warehouse
      const newStock = { ...state.stock };
      if (shelf.productId && shelf.currentStock > 0) {
        newStock[shelf.productId] = (newStock[shelf.productId] || 0) + shelf.currentStock;
      }
      return addNotification({
        ...state,
        money: state.money + refund,
        totalEarned: state.totalEarned + refund,
        shelves: state.shelves.filter(s => s.id !== action.shelfId),
        stock: newStock,
      }, `🗑️ Rak dijual! Dapat refund $${refund} (50%) & stok dikembalikan ke gudang.`, 'success');
    }

    case 'ASSIGN_PRODUCT': {
      const product = PRODUCTS.find(p => p.id === action.productId);
      return {
        ...state,
        shelves: state.shelves.map(s =>
          s.id === action.shelfId ? { ...s, productId: action.productId, currentStock: 0, customSellPrice: product?.baseSellPrice || 0, customerTimer: 0 } : s
        ),
      };
    }

    case 'SET_SELL_PRICE': {
      const SHELF_PRICE_COOLDOWN_MS = 30_000; // 30 real seconds
      const shelf = state.shelves.find(s => s.id === action.shelfId);
      if (!shelf) return state;
      const now = Date.now();
      const lastChange = shelf.lastPriceChangeAt || 0;
      const elapsed = now - lastChange;
      if (lastChange > 0 && elapsed < SHELF_PRICE_COOLDOWN_MS) {
        const secsLeft = Math.ceil((SHELF_PRICE_COOLDOWN_MS - elapsed) / 1000);
        return addNotification(state, `⏳ Tunggu ${Math.floor(secsLeft / 60)}m ${secsLeft % 60}s sebelum ubah harga rak ini lagi.`, 'warning');
      }
      return {
        ...state,
        shelves: state.shelves.map(s =>
          s.id === action.shelfId ? { ...s, customSellPrice: Math.max(1, action.price), lastPriceChangeAt: now } : s
        ),
      };
    }


    case 'RESTOCK_SHELF': {
      const shelf = state.shelves.find(s => s.id === action.shelfId);
      if (!shelf || !shelf.productId) return state;
      const available = state.stock[shelf.productId] || 0;
      const spaceLeft = shelf.capacity - shelf.currentStock;
      const toAdd = Math.min(action.amount, available, spaceLeft);
      if (toAdd <= 0) return addNotification(state, 'Stok gudang kosong atau rak penuh!', 'warning');
      return {
        ...state,
        stock: { ...state.stock, [shelf.productId]: available - toAdd },
        shelves: state.shelves.map(s =>
          s.id === action.shelfId ? { ...s, currentStock: s.currentStock + toAdd } : s
        ),
      };
    }

    case 'RESTOCK_ALL_SHELVES': {
      const newStock = { ...state.stock };
      let totalAdded = 0;
      const newShelves = state.shelves.map(s => {
        if (!s.productId) return s;
        const available = newStock[s.productId] || 0;
        const spaceLeft = s.capacity - s.currentStock;
        const toAdd = Math.min(available, spaceLeft);
        if (toAdd <= 0) return s;
        newStock[s.productId] = available - toAdd;
        totalAdded += toAdd;
        return { ...s, currentStock: s.currentStock + toAdd };
      });
      if (totalAdded <= 0) {
        return addNotification(state, 'Tidak ada rak yang bisa di-restock (gudang kosong / rak penuh).', 'warning');
      }
      return addNotification(
        { ...state, stock: newStock, shelves: newShelves },
        `📦 Restock cepat: ${totalAdded} item dipindah ke rak.`,
        'success'
      );
    }

    case 'SMART_PRICE_ALL': {
      // "Smart Pricing" — set every shelf's price to the data-driven sweet spot
      // (~1.15x baseSellPrice → keeps demand multiplier in the "👍 Laris" zone).
      // Respects the per-shelf 30s price cooldown so it can't be spammed.
      const SHELF_PRICE_COOLDOWN_MS = 30_000;
      const SWEET_SPOT_MULT = 1.15;
      const now = Date.now();
      let updated = 0;
      let skipped = 0;
      const newShelves = state.shelves.map(s => {
        if (!s.productId) return s;
        const product = PRODUCTS.find(p => p.id === s.productId);
        if (!product) return s;
        const lastChange = s.lastPriceChangeAt || 0;
        if (lastChange > 0 && now - lastChange < SHELF_PRICE_COOLDOWN_MS) {
          skipped += 1;
          return s;
        }
        const recommended = Math.max(1, Math.round(product.baseSellPrice * SWEET_SPOT_MULT));
        if (recommended === s.customSellPrice) return s;
        updated += 1;
        return { ...s, customSellPrice: recommended, lastPriceChangeAt: now };
      });
      if (updated === 0) {
        return addNotification(
          state,
          skipped > 0
            ? `🤖 Smart Pricing: ${skipped} rak masih cooldown, tidak ada yang diubah.`
            : '🤖 Smart Pricing: semua rak sudah optimal.',
          'info'
        );
      }
      return addNotification(
        { ...state, shelves: newShelves },
        `🤖 Smart Pricing: ${updated} rak di-set ke harga rekomendasi (${Math.round((SWEET_SPOT_MULT - 1) * 100)}% di atas harga dasar).${skipped > 0 ? ` ${skipped} rak masih cooldown.` : ''}`,
        'success'
      );
    }

    case 'ACTIVATE_HAPPY_HOUR': {
      // Player-triggered 60-second 2× sales boost. 5-minute cooldown.
      const HAPPY_HOUR_COOLDOWN_MS = 5 * 60 * 1000;
      const HAPPY_HOUR_DURATION_TICKS = 60; // 60 ticks ≈ 60s
      const now = Date.now();
      const last = state.lastHappyHourAt || 0;
      if (last > 0 && now - last < HAPPY_HOUR_COOLDOWN_MS) {
        const remaining = Math.ceil((HAPPY_HOUR_COOLDOWN_MS - (now - last)) / 1000);
        return addNotification(state, `⏳ Happy Hour masih cooldown ${remaining}s lagi.`, 'warning');
      }
      const newBuff: ActiveBuff = {
        itemId: 'happy_hour',
        stat: 'all',
        multiplier: 2,
        ticksLeft: HAPPY_HOUR_DURATION_TICKS,
      };
      return addNotification(
        { ...state, activeBuffs: [...(state.activeBuffs || []), newBuff], lastHappyHourAt: now },
        '🎉 HAPPY HOUR! Semua penjualan 2× selama 60 detik!',
        'success'
      );
    }


    case 'HIRE_EMPLOYEE': {
      const empType = EMPLOYEE_TYPES.find(e => e.id === action.typeId);
      if (!empType) return state;
      if (state.money < empType.baseSalary * 10) return addNotification(state, 'Uang tidak cukup! Biaya hiring = 10x gaji.', 'warning');
      const emp: EmployeeState = {
        id: Date.now().toString() + Math.random(),
        typeId: action.typeId,
        name: EMPLOYEE_NAMES[Math.floor(Math.random() * EMPLOYEE_NAMES.length)],
        hiredAt: Date.now(),
        level: 1,
        xp: 0,
        mood: 80,
      };
      return addNotification({
        ...state,
        money: state.money - empType.baseSalary * 10,
        totalSpent: state.totalSpent + empType.baseSalary * 10,
        dayExpenses: state.dayExpenses + empType.baseSalary * 10,
        employees: [...state.employees, emp],
      }, `${emp.name} dipekerjakan sebagai ${empType.name}!`, 'success');
    }

    case 'FIRE_EMPLOYEE':
      return { ...state, employees: state.employees.filter(e => e.id !== action.employeeId) };

    case 'BOOST_EMPLOYEE_MOOD': {
      const bonusCost = 100;
      if (state.money < bonusCost) return addNotification(state, 'Uang tidak cukup untuk bonus!', 'warning');
      const emp = state.employees.find(e => e.id === action.employeeId);
      if (!emp) return state;
      return {
        ...state,
        money: state.money - bonusCost,
        totalSpent: state.totalSpent + bonusCost,
        dayExpenses: state.dayExpenses + bonusCost,
        employees: state.employees.map(e =>
          e.id === action.employeeId ? { ...e, mood: Math.min(100, e.mood + 25) } : e
        ),
      };
    }

    case 'BUY_UPGRADE': {
      const upgrade = UPGRADES.find(u => u.id === action.upgradeId);
      if (!upgrade) return state;
      if (upgrade.requiredReputation && state.reputation < upgrade.requiredReputation) {
        return addNotification(state, `Butuh reputasi ${upgrade.requiredReputation}!`, 'warning');
      }
      const currentLevel = state.upgrades[action.upgradeId] || 0;
      if (currentLevel >= upgrade.maxLevel) return addNotification(state, 'Sudah level maksimal!', 'warning');
      const cost = getUpgradeCost(upgrade, currentLevel);
      if (state.money < cost) return addNotification(state, 'Uang tidak cukup!', 'warning');
      let newState: GameState = {
        ...state,
        money: state.money - cost,
        totalSpent: state.totalSpent + cost,
        dayExpenses: state.dayExpenses + cost,
        upgrades: { ...state.upgrades, [action.upgradeId]: currentLevel + 1 },
      };
      if (action.upgradeId === 'bigger_store') newState.maxShelves = newState.maxShelves + 2;
      if (action.upgradeId === 'decoration') newState.reputation = newState.reputation + 10;
      if (action.upgradeId === 'rooftop_garden') newState.reputation = newState.reputation + 30;
      return addNotification(newState, `${upgrade.name} di-upgrade ke level ${currentLevel + 1}!`, 'success');
    }

    case 'BUY_BRANCH': {
      const branchType = BRANCH_TYPES.find(b => b.id === action.branchTypeId);
      if (!branchType) return state;
      if (state.branches.length >= 100) return addNotification(state, 'Maksimal 100 cabang!', 'warning');
      if (state.reputation < branchType.requiredReputation) {
        return addNotification(state, `Butuh reputasi ${branchType.requiredReputation}!`, 'warning');
      }
      if (state.money < branchType.cost) return addNotification(state, 'Uang tidak cukup!', 'warning');
      const branch: BranchState = {
        id: Date.now().toString() + Math.random(),
        typeId: action.branchTypeId,
        level: 1,
        name: `${branchType.name} #${state.branches.filter(b => b.typeId === action.branchTypeId).length + 1}`,
      };
      return addNotification({
        ...state,
        money: state.money - branchType.cost,
        totalSpent: state.totalSpent + branchType.cost,
        dayExpenses: state.dayExpenses + branchType.cost,
        branches: [...state.branches, branch],
      }, `${branch.name} dibeli!`, 'success');
    }

    case 'UPGRADE_BRANCH': {
      const branch = state.branches.find(b => b.id === action.branchId);
      if (!branch) return state;
      const branchType = BRANCH_TYPES.find(b => b.id === branch.typeId);
      if (!branchType) return state;
      if (branch.level >= branchType.maxLevel) return addNotification(state, 'Cabang sudah level maksimal!', 'warning');
      const cost = getBranchCost(branchType, branch.level);
      if (state.money < cost) return addNotification(state, 'Uang tidak cukup!', 'warning');
      return addNotification({
        ...state,
        money: state.money - cost,
        totalSpent: state.totalSpent + cost,
        dayExpenses: state.dayExpenses + cost,
        branches: state.branches.map(b =>
          b.id === action.branchId ? { ...b, level: b.level + 1 } : b
        ),
      }, `${branch.name} upgrade ke level ${branch.level + 1}!`, 'success');
    }

    case 'REMOVE_BRANCH': {
      const branch = state.branches.find(b => b.id === action.branchId);
      if (!branch) return state;
      const branchType = BRANCH_TYPES.find(b => b.id === branch.typeId);
      // Refund 50% of total invested cost (base + upgrades)
      let totalInvested = branchType?.cost || 0;
      if (branchType) {
        for (let lv = 1; lv < branch.level; lv++) {
          totalInvested += getBranchCost(branchType, lv);
        }
      }
      const refund = Math.floor(totalInvested * 0.5);
      return addNotification({
        ...state,
        money: state.money + refund,
        totalEarned: state.totalEarned + refund,
        branches: state.branches.filter(b => b.id !== action.branchId),
      }, `🗑️ ${branch.name} dijual! Refund $${refund} (50% dari total investasi).`, 'success');
    }

    case 'GAME_TICK': {
      if (!state.gameStarted) return state;
      
      let newState = { ...state, tickCount: state.tickCount + 1, ticksInDay: state.ticksInDay + 1, sideJobCooldown: Math.max(0, (state.sideJobCooldown || 0) - 1), playTimeTicks: (state.playTimeTicks || 0) + 1 };
      const { profitMultiplier, sellSpeedMultiplier, customerMultiplier } = getMultipliers(state);
      
      // Hour calculation: day starts at DAY_START_HOUR, wraps around 24h
      const rawHour = DAY_START_HOUR + (newState.ticksInDay / TICKS_PER_DAY) * 24;
      newState.gameHour = rawHour % 24;

      // Shop closed: time still flows naturally (no fast-forward).
      // Customers won't visit (handled below in shelf logic), but the day still progresses at 1x.


      // Side job progress — increments are paced so the job completes exactly when it expires.
      // Each tick adds (target / totalDuration) progress, so progress reaches target right as time runs out.
      newState.sideJobs = (newState.sideJobs || [])
        .filter(j => newState.tickCount < j.expiresAt)
        .map(j => {
          const totalDuration = Math.max(1, j.expiresAt - j.startedAt);
          const perTick = j.target / totalDuration;
          // Tiny random jitter (±10%) to feel organic, but average exactly equals perTick
          const jitter = 0.9 + Math.random() * 0.2;
          return { ...j, progress: Math.min(j.target, j.progress + perTick * jitter) };
        });

      // Tick down active buffs
      newState.activeBuffs = (state.activeBuffs || [])
        .map(b => ({ ...b, ticksLeft: b.ticksLeft - 1 }))
        .filter(b => b.ticksLeft > 0);

      // Money rain buff
      const moneyRainBuffs = (newState.activeBuffs || []).filter(b => b.stat === 'money_rain');
      moneyRainBuffs.forEach(b => {
        newState.money = (newState.money || state.money) + b.multiplier;
        newState.totalEarned = (newState.totalEarned || state.totalEarned) + b.multiplier;
      });

      // Reputation buff
      const repBuffs = (newState.activeBuffs || []).filter(b => b.stat === 'reputation');
      repBuffs.forEach(() => {
        newState.reputation = Math.min(REPUTATION_CAP, (newState.reputation || state.reputation) + 1);
      });

      const reputationFactor = 1 + Math.min(state.reputation / 50, 5);
      const isNight = isNightTime(newState.gameHour);
      const nightCustomerMult = isNight ? (0.3 + getPrestigeMultiplier(state, 'night_boost') * 0.2) : 1.0;

      // Update market prices every 120 ticks
      if (newState.tickCount % 120 === 0) {
        newState.priceEpoch = (state.priceEpoch || 0) + 1;
        newState.marketPrices = generateMarketPrices(newState.priceEpoch);
      }

      // Random events
      if (state.activeEvent) {
        const ticksLeft = state.activeEvent.ticksLeft - 1;
        if (ticksLeft <= 0) {
          newState.activeEvent = null;
        } else {
          newState.activeEvent = { ...state.activeEvent, ticksLeft };
        }
      } else if (!isNight && state.shopOpen && Math.random() < 0.0018) {
        const evt = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
        newState.activeEvent = { ...evt, ticksLeft: evt.duration };
        newState.eventsEncountered = (newState.eventsEncountered || 0) + 1;
        newState = addNotification(newState, `🎲 Event: ${evt.name} - ${evt.description}`, 'info');
        if (evt.effect === 'gem_rain') {
          newState.gems = (newState.gems || 0) + 5;
        }
      }

      // Random choice events (separate from regular events)
      if (!newState.choiceEvent && !isNight && state.shopOpen && Math.random() < 0.0009) {
        const choiceEvt = CHOICE_EVENTS[Math.floor(Math.random() * CHOICE_EVENTS.length)];
        const correctIdx = Math.floor(Math.random() * choiceEvt.options.length);
        newState.choiceEvent = {
          id: Date.now().toString() + Math.random(),
          eventId: choiceEvt.id,
          correctOptionIndex: correctIdx,
        };
        newState = addNotification(newState, `❓ ${choiceEvt.title} - Buat keputusan!`, 'info');
      }


      let eventSellMult = 1;
      let eventCustomerMult = 1;
      if (newState.activeEvent?.effect === 'sale_rush') eventSellMult = 1.5;
      if (newState.activeEvent?.effect === 'holiday') eventCustomerMult = 2;
      if (newState.activeEvent?.effect === 'rain') eventCustomerMult = 0.7;
      if (newState.activeEvent?.effect === 'food_festival') eventCustomerMult = 1.5;
      if (newState.activeEvent?.effect === 'lucky_day') eventSellMult = 1.3;
      if (newState.activeEvent?.effect === 'viral') {
        newState.reputation = Math.min(REPUTATION_CAP, newState.reputation + 0.5);
      }
      if (newState.activeEvent?.effect === 'employee_party') {
        newState.employees = newState.employees.map(e => ({ ...e, mood: Math.min(100, e.mood + 1) }));
      }

      // Sell items from shelves
      let totalRevenue = 0;
      let totalSold = 0;
      let itemsByProduct: Record<string, number> = { ...newState.dayItemsByProduct };
      const currentSeason = getSeasonForDay(newState.day);

      const shopClosed = !state.shopOpen;
      const newShelves = shopClosed ? state.shelves.map(s => ({ ...s })) : state.shelves.map(shelf => {
        if (!shelf.productId || shelf.currentStock <= 0) return { ...shelf, customerTimer: 0 };
        const product = PRODUCTS.find(p => p.id === shelf.productId);
        if (!product) return shelf;

        const seasonMult = getSeasonProductMultiplier(shelf.productId, currentSeason);
        const demandMult = getDemandMultiplier(shelf.customSellPrice, product.baseSellPrice);
        const timerSpeed = product.sellRate * sellSpeedMultiplier * customerMultiplier * reputationFactor * demandMult * eventSellMult * eventCustomerMult * nightCustomerMult * seasonMult * 0.75;

        let newTimer = (shelf.customerTimer || 0) + timerSpeed;
        let updatedShelf = { ...shelf };

        while (newTimer >= 100 && updatedShelf.currentStock > 0) {
          const sellAmount = Math.min(updatedShelf.currentStock, Math.max(1, Math.floor(demandMult * 1.5)));
          // Boosted products get +20% revenue on top of speed boost
          const seasonRevenueBonus = seasonMult > 1 ? Math.min(1.2, 0.8 + seasonMult * 0.25) : 1;
          totalRevenue += sellAmount * shelf.customSellPrice * profitMultiplier * seasonRevenueBonus;
          totalSold += sellAmount;
          updatedShelf.currentStock -= sellAmount;
          itemsByProduct[shelf.productId!] = (itemsByProduct[shelf.productId!] || 0) + sellAmount;
          newTimer -= 100;
        }

        updatedShelf.customerTimer = updatedShelf.currentStock > 0 ? newTimer : 0;
        return updatedShelf;
      });

      // Auto-restock by stockers
      const stockers = state.employees.filter(e => e.typeId === 'stocker');
      let newStock = { ...state.stock };
      const autoRestockedShelves = newShelves.map(shelf => {
        if (!shelf.productId || stockers.length <= 0) return shelf;
        if (shelf.currentStock >= shelf.capacity * 0.8) return shelf;
        const stockerBonus = stockers.reduce((sum, s) => sum + 1 * getEmployeeLevelBonus(s.level), 0);
        const available = newStock[shelf.productId] || 0;
        const toAdd = Math.min(Math.floor(stockerBonus), available, shelf.capacity - shelf.currentStock);
        if (toAdd <= 0) return shelf;
        newStock = { ...newStock, [shelf.productId]: available - toAdd };
        return { ...shelf, currentStock: shelf.currentStock + toAdd };
      });

      // Cleaner reputation boost
      const cleaners = state.employees.filter(e => e.typeId === 'cleaner');
      const socialMediaLevel = state.upgrades['social_media'] || 0;
      let repBoost = cleaners.reduce((sum, c) => sum + 0.025 * getEmployeeLevelBonus(c.level), 0) + socialMediaLevel * 0.015;

      if (newState.activeEvent?.effect === 'inspection') {
        repBoost += cleaners.length >= 2 ? 0.25 : -0.1;
      }

      // Branch passive income
      const franchiseBrandLevel = state.upgrades['franchise_brand'] || 0;
      const branchMultiplier = 1 + franchiseBrandLevel * 0.25;
      let branchIncome = 0;
      state.branches.forEach(branch => {
        const branchType = BRANCH_TYPES.find(b => b.id === branch.typeId);
        if (branchType) branchIncome += branchType.incomePerTick * branch.level * branchMultiplier * 0.5;
      });

      // Cafe passive income
      const cafeLevel = state.upgrades['cafe'] || 0;
      const cafeIncome = cafeLevel * 5;

      // Auto order
      const autoOrderLevel = state.upgrades['auto_order'] || 0;
      if (autoOrderLevel > 0 && state.tickCount % 20 === 0) {
        autoRestockedShelves.forEach(shelf => {
          if (!shelf.productId) return;
          if ((newStock[shelf.productId] || 0) < shelf.capacity) {
            const buyPrice = getMarketBuyPrice(shelf.productId, newState);
            const buyAmount = shelf.capacity * autoOrderLevel;
            const cost = buyAmount * buyPrice;
            if (newState.money >= cost) {
              newStock[shelf.productId] = (newStock[shelf.productId] || 0) + buyAmount;
              newState.money -= cost;
              newState.totalSpent += cost;
              newState.dayExpenses += cost;
            }
          }
        });
      }

      // Employee XP + Mood
      const breakRoomLevel = state.upgrades['break_room'] || 0;
      const trainingLevel = state.upgrades['training_center'] || 0;
      const canteenLevel = state.upgrades['canteen'] || 0;
      const insuranceLevel = state.upgrades['insurance'] || 0;
      const xpMultiplier = 1 + trainingLevel * 0.5;
      const moodBoost = breakRoomLevel * 0.05 + canteenLevel * 0.1;
      
      let updatedEmployees = (newState.employees.length > 0 ? newState.employees : state.employees).map(emp => {
        let newXP = emp.xp + 0.5 * xpMultiplier;
        let newLevel = emp.level;
        const xpNeeded = getEmployeeLevelXP(emp.level);
        if (newXP >= xpNeeded && newLevel < 10) { newLevel++; newXP = 0; }
        let newMood = emp.mood - 0.015 + moodBoost;
        if (isNight) newMood += 0.05;
        newMood = Math.max(0, Math.min(100, newMood));
        return { ...emp, xp: newXP, level: newLevel, mood: newMood };
      });

      // Check resignations
      const resignedEmployees: string[] = [];
      updatedEmployees = updatedEmployees.filter(emp => {
        if (emp.mood < 15) {
          const resignChance = (0.005 / emp.level) * (1 - insuranceLevel * 0.15);
          if (Math.random() < resignChance) { resignedEmployees.push(emp.name); return false; }
        }
        return true;
      });

      if (resignedEmployees.length > 0) {
        newState = addNotification(newState, `😤 ${resignedEmployees.join(', ')} resign karena mood rendah!`, 'warning');
      }

      // Day change
      if (newState.ticksInDay >= TICKS_PER_DAY) {
        newState = processEndOfDay(
          { ...newState, shelves: autoRestockedShelves, stock: newStock, employees: updatedEmployees },
          totalRevenue, totalSold, branchIncome, cafeIncome, itemsByProduct
        );

        const finalMoney = newState.money + totalRevenue + cafeIncome + branchIncome;
        let finalState: GameState = {
          ...newState,
          money: finalMoney,
          totalEarned: state.totalEarned + totalRevenue + cafeIncome + branchIncome,
          reputation: Math.min(REPUTATION_CAP, Math.max(0, (newState.reputation || state.reputation) + repBoost)),
          shelves: autoRestockedShelves,
          stock: newStock,
          employees: updatedEmployees,
          customersServed: state.customersServed + (totalSold > 0 ? 1 : 0),
          itemsSold: state.itemsSold + totalSold,
        };
        return checkAchievements(finalState);
      }

      // Theft
      const securities = state.employees.filter(e => e.typeId === 'security');
      const cctvLevel = state.upgrades['cctv'] || 0;
      const securityBonus = securities.reduce((sum, s) => sum + 0.01 * getEmployeeLevelBonus(s.level), 0);
      const theftChance = Math.max(0, 0.01 - securityBonus - cctvLevel * 0.00125);
      if (!isNight && !shopClosed && Math.random() < theftChance) {
        const shelvesWithStock = autoRestockedShelves.filter(s => s.currentStock > 0);
        if (shelvesWithStock.length > 0) {
          const sidx = Math.floor(Math.random() * shelvesWithStock.length);
          const stolen = Math.min(3, shelvesWithStock[sidx].currentStock);
          shelvesWithStock[sidx] = { ...shelvesWithStock[sidx], currentStock: shelvesWithStock[sidx].currentStock - stolen };
        }
      }

      const finalMoney = newState.money + totalRevenue + cafeIncome + branchIncome;

      const tickIncome = totalRevenue + cafeIncome + branchIncome;
      const recentIncome = [...(state.recentIncome || []), tickIncome].slice(-10);

      let finalState: GameState = {
        ...newState,
        money: finalMoney,
        totalEarned: state.totalEarned + tickIncome,
        reputation: Math.min(REPUTATION_CAP, Math.max(0, (newState.reputation || state.reputation) + repBoost)),
        shelves: autoRestockedShelves,
        stock: newStock,
        employees: updatedEmployees,
        customersServed: state.customersServed + (totalSold > 0 ? 1 : 0),
        itemsSold: state.itemsSold + totalSold,
        dayRevenue: state.dayRevenue + tickIncome,
        dayItemsSold: state.dayItemsSold + totalSold,
        dayCustomers: state.dayCustomers + (totalSold > 0 ? 1 : 0),
        dayBranchIncome: state.dayBranchIncome + branchIncome,
        dayItemsByProduct: itemsByProduct,
        dayExpenses: newState.dayExpenses,
        recentIncome,
        nightSales: (state.nightSales || 0) + (isNight ? totalSold : 0),
        hasBankrupted: state.hasBankrupted || finalMoney <= 0,
      };

      return checkAchievements(finalState);
    }

    case 'SET_STORE_NAME':
      return { ...state, storeName: action.name };

    case 'DISMISS_NOTIFICATION':
      return { ...state, notifications: state.notifications.filter(n => n.id !== action.id) };

    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<Action>;
  multipliers: ReturnType<typeof getMultipliers>;
  getMarketPrice: (productId: string) => number;
}

const GameContext = createContext<GameContextType | null>(null);

export { INITIAL_STATE };

export function GameProvider({ children, initialState }: { children: React.ReactNode; initialState?: GameState }) {
  const [state, dispatch] = useReducer(gameReducer, initialState || INITIAL_STATE, (init) => {
    const merged = {
      ...INITIAL_STATE,
      ...init,
      shopOpen: init.shopOpen ?? true,
      sfxEnabled: init.sfxEnabled ?? true,
      musicVolume: init.musicVolume ?? 0.5,
      musicLoop: init.musicLoop ?? true,
      recentIncome: init.recentIncome ?? [],
      prestigeLevel: init.prestigeLevel ?? 0,
      prestigePoints: init.prestigePoints ?? 0,
      prestigeUpgrades: init.prestigeUpgrades ?? {},
      gems: init.gems ?? 0,
      gachaInventory: init.gachaInventory ?? [],
      activeBuffs: init.activeBuffs ?? [],
      equippedTheme: init.equippedTheme ?? null,
      equippedCosmetic: init.equippedCosmetic ?? null,
      equippedTitle: init.equippedTitle ?? null,
      sideJobs: init.sideJobs ?? [],
      sideJobCooldown: init.sideJobCooldown ?? 0,
      choiceEvent: init.choiceEvent ?? null,
      playTimeTicks: init.playTimeTicks ?? 0,
      eventsEncountered: init.eventsEncountered ?? 0,
      nightSales: init.nightSales ?? 0,
      sideJobsCompleted: init.sideJobsCompleted ?? 0,
      hasBankrupted: init.hasBankrupted ?? false,
      lowestPriceBuys: init.lowestPriceBuys ?? 0,
    };
    if (merged.marketPrices && Object.keys(merged.marketPrices).length > 0) return merged;
    return { ...merged, marketPrices: generateMarketPrices(merged.priceEpoch || 0) };
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  // Dark mode toggle based on game hour
  useEffect(() => {
    if (isNightTime(state.gameHour)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.gameHour]);

  // Apply equipped theme colors based on day/night
  useEffect(() => {
    const root = document.documentElement;
    if (state.equippedTheme) {
      const item = GACHA_ITEMS.find(i => i.id === state.equippedTheme);
      const night = isNightTime(state.gameHour);
      const colors = night ? item?.themeColorsDark : item?.themeColorsLight;
      if (colors) {
        root.style.setProperty('--primary', colors.primary);
        root.style.setProperty('--secondary', colors.secondary);
        root.style.setProperty('--accent', colors.accent);
        root.style.setProperty('--background', colors.background);
        root.style.setProperty('--card', colors.card);
        root.style.setProperty('--ring', colors.primary);
        root.style.setProperty('--sidebar-primary', colors.primary);
        // Derive muted/border from background for consistency
        const bgParts = colors.background.split(' ');
        if (bgParts.length >= 3) {
          const hue = bgParts[0];
          const sat = parseInt(bgParts[1]);
          if (night) {
            root.style.setProperty('--muted', `${hue} ${Math.max(10, sat - 5)}% 18%`);
            root.style.setProperty('--border', `${hue} ${Math.max(10, sat - 5)}% 20%`);
            root.style.setProperty('--input', `${hue} ${Math.max(10, sat - 5)}% 20%`);
          } else {
            root.style.setProperty('--muted', `${hue} ${Math.min(50, sat + 5)}% 88%`);
            root.style.setProperty('--border', `${hue} ${Math.min(50, sat + 5)}% 82%`);
            root.style.setProperty('--input', `${hue} ${Math.min(50, sat + 5)}% 82%`);
          }
        }
        return;
      }
    }
    // Reset to default
    const props = ['--primary', '--secondary', '--accent', '--background', '--card', '--ring', '--sidebar-primary', '--muted', '--border', '--input'];
    props.forEach(p => root.style.removeProperty(p));
  }, [state.equippedTheme, state.gameHour]);

  // Game loop
  useEffect(() => {
    const interval = setInterval(() => dispatch({ type: 'GAME_TICK' }), TICK_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const multipliers = getMultipliers(state);
  const getMarketPrice = useCallback((productId: string) => getMarketBuyPrice(productId, state), [state]);

  return (
    <GameContext.Provider value={{ state, dispatch, multipliers, getMarketPrice }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
