import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LogEntry {
  version: string;
  date: string;
  title: string;
  changes: { type: 'feat' | 'fix' | 'balance' | 'theme'; text: string }[];
}

const TYPE_BADGE: Record<string, string> = {
  feat: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
  fix: 'bg-red-500/15 text-red-500 border-red-500/30',
  balance: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
  theme: 'bg-purple-500/15 text-purple-500 border-purple-500/30',
};

const TYPE_LABEL: Record<string, string> = {
  feat: 'BARU',
  fix: 'FIX',
  balance: 'BALANCE',
  theme: 'TEMA',
};

const UPDATE_LOGS: LogEntry[] = [
  {
    version: 'v2.4',
    date: '2026-04-27',
    title: '🗄️ Players Database + Cooldown Harga 30s',
    changes: [
      { type: 'feat', text: '🗄️ DATABASE PEMAIN! Admin Panel kini punya tab "Players Database" — lihat semua pemain yang pernah login (email, nama, hari tertinggi, total uang, item terjual, prestige, reputasi). Berguna untuk tugas database / monitoring komunitas.' },
      { type: 'feat', text: '📧 Email pemain otomatis tersimpan ke Lovable Cloud setiap kali login (Google atau Email/Password).' },
      { type: 'balance', text: '⏱️ Cooldown ubah harga jual rak dipangkas dari 3 menit → 30 detik. Tetap mencegah spam tweak, tapi jauh lebih nyaman saat balancing.' },
      { type: 'fix', text: 'Polish minor pada tampilan admin & sinkronisasi leaderboard saat pemain baru pertama kali login.' },
    ],
  },
  {
    version: 'v2.3',
    date: '2026-04-20',
    title: '📱 Mobile App + Daily Bonus + Theme Fix Permanent',
    changes: [
      { type: 'feat', text: '📱 GAME BISA DI-INSTALL! Tombol "Install App" muncul di menu — install langsung di Android/Desktop Chrome/Edge tanpa Play Store. iPhone: Share → Add to Home Screen.' },
      { type: 'feat', text: '🤖 SUPPORT APK ANDROID via Capacitor! Build APK sendiri (lihat README) — APK akan AUTO-UPDATE setiap kali game di-publish ulang di Lovable. Tetap berfungsi selamanya.' },
      { type: 'feat', text: '🎁 DAILY LOGIN BONUS! Klaim hadiah tiap 20 jam — streak bonus 1-7 hari. Hari ke-7 = 4x lipat reward!' },
      { type: 'feat', text: '💤 OFFLINE REWARD! Dapat uang otomatis berdasarkan waktu kamu tidak main (cap 8 jam, scaling dengan prestige).' },
      { type: 'fix', text: '🛠️ FIX TOTAL bug tema "berganti ke Frostbite". Sekarang MainMenu reset SEMUA: CSS vars, style tags, class theme-card/glow, partikel ambient, flash overlays. Tidak akan menempel lagi.' },
      { type: 'feat', text: 'PWA manifest lengkap: ikon 512x512 baru, splash screen color, standalone display mode, status bar styling.' },
    ],
  },
  {
    version: 'v2.2',
    date: '2026-04-20',
    title: '⭐ Cap Reputasi 1M, Tooltip Header & Theme Cleanup',
    changes: [
      { type: 'feat', text: 'CAP REPUTASI dinaikkan 1.000 → 1.000.000! Tampilan otomatis disingkat: 1K, 10K, 1M, 1B (sama untuk gems & pelanggan).' },
      { type: 'feat', text: '2 achievement baru: 💫 Reputasi 100K (Legenda) & 👑 Reputasi 1M (Dewa Pasar).' },
      { type: 'feat', text: 'TOOLTIP di header — hover 💎 berlian, ⭐ reputasi, 👥 pelanggan, 🌸 musim, 💰 uang, 📅 hari, 🌙/☀️ waktu, dan tombol-tombol untuk lihat penjelasan singkat.' },
      { type: 'feat', text: 'Login Google sekarang force "select_account" — wajib pilih & verifikasi akun Google sebelum masuk. Setiap login juga otomatis tercatat di leaderboard.' },
      { type: 'fix', text: '🛠️ Fix bug tema "menempel" (sering ke Frostbite Aurora) saat balik ke menu lalu masuk lagi — sekarang semua CSS variable, style tag, & class tema dibersihkan total.' },
      { type: 'balance', text: 'Progress bar Side Job sekarang ditampilkan PERSEN bulat (1% s/d 100%) — tidak ada desimal berantakan lagi.' },
      { type: 'fix', text: 'Password leaked-check (HIBP) diaktifkan untuk akun email/password agar lebih aman.' },
    ],
  },
  {
    version: 'v2.1',
    date: '2026-04-19',
    title: '🏷️ Conditional Titles & Mythic GUI Overhaul',
    changes: [
      { type: 'feat', text: 'GELAR KONDISIONAL 🔒 — beberapa gelar (Sultan, Master Retail, Kaisar, Whale, Dewa Dagang, Galaxy Lord, Phoenix Reborn, Artisan, Dragon Lord) sekarang DI-AUTO GRANT saat kondisinya terpenuhi (bukan dari gacha lagi). Cek deskripsi item di inventori untuk syaratnya!' },
      { type: 'theme', text: 'Tema Royal 👑 dipromosi jadi MYTHICAL! GUI baru: gradient teks merah-emas, mahkota berkilau, shimmer royal, light-mode jauh lebih terbaca (cream + maroon contrast tinggi)' },
      { type: 'theme', text: 'Tema Naga Api 🐉 light-mode di-redesign: parchment hangat + glow emas-oranye, gradient teks merah→emas, mirip semangat dark-mode tapi lebih cerah' },
      { type: 'theme', text: 'Sakura Eternal 🌸, Solar Eclipse 🌞, Harvest King 🍁, Frostbite Aurora 🧊 sekarang punya GUI mythic ramai: gradient teks 3-warna, partikel ambient (kelopak/api/daun/salju), flash aura periodik, animasi card khas' },
      { type: 'fix', text: 'Roll gacha tidak akan lagi memberi gelar yang seharusnya didapat dari kondisi tertentu' },
    ],
  },
  {
    version: 'v2.0',
    date: '2026-04-19',
    title: '🌸 Seasonal Limited Market & QoL Polish',
    changes: [
      { type: 'feat', text: 'MARKET LIMITED 🌸 — tab baru yang menjual item eksklusif per musim. Spring=Sakura, Summer=Tropical, Autumn=Harvest, Winter=Frost. Item ganti otomatis tiap pergantian musim!' },
      { type: 'feat', text: '4 tema MYTHICAL baru eksklusif market: Sakura Eternal 🌸 (spring), Solar Eclipse 🌞 (summer), Harvest King 🍁 (autumn), Frostbite Aurora 🧊 (winter)' },
      { type: 'feat', text: 'Tema Sakura, Autumn, & Winter sekarang hanya bisa didapat di Market Limited (tidak lagi muncul di gacha biasa)' },
      { type: 'feat', text: 'Cosmetic & Title eksklusif baru per musim: 🌺🌷 Spring, ☀️🌴🏖️ Summer, 🎃🍁🌾 Autumn, ❄️🎅🧊 Winter' },
      { type: 'feat', text: 'Inventori sekarang otomatis di-sort dari rarity TERTINGGI (Mythical) ke terendah (Common)' },
      { type: 'balance', text: 'Cooldown 3 menit (real-time) saat ubah harga jual rak — harus strategis pilih harga, tidak bisa tweak terus-menerus' },
      { type: 'fix', text: 'Item limited cuma bisa dibeli 1x per musim, dengan validasi musim untuk mencegah eksploit' },
    ],
  },
  {
    version: 'v1.9',
    date: '2026-04-19',
    title: '✨ Polish Sidejob, Mythic Dragon FX & Bug Fix Toko',
    changes: [
      { type: 'fix', text: 'Progress sidejob ditampilkan rapi (1 desimal, mis. "0.3/21" bukan "0.3606954.../21")' },
      { type: 'balance', text: 'Durasi sidejob -18% lebih cepat selesai' },
      { type: 'balance', text: 'Reward uang sidejob +25% (gems tetap sama)' },
      { type: 'fix', text: 'Hapus 4x speed saat toko ditutup — waktu sekarang berjalan normal (1x), pelanggan tidak datang. Pakai ⏭️ Skip kalau mau lompat hari' },
      { type: 'theme', text: 'Mythic Dragon 🐉 sekarang punya efek unik: ambient embers melayang dari sisi kiri/kanan layar + flash "dragon roar" emas tiap ~12 detik (efek subtle, tidak menyilaukan)' },
      { type: 'fix', text: 'Beberapa polish minor pada Quality of Life: sidejob progress lebih intuitif, indikator toko ditutup lebih informatif' },
    ],
  },
  {
    version: 'v1.8',
    date: '2026-04-18',
    title: '🗑️ Hapus Rak/Cabang, Sidejob Realistis & Polish Audio',
    changes: [
      { type: 'feat', text: 'Tombol HAPUS RAK 🗑️ — refund 50% harga beli + stok dikembalikan ke gudang otomatis' },
      { type: 'feat', text: 'Tombol JUAL CABANG 🗑️ — refund 50% dari total investasi (harga beli + semua upgrade)' },
      { type: 'fix', text: 'Sidejob progress bar sekarang berjalan PAS sesuai durasi — kalau timer 84 menit, progressnya selesai tepat di menit ke-84 (bukan terlalu cepat lagi)' },
      { type: 'balance', text: 'Random event muncul lebih jarang (0.4% → 0.18% per tick) supaya tidak terlalu spammy, choice event juga dikurangi (0.2% → 0.09%)' },
      { type: 'feat', text: 'Setiap event sekarang punya LAGU BERBEDA: cheap_supplier (cheery), inspection (tense), gem_rain (magical), employee_party (party), holiday (upbeat), dll — total 5 melodi event unik' },
      { type: 'theme', text: 'Tema Dragon 🐉 di-redesign: tidak lagi ada naga gede mencolok di depan card. Sekarang ada naga halus di sisi kiri/kanan card + naga vertikal samar di edge layar — lebih elegan, less eye-strain' },
      { type: 'theme', text: 'Glow & breath aura tema Dragon dikurangi intensitasnya supaya tidak menyilaukan tapi tetap terasa "mythical"' },
      { type: 'fix', text: 'Konfirmasi dialog sebelum hapus rak/cabang biar tidak salah klik' },
    ],
  },
  {
    version: 'v1.7',
    date: '2026-04-18',
    title: '🌸 Musim, Produk Baru & Polish UI',
    changes: [
      { type: 'feat', text: 'Sistem MUSIM: Spring 🌸 / Summer ☀️ / Autumn 🍂 / Winter ❄️ — tiap 30 hari ganti otomatis' },
      { type: 'feat', text: 'Tiap musim boost produk & kategori tertentu (+25% s/d +60% sell speed & +20% revenue)' },
      { type: 'feat', text: '14 produk baru: Buket Bunga, Madu, Sunscreen, Kelapa, Nanas, Labu, Sirup Maple, Jamur, Cokelat Panas, Kado, Roti Jahe, Sushi, Macaron, Energy Drink' },
      { type: 'feat', text: 'Indikator musim di header dengan tooltip & countdown hari musim' },
      { type: 'fix', text: 'Bug GUI: dialog (Admin Panel, Settings, dll) tidak lagi pindah-pindah random saat tema aktif — Radix overlay sekarang di-exclude dari .theme-card' },
      { type: 'theme', text: 'Tutorial & Update Log juga tidak lagi terkena efek transform tema' },
      { type: 'balance', text: 'Upgrade Shop redesign: grid 4-kolom compact, sort otomatis (affordable→locked→maxed), tooltip on hover, filter "Sembunyikan Max", counter dimiliki/total' },
      { type: 'theme', text: 'Notifikasi otomatis saat musim berubah dengan deskripsi boost' },
    ],
  },
  {
    version: 'v1.6',
    date: '2026-04-17',
    title: '🌌 Content Explosion — Themes, Shelves & QoL',
    changes: [
      { type: 'theme', text: '9 tema baru: Galaxy, Volcano, Emerald, Pastel, Monochrome, Steampunk, Aurora, Desert + Dragon (Mythical 🔥)' },
      { type: 'theme', text: 'Setiap tema baru punya GUI styling unik (border, animasi, glow) sesuai rarity-nya' },
      { type: 'feat', text: '3 rak baru: Holo-Display, Brankas Premium, Quantum Shelf (cap 15!)' },
      { type: 'feat', text: '4 pegawai baru: Barista, Tukang Daging, Data Analyst, In-store Influencer' },
      { type: 'feat', text: '6 upgrade baru: Drive-Thru, Maskot, Crypto Pay, Drone Delivery, Penthouse, Aplikasi Pegawai' },
      { type: 'feat', text: '3 cabang baru: Mini Mart SPBU, Kios Wisata, Space Station Outlet 🚀 (urutan otomatis dari termurah)' },
      { type: 'feat', text: '5 prestige bonus baru: Gem Magnet, Franchise King, Mentor, Logistik, Lucky Spinner' },
      { type: 'feat', text: 'Cosmetic & title baru: Phoenix (Mythical), Galaxy Lord, Dragon Lord, Artisan, dll' },
      { type: 'balance', text: 'Pegawai diurutkan dari gaji termurah (Cleaner $40) ke termahal (Manager $200+)' },
    ],
  },
  {
    version: 'v1.5',
    date: '2026-04-17',
    title: '✨ Mythical Tier & Royal Glow-Up',
    changes: [
      { type: 'theme', text: 'Tema Royal sekarang punya nuansa merah maroon + emas dengan shimmer kerajaan & mahkota berdenyut' },
      { type: 'theme', text: 'Tema Pengangguran naik ke rarity ✨ MYTHICAL — efek unik: Z mengambang ambient, body bernafas, partikel klik melayang malas' },
      { type: 'feat', text: 'Tier rarity baru: Mythical (warna pelangi rose-fuchsia-amber)' },
      { type: 'feat', text: 'Update Log & Tutorial untuk pemain baru di Main Menu' },
    ],
  },
  {
    version: 'v1.4',
    date: '2026-04-16',
    title: '🏆 Achievement Expansion',
    changes: [
      { type: 'feat', text: '30+ achievement baru dengan reward khusus (NEET title, Mythical theme, dll)' },
      { type: 'feat', text: 'Achievement Unemployment: butuh 100 jam playtime untuk title & tema khusus' },
      { type: 'feat', text: 'Tracking baru: playtime, night sales, events encountered, side jobs completed' },
      { type: 'theme', text: 'Semua tema legendary dapat efek klik + GUI animation berdasarkan rarity' },
    ],
  },
  {
    version: 'v1.3',
    date: '2026-04-15',
    title: '🏢 New Branches & Smart Inventory',
    changes: [
      { type: 'feat', text: 'Cabang baru: Food Court ($750K) & Airport Shop ($2M)' },
      { type: 'balance', text: 'Cabang dibatasi maksimal 100 unit' },
      { type: 'feat', text: 'Rekomendasi rak pintar: barang stok terbanyak & belum di-shelf di-prioritaskan ⭐' },
      { type: 'feat', text: 'Filter inventori gacha berdasarkan tipe (Tema/Buff/Cosmetic/Title)' },
      { type: 'fix', text: 'Tema Midnight & Retro: kontras light/dark mode diperbaiki' },
    ],
  },
  {
    version: 'v1.2',
    date: '2026-04-10',
    title: '☁️ Cloud Save & Leaderboard',
    changes: [
      { type: 'feat', text: 'Login Google + 3 save slot di cloud' },
      { type: 'feat', text: 'Leaderboard global berdasarkan total earned, prestige, hari' },
      { type: 'feat', text: 'Export/Import save ke JSON di Settings' },
      { type: 'feat', text: 'Side jobs untuk income tambahan' },
    ],
  },
  {
    version: 'v1.1',
    date: '2026-04-05',
    title: '🎰 Gacha System',
    changes: [
      { type: 'feat', text: 'Sistem gacha dengan 4 rarity: Common/Rare/Epic/Legendary' },
      { type: 'feat', text: '40+ item: tema, buff, cosmetic toko, dan title' },
      { type: 'feat', text: 'Tarik 1x atau 10x dengan diskon 10%' },
      { type: 'feat', text: 'Mata uang Gem dari menyelesaikan hari' },
    ],
  },
  {
    version: 'v1.0',
    date: '2026-04-01',
    title: '🚀 Initial Release',
    changes: [
      { type: 'feat', text: 'Core gameplay: kelola rak, stok, pelanggan, dan pegawai' },
      { type: 'feat', text: 'Sistem Prestige untuk reset dengan bonus permanen' },
      { type: 'feat', text: 'Random events & choice events tiap hari' },
      { type: 'feat', text: 'Background music & SFX yang bisa diatur' },
    ],
  },
];

