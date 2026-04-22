export interface Product {
  id: string;
  name: string;
  emoji: string;
  category: string;
  baseBuyCost: number;
  baseSellPrice: number;
  shelfCapacity: number;
  sellRate: number;
}

export interface ShelfType {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  capacity: number;
  description: string;
}

export interface EmployeeType {
  id: string;
  name: string;
  emoji: string;
  role: 'stocker' | 'cashier' | 'manager' | 'cleaner' | 'security' | 'marketing' | 'chef' | 'technician';
  baseSalary: number;
  description: string;
  effect: string;
}

export interface UpgradeType {
  id: string;
  name: string;
  emoji: string;
  baseCost: number;
  costMultiplier: number;
  maxLevel: number;
  description: string;
  category: 'store' | 'marketing' | 'tech' | 'luxury' | 'employee';
  requiredReputation?: number;
}

export interface BranchType {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  incomePerTick: number;
  upgradeCostMultiplier: number;
  maxLevel: number;
  description: string;
  requiredReputation: number;
}

export const PRODUCTS: Product[] = [
  // Bakeri
  { id: 'bread', name: 'Roti', emoji: '🍞', category: 'Bakeri', baseBuyCost: 5, baseSellPrice: 12, shelfCapacity: 20, sellRate: 0.8 },
  { id: 'cake', name: 'Kue', emoji: '🍰', category: 'Bakeri', baseBuyCost: 12, baseSellPrice: 28, shelfCapacity: 12, sellRate: 0.5 },
  { id: 'donut', name: 'Donat', emoji: '🍩', category: 'Bakeri', baseBuyCost: 4, baseSellPrice: 10, shelfCapacity: 25, sellRate: 0.9 },
  { id: 'croissant', name: 'Croissant', emoji: '🥐', category: 'Bakeri', baseBuyCost: 7, baseSellPrice: 16, shelfCapacity: 18, sellRate: 0.6 },
  { id: 'bagel', name: 'Bagel', emoji: '🥯', category: 'Bakeri', baseBuyCost: 6, baseSellPrice: 14, shelfCapacity: 20, sellRate: 0.7 },
  { id: 'pretzel', name: 'Pretzel', emoji: '🥨', category: 'Bakeri', baseBuyCost: 5, baseSellPrice: 11, shelfCapacity: 22, sellRate: 0.75 },
  // Dairy
  { id: 'milk', name: 'Susu', emoji: '🥛', category: 'Dairy', baseBuyCost: 8, baseSellPrice: 18, shelfCapacity: 15, sellRate: 0.6 },
  { id: 'egg', name: 'Telur', emoji: '🥚', category: 'Dairy', baseBuyCost: 6, baseSellPrice: 15, shelfCapacity: 24, sellRate: 0.7 },
  { id: 'cheese', name: 'Keju', emoji: '🧀', category: 'Dairy', baseBuyCost: 15, baseSellPrice: 32, shelfCapacity: 10, sellRate: 0.4 },
  { id: 'butter', name: 'Mentega', emoji: '🧈', category: 'Dairy', baseBuyCost: 10, baseSellPrice: 22, shelfCapacity: 15, sellRate: 0.5 },
  { id: 'yogurt', name: 'Yogurt', emoji: '🫙', category: 'Dairy', baseBuyCost: 9, baseSellPrice: 20, shelfCapacity: 18, sellRate: 0.55 },
  // Buah
  { id: 'apple', name: 'Apel', emoji: '🍎', category: 'Buah', baseBuyCost: 3, baseSellPrice: 8, shelfCapacity: 30, sellRate: 1.0 },
  { id: 'banana', name: 'Pisang', emoji: '🍌', category: 'Buah', baseBuyCost: 2, baseSellPrice: 6, shelfCapacity: 35, sellRate: 1.1 },
  { id: 'grape', name: 'Anggur', emoji: '🍇', category: 'Buah', baseBuyCost: 8, baseSellPrice: 18, shelfCapacity: 15, sellRate: 0.5 },
  { id: 'watermelon', name: 'Semangka', emoji: '🍉', category: 'Buah', baseBuyCost: 10, baseSellPrice: 22, shelfCapacity: 8, sellRate: 0.4 },
  { id: 'strawberry', name: 'Stroberi', emoji: '🍓', category: 'Buah', baseBuyCost: 6, baseSellPrice: 14, shelfCapacity: 20, sellRate: 0.7 },
  { id: 'mango', name: 'Mangga', emoji: '🥭', category: 'Buah', baseBuyCost: 7, baseSellPrice: 16, shelfCapacity: 18, sellRate: 0.6 },
  { id: 'peach', name: 'Persik', emoji: '🍑', category: 'Buah', baseBuyCost: 5, baseSellPrice: 12, shelfCapacity: 22, sellRate: 0.7 },
  { id: 'cherry', name: 'Ceri', emoji: '🍒', category: 'Buah', baseBuyCost: 8, baseSellPrice: 19, shelfCapacity: 16, sellRate: 0.5 },
  // Snack
  { id: 'chips', name: 'Keripik', emoji: '🍿', category: 'Snack', baseBuyCost: 4, baseSellPrice: 10, shelfCapacity: 25, sellRate: 0.9 },
  { id: 'candy', name: 'Permen', emoji: '🍬', category: 'Snack', baseBuyCost: 2, baseSellPrice: 6, shelfCapacity: 40, sellRate: 1.2 },
  { id: 'chocolate', name: 'Cokelat', emoji: '🍫', category: 'Snack', baseBuyCost: 5, baseSellPrice: 12, shelfCapacity: 22, sellRate: 0.8 },
  { id: 'cookies', name: 'Biskuit', emoji: '🍪', category: 'Snack', baseBuyCost: 3, baseSellPrice: 8, shelfCapacity: 30, sellRate: 1.0 },
  { id: 'icecream', name: 'Es Krim', emoji: '🍦', category: 'Snack', baseBuyCost: 7, baseSellPrice: 15, shelfCapacity: 18, sellRate: 0.7 },
  { id: 'lollipop', name: 'Lolipop', emoji: '🍭', category: 'Snack', baseBuyCost: 2, baseSellPrice: 5, shelfCapacity: 40, sellRate: 1.3 },
  { id: 'popcorn', name: 'Popcorn', emoji: '🍿', category: 'Snack', baseBuyCost: 3, baseSellPrice: 9, shelfCapacity: 28, sellRate: 0.9 },
  // Minuman
  { id: 'soda', name: 'Soda', emoji: '🥤', category: 'Minuman', baseBuyCost: 6, baseSellPrice: 14, shelfCapacity: 20, sellRate: 0.7 },
  { id: 'coffee', name: 'Kopi', emoji: '☕', category: 'Minuman', baseBuyCost: 8, baseSellPrice: 20, shelfCapacity: 15, sellRate: 0.6 },
  { id: 'juice', name: 'Jus', emoji: '🧃', category: 'Minuman', baseBuyCost: 5, baseSellPrice: 12, shelfCapacity: 20, sellRate: 0.8 },
  { id: 'tea', name: 'Teh', emoji: '🍵', category: 'Minuman', baseBuyCost: 4, baseSellPrice: 10, shelfCapacity: 25, sellRate: 0.9 },
  { id: 'smoothie', name: 'Smoothie', emoji: '🥤', category: 'Minuman', baseBuyCost: 10, baseSellPrice: 24, shelfCapacity: 12, sellRate: 0.5 },
  { id: 'mineral_water', name: 'Air Mineral', emoji: '💧', category: 'Minuman', baseBuyCost: 2, baseSellPrice: 5, shelfCapacity: 40, sellRate: 1.4 },
  // Daging & Seafood
  { id: 'chicken', name: 'Ayam', emoji: '🍗', category: 'Daging', baseBuyCost: 15, baseSellPrice: 35, shelfCapacity: 10, sellRate: 0.4 },
  { id: 'beef', name: 'Daging Sapi', emoji: '🥩', category: 'Daging', baseBuyCost: 25, baseSellPrice: 55, shelfCapacity: 8, sellRate: 0.3 },
  { id: 'fish', name: 'Ikan', emoji: '🐟', category: 'Seafood', baseBuyCost: 20, baseSellPrice: 45, shelfCapacity: 8, sellRate: 0.3 },
  { id: 'shrimp', name: 'Udang', emoji: '🦐', category: 'Seafood', baseBuyCost: 22, baseSellPrice: 50, shelfCapacity: 8, sellRate: 0.25 },
  { id: 'sausage', name: 'Sosis', emoji: '🌭', category: 'Daging', baseBuyCost: 8, baseSellPrice: 18, shelfCapacity: 16, sellRate: 0.6 },
  { id: 'bacon', name: 'Bacon', emoji: '🥓', category: 'Daging', baseBuyCost: 12, baseSellPrice: 28, shelfCapacity: 12, sellRate: 0.45 },
  { id: 'crab', name: 'Kepiting', emoji: '🦀', category: 'Seafood', baseBuyCost: 30, baseSellPrice: 65, shelfCapacity: 6, sellRate: 0.2 },
  // Pokok & Sayur
  { id: 'rice', name: 'Beras', emoji: '🍚', category: 'Pokok', baseBuyCost: 10, baseSellPrice: 22, shelfCapacity: 20, sellRate: 0.5 },
  { id: 'noodle', name: 'Mie Instan', emoji: '🍜', category: 'Pokok', baseBuyCost: 3, baseSellPrice: 8, shelfCapacity: 35, sellRate: 1.1 },
  { id: 'vegetable', name: 'Sayuran', emoji: '🥬', category: 'Sayur', baseBuyCost: 4, baseSellPrice: 10, shelfCapacity: 25, sellRate: 0.8 },
  { id: 'potato', name: 'Kentang', emoji: '🥔', category: 'Sayur', baseBuyCost: 3, baseSellPrice: 8, shelfCapacity: 28, sellRate: 0.9 },
  { id: 'tomato', name: 'Tomat', emoji: '🍅', category: 'Sayur', baseBuyCost: 3, baseSellPrice: 7, shelfCapacity: 30, sellRate: 1.0 },
  { id: 'corn', name: 'Jagung', emoji: '🌽', category: 'Sayur', baseBuyCost: 4, baseSellPrice: 9, shelfCapacity: 25, sellRate: 0.8 },
  { id: 'carrot', name: 'Wortel', emoji: '🥕', category: 'Sayur', baseBuyCost: 3, baseSellPrice: 7, shelfCapacity: 28, sellRate: 0.85 },
  { id: 'onion', name: 'Bawang', emoji: '🧅', category: 'Sayur', baseBuyCost: 2, baseSellPrice: 6, shelfCapacity: 35, sellRate: 1.0 },
  { id: 'garlic', name: 'Bawang Putih', emoji: '🧄', category: 'Sayur', baseBuyCost: 3, baseSellPrice: 8, shelfCapacity: 30, sellRate: 0.9 },
  // Premium
  { id: 'wine', name: 'Wine', emoji: '🍷', category: 'Premium', baseBuyCost: 40, baseSellPrice: 90, shelfCapacity: 6, sellRate: 0.15 },
  { id: 'lobster', name: 'Lobster', emoji: '🦞', category: 'Premium', baseBuyCost: 50, baseSellPrice: 120, shelfCapacity: 4, sellRate: 0.1 },
  { id: 'truffle', name: 'Truffle', emoji: '🍄', category: 'Premium', baseBuyCost: 60, baseSellPrice: 150, shelfCapacity: 4, sellRate: 0.08 },
  { id: 'caviar', name: 'Kaviar', emoji: '🫙', category: 'Premium', baseBuyCost: 80, baseSellPrice: 200, shelfCapacity: 3, sellRate: 0.06 },
  { id: 'wagyu', name: 'Wagyu', emoji: '🥩', category: 'Premium', baseBuyCost: 100, baseSellPrice: 250, shelfCapacity: 3, sellRate: 0.05 },
  { id: 'champagne', name: 'Champagne', emoji: '🍾', category: 'Premium', baseBuyCost: 70, baseSellPrice: 170, shelfCapacity: 4, sellRate: 0.07 },
  // Frozen
  { id: 'frozen_pizza', name: 'Pizza Beku', emoji: '🍕', category: 'Frozen', baseBuyCost: 12, baseSellPrice: 26, shelfCapacity: 14, sellRate: 0.55 },
  { id: 'frozen_dumpling', name: 'Dimsum Beku', emoji: '🥟', category: 'Frozen', baseBuyCost: 10, baseSellPrice: 22, shelfCapacity: 16, sellRate: 0.6 },
  { id: 'frozen_fries', name: 'Kentang Beku', emoji: '🍟', category: 'Frozen', baseBuyCost: 6, baseSellPrice: 14, shelfCapacity: 20, sellRate: 0.7 },
  // Household
  { id: 'soap', name: 'Sabun', emoji: '🧼', category: 'Household', baseBuyCost: 5, baseSellPrice: 12, shelfCapacity: 25, sellRate: 0.6 },
  { id: 'tissue', name: 'Tisu', emoji: '🧻', category: 'Household', baseBuyCost: 4, baseSellPrice: 10, shelfCapacity: 30, sellRate: 0.8 },
  { id: 'detergent', name: 'Deterjen', emoji: '🫧', category: 'Household', baseBuyCost: 8, baseSellPrice: 18, shelfCapacity: 15, sellRate: 0.5 },
  // === v1.7 NEW PRODUCTS (musiman & spesial) ===
  // Seasonal — Spring
  { id: 'flower_bouquet', name: 'Buket Bunga', emoji: '💐', category: 'Spesial', baseBuyCost: 18, baseSellPrice: 45, shelfCapacity: 10, sellRate: 0.4 },
  { id: 'honey', name: 'Madu Murni', emoji: '🍯', category: 'Spesial', baseBuyCost: 22, baseSellPrice: 52, shelfCapacity: 10, sellRate: 0.4 },
  // Seasonal — Summer
  { id: 'sunscreen', name: 'Sunscreen', emoji: '🧴', category: 'Household', baseBuyCost: 14, baseSellPrice: 32, shelfCapacity: 14, sellRate: 0.5 },
  { id: 'coconut', name: 'Kelapa Muda', emoji: '🥥', category: 'Buah', baseBuyCost: 8, baseSellPrice: 20, shelfCapacity: 14, sellRate: 0.7 },
  { id: 'pineapple', name: 'Nanas', emoji: '🍍', category: 'Buah', baseBuyCost: 9, baseSellPrice: 22, shelfCapacity: 12, sellRate: 0.6 },
  // Seasonal — Autumn
  { id: 'pumpkin', name: 'Labu', emoji: '🎃', category: 'Sayur', baseBuyCost: 7, baseSellPrice: 18, shelfCapacity: 14, sellRate: 0.6 },
  { id: 'maple_syrup', name: 'Sirup Maple', emoji: '🍁', category: 'Spesial', baseBuyCost: 25, baseSellPrice: 60, shelfCapacity: 8, sellRate: 0.35 },
  { id: 'mushroom', name: 'Jamur', emoji: '🍄', category: 'Sayur', baseBuyCost: 6, baseSellPrice: 15, shelfCapacity: 18, sellRate: 0.7 },
  // Seasonal — Winter
  { id: 'hot_chocolate', name: 'Cokelat Panas', emoji: '☕', category: 'Minuman', baseBuyCost: 10, baseSellPrice: 25, shelfCapacity: 14, sellRate: 0.55 },
  { id: 'gift_box', name: 'Kado Hadiah', emoji: '🎁', category: 'Spesial', baseBuyCost: 30, baseSellPrice: 75, shelfCapacity: 8, sellRate: 0.3 },
  { id: 'gingerbread', name: 'Roti Jahe', emoji: '🍪', category: 'Bakeri', baseBuyCost: 8, baseSellPrice: 20, shelfCapacity: 16, sellRate: 0.6 },
  // Year-round premium additions
  { id: 'sushi', name: 'Sushi', emoji: '🍣', category: 'Premium', baseBuyCost: 35, baseSellPrice: 85, shelfCapacity: 6, sellRate: 0.18 },
  { id: 'macaron', name: 'Macaron', emoji: '🧁', category: 'Premium', baseBuyCost: 28, baseSellPrice: 70, shelfCapacity: 8, sellRate: 0.2 },
  { id: 'energy_drink', name: 'Minuman Energi', emoji: '⚡', category: 'Minuman', baseBuyCost: 9, baseSellPrice: 22, shelfCapacity: 16, sellRate: 0.7 },
];

