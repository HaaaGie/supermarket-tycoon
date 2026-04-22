import { useGame } from '@/game/GameContext';
import { formatMoney, PRESTIGE_BONUSES } from '@/game/gameData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrestigePanel() {
  const { state, dispatch } = useGame();
  
  const prestigePoints = state.prestigePoints || 0;
  const prestigeLevel = state.prestigeLevel || 0;
  const prestigeUpgrades = state.prestigeUpgrades || {};
  
  // Prestige requirement: earn at least $100K total
  const canPrestige = state.totalEarned >= 100_000;
  const pointsEarned = Math.floor(Math.sqrt(state.totalEarned / 10_000));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-2">
          <span>👑</span> Prestige
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Prestige Info */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="font-heading font-bold text-foreground">
                👑 Prestige Level: {prestigeLevel}
              </div>
              <div className="text-sm text-muted-foreground">
                💎 Poin Tersedia: <span className="text-amber-500 font-bold">{prestigePoints}</span>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground mb-3">
            Prestige akan <span className="text-destructive font-medium">mereset semua progress</span> tapi memberikan bonus permanen.
            <br />Saat ini kamu akan mendapat <span className="text-amber-500 font-bold">{pointsEarned} poin</span> (berdasarkan total pendapatan: {formatMoney(state.totalEarned)}).
          </div>

          <Button
            onClick={() => {
              if (canPrestige && confirm('⚠️ Prestige akan mereset semua progress (uang, toko, pegawai, upgrade, cabang). Kamu akan mendapat ' + pointsEarned + ' poin prestige. Lanjutkan?')) {
                dispatch({ type: 'PRESTIGE' });
              }
            }}
            disabled={!canPrestige}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-bold"
            size="lg"
          >
            {canPrestige 
              ? `👑 Prestige (+${pointsEarned} Poin)` 
              : `🔒 Butuh Total Pendapatan ${formatMoney(100_000)}`
            }
          </Button>
        </div>

        {/* Prestige Upgrades */}
        <div>
          <h3 className="font-heading font-semibold text-foreground mb-3">💎 Upgrade Prestige</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRESTIGE_BONUSES.map(bonus => {
              const currentLevel = prestigeUpgrades[bonus.id] || 0;
              const isMaxed = currentLevel >= bonus.maxLevel;
              const cost = bonus.costPerLevel;

              return (
                <div
                  key={bonus.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isMaxed ? 'border-amber-500/30 bg-amber-500/5' : 'border-border bg-card hover:border-amber-500/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{bonus.emoji}</span>
                    <div className="font-heading font-semibold text-foreground">{bonus.name}</div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{bonus.description}</p>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all"
                        style={{ width: `${(currentLevel / bonus.maxLevel) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-heading font-bold text-foreground">
                      {currentLevel}/{bonus.maxLevel}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => dispatch({ type: 'BUY_PRESTIGE_UPGRADE', upgradeId: bonus.id })}
                    disabled={prestigePoints < cost || isMaxed}
                    className="w-full"
                    variant={isMaxed ? 'outline' : 'default'}
                  >
                    {isMaxed ? '✅ MAX' : `Upgrade (💎 ${cost})`}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
