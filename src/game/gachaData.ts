// Loose state shape used only for unlock checks — avoids circular import with GameContext.
// Each condition reads only the fields it needs. Keep it minimal & permissive.
export type UnlockCheckState = {
  itemsSold?: number;
  totalEarned?: number;
  totalSpent?: number;
  reputation?: number;
  day?: number;
  money?: number;
  prestigeLevel?: number;
  branches?: unknown[];
  shelves?: unknown[];
  employees?: unknown[];
  gachaInventory?: string[];
  achievements?: string[];
  sideJobsCompleted?: number;
  eventsEncountered?: number;
  nightSales?: number;
  hasBankrupted?: boolean;
  playTimeTicks?: number;
  gems?: number;
  // anything else
  [k: string]: unknown;
};

export interface GachaItem {
  id: string;
  name: string;
  emoji: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythical';
  type: 'theme' | 'buff' | 'cosmetic' | 'title';
  description: string;
  // If set, item is ONLY obtainable from the seasonal Limited Market during this season,
  // and is excluded from the regular gacha pool.
  exclusiveSeason?: 'spring' | 'summer' | 'autumn' | 'winter';
  // If set: item is NOT obtainable via gacha/market at all. It is auto-granted
  // when the condition is met. Used for special "earned" titles.
  unlockCondition?: {
    description: string;
    check: (state: UnlockCheckState) => boolean;
  };
  themeColorsLight?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    card: string;
  };
  themeColorsDark?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    card: string;
  };
  buffEffect?: {
    stat: string;
    multiplier: number;
    durationTicks: number;
  };
  cosmeticEmoji?: string;
}