// === SEASON SYSTEM (v1.7) ===
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface SeasonInfo {
  id: Season;
  name: string;
  emoji: string;
  description: string;
  // Product IDs that get +50% sell speed & +20% profit
  boostedProductIds: string[];
  // Categories that get +25% bonus
  boostedCategories: string[];
  // Background tint hint
  accentHue: number;
}

export const SEASONS: Record<Season, SeasonInfo> = {
  spring: {
    id: 'spring', name: 'Musim Semi', emoji: '🌸',
    description: 'Bunga & madu laris! Pelanggan ceria, lebih banyak dari biasa.',
    boostedProductIds: ['flower_bouquet', 'honey', 'strawberry', 'apple', 'cake'],
    boostedCategories: ['Buah', 'Bakeri'],
    accentHue: 340,
  },
  summer: {
    id: 'summer', name: 'Musim Panas', emoji: '☀️',
    description: 'Es krim, minuman dingin & buah tropis booming!',
    boostedProductIds: ['icecream', 'soda', 'juice', 'mineral_water', 'coconut', 'pineapple', 'sunscreen', 'watermelon', 'smoothie'],
    boostedCategories: ['Minuman'],
    accentHue: 45,
  },
  autumn: {
    id: 'autumn', name: 'Musim Gugur', emoji: '🍂',
    description: 'Labu, jamur & syrup maple jadi favorit. Suhu turun, kopi hangat laris.',
    boostedProductIds: ['pumpkin', 'maple_syrup', 'mushroom', 'coffee', 'tea', 'bread', 'mango'],
    boostedCategories: ['Pokok'],
    accentHue: 25,
  },
  winter: {
    id: 'winter', name: 'Musim Dingin', emoji: '❄️',
    description: 'Cokelat panas, kado, & roti jahe laris keras. Daging hangat juga!',
    boostedProductIds: ['hot_chocolate', 'gift_box', 'gingerbread', 'chocolate', 'beef', 'chicken', 'sausage'],
    boostedCategories: ['Daging'],
    accentHue: 205,
  },
};

