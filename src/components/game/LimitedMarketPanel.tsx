import { useMemo } from 'react';
import { useGame } from '@/game/GameContext';
import { GACHA_ITEMS, RARITY_CONFIG, type GachaItem } from '@/game/gachaData';
import { getSeasonForDay, getSeasonProgress, SEASONS, formatMoney, type Season } from '@/game/gameData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Pricing per rarity (gems / money)
const PRICE_TABLE: Record<GachaItem['rarity'], { gems: number; money: number }> = {
  common: { gems: 20, money: 8_000 },
  rare: { gems: 40, money: 20_000 },
  epic: { gems: 80, money: 60_000 },
  legendary: { gems: 150, money: 200_000 },
  mythical: { gems: 350, money: 750_000 },
};

const RARITY_RANK: Record<GachaItem['rarity'], number> = {
  mythical: 5, legendary: 4, epic: 3, rare: 2, common: 1,
};

const SEASON_BANNERS: Record<Season, { title: string; gradient: string }> = {
  spring: { title: 'Sakura Festival Market', gradient: 'from-pink-500/15 via-rose-400/10 to-fuchsia-500/15' },
  summer: { title: 'Tropical Beach Bazaar', gradient: 'from-amber-400/15 via-orange-400/10 to-yellow-400/15' },
  autumn: { title: 'Harvest Moon Bazaar', gradient: 'from-orange-600/15 via-amber-700/10 to-red-600/15' },
  winter: { title: 'Frost Crystal Market', gradient: 'from-cyan-500/15 via-blue-400/10 to-indigo-500/15' },
};

export default function LimitedMarketPanel() {
  const { state, dispatch } = useGame();
  const season = getSeasonForDay(state.day);
  const seasonInfo = SEASONS[season];
  const progress = getSeasonProgress(state.day);
  const banner = SEASON_BANNERS[season];
  const owned = new Set(state.gachaInventory || []);

  // Items available this season — sorted mythical → common
  const items = useMemo(() => {
    return GACHA_ITEMS
      .filter(i => i.exclusiveSeason === season)
      .sort((a, b) => RARITY_RANK[b.rarity] - RARITY_RANK[a.rarity]);
  }, [season]);

  return (
    <div className="space-y-4">
      <div className={`rounded-xl border bg-gradient-to-br ${banner.gradient} p-4`}>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-3xl">{seasonInfo.emoji}</span>
              <h2 className="text-xl font-heading font-bold text-foreground">
                {banner.title}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-xl">
              Market eksklusif musim {seasonInfo.name}. Item-item ini <strong className="text-foreground">cuma bisa didapat di sini</strong> — tidak muncul di gacha biasa! Ganti tiap musim ({progress.daysLeft} hari lagi).
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground">
            <span>💎 {state.gems || 0}</span>
            <span>💰 {formatMoney(state.money)}</span>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <p className="text-3xl mb-2">🌫️</p>
            <p>Tidak ada item limited untuk musim ini.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map(item => {
            const rConf = RARITY_CONFIG[item.rarity];
            const price = PRICE_TABLE[item.rarity];
            const alreadyOwned = owned.has(item.id);
            const canAffordGems = (state.gems || 0) >= price.gems;
            const canAffordMoney = state.money >= price.money;

            return (
              <Card key={item.id} className={`relative overflow-hidden ${rConf.border} ${alreadyOwned ? 'opacity-60' : ''}`}>
                <div className={`absolute inset-0 ${rConf.bg} opacity-40 pointer-events-none`} />
                <CardHeader className="pb-2 relative">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={`${rConf.color} ${rConf.border} text-[10px]`}>
                      {rConf.label}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {item.type === 'theme' ? '🎨 Tema' : item.type === 'cosmetic' ? '✨ Kosmetik' : item.type === 'title' ? '🏷️ Gelar' : '⚡ Buff'}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-heading flex items-center gap-2 mt-1">
                    <span className="text-2xl">{item.emoji}</span>
                    <span>{item.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-2">
                  <p className="text-xs text-muted-foreground min-h-[32px]">{item.description}</p>
                  {alreadyOwned ? (
                    <div className="text-center py-2 text-sm font-medium text-primary">
                      ✅ Sudah Dimiliki
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        variant={canAffordGems ? 'default' : 'outline'}
                        disabled={!canAffordGems}
                        onClick={() => dispatch({ type: 'BUY_LIMITED_ITEM', itemId: item.id, cost: price.gems, currency: 'gems' })}
                        className="text-xs"
                      >
                        💎 {price.gems}
                      </Button>
                      <Button
                        size="sm"
                        variant={canAffordMoney ? 'secondary' : 'outline'}
                        disabled={!canAffordMoney}
                        onClick={() => dispatch({ type: 'BUY_LIMITED_ITEM', itemId: item.id, cost: price.money, currency: 'money' })}
                        className="text-xs"
                      >
                        💰 {formatMoney(price.money)}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardContent className="py-3">
          <p className="text-xs text-muted-foreground text-center">
            💡 Item limited hanya tersedia 30 hari per musim. Lewat musim, item akan hilang & balik lagi tahun depan!
            Setiap item cuma bisa dibeli <strong>satu kali</strong>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
