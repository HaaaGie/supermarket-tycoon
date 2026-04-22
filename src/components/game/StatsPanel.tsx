import { useGame } from '@/game/GameContext';
import { formatMoney, EMPLOYEE_TYPES, BRANCH_TYPES } from '@/game/gameData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ACHIEVEMENT_NAMES: Record<string, string> = {
  first_sale: '🎉 Penjualan Pertama',
  hundred_sales: '💯 100 Item Terjual',
  thousand_sales: '🏆 1000 Item Terjual',
  ten_thousand_sales: '🔥 10.000 Item Terjual',
  first_employee: '🤝 Pegawai Pertama',
  team_of_5: '👥 Tim 5 Orang',
  team_of_10: '🏢 Tim 10 Orang',
  all_employee_types: '🎭 Semua Jenis Pegawai',
  rich_1k: '💰 $1K',
  rich_10k: '💎 $10K',
  rich_100k: '👑 $100K',
  rich_500k: '🤑 $500K',
  rich_1m: '💵 $1M Cash',
  rep_50: '⭐ Reputasi 50',
  rep_200: '🌟 Reputasi 200',
  rep_500: '🌠 Reputasi 500',
  rep_max: '🏅 Reputasi 1.000',
  rep_legend: '💫 Reputasi 100K — Legenda',
  rep_god: '👑 Reputasi 1M — Dewa Pasar',
  day_7: '📅 Seminggu Berjalan',
  day_30: '📅 Sebulan Berjalan',
  day_100: '📅 100 Hari',
  day_365: '📅 Setahun!',
  full_shelves: '🛒 4 Rak Penuh',
  shelves_10: '🛒 10 Rak',
  shelves_20: '🛒 20 Rak',
  first_branch: '🏪 Cabang Pertama',
  empire: '🏢 Kerajaan 5 Cabang',
  ten_branches: '🏙️ 10 Cabang',
  twenty_branches: '🌆 20 Cabang',
  fifty_branches: '🌍 50 Cabang',
  max_employee: '🎓 Pegawai Level Max',
  all_max_employees: '🏆 Semua Pegawai Max',
  millionaire: '💎 Jutawan ($1M)',
  billionaire: '💰 Milyarder ($1B)',
  first_prestige: '👑 Prestige Pertama',
  prestige_5: '🔄 Prestige 5',
  prestige_10: '♻️ Prestige 10',
  gacha_collector: '🎰 Kolektor (10 Item)',
  gacha_collector_50: '🎰 Kolektor Pro (50 Item)',
  legendary_pull: '✨ Pull Legendary!',
  gem_hoarder: '💎 100 Gems!',
  gem_master: '💎 500 Gems!',
  gem_god: '💎 1000 Gems!',
  stock_hoarder: '📦 Stok 1000 Total',
  speed_demon: '⚡ Speed 5x',
  profit_king: '📈 Profit 5x',
  bankrupt_survivor: '😱 Pernah Bangkrut',
  night_trader: '🌙 Jual 500 Saat Malam',
  unemployment: '😴 Pengangguran (100 Jam)',
  early_bird: '🐦 Buka Toko Jam 6 Pagi',
  no_shelf_profit: '🧠 $1K Tanpa Rak',
  full_stock_all: '📦 Semua Rak Penuh',
  event_master: '🎲 50 Event Dihadapi',
  side_hustle: '💼 5 Side Job Selesai',
  big_spender: '💸 Habis $500K',
  market_timer: '📊 Beli Saat Harga Rendah',
};

export default function StatsPanel() {
  const { state, multipliers } = useGame();

  const dailySalary = state.employees.reduce((sum, emp) => {
    const type = EMPLOYEE_TYPES.find(e => e.id === emp.typeId);
    return sum + (type?.baseSalary || 0);
  }, 0);

  const branchIncome = state.branches.reduce((sum, branch) => {
    const type = BRANCH_TYPES.find(b => b.id === branch.typeId);
    return sum + (type ? type.incomePerTick * branch.level : 0);
  }, 0);

  const playTimeHours = Math.floor((state.playTimeTicks || 0) / 3600);
  const playTimeMinutes = Math.floor(((state.playTimeTicks || 0) % 3600) / 60);

  const stats = [
    { label: 'Total Pendapatan', value: formatMoney(state.totalEarned), emoji: '💵' },
    { label: 'Total Pengeluaran', value: formatMoney(state.totalSpent), emoji: '💸' },
    { label: 'Profit Bersih', value: formatMoney(state.totalEarned - state.totalSpent), emoji: '📊' },
    { label: 'Pelanggan Dilayani', value: state.customersServed.toLocaleString(), emoji: '👥' },
    { label: 'Item Terjual', value: state.itemsSold.toLocaleString(), emoji: '📦' },
    { label: 'Jumlah Rak', value: `${state.shelves.length}/${state.maxShelves}`, emoji: '🛒' },
    { label: 'Jumlah Pegawai', value: state.employees.length.toString(), emoji: '🧑‍💼' },
    { label: 'Gaji Harian', value: formatMoney(dailySalary), emoji: '💰' },
    { label: 'Jumlah Cabang', value: state.branches.length.toString(), emoji: '🏬' },
    { label: 'Income Cabang', value: `${formatMoney(branchIncome)}/s`, emoji: '🏢' },
    { label: 'Reputasi', value: Math.floor(state.reputation).toString(), emoji: '⭐' },
    { label: 'Hari ke-', value: state.day.toString(), emoji: '📅' },
    { label: 'Gems', value: (state.gems || 0).toString(), emoji: '💎' },
    { label: 'Item Gacha', value: (state.gachaInventory || []).length.toString(), emoji: '🎰' },
    { label: 'Profit Multiplier', value: `${multipliers.profitMultiplier.toFixed(1)}x`, emoji: '📈' },
    { label: 'Speed Multiplier', value: `${multipliers.sellSpeedMultiplier.toFixed(1)}x`, emoji: '⚡' },
    { label: 'Waktu Main', value: `${playTimeHours}j ${playTimeMinutes}m`, emoji: '⏱️' },
    { label: 'Event Dihadapi', value: (state.eventsEncountered || 0).toString(), emoji: '🎲' },
    { label: 'Night Sales', value: (state.nightSales || 0).toString(), emoji: '🌙' },
    { label: 'Side Jobs Done', value: (state.sideJobsCompleted || 0).toString(), emoji: '💼' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <span>📊</span> Statistik Toko
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {stats.map(stat => (
              <div key={stat.label} className="p-3 rounded-lg bg-muted/50 text-center">
                <span className="text-2xl">{stat.emoji}</span>
                <div className="font-heading font-bold text-lg text-foreground mt-1">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <span>🏅</span> Achievement ({state.achievements?.length || 0}/{Object.keys(ACHIEVEMENT_NAMES).length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(ACHIEVEMENT_NAMES).map(([id, name]) => {
              const unlocked = state.achievements?.includes(id);
              return (
                <div
                  key={id}
                  className={`p-2 rounded-lg text-center text-sm ${
                    unlocked ? 'bg-primary/10 border border-primary/30 text-foreground' : 'bg-muted/30 text-muted-foreground opacity-50'
                  }`}
                >
                  {unlocked ? '✅' : '🔒'} {name}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