// Each season lasts 30 game days
export const SEASON_LENGTH_DAYS = 30;
export const SEASON_ORDER: Season[] = ['spring', 'summer', 'autumn', 'winter'];

export function getSeasonForDay(day: number): Season {
  const cycle = Math.floor((day - 1) / SEASON_LENGTH_DAYS) % SEASON_ORDER.length;
  return SEASON_ORDER[cycle];
}

export function getSeasonProgress(day: number): { current: number; total: number; daysLeft: number } {
  const dayInSeason = ((day - 1) % SEASON_LENGTH_DAYS) + 1;
  return { current: dayInSeason, total: SEASON_LENGTH_DAYS, daysLeft: SEASON_LENGTH_DAYS - dayInSeason + 1 };
}

export function getSeasonProductMultiplier(productId: string, season: Season): number {
  const info = SEASONS[season];
  const product = PRODUCTS.find(p => p.id === productId);
  if (info.boostedProductIds.includes(productId)) return 1.6; // +60%
  if (product && info.boostedCategories.includes(product.category)) return 1.25; // +25%
  return 1.0;
}

export const SHELF_TYPES: ShelfType[] = [
  { id: 'basic', name: 'Rak Kayu', emoji: '🪵', cost: 100, capacity: 1, description: 'Rak sederhana dari kayu' },
  { id: 'metal', name: 'Rak Besi', emoji: '🔩', cost: 500, capacity: 2, description: 'Rak kokoh, muat lebih banyak' },
  { id: 'fridge', name: 'Kulkas Display', emoji: '🧊', cost: 1500, capacity: 3, description: 'Untuk produk dingin & segar' },
  { id: 'premium', name: 'Rak Premium', emoji: '✨', cost: 5000, capacity: 4, description: 'Rak mewah, pelanggan lebih tertarik' },
  { id: 'freezer', name: 'Freezer Box', emoji: '❄️', cost: 8000, capacity: 5, description: 'Freezer besar untuk frozen food' },
  { id: 'glass', name: 'Rak Kaca', emoji: '🪟', cost: 12000, capacity: 4, description: 'Rak kaca premium, +15% minat beli' },
  { id: 'mega', name: 'Rak Mega', emoji: '🏗️', cost: 15000, capacity: 6, description: 'Rak raksasa untuk stok besar' },
  { id: 'gondola', name: 'Gondola Ganda', emoji: '🛒', cost: 25000, capacity: 8, description: 'Rak gondola 2 sisi, kapasitas maks' },
  { id: 'smart', name: 'Smart Shelf', emoji: '📡', cost: 50000, capacity: 7, description: 'Rak pintar dengan sensor stok otomatis' },
  // NEW shelves
  { id: 'hologram', name: 'Holo-Display', emoji: '🛸', cost: 100000, capacity: 9, description: 'Display hologram futuristik, +20% minat beli' },
  { id: 'vault', name: 'Brankas Premium', emoji: '🔐', cost: 250000, capacity: 10, description: 'Untuk produk super-mewah, anti-maling' },
  { id: 'quantum', name: 'Quantum Shelf', emoji: '🌌', cost: 1000000, capacity: 15, description: 'Rak kuantum — kapasitas tak masuk akal!' },
];

