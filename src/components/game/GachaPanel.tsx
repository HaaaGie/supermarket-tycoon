import { useState } from 'react';
import { useGame } from '@/game/GameContext';
import { GACHA_ITEMS, RARITY_CONFIG, GACHA_COST_GEMS, GACHA_COST_MONEY, rollGacha, rollGachaMulti, type GachaItem } from '@/game/gachaData';
import { formatMoney } from '@/game/gameData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function GachaResult({ item, onClose }: { item: GachaItem; onClose: () => void }) {
  const rConf = RARITY_CONFIG[item.rarity];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in" onClick={onClose}>
      <div className="bg-card border-2 rounded-2xl p-8 text-center max-w-sm mx-4 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${rConf.color}`}>
          ✨ {rConf.label} ✨
        </div>
        <div className="text-7xl mb-4 animate-float">{item.emoji}</div>
        <h3 className="font-heading text-xl font-bold text-foreground mb-2">{item.name}</h3>
        <p className="text-sm text-muted-foreground mb-1">{item.description}</p>
        <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${rConf.bg} ${rConf.color} border ${rConf.border}`}>
          {item.type === 'theme' ? '🎨 Tema' : item.type === 'buff' ? '⚡ Buff' : item.type === 'cosmetic' ? '✨ Kosmetik' : '🏷️ Gelar'}
        </div>
        <div className="mt-6">
          <Button onClick={onClose} className="font-heading">OK!</Button>
        </div>
      </div>
    </div>
  );
}

function GachaMultiResult({ items, onClose }: { items: GachaItem[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in" onClick={onClose}>
      <div className="bg-card border-2 rounded-2xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
        <h3 className="font-heading text-xl font-bold text-foreground text-center mb-4">🎰 Hasil 10x Spin!</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
          {items.map((item, idx) => {
            const rConf = RARITY_CONFIG[item.rarity];
            return (
              <div key={idx} className={`p-2 rounded-lg border text-center ${rConf.bg} ${rConf.border} animate-slide-up`}
                style={{ animationDelay: `${idx * 0.08}s`, animationFillMode: 'both' }}>
                <div className="text-3xl mb-1">{item.emoji}</div>
                <div className="text-[10px] font-heading font-medium text-foreground truncate">{item.name}</div>
                <div className={`text-[9px] font-bold ${rConf.color}`}>{rConf.label}</div>
              </div>
            );
          })}
        </div>
        {/* Summary */}
        <div className="flex gap-2 justify-center flex-wrap mb-4">
          {(['legendary', 'epic', 'rare', 'common'] as const).map(r => {
            const count = items.filter(i => i.rarity === r).length;
            if (count === 0) return null;
            const rConf = RARITY_CONFIG[r];
            return (
              <span key={r} className={`text-xs px-2 py-1 rounded-full ${rConf.bg} ${rConf.color} border ${rConf.border}`}>
                {rConf.label}: {count}
              </span>
            );
          })}
        </div>
        <div className="text-center">
          <Button onClick={onClose} className="font-heading">OK!</Button>
        </div>
      </div>
    </div>
  );
}

export default function GachaPanel() {
  const { state, dispatch } = useGame();
  const [result, setResult] = useState<GachaItem | null>(null);
  const [multiResult, setMultiResult] = useState<GachaItem[] | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [tab, setTab] = useState<'gacha' | 'inventory' | 'equip'>('gacha');
  const [invFilter, setInvFilter] = useState<'all' | 'theme' | 'buff' | 'cosmetic' | 'title'>('all');

  const gems = state.gems || 0;
  const inventory = state.gachaInventory || [];

  const handleSpin = (currency: 'gems' | 'money', count: number = 1) => {
    if (spinning) return;
    setSpinning(true);
    
    // Roll items in the component so we can display them
    const rolledItems = rollGachaMulti(count);
    const rolledItemIds = rolledItems.map(i => i.id);
    
    dispatch({ type: 'GACHA_SPIN', currency, count, rolledItemIds });
    
    setTimeout(() => {
      if (count > 1) {
        setMultiResult(rolledItems);
      } else {
        setResult(rolledItems[0]);
      }
      setSpinning(false);
    }, 800);
  };

  const handleActivateBuff = (itemId: string) => {
    dispatch({ type: 'ACTIVATE_BUFF', itemId });
  };

  const handleEquipTheme = (itemId: string) => {
    dispatch({ type: 'EQUIP_THEME', itemId });
  };

  const handleEquipCosmetic = (itemId: string) => {
    dispatch({ type: 'EQUIP_COSMETIC', itemId });
  };

  const handleEquipTitle = (itemId: string) => {
    dispatch({ type: 'EQUIP_TITLE', itemId });
  };

  const activeBuffs = state.activeBuffs || [];
  const equippedTheme = state.equippedTheme || null;
  const equippedCosmetic = state.equippedCosmetic || null;
  const equippedTitle = state.equippedTitle || null;

  // Group inventory by type
  const themes = inventory.filter((id: string) => GACHA_ITEMS.find(i => i.id === id)?.type === 'theme');
  const buffs = inventory.filter((id: string) => GACHA_ITEMS.find(i => i.id === id)?.type === 'buff');
  const cosmetics = inventory.filter((id: string) => GACHA_ITEMS.find(i => i.id === id)?.type === 'cosmetic');
  const titles = inventory.filter((id: string) => GACHA_ITEMS.find(i => i.id === id)?.type === 'title');
  // Count duplicates
  const inventoryCount: Record<string, number> = {};
  inventory.forEach((id: string) => { inventoryCount[id] = (inventoryCount[id] || 0) + 1; });
  // Sort unique inventory by rarity (mythical → common), then by name for stability
  const RARITY_RANK: Record<string, number> = { mythical: 5, legendary: 4, epic: 3, rare: 2, common: 1 };
  const uniqueInventory = ([...new Set(inventory)] as string[]).sort((a, b) => {
    const ia = GACHA_ITEMS.find(i => i.id === a);
    const ib = GACHA_ITEMS.find(i => i.id === b);
    const ra = ia ? RARITY_RANK[ia.rarity] || 0 : 0;
    const rb = ib ? RARITY_RANK[ib.rarity] || 0 : 0;
    if (ra !== rb) return rb - ra;
    return (ia?.name || '').localeCompare(ib?.name || '');
  });

  return (
    <div className="space-y-4">
      {result && <GachaResult item={result} onClose={() => setResult(null)} />}
      {multiResult && <GachaMultiResult items={multiResult} onClose={() => setMultiResult(null)} />}

      {/* Currency */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 bg-purple-500/10 px-4 py-2 rounded-full">
          <span className="text-xl">💎</span>
          <span className="font-heading font-bold text-purple-500">{gems} Gems</span>
        </div>
        <div className="flex items-center gap-2 bg-money/10 px-4 py-2 rounded-full">
          <span className="text-xl">💰</span>
          <span className="font-heading font-bold text-money-foreground">{formatMoney(state.money)}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          💡 Dapatkan gems dari menyelesaikan hari, achievement, dan event!
        </div>
      </div>

      {/* Active Buffs */}
      {activeBuffs.length > 0 && (
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-heading font-medium text-foreground">Buff Aktif:</span>
              {activeBuffs.map((buff: any, i: number) => {
                const item = GACHA_ITEMS.find(gi => gi.id === buff.itemId);
                if (!item) return null;
                const secondsLeft = Math.ceil(buff.ticksLeft * 0.5);
                return (
                  <div key={i} className="flex items-center gap-1 bg-accent/10 px-2 py-1 rounded-full text-xs">
                    <span>{item.emoji}</span>
                    <span className="font-medium text-foreground">{item.name}</span>
                    <span className="text-muted-foreground">({secondsLeft}s)</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab Nav */}
      <div className="flex gap-2">
        {(['gacha', 'inventory', 'equip'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg font-heading text-sm transition-colors ${
              tab === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}>
            {t === 'gacha' ? '🎰 Gacha' : t === 'inventory' ? '🎒 Inventori' : '👗 Equip'}
          </button>
        ))}
      </div>

      {tab === 'gacha' && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <span>🎰</span> Gacha Machine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Rates */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {Object.entries(RARITY_CONFIG).map(([key, conf]) => (
                <div key={key} className={`p-2 rounded-lg ${conf.bg} border ${conf.border}`}>
                  <div className={`font-bold ${conf.color}`}>{conf.label}</div>
                  <div className="text-muted-foreground">{(conf.chance * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>

            {/* Spin Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <h4 className="font-heading font-medium text-sm text-foreground">💎 Pakai Gems</h4>
                <Button onClick={() => handleSpin('gems', 1)} disabled={spinning || gems < GACHA_COST_GEMS}
                  className="w-full font-heading" variant={gems >= GACHA_COST_GEMS ? 'default' : 'outline'}>
                  {spinning ? '🎰 Spinning...' : `1x Spin (${GACHA_COST_GEMS} 💎)`}
                </Button>
                <Button onClick={() => handleSpin('gems', 10)} disabled={spinning || gems < GACHA_COST_GEMS * 9}
                  className="w-full font-heading" variant="secondary">
                  10x Spin ({GACHA_COST_GEMS * 9} 💎) 🔥
                </Button>
              </div>
              <div className="space-y-2">
                <h4 className="font-heading font-medium text-sm text-foreground">💰 Pakai Uang</h4>
                <Button onClick={() => handleSpin('money', 1)} disabled={spinning || state.money < GACHA_COST_MONEY}
                  className="w-full font-heading" variant={state.money >= GACHA_COST_MONEY ? 'default' : 'outline'}>
                  {spinning ? '🎰 Spinning...' : `1x Spin (${formatMoney(GACHA_COST_MONEY)})`}
                </Button>
                <Button onClick={() => handleSpin('money', 10)} disabled={spinning || state.money < GACHA_COST_MONEY * 9}
                  className="w-full font-heading" variant="secondary">
                  10x Spin ({formatMoney(GACHA_COST_MONEY * 9)}) 🔥
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              10x spin = bayar 9x harga (hemat 10%!) • Buff bisa diaktifkan dari inventori
            </p>
          </CardContent>
        </Card>
      )}

      {tab === 'inventory' && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <span>🎒</span> Inventori ({uniqueInventory.length} item)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filter buttons */}
            <div className="flex gap-2 flex-wrap mb-4">
              {([
                { key: 'all', label: '🏷️ Semua' },
                { key: 'theme', label: '🎨 Tema' },
                { key: 'buff', label: '⚡ Buff' },
                { key: 'cosmetic', label: '✨ Kosmetik' },
                { key: 'title', label: '🏷️ Gelar' },
              ] as const).map(f => (
                <button
                  key={f.key}
                  onClick={() => setInvFilter(f.key)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    invFilter === f.key
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {uniqueInventory.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Belum ada item. Coba gacha dulu! 🎰</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {uniqueInventory
                  .filter(itemId => {
                    if (invFilter === 'all') return true;
                    const item = GACHA_ITEMS.find(i => i.id === itemId);
                    return item?.type === invFilter;
                  })
                  .map((itemId) => {
                  const item = GACHA_ITEMS.find(i => i.id === itemId);
                  if (!item) return null;
                  const count = inventoryCount[itemId] || 0;
                  const rConf = RARITY_CONFIG[item.rarity];
                  const isEquipped = equippedTheme === itemId || equippedCosmetic === itemId || equippedTitle === itemId;
                  return (
                    <div key={itemId} className={`p-3 rounded-lg border ${rConf.border} ${rConf.bg} flex items-center gap-3`}>
                      <span className="text-3xl">{item.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-medium text-sm text-foreground truncate">{item.name}</span>
                          {count > 1 && <span className="text-xs bg-muted px-1.5 rounded text-muted-foreground">x{count}</span>}
                          {isEquipped && <span className="text-xs bg-primary/20 text-primary px-1.5 rounded">Equipped</span>}
                        </div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                        <div className={`text-xs font-medium ${rConf.color}`}>{rConf.label}</div>
                      </div>
                      {item.type === 'buff' && count > 0 && (
                        <Button size="sm" variant="outline" onClick={() => handleActivateBuff(itemId)} className="text-xs shrink-0">
                          ⚡ Pakai
                        </Button>
                      )}
                      {item.type === 'theme' && !isEquipped && (
                        <Button size="sm" variant="outline" onClick={() => handleEquipTheme(itemId)} className="text-xs shrink-0">
                          🎨 Pakai
                        </Button>
                      )}
                      {item.type === 'cosmetic' && !isEquipped && (
                        <Button size="sm" variant="outline" onClick={() => handleEquipCosmetic(itemId)} className="text-xs shrink-0">
                          ✨ Pakai
                        </Button>
                      )}
                      {item.type === 'title' && !isEquipped && (
                        <Button size="sm" variant="outline" onClick={() => handleEquipTitle(itemId)} className="text-xs shrink-0">
                          🏷️ Pakai
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'equip' && (
        <div className="space-y-4">
          {/* Equipped Items */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-base">👗 Item Terpasang</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <span>🎨</span>
                <span className="text-sm font-heading text-foreground">Tema:</span>
                <span className="text-sm text-muted-foreground">
                  {equippedTheme ? GACHA_ITEMS.find(i => i.id === equippedTheme)?.name || 'Default' : 'Default'}
                </span>
                {equippedTheme && (
                  <Button size="sm" variant="ghost" onClick={() => dispatch({ type: 'EQUIP_THEME', itemId: '' })} className="text-xs ml-auto">
                    Reset
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <span>✨</span>
                <span className="text-sm font-heading text-foreground">Ikon Toko:</span>
                <span className="text-sm text-muted-foreground">
                  {equippedCosmetic ? GACHA_ITEMS.find(i => i.id === equippedCosmetic)?.cosmeticEmoji || '🏪' : '🏪 Default'}
                </span>
                {equippedCosmetic && (
                  <Button size="sm" variant="ghost" onClick={() => dispatch({ type: 'EQUIP_COSMETIC', itemId: '' })} className="text-xs ml-auto">
                    Reset
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                <span>🏷️</span>
                <span className="text-sm font-heading text-foreground">Gelar:</span>
                <span className="text-sm text-muted-foreground">
                  {equippedTitle ? GACHA_ITEMS.find(i => i.id === equippedTitle)?.name?.replace('Gelar: ', '') || '-' : 'Tidak ada'}
                </span>
                {equippedTitle && (
                  <Button size="sm" variant="ghost" onClick={() => dispatch({ type: 'EQUIP_TITLE', itemId: '' })} className="text-xs ml-auto">
                    Reset
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Available themes */}
          {themes.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="font-heading text-base">🎨 Tema Tersedia</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[...new Set(themes)].map((itemId: string) => {
                    const item = GACHA_ITEMS.find(i => i.id === itemId);
                    if (!item) return null;
                    const isActive = equippedTheme === itemId;
                    return (
                      <button key={itemId} onClick={() => handleEquipTheme(itemId)}
                        className={`p-3 rounded-lg border text-center transition-all ${
                          isActive ? 'border-primary bg-primary/10 ring-2 ring-primary' : 'border-border bg-muted/30 hover:bg-muted/60'
                        }`}>
                        <span className="text-2xl">{item.emoji}</span>
                        <div className="text-xs font-heading font-medium text-foreground mt-1">{item.name}</div>
                        {isActive && <div className="text-xs text-primary mt-1">✓ Aktif</div>}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
