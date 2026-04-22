import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';

interface Step {
  emoji: string;
  title: string;
  body: string;
  tip?: string;
}

const STEPS: Step[] = [
  {
    emoji: '🏪',
    title: 'Selamat Datang di Supermarket Incremental!',
    body: 'Kamu akan membangun jaringan supermarket dari kios kecil sampai kerajaan retail global. Tidak ada batas waktu — main santai sambil cuan jalan terus!',
    tip: 'Game ini idle-friendly: kamu tetap dapat penghasilan walaupun nggak aktif klik.',
  },
  {
    emoji: '📦',
    title: 'Step 1 — Beli Stok Barang',
    body: 'Buka tab "📦 Stok" dan beli produk dari pemasok. Setiap produk punya harga beli, harga jual, dan margin keuntungan berbeda.',
    tip: 'Mulai dari produk murah dulu (Permen, Roti) sampai modal cukup untuk barang premium.',
  },
  {
    emoji: '🛒',
    title: 'Step 2 — Taruh di Rak',
    body: 'Pindah ke tab "🛒 Rak" dan letakkan barang yang sudah kamu beli ke rak. Pelanggan baru akan mulai datang dan membeli!',
    tip: 'Barang dengan stok terbanyak yang belum di-shelf akan di-tandai ⭐ — pilih itu dulu untuk efisiensi.',
  },
  {
    emoji: '👥',
    title: 'Step 3 — Hire Pegawai',
    body: 'Tab "👥 Pegawai" — sewa kasir, stocker, dan manager untuk otomatisasi. Mereka kerja sendiri walaupun kamu lagi AFK.',
    tip: 'Pegawai naik level seiring waktu dan jadi lebih efisien.',
  },
  {
    emoji: '🏢',
    title: 'Step 4 — Ekspansi Cabang',
    body: 'Setelah cukup reputasi & uang, beli cabang baru di tab "🏢 Cabang". Cabang menghasilkan income pasif. Maksimal 100 cabang!',
    tip: 'Cabang diurutkan dari yang termurah. Food Court & Airport Shop adalah end-game!',
  },
  {
    emoji: '⬆️',
    title: 'Step 5 — Upgrade & Side Jobs',
    body: 'Tab "⬆️ Upgrade" untuk meningkatkan kapasitas, kecepatan, dan profit. Tab "💼 Side Job" untuk income sampingan jangka pendek.',
    tip: 'Upgrade prioritaskan kapasitas rak & jumlah pelanggan dulu.',
  },
  {
    emoji: '🎰',
    title: 'Gacha & Koleksi',
    body: 'Kumpulkan Gem dari menyelesaikan hari, lalu tarik di tab "🎰 Gacha". Dapatkan tema GUI, buff, cosmetic toko, dan title langka!',
    tip: 'Tier rarity: Common → Rare → Epic → Legendary → ✨ Mythical (cuma bisa dari achievement spesial).',
  },
  {
    emoji: '👑',
    title: 'Prestige untuk Bonus Permanen',
    body: 'Kalau game terasa lambat, prestige di tab "👑 Prestige" untuk reset progress + bonus permanen yang bikin run berikutnya jauh lebih cepat.',
    tip: 'Jangan prestige terlalu cepat — kumpulkan reputasi dulu untuk bonus maksimal.',
  },
  {
    emoji: '🏆',
    title: 'Achievement & Title',
    body: 'Lihat tab "📊 Statistik" untuk daftar achievement. Beberapa achievement spesial butuh metode unik — contoh: 100 jam playtime untuk title & tema NEET!',
    tip: 'Cek update log secara berkala untuk fitur baru. Selamat berdagang! 🛒💰',
  },
];

const TUTORIAL_KEY = 'supermarket_tutorial_seen_v1';

export default function Tutorial({ trigger, autoOpenForNewPlayer = false }: { trigger?: React.ReactNode; autoOpenForNewPlayer?: boolean }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (autoOpenForNewPlayer && !localStorage.getItem(TUTORIAL_KEY)) {
      setOpen(true);
    }
  }, [autoOpenForNewPlayer]);

  const handleClose = (next: boolean) => {
    setOpen(next);
    if (!next) {
      localStorage.setItem(TUTORIAL_KEY, '1');
      setStep(0);
    }
  };

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1.5">
            📖 Tutorial
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg flex items-center gap-2">
            <span className="text-2xl">{current.emoji}</span>
            {current.title}
          </DialogTitle>
        </DialogHeader>

        {/* Progress bar */}
        <div className="flex gap-1 my-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <div className="space-y-3 py-2">
          <p className="text-sm text-foreground/90 leading-relaxed">{current.body}</p>
          {current.tip && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-xs text-foreground/80">
              <span className="font-bold text-primary">💡 Tips: </span>
              {current.tip}
            </div>
          )}
          <p className="text-[11px] text-muted-foreground text-center">
            Langkah {step + 1} dari {STEPS.length}
          </p>
        </div>

        <DialogFooter className="flex flex-row justify-between sm:justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleClose(false)}
            className="text-xs text-muted-foreground"
          >
            Skip
          </Button>
          <div className="flex gap-2">
            {!isFirst && (
              <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>
                ← Prev
              </Button>
            )}
            {isLast ? (
              <Button size="sm" onClick={() => handleClose(false)}>
                🎮 Mulai Main!
              </Button>
            ) : (
              <Button size="sm" onClick={() => setStep(step + 1)}>
                Next →
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