export const EMPLOYEE_TYPES: EmployeeType[] = [
  { id: 'cleaner', name: 'Cleaning Service', emoji: '🧹', role: 'cleaner', baseSalary: 40, description: 'Menjaga kebersihan toko', effect: '+5 reputasi/menit' },
  { id: 'stocker', name: 'Stocker', emoji: '📦', role: 'stocker', baseSalary: 50, description: 'Mengisi rak secara otomatis', effect: 'Auto-restock 2 item/tick' },
  { id: 'security', name: 'Security', emoji: '💂', role: 'security', baseSalary: 60, description: 'Mengurangi pencurian', effect: '-50% kehilangan stok' },
  { id: 'cashier', name: 'Kasir', emoji: '🧑‍💼', role: 'cashier', baseSalary: 80, description: 'Mempercepat pelayanan pelanggan', effect: '+20% kecepatan jual' },
  { id: 'technician', name: 'Teknisi', emoji: '🔧', role: 'technician', baseSalary: 100, description: 'Merawat peralatan toko', effect: '-30% biaya maintenance' },
  { id: 'chef', name: 'Chef', emoji: '👨‍🍳', role: 'chef', baseSalary: 120, description: 'Membuat produk bakeri lebih laris', effect: '+25% jual produk bakeri' },
  { id: 'marketing', name: 'Marketing', emoji: '📣', role: 'marketing', baseSalary: 150, description: 'Meningkatkan jumlah pelanggan', effect: '+15% pelanggan' },
  { id: 'manager', name: 'Manager', emoji: '👔', role: 'manager', baseSalary: 200, description: 'Meningkatkan efisiensi seluruh toko', effect: '+10% profit semua produk' },
  // NEW employees
  { id: 'barista', name: 'Barista', emoji: '☕', role: 'chef', baseSalary: 110, description: 'Ahli minuman & kopi', effect: '+30% jual produk minuman' },
  { id: 'butcher', name: 'Tukang Daging', emoji: '🔪', role: 'chef', baseSalary: 140, description: 'Spesialis daging & seafood', effect: '+30% jual daging/seafood' },
  { id: 'analyst', name: 'Data Analyst', emoji: '📊', role: 'manager', baseSalary: 250, description: 'Optimalkan harga real-time', effect: '+15% profit semua produk' },
  { id: 'influencer', name: 'In-store Influencer', emoji: '🤳', role: 'marketing', baseSalary: 220, description: 'Promosi via medsos langsung', effect: '+25% pelanggan & +1 rep/menit' },
];

