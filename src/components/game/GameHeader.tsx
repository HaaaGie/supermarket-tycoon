import { useGame } from '@/game/GameContext';
import { formatMoney, formatNumber, formatGameTime, isNightTime, getSeasonForDay, getSeasonProgress, SEASONS } from '@/game/gameData';
import { GACHA_ITEMS } from '@/game/gachaData';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { ReactNode } from 'react';

function HeaderChip({ tooltip, children, className, style }: { tooltip: ReactNode; children: ReactNode; className: string; style?: React.CSSProperties }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={`cursor-help ${className}`} style={style}>{children}</div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[240px] text-xs leading-relaxed">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

export default function GameHeader() {
  const { state, dispatch } = useGame();
  
  const recentIncome = state.recentIncome || [];
  const incomePerSec = recentIncome.length > 0
    ? recentIncome.reduce((a, b) => a + b, 0) / recentIncome.length
    : 0;
  const isNight = isNightTime(state.gameHour);

  const storeEmoji = state.equippedCosmetic
    ? (GACHA_ITEMS.find(i => i.id === state.equippedCosmetic)?.cosmeticEmoji || '🏪')
    : '🏪';

  const title = state.equippedTitle
    ? GACHA_ITEMS.find(i => i.id === state.equippedTitle)?.name?.replace('Gelar: ', '')
    : null;

  return (
    <div className="bg-card border-b border-border px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{storeEmoji}</span>
          <div>
            <h1 className="font-heading text-xl font-bold text-foreground">{state.storeName}</h1>
            {title && <div className="text-xs text-muted-foreground">~ {title} ~</div>}
          </div>
          {(state.prestigeLevel || 0) > 0 && (
            <HeaderChip
              tooltip={<><b>Level Prestige 👑</b><br/>Setiap prestige memberi bonus permanen yang bisa kamu tukar di tab Prestige.</>}
              className={`text-xs bg-amber-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-bold`}
            >
              👑 P{state.prestigeLevel}
            </HeaderChip>
          )}
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <HeaderChip
            tooltip={<><b>{isNight ? '🌙 Malam' : '☀️ Siang'}</b><br/>Waktu game (1 hari ≈ 12 menit nyata). Toko tutup otomatis pukul 21:00 — pelanggan tidak datang.</>}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${isNight ? 'bg-accent/10' : 'bg-money/10'}`}
          >
            <span>{isNight ? '🌙' : '☀️'}</span>
            <span className="font-heading font-bold text-foreground text-sm">
              {formatGameTime(state.gameHour)}
            </span>
          </HeaderChip>

          <HeaderChip
            tooltip={<><b>💰 Uang</b><br/>Mata uang utama untuk beli stok, rak, pegawai, upgrade, & cabang.<br/><span className="text-muted-foreground">Pendapatan/detik: {incomePerSec >= 0 ? '+' : ''}{formatMoney(incomePerSec)}</span></>}
            className="flex items-center gap-1.5 bg-money/10 px-3 py-1.5 rounded-full"
          >
            <span>💰</span>
            <span className="font-heading font-bold text-money-foreground">{formatMoney(state.money)}</span>
            <span className="text-xs text-muted-foreground">
              ({incomePerSec > 0 ? '+' : ''}{formatMoney(incomePerSec)}/s)
            </span>
          </HeaderChip>
          
          <HeaderChip
            tooltip={<><b>⭐ Reputasi</b><br/>Naik dari penjualan & event positif, turun dari kejadian buruk. Reputasi tinggi menarik lebih banyak pelanggan & membuka upgrade premium.<br/><span className="text-muted-foreground">Cap maksimum: 1.000.000</span></>}
            className="flex items-center gap-1.5 bg-reputation/10 px-3 py-1.5 rounded-full"
          >
            <span>⭐</span>
            <span className="font-heading font-bold text-reputation">{formatNumber(state.reputation)}</span>
          </HeaderChip>

          <HeaderChip
            tooltip={<><b>💎 Berlian (Gems)</b><br/>Mata uang premium untuk Gacha 🎰, Market Limited 🌸, & item eksklusif. Didapat dari achievement, side job, dan event tertentu.</>}
            className="flex items-center gap-1.5 bg-purple-500/10 px-3 py-1.5 rounded-full"
          >
            <span>💎</span>
            <span className="font-heading font-bold text-purple-500 dark:text-purple-400 text-sm">{formatNumber(state.gems || 0)}</span>
          </HeaderChip>

          <HeaderChip
            tooltip={<><b>📅 Hari ke-{state.day}</b><br/>1 hari game = ~12 menit nyata. Setiap pergantian hari memberi summary & trigger event musiman.</>}
            className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full"
          >
            <span>📅</span>
            <span className="text-sm font-medium text-foreground">Hari {state.day}</span>
          </HeaderChip>

          {(() => {
            const season = getSeasonForDay(state.day);
            const info = SEASONS[season];
            const prog = getSeasonProgress(state.day);
            return (
              <HeaderChip
                tooltip={<><b>{info.emoji} Musim {info.name}</b><br/>{info.description}<br/><span className="text-muted-foreground">Hari {prog.current}/{prog.total} di musim ini. Item musiman bisa kamu beli di Market Limited 🌸.</span></>}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-card"
                style={{ borderColor: `hsl(${info.accentHue} 70% 60% / 0.4)`, background: `hsl(${info.accentHue} 70% 60% / 0.08)` }}
              >
                <span>{info.emoji}</span>
                <span className="text-sm font-medium text-foreground">{info.name}</span>
                <span className="text-[10px] text-muted-foreground">D{prog.current}/{prog.total}</span>
              </HeaderChip>
            );
          })()}

          <HeaderChip
            tooltip={<><b>👥 Total Pelanggan Dilayani</b><br/>Jumlah kumulatif pelanggan yang sudah selesai berbelanja sejak awal save. Stat ini digunakan untuk beberapa achievement & gelar terkunci.</>}
            className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-full"
          >
            <span>👥</span>
            <span className="text-sm font-medium text-foreground">{formatNumber(state.customersServed)}</span>
          </HeaderChip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                onClick={() => dispatch({ type: 'SKIP_DAY' })}
                className="text-xs font-heading"
              >
                ⏭️ Skip
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">Lewati ke hari berikutnya — semua pendapatan pasif tetap masuk.</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant={state.shopOpen ? 'outline' : 'secondary'}
                onClick={() => dispatch({ type: state.shopOpen ? 'CLOSE_SHOP' : 'OPEN_SHOP' })}
                className="text-xs font-heading"
              >
                {state.shopOpen ? '🔒 Tutup Toko' : '🔓 Buka Toko'}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs max-w-[220px]">
              {state.shopOpen ? 'Tutup toko sementara — pelanggan berhenti datang, tapi pegawai tetap dibayar.' : 'Buka toko agar pelanggan kembali masuk dan belanja.'}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {(state.activeBuffs || []).length > 0 && (
        <div className="max-w-6xl mx-auto mt-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-muted-foreground">⚡ Buff:</span>
            {(state.activeBuffs || []).map((buff, i) => {
              const item = GACHA_ITEMS.find(gi => gi.id === buff.itemId);
              return item ? (
                <span key={i} className="text-xs bg-accent/10 px-2 py-0.5 rounded-full text-foreground">
                  {item.emoji} {Math.ceil(buff.ticksLeft)}s
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      {!state.shopOpen && (
        <div className="max-w-6xl mx-auto mt-2">
          <div className="bg-accent/20 border border-accent/30 rounded-lg px-3 py-2 text-center text-sm">
            🌙 Toko ditutup — pelanggan tidak datang. Buka kembali atau tekan ⏭️ Skip untuk melompat ke hari berikutnya.
          </div>
        </div>
      )}
    </div>
  );
}
