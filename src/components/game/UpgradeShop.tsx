import { useGame } from '@/game/GameContext';
import { UPGRADES, getUpgradeCost, formatMoney } from '@/game/gameData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useState, useMemo } from 'react';

const CATEGORIES = [
  { id: 'all', label: 'Semua', emoji: '🏷️' },
  { id: 'store', label: 'Toko', emoji: '🏪' },
  { id: 'marketing', label: 'Marketing', emoji: '📢' },
  { id: 'tech', label: 'Teknologi', emoji: '💻' },
  { id: 'luxury', label: 'Mewah', emoji: '👑' },
  { id: 'employee', label: 'Pegawai', emoji: '👥' },
];

export default function UpgradeShop() {
  const { state, dispatch } = useGame();
  const [selectedCat, setSelectedCat] = useState('all');
  const [hideMaxed, setHideMaxed] = useState(false);

  const filtered = useMemo(() => {
    let list = selectedCat === 'all' ? UPGRADES : UPGRADES.filter(u => u.category === selectedCat);
    if (hideMaxed) list = list.filter(u => (state.upgrades[u.id] || 0) < u.maxLevel);
    // Sort: affordable & unlocked first, then locked, then maxed last
    return [...list].sort((a, b) => {
      const aLvl = state.upgrades[a.id] || 0;
      const bLvl = state.upgrades[b.id] || 0;
      const aMax = aLvl >= a.maxLevel;
      const bMax = bLvl >= b.maxLevel;
      const aLocked = (a.requiredReputation || 0) > state.reputation;
      const bLocked = (b.requiredReputation || 0) > state.reputation;
      if (aMax !== bMax) return aMax ? 1 : -1;
      if (aLocked !== bLocked) return aLocked ? 1 : -1;
      return getUpgradeCost(a, aLvl) - getUpgradeCost(b, bLvl);
    });
  }, [selectedCat, hideMaxed, state.upgrades, state.reputation]);

  const stats = useMemo(() => {
    const owned = UPGRADES.filter(u => (state.upgrades[u.id] || 0) > 0).length;
    const maxed = UPGRADES.filter(u => (state.upgrades[u.id] || 0) >= u.maxLevel).length;
    return { owned, maxed, total: UPGRADES.length };
  }, [state.upgrades]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="font-heading flex items-center gap-2 text-lg">
            <span>⬆️</span> Upgrade Toko
          </CardTitle>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted-foreground">
              <span className="font-semibold text-primary">{stats.owned}</span>/{stats.total} dimiliki
              {stats.maxed > 0 && <span className="ml-2 text-amber-500">★ {stats.maxed} max</span>}
            </span>
            <button
              onClick={() => setHideMaxed(v => !v)}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                hideMaxed ? 'bg-primary/15 text-primary border border-primary/30' : 'bg-muted text-muted-foreground hover:bg-muted/70'
              }`}
            >
              {hideMaxed ? '✓ Sembunyikan Max' : 'Sembunyikan Max'}
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-1.5 flex-wrap mb-3 -mx-1 px-1">
          {CATEGORIES.map(cat => {
            const count = cat.id === 'all'
              ? UPGRADES.length
              : UPGRADES.filter(u => u.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                  selectedCat === cat.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
                <span className="opacity-60 text-[10px]">{count}</span>
              </button>
            );
          })}
        </div>

        <TooltipProvider delayDuration={200}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {filtered.map(upgrade => {
              const currentLevel = state.upgrades[upgrade.id] || 0;
              const cost = getUpgradeCost(upgrade, currentLevel);
              const isMaxed = currentLevel >= upgrade.maxLevel;
              const locked = upgrade.requiredReputation ? state.reputation < upgrade.requiredReputation : false;
              const canAfford = state.money >= cost;
              const progress = (currentLevel / upgrade.maxLevel) * 100;

              return (
                <Tooltip key={upgrade.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => !isMaxed && !locked && canAfford && dispatch({ type: 'BUY_UPGRADE', upgradeId: upgrade.id })}
                      disabled={isMaxed || locked || !canAfford}
                      className={`group relative text-left p-2.5 rounded-lg border transition-all overflow-hidden ${
                        isMaxed
                          ? 'border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-amber-600/5 cursor-default'
                          : locked
                          ? 'border-border/50 bg-muted/20 opacity-50 cursor-not-allowed'
                          : canAfford
                          ? 'border-primary/30 bg-card hover:border-primary hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer'
                          : 'border-border bg-card/60 opacity-75 cursor-not-allowed'
                      }`}
                    >
                      {/* progress bar BG */}
                      <div
                        className="absolute inset-x-0 bottom-0 h-0.5 bg-primary/40 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                      {isMaxed && (
                        <div className="absolute top-1 right-1 text-[9px] font-bold text-amber-600 bg-amber-500/20 px-1 rounded">MAX</div>
                      )}
                      <div className="flex items-start gap-2 mb-1">
                        <span className="text-xl leading-none mt-0.5">{upgrade.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-heading text-xs font-semibold text-foreground truncate">{upgrade.name}</div>
                          <div className="text-[10px] text-muted-foreground">Lv {currentLevel}/{upgrade.maxLevel}</div>
                        </div>
                      </div>
                      <div className={`text-[11px] font-bold font-heading ${
                        isMaxed ? 'text-amber-600' :
                        locked ? 'text-secondary' :
                        canAfford ? 'text-primary' : 'text-muted-foreground'
                      }`}>
                        {isMaxed ? '✓ Selesai' : locked ? `🔒 Rep ${upgrade.requiredReputation}` : formatMoney(cost)}
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-1">
                      <div className="font-heading font-bold flex items-center gap-1.5">
                        <span>{upgrade.emoji}</span> {upgrade.name}
                      </div>
                      <div className="text-xs">{upgrade.description}</div>
                      {locked && (
                        <div className="text-xs text-secondary">🔒 Butuh Reputasi {upgrade.requiredReputation}</div>
                      )}
                      {!isMaxed && !locked && (
                        <div className="text-xs text-muted-foreground">
                          Click untuk upgrade ke level {currentLevel + 1}
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>

        {filtered.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            ✨ Semua upgrade di kategori ini sudah max!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