export const UPGRADES: UpgradeType[] = [
  // Store
  { id: 'bigger_store', name: 'Perluas Toko', emoji: '🏗️', baseCost: 1000, costMultiplier: 2.5, maxLevel: 10, description: '+2 slot rak', category: 'store' },
  { id: 'decoration', name: 'Dekorasi', emoji: '🎨', baseCost: 300, costMultiplier: 1.8, maxLevel: 15, description: '+10 reputasi', category: 'store' },
  { id: 'ac', name: 'AC & Pendingin', emoji: '❄️', baseCost: 800, costMultiplier: 2.0, maxLevel: 5, description: '+15% kecepatan jual', category: 'store' },
  { id: 'warehouse', name: 'Gudang Besar', emoji: '🏭', baseCost: 2000, costMultiplier: 2.0, maxLevel: 5, description: '+50% kapasitas gudang', category: 'store', requiredReputation: 30 },
  { id: 'generator', name: 'Generator Listrik', emoji: '⚡', baseCost: 5000, costMultiplier: 2.5, maxLevel: 3, description: 'Toko tetap buka saat mati lampu', category: 'store', requiredReputation: 80 },
  { id: 'escalator', name: 'Eskalator', emoji: '🛗', baseCost: 20000, costMultiplier: 3.0, maxLevel: 2, description: '+4 slot rak per level', category: 'store', requiredReputation: 200 },
  { id: 'solar_panel', name: 'Panel Surya', emoji: '☀️', baseCost: 15000, costMultiplier: 2.5, maxLevel: 3, description: '-20% biaya operasional', category: 'store', requiredReputation: 150 },
  // Marketing
  { id: 'billboard', name: 'Billboard', emoji: '📢', baseCost: 500, costMultiplier: 2.2, maxLevel: 10, description: '+5 pelanggan/menit', category: 'marketing' },
  { id: 'social_media', name: 'Social Media', emoji: '📱', baseCost: 200, costMultiplier: 1.5, maxLevel: 20, description: '+3% reputasi/menit', category: 'marketing' },
  { id: 'loyalty', name: 'Loyalty Card', emoji: '💳', baseCost: 1000, costMultiplier: 2.0, maxLevel: 5, description: '+10% repeat customer', category: 'marketing' },
  { id: 'delivery', name: 'Layanan Delivery', emoji: '🛵', baseCost: 3000, costMultiplier: 2.0, maxLevel: 5, description: '+15% penjualan tambahan', category: 'marketing', requiredReputation: 50 },
  { id: 'franchise_brand', name: 'Branding Franchise', emoji: '🏷️', baseCost: 10000, costMultiplier: 2.5, maxLevel: 3, description: 'Cabang +25% lebih efektif', category: 'marketing', requiredReputation: 150 },
  { id: 'influencer', name: 'Influencer Deal', emoji: '🤳', baseCost: 8000, costMultiplier: 2.0, maxLevel: 5, description: '+20% reputasi per level', category: 'marketing', requiredReputation: 100 },
  { id: 'tv_ad', name: 'Iklan TV', emoji: '📺', baseCost: 25000, costMultiplier: 3.0, maxLevel: 3, description: '+30% pelanggan', category: 'marketing', requiredReputation: 250 },
  // Tech
  { id: 'pos', name: 'Sistem POS', emoji: '🖥️', baseCost: 2000, costMultiplier: 2.5, maxLevel: 5, description: '+25% kecepatan kasir', category: 'tech' },
  { id: 'cctv', name: 'CCTV', emoji: '📹', baseCost: 600, costMultiplier: 1.8, maxLevel: 8, description: '-10% pencurian', category: 'tech' },
  { id: 'auto_order', name: 'Auto Order', emoji: '🤖', baseCost: 5000, costMultiplier: 3.0, maxLevel: 3, description: 'Auto beli stok saat habis', category: 'tech', requiredReputation: 40 },
  { id: 'self_checkout', name: 'Self Checkout', emoji: '🏧', baseCost: 8000, costMultiplier: 2.5, maxLevel: 3, description: '+30% kecepatan tanpa kasir', category: 'tech', requiredReputation: 100 },
  { id: 'ai_analytics', name: 'AI Analytics', emoji: '🧠', baseCost: 30000, costMultiplier: 3.0, maxLevel: 3, description: '+15% profit dari prediksi harga', category: 'tech', requiredReputation: 200 },
  { id: 'robot_stocker', name: 'Robot Stocker', emoji: '🦾', baseCost: 50000, costMultiplier: 3.5, maxLevel: 2, description: 'Auto-restock 5 item/tick', category: 'tech', requiredReputation: 300 },
  // Luxury
  { id: 'vip_lounge', name: 'VIP Lounge', emoji: '🛋️', baseCost: 3000, costMultiplier: 2.5, maxLevel: 5, description: '+50% profit VIP customer', category: 'luxury', requiredReputation: 60 },
  { id: 'parking', name: 'Parkir Luas', emoji: '🅿️', baseCost: 2000, costMultiplier: 2.0, maxLevel: 5, description: '+20% pelanggan', category: 'luxury' },
  { id: 'cafe', name: 'Mini Cafe', emoji: '☕', baseCost: 4000, costMultiplier: 2.5, maxLevel: 3, description: 'Passive income $10/detik', category: 'luxury', requiredReputation: 30 },
  { id: 'playground', name: 'Area Bermain Anak', emoji: '🎠', baseCost: 6000, costMultiplier: 2.0, maxLevel: 3, description: '+15% pelanggan keluarga', category: 'luxury', requiredReputation: 70 },
  { id: 'rooftop_garden', name: 'Rooftop Garden', emoji: '🌿', baseCost: 15000, costMultiplier: 2.5, maxLevel: 2, description: '+30 reputasi, produk organik', category: 'luxury', requiredReputation: 120 },
  { id: 'spa', name: 'Mini Spa', emoji: '🧖', baseCost: 20000, costMultiplier: 2.5, maxLevel: 3, description: 'Passive income $20/detik', category: 'luxury', requiredReputation: 180 },
  { id: 'cinema', name: 'Mini Cinema', emoji: '🎬', baseCost: 40000, costMultiplier: 3.0, maxLevel: 2, description: 'Passive income $50/detik', category: 'luxury', requiredReputation: 250 },
  { id: 'aquarium', name: 'Akuarium Raksasa', emoji: '🐠', baseCost: 35000, costMultiplier: 2.5, maxLevel: 2, description: '+50 reputasi, menarik pelanggan', category: 'luxury', requiredReputation: 200 },
  // Employee
  { id: 'break_room', name: 'Ruang Istirahat', emoji: '🛏️', baseCost: 1500, costMultiplier: 2.0, maxLevel: 5, description: 'Mood pegawai +0.1/tick', category: 'employee' },
  { id: 'training_center', name: 'Pusat Pelatihan', emoji: '🎓', baseCost: 3000, costMultiplier: 2.5, maxLevel: 5, description: 'XP pegawai +50%', category: 'employee', requiredReputation: 40 },
  { id: 'canteen', name: 'Kantin Pegawai', emoji: '🍱', baseCost: 2000, costMultiplier: 2.0, maxLevel: 3, description: 'Mood pegawai +0.2/tick', category: 'employee', requiredReputation: 25 },
  { id: 'insurance', name: 'Asuransi Pegawai', emoji: '🏥', baseCost: 5000, costMultiplier: 2.0, maxLevel: 3, description: '-50% chance resign', category: 'employee', requiredReputation: 60 },
  { id: 'gym', name: 'Gym Pegawai', emoji: '💪', baseCost: 8000, costMultiplier: 2.0, maxLevel: 3, description: '+10% produktivitas', category: 'employee', requiredReputation: 80 },
  { id: 'daycare', name: 'Daycare', emoji: '👶', baseCost: 12000, costMultiplier: 2.5, maxLevel: 2, description: '-70% chance resign', category: 'employee', requiredReputation: 100 },
  // NEW upgrades
  { id: 'drive_thru', name: 'Drive-Thru', emoji: '🚗', baseCost: 18000, costMultiplier: 2.5, maxLevel: 3, description: '+25% pelanggan & +20% kecepatan', category: 'store', requiredReputation: 110 },
  { id: 'mascot', name: 'Maskot Toko', emoji: '🐻', baseCost: 4500, costMultiplier: 2.0, maxLevel: 5, description: '+8 reputasi & +5% pelanggan/level', category: 'marketing', requiredReputation: 35 },
  { id: 'crypto_payment', name: 'Pembayaran Crypto', emoji: '🪙', baseCost: 22000, costMultiplier: 2.5, maxLevel: 3, description: '+10% profit dari fee transaksi', category: 'tech', requiredReputation: 140 },
  { id: 'drone_delivery', name: 'Drone Delivery', emoji: '🛸', baseCost: 60000, costMultiplier: 3.0, maxLevel: 3, description: '+40% kecepatan jual & +10% pelanggan', category: 'tech', requiredReputation: 280 },
  { id: 'penthouse_office', name: 'Penthouse Office', emoji: '🏙️', baseCost: 80000, costMultiplier: 3.0, maxLevel: 2, description: '+50 reputasi & +10% profit cabang', category: 'luxury', requiredReputation: 350 },
  { id: 'employee_app', name: 'Aplikasi Pegawai', emoji: '📱', baseCost: 7000, costMultiplier: 2.0, maxLevel: 4, description: 'XP +30% & mood +0.15/tick', category: 'employee', requiredReputation: 90 },
];