export const LATEST_VERSION = UPDATE_LOGS[0].version;

export default function UpdateLog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1.5">
            📋 Update Log <span className="text-xs text-muted-foreground">{LATEST_VERSION}</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl flex items-center gap-2">
            📋 Update Log
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
              Latest: {LATEST_VERSION}
            </span>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[65vh] pr-4">
          <div className="space-y-6">
            {UPDATE_LOGS.map((log, i) => (
              <div key={log.version} className="relative">
                {i === 0 && (
                  <div className="absolute -left-1 -top-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground shadow-md">
                    NEW
                  </div>
                )}
                <div className="border-l-2 border-primary/40 pl-4 space-y-2">
                  <div className="flex items-baseline justify-between flex-wrap gap-2">
                    <h3 className="font-heading font-bold text-base text-foreground">
                      {log.version} — {log.title}
                    </h3>
                    <span className="text-xs text-muted-foreground">{log.date}</span>
                  </div>
                  <ul className="space-y-1.5">
                    {log.changes.map((c, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 mt-0.5 ${TYPE_BADGE[c.type]}`}>
                          {TYPE_LABEL[c.type]}
                        </span>
                        <span className="text-foreground/90">{c.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
            <p className="text-xs text-center text-muted-foreground pt-2 pb-4">
              Terima kasih sudah bermain Supermarket Incremental! 🛒💰
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