export const GACHA_ITEMS: GachaItem[] = [
  // === THEMES (GUI Colors) — each has Light + Dark variants ===
  { id: 'theme_ocean', name: 'Tema Samudra', emoji: '🌊', rarity: 'rare', type: 'theme', description: 'Warna biru laut yang menenangkan',
    themeColorsLight: { primary: '200 80% 50%', secondary: '180 60% 40%', accent: '220 70% 55%', background: '210 40% 95%', card: '200 50% 98%' },
    themeColorsDark: { primary: '200 75% 45%', secondary: '180 55% 35%', accent: '220 65% 50%', background: '210 35% 10%', card: '210 30% 14%' } },
  { id: 'theme_sakura', name: 'Tema Sakura', emoji: '🌸', rarity: 'epic', type: 'theme', description: '🌸 SPRING LIMITED — Pink lembut ala Jepang (hanya market musim semi)',
    exclusiveSeason: 'spring',
    themeColorsLight: { primary: '340 80% 65%', secondary: '320 60% 50%', accent: '350 75% 60%', background: '340 40% 95%', card: '340 50% 98%' },
    themeColorsDark: { primary: '340 70% 55%', secondary: '320 50% 40%', accent: '350 65% 50%', background: '340 25% 10%', card: '340 20% 14%' } },
  { id: 'theme_forest', name: 'Tema Hutan', emoji: '🌲', rarity: 'rare', type: 'theme', description: 'Hijau alami yang segar',
    themeColorsLight: { primary: '145 70% 40%', secondary: '160 55% 35%', accent: '120 65% 45%', background: '140 30% 94%', card: '140 40% 97%' },
    themeColorsDark: { primary: '145 60% 35%', secondary: '160 45% 28%', accent: '120 55% 35%', background: '140 30% 8%', card: '140 25% 12%' } },
  { id: 'theme_sunset', name: 'Tema Senja', emoji: '🌅', rarity: 'epic', type: 'theme', description: 'Gradasi oranye-ungu yang indah',
    themeColorsLight: { primary: '25 90% 55%', secondary: '280 60% 50%', accent: '15 85% 55%', background: '30 35% 94%', card: '25 45% 97%' },
    themeColorsDark: { primary: '25 80% 45%', secondary: '280 50% 40%', accent: '15 75% 45%', background: '25 30% 9%', card: '25 25% 13%' } },
  { id: 'theme_midnight', name: 'Tema Midnight', emoji: '🌃', rarity: 'legendary', type: 'theme', description: 'Gelap elegan dengan aksen neon',
    themeColorsLight: { primary: '260 70% 55%', secondary: '180 65% 45%', accent: '300 65% 50%', background: '260 20% 94%', card: '260 25% 97%' },
    themeColorsDark: { primary: '260 85% 65%', secondary: '180 80% 55%', accent: '300 80% 60%', background: '250 35% 6%', card: '250 30% 10%' } },
  { id: 'theme_candy', name: 'Tema Candy', emoji: '🍬', rarity: 'rare', type: 'theme', description: 'Warna-warni cerah dan fun!',
    themeColorsLight: { primary: '300 75% 60%', secondary: '50 80% 55%', accent: '180 70% 50%', background: '310 25% 95%', card: '300 35% 98%' },
    themeColorsDark: { primary: '300 65% 50%', secondary: '50 70% 45%', accent: '180 60% 40%', background: '300 25% 9%', card: '300 20% 13%' } },
  { id: 'theme_royal', name: 'Tema Royal', emoji: '👑', rarity: 'mythical', type: 'theme', description: '✨ MYTHICAL — Kerajaan merah-emas dengan mahkota berkilau & shimmer royal!',
    // Light: deep crimson + bold gold for high contrast & readability
    themeColorsLight: { primary: '0 75% 38%', secondary: '42 95% 42%', accent: '350 80% 40%', background: '40 55% 94%', card: '40 70% 98%' },
    themeColorsDark:  { primary: '45 95% 55%', secondary: '0 80% 45%', accent: '15 85% 50%', background: '0 35% 7%', card: '0 30% 11%' } },
  { id: 'theme_retro', name: 'Tema Retro', emoji: '🕹️', rarity: 'epic', type: 'theme', description: 'Gaya retro 80-an',
    themeColorsLight: { primary: '330 70% 50%', secondary: '195 75% 42%', accent: '55 80% 50%', background: '280 15% 94%', card: '280 18% 97%' },
    themeColorsDark: { primary: '330 85% 60%', secondary: '195 90% 50%', accent: '55 90% 58%', background: '250 25% 6%', card: '250 22% 10%' } },

  // === NEW THEMES ===
  { id: 'theme_neon', name: 'Tema Neon', emoji: '💡', rarity: 'epic', type: 'theme', description: 'Warna neon menyala terang!',
    themeColorsLight: { primary: '160 100% 45%', secondary: '290 90% 55%', accent: '45 100% 50%', background: '200 15% 94%', card: '200 20% 97%' },
    themeColorsDark: { primary: '160 100% 50%', secondary: '290 90% 60%', accent: '45 100% 55%', background: '220 30% 6%', card: '220 25% 10%' } },
  { id: 'theme_autumn', name: 'Tema Musim Gugur', emoji: '🍂', rarity: 'rare', type: 'theme', description: '🍂 AUTUMN LIMITED — Hangat seperti musim gugur (hanya market musim gugur)',
    exclusiveSeason: 'autumn',
    themeColorsLight: { primary: '25 85% 48%', secondary: '40 70% 42%', accent: '10 80% 50%', background: '35 35% 93%', card: '35 40% 97%' },
    themeColorsDark: { primary: '25 75% 40%', secondary: '40 60% 35%', accent: '10 70% 42%', background: '25 30% 8%', card: '25 25% 12%' } },
  { id: 'theme_winter', name: 'Tema Musim Dingin', emoji: '❄️', rarity: 'rare', type: 'theme', description: '❄️ WINTER LIMITED — Sejuk dan bersih seperti salju (hanya market musim dingin)',
    exclusiveSeason: 'winter',
    themeColorsLight: { primary: '205 80% 55%', secondary: '195 50% 60%', accent: '210 70% 65%', background: '210 30% 96%', card: '210 40% 99%' },
    themeColorsDark: { primary: '205 70% 50%', secondary: '195 40% 45%', accent: '210 60% 55%', background: '210 30% 8%', card: '210 25% 12%' } },
  { id: 'theme_cyberpunk', name: 'Tema Cyberpunk', emoji: '🤖', rarity: 'legendary', type: 'theme', description: 'Futuristik gelap dengan aksen tajam',
    themeColorsLight: { primary: '195 100% 50%', secondary: '340 90% 55%', accent: '55 100% 55%', background: '200 10% 93%', card: '200 15% 97%' },
    themeColorsDark: { primary: '195 100% 55%', secondary: '340 90% 60%', accent: '55 100% 55%', background: '230 35% 6%', card: '230 30% 10%' } },
  { id: 'theme_lavender', name: 'Tema Lavender', emoji: '💜', rarity: 'rare', type: 'theme', description: 'Ungu lembut yang menenangkan',
    themeColorsLight: { primary: '270 60% 60%', secondary: '280 45% 50%', accent: '260 55% 65%', background: '270 25% 95%', card: '270 30% 98%' },
    themeColorsDark: { primary: '270 55% 50%', secondary: '280 40% 40%', accent: '260 50% 55%', background: '270 25% 8%', card: '270 20% 12%' } },
  
  // === NEW THEMES (v1.6) ===
  { id: 'theme_galaxy', name: 'Tema Galaxy', emoji: '🌌', rarity: 'legendary', type: 'theme', description: 'Ruang angkasa berkilauan dengan nebula',
    themeColorsLight: { primary: '270 80% 55%', secondary: '220 75% 50%', accent: '310 85% 60%', background: '260 30% 92%', card: '260 35% 96%' },
    themeColorsDark: { primary: '270 90% 65%', secondary: '220 85% 60%', accent: '310 95% 70%', background: '255 40% 5%', card: '255 35% 9%' } },
  { id: 'theme_volcano', name: 'Tema Vulkanik', emoji: '🌋', rarity: 'epic', type: 'theme', description: 'Lava merah membara!',
    themeColorsLight: { primary: '15 90% 50%', secondary: '0 80% 45%', accent: '35 95% 55%', background: '20 30% 92%', card: '20 35% 96%' },
    themeColorsDark: { primary: '15 95% 55%', secondary: '0 85% 50%', accent: '35 100% 60%', background: '15 40% 7%', card: '15 35% 11%' } },
  { id: 'theme_emerald', name: 'Tema Zamrud', emoji: '💚', rarity: 'epic', type: 'theme', description: 'Hijau zamrud yang mewah',
    themeColorsLight: { primary: '155 75% 40%', secondary: '170 70% 35%', accent: '140 80% 45%', background: '155 25% 94%', card: '155 30% 97%' },
    themeColorsDark: { primary: '155 80% 45%', secondary: '170 75% 40%', accent: '140 85% 50%', background: '155 35% 7%', card: '155 30% 11%' } },
  { id: 'theme_pastel', name: 'Tema Pastel', emoji: '🎨', rarity: 'rare', type: 'theme', description: 'Lembut & feminin',
    themeColorsLight: { primary: '200 60% 70%', secondary: '340 55% 75%', accent: '50 70% 75%', background: '200 30% 96%', card: '200 40% 99%' },
    themeColorsDark: { primary: '200 50% 60%', secondary: '340 45% 60%', accent: '50 60% 60%', background: '210 20% 12%', card: '210 18% 16%' } },
  { id: 'theme_monochrome', name: 'Tema Monokrom', emoji: '⚫', rarity: 'rare', type: 'theme', description: 'Hitam-putih elegan & minimalis',
    themeColorsLight: { primary: '0 0% 15%', secondary: '0 0% 35%', accent: '0 0% 50%', background: '0 0% 98%', card: '0 0% 100%' },
    themeColorsDark: { primary: '0 0% 90%', secondary: '0 0% 70%', accent: '0 0% 60%', background: '0 0% 5%', card: '0 0% 10%' } },
  { id: 'theme_steampunk', name: 'Tema Steampunk', emoji: '⚙️', rarity: 'epic', type: 'theme', description: 'Coklat tembaga era industri',
    themeColorsLight: { primary: '30 60% 40%', secondary: '20 50% 35%', accent: '40 70% 50%', background: '35 25% 92%', card: '35 30% 96%' },
    themeColorsDark: { primary: '30 65% 50%', secondary: '20 55% 40%', accent: '40 75% 55%', background: '30 25% 8%', card: '30 22% 12%' } },
  { id: 'theme_aurora', name: 'Tema Aurora', emoji: '🌠', rarity: 'legendary', type: 'theme', description: 'Cahaya utara berkilau hijau-ungu',
    themeColorsLight: { primary: '170 80% 45%', secondary: '270 70% 55%', accent: '210 75% 55%', background: '200 35% 94%', card: '200 40% 97%' },
    themeColorsDark: { primary: '170 90% 55%', secondary: '270 85% 65%', accent: '210 90% 65%', background: '220 40% 6%', card: '220 35% 10%' } },
  { id: 'theme_desert', name: 'Tema Gurun', emoji: '🏜️', rarity: 'rare', type: 'theme', description: 'Pasir keemasan yang hangat',
    themeColorsLight: { primary: '40 75% 50%', secondary: '30 60% 45%', accent: '25 80% 55%', background: '40 35% 93%', card: '40 40% 97%' },
    themeColorsDark: { primary: '40 70% 45%', secondary: '30 55% 38%', accent: '25 75% 48%', background: '40 30% 8%', card: '40 25% 12%' } },
  { id: 'theme_dragon', name: 'Tema Naga Api', emoji: '🐉', rarity: 'mythical', type: 'theme', description: '✨ MYTHICAL — Naga merah-emas dengan efek api naga!',
    themeColorsLight: { primary: '0 85% 45%', secondary: '40 95% 50%', accent: '15 90% 50%', background: '10 30% 92%', card: '10 35% 96%' },
    themeColorsDark: { primary: '0 90% 55%', secondary: '40 100% 55%', accent: '15 95% 58%', background: '0 40% 6%', card: '0 35% 10%' } },
  
  // === SPECIAL ACHIEVEMENT THEMES (MYTHICAL) ===
  { id: 'theme_unemployment', name: 'Tema Pengangguran', emoji: '😴', rarity: 'mythical', type: 'theme', description: '🌟 MYTHICAL — Reward 100 jam bermain. Tema bermalas-malasan dengan efek unik!',
    themeColorsLight: { primary: '220 8% 35%', secondary: '30 15% 40%', accent: '210 12% 45%', background: '220 10% 85%', card: '220 12% 90%' },
    themeColorsDark: { primary: '220 12% 55%', secondary: '30 15% 45%', accent: '210 15% 50%', background: '220 15% 5%', card: '220 12% 9%' } },

  // === SEASONAL LIMITED MARKET THEMES (MYTHICAL UPGRADES — only available during their season) ===
  { id: 'theme_sakura_eternal', name: 'Sakura Eternal', emoji: '🌸', rarity: 'mythical', type: 'theme', description: '✨ SPRING MYTHICAL — Sakura abadi yang berkilau emas, hanya bisa didapatkan di market musim semi.',
    exclusiveSeason: 'spring',
    themeColorsLight: { primary: '335 85% 60%', secondary: '45 80% 55%', accent: '350 90% 70%', background: '335 50% 96%', card: '335 60% 99%' },
    themeColorsDark: { primary: '335 80% 60%', secondary: '45 90% 55%', accent: '350 85% 65%', background: '335 30% 8%', card: '335 28% 12%' } },
  { id: 'theme_solar_eclipse', name: 'Solar Eclipse', emoji: '🌞', rarity: 'mythical', type: 'theme', description: '✨ SUMMER MYTHICAL — Matahari & gerhana, hanya di market musim panas.',
    exclusiveSeason: 'summer',
    themeColorsLight: { primary: '40 100% 50%', secondary: '15 90% 55%', accent: '50 95% 60%', background: '45 60% 94%', card: '45 70% 98%' },
    themeColorsDark: { primary: '40 100% 55%', secondary: '15 95% 50%', accent: '50 100% 60%', background: '20 50% 6%', card: '20 45% 10%' } },
  { id: 'theme_harvest_king', name: 'Harvest King', emoji: '🍁', rarity: 'mythical', type: 'theme', description: '✨ AUTUMN MYTHICAL — Raja panen dengan daun emas, hanya di market musim gugur.',
    exclusiveSeason: 'autumn',
    themeColorsLight: { primary: '20 90% 45%', secondary: '40 85% 45%', accent: '15 95% 50%', background: '30 50% 93%', card: '30 60% 97%' },
    themeColorsDark: { primary: '20 90% 50%', secondary: '40 90% 50%', accent: '15 95% 55%', background: '20 45% 7%', card: '20 40% 11%' } },
  { id: 'theme_frostbite', name: 'Frostbite Aurora', emoji: '🧊', rarity: 'mythical', type: 'theme', description: '✨ WINTER MYTHICAL — Es kristal dengan aurora utara, hanya di market musim dingin.',
    exclusiveSeason: 'winter',
    themeColorsLight: { primary: '195 95% 55%', secondary: '270 70% 60%', accent: '180 85% 60%', background: '200 50% 96%', card: '200 60% 99%' },
    themeColorsDark: { primary: '195 100% 60%', secondary: '270 85% 65%', accent: '180 95% 65%', background: '215 50% 5%', card: '215 45% 9%' } },

  
  // === BUFFS ===
  { id: 'buff_profit_small', name: 'Jimat Keberuntungan', emoji: '🍀', rarity: 'common', type: 'buff', description: '+20% profit selama 5 menit',
    buffEffect: { stat: 'profit', multiplier: 1.2, durationTicks: 600 } },
  { id: 'buff_profit_big', name: 'Batu Berlian', emoji: '💎', rarity: 'epic', type: 'buff', description: '+50% profit selama 3 menit',
    buffEffect: { stat: 'profit', multiplier: 1.5, durationTicks: 360 } },
  { id: 'buff_speed_small', name: 'Sepatu Cepat', emoji: '👟', rarity: 'common', type: 'buff', description: '+30% kecepatan jual 5 menit',
    buffEffect: { stat: 'speed', multiplier: 1.3, durationTicks: 600 } },
  { id: 'buff_speed_big', name: 'Roket Booster', emoji: '🚀', rarity: 'rare', type: 'buff', description: '+60% kecepatan jual 3 menit',
    buffEffect: { stat: 'speed', multiplier: 1.6, durationTicks: 360 } },
  { id: 'buff_customer', name: 'Magnet Pelanggan', emoji: '🧲', rarity: 'rare', type: 'buff', description: '+40% pelanggan 5 menit',
    buffEffect: { stat: 'customer', multiplier: 1.4, durationTicks: 600 } },
  { id: 'buff_customer_big', name: 'Viral Marketing', emoji: '📣', rarity: 'epic', type: 'buff', description: '2x pelanggan selama 2 menit',
    buffEffect: { stat: 'customer', multiplier: 2.0, durationTicks: 240 } },
  { id: 'buff_rep', name: 'Piala Emas', emoji: '🏆', rarity: 'rare', type: 'buff', description: '+1 reputasi/tick selama 3 menit',
    buffEffect: { stat: 'reputation', multiplier: 1.0, durationTicks: 360 } },
  { id: 'buff_money_rain', name: 'Hujan Uang', emoji: '💸', rarity: 'legendary', type: 'buff', description: '+$100/tick selama 2 menit!',
    buffEffect: { stat: 'money_rain', multiplier: 100, durationTicks: 240 } },
  { id: 'buff_double_all', name: 'Dewa Dagang', emoji: '⚡', rarity: 'legendary', type: 'buff', description: '2x SEMUA bonus selama 1 menit!',
    buffEffect: { stat: 'all', multiplier: 2.0, durationTicks: 120 } },
  // New buffs
  { id: 'buff_gem_finder', name: 'Pencari Permata', emoji: '🔮', rarity: 'epic', type: 'buff', description: '+1 gem per penjualan selama 2 menit',
    buffEffect: { stat: 'gem_finder', multiplier: 1.0, durationTicks: 240 } },
  { id: 'buff_xp_boost', name: 'Buku Ilmu', emoji: '📖', rarity: 'rare', type: 'buff', description: '+100% XP pegawai selama 5 menit',
    buffEffect: { stat: 'xp_boost', multiplier: 2.0, durationTicks: 600 } },

  // === COSMETICS ===
  { id: 'cos_store_castle', name: 'Toko Kastil', emoji: '🏰', rarity: 'epic', type: 'cosmetic', description: 'Ikon toko berubah jadi kastil', cosmeticEmoji: '🏰' },
  { id: 'cos_store_rocket', name: 'Toko Roket', emoji: '🚀', rarity: 'rare', type: 'cosmetic', description: 'Ikon toko berubah jadi roket', cosmeticEmoji: '🚀' },
  { id: 'cos_store_rainbow', name: 'Toko Pelangi', emoji: '🌈', rarity: 'rare', type: 'cosmetic', description: 'Ikon toko berubah jadi pelangi', cosmeticEmoji: '🌈' },
  { id: 'cos_store_diamond', name: 'Toko Berlian', emoji: '💎', rarity: 'legendary', type: 'cosmetic', description: 'Ikon toko berubah jadi berlian', cosmeticEmoji: '💎' },
  { id: 'cos_store_ufo', name: 'Toko UFO', emoji: '🛸', rarity: 'epic', type: 'cosmetic', description: 'Ikon toko berubah jadi UFO', cosmeticEmoji: '🛸' },
  { id: 'cos_store_tree', name: 'Toko Pohon', emoji: '🌳', rarity: 'common', type: 'cosmetic', description: 'Ikon toko berubah jadi pohon', cosmeticEmoji: '🌳' },
  { id: 'cos_store_cat', name: 'Toko Kucing', emoji: '🐱', rarity: 'common', type: 'cosmetic', description: 'Ikon toko berubah jadi kucing', cosmeticEmoji: '🐱' },
  { id: 'cos_store_fire', name: 'Toko Api', emoji: '🔥', rarity: 'rare', type: 'cosmetic', description: 'Ikon toko berubah jadi api', cosmeticEmoji: '🔥' },
  { id: 'cos_store_crown', name: 'Toko Mahkota', emoji: '👑', rarity: 'legendary', type: 'cosmetic', description: 'Ikon toko berubah jadi mahkota', cosmeticEmoji: '👑' },
  { id: 'cos_store_dragon', name: 'Toko Naga', emoji: '🐉', rarity: 'legendary', type: 'cosmetic', description: 'Ikon toko berubah jadi naga!', cosmeticEmoji: '🐉' },
  { id: 'cos_store_moon', name: 'Toko Bulan', emoji: '🌙', rarity: 'epic', type: 'cosmetic', description: 'Ikon toko berubah jadi bulan', cosmeticEmoji: '🌙' },
  { id: 'cos_store_star', name: 'Toko Bintang', emoji: '⭐', rarity: 'rare', type: 'cosmetic', description: 'Ikon toko berubah jadi bintang', cosmeticEmoji: '⭐' },
  { id: 'cos_store_snowman', name: 'Toko Manusia Salju', emoji: '⛄', rarity: 'rare', type: 'cosmetic', description: '❄️ WINTER LIMITED — Ikon toko jadi snowman (hanya market musim dingin)', exclusiveSeason: 'winter', cosmeticEmoji: '⛄' },
  { id: 'cos_store_ghost', name: 'Toko Hantu', emoji: '👻', rarity: 'epic', type: 'cosmetic', description: 'Ikon toko berubah jadi hantu!', cosmeticEmoji: '👻' },
  { id: 'cos_store_panda', name: 'Toko Panda', emoji: '🐼', rarity: 'rare', type: 'cosmetic', description: 'Ikon toko berubah jadi panda', cosmeticEmoji: '🐼' },
  { id: 'cos_store_alien', name: 'Toko Alien', emoji: '👽', rarity: 'epic', type: 'cosmetic', description: 'Ikon toko berubah jadi alien', cosmeticEmoji: '👽' },
  { id: 'cos_store_robot', name: 'Toko Robot', emoji: '🤖', rarity: 'rare', type: 'cosmetic', description: 'Ikon toko berubah jadi robot', cosmeticEmoji: '🤖' },
  { id: 'cos_store_unicorn', name: 'Toko Unicorn', emoji: '🦄', rarity: 'legendary', type: 'cosmetic', description: 'Ikon toko berubah jadi unicorn!', cosmeticEmoji: '🦄' },
  // New cosmetics
  { id: 'cos_store_sakura_tree', name: 'Toko Sakura', emoji: '🌸', rarity: 'epic', type: 'cosmetic', description: '🌸 SPRING LIMITED — Ikon toko jadi bunga sakura (hanya market musim semi)', exclusiveSeason: 'spring', cosmeticEmoji: '🌸' },
  { id: 'cos_store_crystal', name: 'Toko Kristal', emoji: '🔮', rarity: 'legendary', type: 'cosmetic', description: 'Ikon toko berubah jadi bola kristal', cosmeticEmoji: '🔮' },
  // v1.6 cosmetics
  { id: 'cos_store_volcano', name: 'Toko Vulkanik', emoji: '🌋', rarity: 'epic', type: 'cosmetic', description: 'Ikon toko berubah jadi gunung berapi', cosmeticEmoji: '🌋' },
  { id: 'cos_store_galaxy', name: 'Toko Galaksi', emoji: '🌌', rarity: 'legendary', type: 'cosmetic', description: 'Ikon toko jadi galaksi spiral', cosmeticEmoji: '🌌' },
  { id: 'cos_store_phoenix', name: 'Toko Phoenix', emoji: '🔥', rarity: 'mythical', type: 'cosmetic', description: '✨ MYTHICAL — Phoenix legendaris', cosmeticEmoji: '🦅' },

  // === TITLES ===
  // Some titles are unlocked via gacha (default). Others require specific conditions
  // and are auto-granted (excluded from gacha pool) — see `unlockCondition` field.
  { id: 'title_boss', name: 'Gelar: Bos Besar', emoji: '🎩', rarity: 'common', type: 'title', description: 'Gelar "Bos Besar" di profil' },
  { id: 'title_tycoon', name: 'Gelar: Tycoon', emoji: '💼', rarity: 'rare', type: 'title', description: 'Gelar "Tycoon" di profil' },
  { id: 'title_legend', name: 'Gelar: Legenda', emoji: '🌟', rarity: 'epic', type: 'title', description: 'Gelar "Legenda" di profil' },
  { id: 'title_god', name: 'Gelar: Dewa Dagang', emoji: '👁️', rarity: 'legendary', type: 'title', description: '🔒 Dapatkan dengan mencapai $1B total earnings.',
    unlockCondition: { description: 'Total earnings ≥ $1.000.000.000', check: (s) => (s.totalEarned || 0) >= 1_000_000_000 } },
  { id: 'title_sultan', name: 'Gelar: Sultan', emoji: '💰', rarity: 'epic', type: 'title', description: '🔒 Punya $1.000.000 cash sekaligus.',
    unlockCondition: { description: 'Money ≥ $1.000.000', check: (s) => (s.money || 0) >= 1_000_000 } },
  { id: 'title_master', name: 'Gelar: Master Retail', emoji: '🏅', rarity: 'rare', type: 'title', description: '🔒 Jual 5.000 item.',
    unlockCondition: { description: 'Items sold ≥ 5.000', check: (s) => (s.itemsSold || 0) >= 5_000 } },
  { id: 'title_emperor', name: 'Gelar: Kaisar', emoji: '🫅', rarity: 'legendary', type: 'title', description: '🔒 Bangun kerajaan 20 cabang.',
    unlockCondition: { description: 'Cabang ≥ 20', check: (s) => (s.branches?.length || 0) >= 20 } },
  { id: 'title_newbie', name: 'Gelar: Pemula', emoji: '🐣', rarity: 'common', type: 'title', description: 'Gelar "Pemula" di profil' },
  { id: 'title_pro', name: 'Gelar: Pro Player', emoji: '🎮', rarity: 'rare', type: 'title', description: 'Gelar "Pro Player" di profil' },
  { id: 'title_whale', name: 'Gelar: Whale', emoji: '🐋', rarity: 'epic', type: 'title', description: '🔒 Habiskan total $500K.',
    unlockCondition: { description: 'Total spent ≥ $500.000', check: (s) => (s.totalSpent || 0) >= 500_000 } },
  // New titles
  { id: 'title_cyber', name: 'Gelar: Cyberpunk', emoji: '🤖', rarity: 'epic', type: 'title', description: 'Gelar "Cyberpunk" di profil' },
  { id: 'title_frozen', name: 'Gelar: Ice King', emoji: '❄️', rarity: 'rare', type: 'title', description: 'Gelar "Ice King" di profil' },
  
  // === SPECIAL ACHIEVEMENT TITLES ===
  { id: 'title_neet', name: 'Gelar: NEET', emoji: '😴', rarity: 'legendary', type: 'title', description: '🔒 Reward 100 jam bermain (auto-grant).',
    unlockCondition: { description: 'Play time ≥ 100 jam', check: (s) => (s.playTimeTicks || 0) >= 360_000 } },
  // v1.6 titles
  { id: 'title_galaxy_lord', name: 'Gelar: Galaxy Lord', emoji: '🌌', rarity: 'legendary', type: 'title', description: '🔒 Capai prestige level 5.',
    unlockCondition: { description: 'Prestige level ≥ 5', check: (s) => (s.prestigeLevel || 0) >= 5 } },
  { id: 'title_phoenix', name: 'Gelar: Phoenix Reborn', emoji: '🔥', rarity: 'epic', type: 'title', description: '🔒 Bangkit dari bangkrut & lakukan prestige pertama.',
    unlockCondition: { description: 'Pernah bangkrut & prestige ≥ 1', check: (s) => !!s.hasBankrupted && (s.prestigeLevel || 0) >= 1 } },
  { id: 'title_artisan', name: 'Gelar: Artisan', emoji: '🎨', rarity: 'rare', type: 'title', description: '🔒 Kumpulkan 25 item gacha berbeda.',
    unlockCondition: { description: 'Inventory unik ≥ 25', check: (s) => new Set(s.gachaInventory || []).size >= 25 } },
  { id: 'title_dragon_lord', name: 'Gelar: Dragon Lord', emoji: '🐉', rarity: 'legendary', type: 'title', description: '🔒 Pakai Tema Naga Api & capai reputasi 500.',
    unlockCondition: { description: 'Punya theme_dragon & reputasi ≥ 500', check: (s) => (s.gachaInventory || []).includes('theme_dragon') && (s.reputation || 0) >= 500 } },

  // === SEASONAL MARKET LIMITED ITEMS ===
  // Spring exclusives
  { id: 'cos_store_cherry', name: 'Toko Bunga Sakura Mekar', emoji: '🌺', rarity: 'legendary', type: 'cosmetic', description: '🌸 SPRING LIMITED — Toko bunga sakura mekar', exclusiveSeason: 'spring', cosmeticEmoji: '🌺' },
  { id: 'title_spring_bloom', name: 'Gelar: Spring Bloom', emoji: '🌷', rarity: 'epic', type: 'title', description: '🌸 SPRING LIMITED — "Spring Bloom"', exclusiveSeason: 'spring' },
  // Summer exclusives
  { id: 'cos_store_sun', name: 'Toko Matahari', emoji: '☀️', rarity: 'epic', type: 'cosmetic', description: '☀️ SUMMER LIMITED — Toko bersinar matahari', exclusiveSeason: 'summer', cosmeticEmoji: '☀️' },
  { id: 'cos_store_palm', name: 'Toko Pohon Kelapa', emoji: '🌴', rarity: 'legendary', type: 'cosmetic', description: '☀️ SUMMER LIMITED — Toko pantai tropis', exclusiveSeason: 'summer', cosmeticEmoji: '🌴' },
  { id: 'title_beach_king', name: 'Gelar: Beach King', emoji: '🏖️', rarity: 'epic', type: 'title', description: '☀️ SUMMER LIMITED — "Beach King"', exclusiveSeason: 'summer' },
  // Autumn exclusives
  { id: 'cos_store_pumpkin', name: 'Toko Labu', emoji: '🎃', rarity: 'epic', type: 'cosmetic', description: '🍂 AUTUMN LIMITED — Toko jadi labu jack-o-lantern', exclusiveSeason: 'autumn', cosmeticEmoji: '🎃' },
  { id: 'cos_store_maple', name: 'Toko Maple', emoji: '🍁', rarity: 'legendary', type: 'cosmetic', description: '🍂 AUTUMN LIMITED — Toko daun maple keemasan', exclusiveSeason: 'autumn', cosmeticEmoji: '🍁' },
  { id: 'title_harvest', name: 'Gelar: Harvest Master', emoji: '🌾', rarity: 'epic', type: 'title', description: '🍂 AUTUMN LIMITED — "Harvest Master"', exclusiveSeason: 'autumn' },
  // Winter exclusives
  { id: 'cos_store_snowflake', name: 'Toko Kepingan Salju', emoji: '❄️', rarity: 'legendary', type: 'cosmetic', description: '❄️ WINTER LIMITED — Toko kristal salju', exclusiveSeason: 'winter', cosmeticEmoji: '❄️' },
  { id: 'cos_store_santa', name: 'Toko Santa', emoji: '🎅', rarity: 'epic', type: 'cosmetic', description: '❄️ WINTER LIMITED — Toko Sinterklas', exclusiveSeason: 'winter', cosmeticEmoji: '🎅' },
  { id: 'title_winter_lord', name: 'Gelar: Winter Lord', emoji: '🧊', rarity: 'epic', type: 'title', description: '❄️ WINTER LIMITED — "Winter Lord"', exclusiveSeason: 'winter' },
];