export const BRANCH_TYPES: BranchType[] = [
  { id: 'kios', name: 'Kios Kecil', emoji: '🏪', cost: 5000, incomePerTick: 5, upgradeCostMultiplier: 2.0, maxLevel: 5, description: 'Kios kecil di pinggir jalan', requiredReputation: 20 },
  { id: 'online_store', name: 'Toko Online', emoji: '🌐', cost: 15000, incomePerTick: 15, upgradeCostMultiplier: 2.0, maxLevel: 8, description: 'Toko online tanpa biaya sewa', requiredReputation: 40 },
  { id: 'minimarket', name: 'Minimarket', emoji: '🏬', cost: 25000, incomePerTick: 25, upgradeCostMultiplier: 2.5, maxLevel: 5, description: 'Minimarket dengan produk lengkap', requiredReputation: 60 },
  { id: 'supermarket', name: 'Supermarket Cabang', emoji: '🛒', cost: 100000, incomePerTick: 100, upgradeCostMultiplier: 3.0, maxLevel: 5, description: 'Supermarket besar di kota lain', requiredReputation: 150 },
  { id: 'warehouse_outlet', name: 'Warehouse Outlet', emoji: '📦', cost: 200000, incomePerTick: 200, upgradeCostMultiplier: 3.0, maxLevel: 4, description: 'Warehouse besar, jual grosir', requiredReputation: 200 },
  { id: 'hypermart', name: 'Hypermart', emoji: '🏢', cost: 500000, incomePerTick: 500, upgradeCostMultiplier: 3.5, maxLevel: 3, description: 'Hypermart megah dengan segalanya', requiredReputation: 300 },
  { id: 'food_court', name: 'Food Court', emoji: '🍔', cost: 750000, incomePerTick: 750, upgradeCostMultiplier: 3.5, maxLevel: 4, description: 'Food court ramai di pusat kota', requiredReputation: 400 },
  { id: 'mall_anchor', name: 'Anchor Tenant Mall', emoji: '🏬', cost: 1000000, incomePerTick: 1000, upgradeCostMultiplier: 4.0, maxLevel: 3, description: 'Tenant utama di mall besar!', requiredReputation: 500 },
  { id: 'airport_shop', name: 'Airport Shop', emoji: '✈️', cost: 2000000, incomePerTick: 2000, upgradeCostMultiplier: 4.5, maxLevel: 3, description: 'Toko premium di bandara internasional!', requiredReputation: 700 },
  // NEW branches (sorted in)
  { id: 'gas_station', name: 'Mini Mart SPBU', emoji: '⛽', cost: 50000, incomePerTick: 50, upgradeCostMultiplier: 2.5, maxLevel: 5, description: 'Mini mart 24 jam di SPBU', requiredReputation: 80 },
  { id: 'tourist_kiosk', name: 'Kios Wisata', emoji: '🗺️', cost: 350000, incomePerTick: 350, upgradeCostMultiplier: 3.0, maxLevel: 4, description: 'Kios di destinasi wisata, harga premium', requiredReputation: 250 },
  { id: 'space_station', name: 'Space Station Outlet', emoji: '🚀', cost: 5000000, incomePerTick: 5000, upgradeCostMultiplier: 5.0, maxLevel: 3, description: '🌟 Outlet di stasiun luar angkasa! Ultimate flex.', requiredReputation: 1000 },
].sort((a, b) => a.cost - b.cost);

export const EMPLOYEE_NAMES = [
  'Budi', 'Siti', 'Andi', 'Dewi', 'Rudi', 'Rina', 'Agus', 'Putri', 
  'Joko', 'Lina', 'Bambang', 'Ani', 'Hendra', 'Maya', 'Dimas', 'Sari',
  'Rizki', 'Wulan', 'Fajar', 'Indah', 'Bayu', 'Tari', 'Arif', 'Nadia',
  'Faisal', 'Citra', 'Deni', 'Ratna', 'Gilang', 'Kirana',
  'Surya', 'Ayu', 'Yoga', 'Fitri', 'Eko', 'Laras', 'Taufik', 'Mega',
  'Rangga', 'Intan', 'Bima', 'Anisa', 'Galih', 'Tiara', 'Putra', 'Sinta',
];

export function getUpgradeCost(upgrade: UpgradeType, currentLevel: number): number {
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLevel));
}

export function getBranchCost(branch: BranchType, currentLevel: number): number {
  return Math.floor(branch.cost * Math.pow(branch.upgradeCostMultiplier, currentLevel));
}

export function getEmployeeLevelXP(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function getEmployeeLevelBonus(level: number): number {
  return 1 + (level - 1) * 0.15;
}

export function formatMoney(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
  return `$${Math.floor(amount)}`;
}

// Cap reputasi maksimum (dinaikkan dari 1.000 → 1.000.000)
export const REPUTATION_CAP = 1_000_000;

// Format angka umum tanpa simbol $ — 1.2K, 4.5M, 3.1B, dst.
export function formatNumber(n: number): string {
  const a = Math.abs(n);
  const s = n < 0 ? '-' : '';
  if (a >= 1_000_000_000) return `${s}${(a / 1_000_000_000).toFixed(a >= 10_000_000_000 ? 0 : 1)}B`;
  if (a >= 1_000_000) return `${s}${(a / 1_000_000).toFixed(a >= 10_000_000 ? 0 : 1)}M`;
  if (a >= 1_000) return `${s}${(a / 1_000).toFixed(a >= 10_000 ? 0 : 1)}K`;
  return `${s}${Math.floor(a)}`;
}

export function formatGameTime(hour: number): string {
  const h = Math.floor(hour);
  const m = Math.floor((hour - h) * 60);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function isNightTime(hour: number): boolean {
  return hour >= 21 || hour < 6;
}

export function isDayTime(hour: number): boolean {
  return !isNightTime(hour);
}

export function generatePriceMultiplier(seed: number): number {
  const sin = Math.sin(seed * 12.9898 + 78.233);
  const rand = sin - Math.floor(sin);
  return 0.5 + rand;
}

export function getDemandMultiplier(customSellPrice: number, baseSellPrice: number): number {
  const ratio = customSellPrice / baseSellPrice;
  if (ratio <= 0.5) return 2.5;
  if (ratio <= 0.8) return 1.8;
  if (ratio <= 1.0) return 1.2;
  if (ratio <= 1.2) return 0.8;
  if (ratio <= 1.5) return 0.5;
  if (ratio <= 2.0) return 0.15;
  // Terlalu mahal — tidak ada yang mau beli!
  return 0;
}

export interface PrestigeBonus {
  id: string;
  name: string;
  emoji: string;
  description: string;
  effect: string;
  costPerLevel: number;
  maxLevel: number;
}

export const PRESTIGE_BONUSES: PrestigeBonus[] = [
  { id: 'profit_boost', name: 'Profit Master', emoji: '💎', description: '+10% profit per level', effect: 'profit', costPerLevel: 1, maxLevel: 10 },
  { id: 'speed_boost', name: 'Quick Seller', emoji: '⚡', description: '+10% kecepatan jual per level', effect: 'speed', costPerLevel: 1, maxLevel: 10 },
  { id: 'start_money', name: 'Silver Spoon', emoji: '🥄', description: '+$500 uang awal per level', effect: 'start_money', costPerLevel: 2, maxLevel: 5 },
  { id: 'rep_boost', name: 'Famous Brand', emoji: '🌟', description: '+5 reputasi awal per level', effect: 'start_rep', costPerLevel: 2, maxLevel: 5 },
  { id: 'customer_boost', name: 'People Magnet', emoji: '🧲', description: '+10% pelanggan per level', effect: 'customer', costPerLevel: 1, maxLevel: 10 },
  { id: 'night_boost', name: 'Night Owl', emoji: '🦉', description: '+20% pelanggan malam per level', effect: 'night', costPerLevel: 1, maxLevel: 5 },
  // NEW prestige bonuses
  { id: 'gem_boost', name: 'Gem Magnet', emoji: '💎', description: '+1 gem/hari per level', effect: 'gem', costPerLevel: 2, maxLevel: 5 },
  { id: 'branch_boost', name: 'Franchise King', emoji: '🏬', description: '+10% income cabang per level', effect: 'branch', costPerLevel: 2, maxLevel: 10 },
  { id: 'employee_xp', name: 'Mentor Sejati', emoji: '🎓', description: '+20% XP pegawai per level', effect: 'emp_xp', costPerLevel: 1, maxLevel: 5 },
  { id: 'shelf_capacity', name: 'Master Logistik', emoji: '📦', description: '+10% kapasitas rak per level', effect: 'shelf', costPerLevel: 2, maxLevel: 5 },
  { id: 'lucky_gacha', name: 'Lucky Spinner', emoji: '🍀', description: '+5% chance rare+ di gacha per level', effect: 'gacha_luck', costPerLevel: 3, maxLevel: 4 },
];