export const RARITY_CONFIG = {
  common: { color: 'text-muted-foreground', bg: 'bg-muted/50', border: 'border-border', label: 'Common', chance: 0.50 },
  rare: { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30', label: 'Rare', chance: 0.30 },
  epic: { color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30', label: 'Epic', chance: 0.15 },
  legendary: { color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Legendary', chance: 0.05 },
  mythical: { color: 'text-rose-400', bg: 'bg-gradient-to-br from-rose-500/20 via-fuchsia-500/20 to-amber-500/20', border: 'border-rose-400/50', label: '✨ Mythical', chance: 0 },
} as const;

export const GACHA_COST_GEMS = 10;
export const GACHA_COST_MONEY = 5000;
export const GACHA_10X_DISCOUNT = 0.9;

export function rollGacha(): GachaItem {
  const roll = Math.random();
  let rarity: GachaItem['rarity'];
  if (roll < RARITY_CONFIG.legendary.chance) rarity = 'legendary';
  else if (roll < RARITY_CONFIG.legendary.chance + RARITY_CONFIG.epic.chance) rarity = 'epic';
  else if (roll < RARITY_CONFIG.legendary.chance + RARITY_CONFIG.epic.chance + RARITY_CONFIG.rare.chance) rarity = 'rare';
  else rarity = 'common';

  // Exclude season-exclusive items AND items with unlockCondition (those are auto-granted, not rolled)
  const pool = GACHA_ITEMS.filter(i => i.rarity === rarity && !i.exclusiveSeason && !i.unlockCondition);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function rollGachaMulti(count: number): GachaItem[] {
  const results: GachaItem[] = [];
  for (let i = 0; i < count; i++) results.push(rollGacha());
  return results;
}
