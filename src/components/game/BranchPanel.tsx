import { useGame } from '@/game/GameContext';
import { BRANCH_TYPES, formatMoney, getBranchCost } from '@/game/gameData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

export default function BranchPanel() {
  const { state, dispatch } = useGame();

  return (
    <div className="space-y-6">
      {/* Buy New Branch */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <span>🏢</span> Beli Cabang Baru
            <span className="text-sm font-body text-muted-foreground ml-auto">
              {state.branches.length}/100 cabang
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BRANCH_TYPES.map(branch => {
              const owned = state.branches.filter(b => b.typeId === branch.id).length;
              const locked = state.reputation < branch.requiredReputation;
              return (
                <div
                  key={branch.id}
                  className={`p-4 rounded-lg border transition-all ${
                    locked ? 'border-border bg-muted/30 opacity-60' : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl">{branch.emoji}</span>
                    <div>
                      <div className="font-heading font-semibold text-foreground">{branch.name}</div>
                      <div className="text-xs text-muted-foreground">{branch.description}</div>
                    </div>
                  </div>
                  <div className="text-xs text-primary font-medium mb-1">
                    💰 +{formatMoney(branch.incomePerTick)}/detik per level
                  </div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-muted-foreground">Dimiliki: {owned}</span>
                    {locked && (
                      <span className="text-secondary font-medium">🔒 Reputasi {branch.requiredReputation}</span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => dispatch({ type: 'BUY_BRANCH', branchTypeId: branch.id })}
                    disabled={state.money < branch.cost || locked || state.branches.length >= 100}
                    className="w-full"
                  >
                    Beli ({formatMoney(branch.cost)})
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Owned Branches */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <span>🏬</span> Cabang Saya ({state.branches.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {state.branches.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 font-heading">
              Belum punya cabang. Beli cabang pertamamu! 🏪
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {state.branches.map(branch => {
                const branchType = BRANCH_TYPES.find(b => b.id === branch.typeId);
                if (!branchType) return null;
                const isMaxed = branch.level >= branchType.maxLevel;
                const upgradeCost = getBranchCost(branchType, branch.level);
                const income = branchType.incomePerTick * branch.level;
                const franchiseBrand = state.upgrades['franchise_brand'] || 0;
                const effectiveIncome = income * (1 + franchiseBrand * 0.25);

                return (
                  <div key={branch.id} className="p-4 rounded-lg border border-border bg-card">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{branchType.emoji}</span>
                      <div>
                        <div className="font-heading font-semibold text-sm text-foreground">{branch.name}</div>
                        <div className="text-xs text-primary font-medium">+{formatMoney(effectiveIncome)}/detik</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${(branch.level / branchType.maxLevel) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-heading font-bold text-foreground">
                        Lv.{branch.level}/{branchType.maxLevel}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => dispatch({ type: 'UPGRADE_BRANCH', branchId: branch.id })}
                        disabled={state.money < upgradeCost || isMaxed}
                        className="flex-1"
                        variant={isMaxed ? 'outline' : 'default'}
                      >
                        {isMaxed ? '✅ MAX' : `Upgrade (${formatMoney(upgradeCost)})`}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-9 w-9 shrink-0" title="Jual cabang (refund 50%)">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Jual {branch.name}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cabang ini akan dijual permanen. Kamu akan mendapat refund <span className="font-semibold text-primary">50%</span> dari total investasi (harga beli + semua upgrade).
                              Income pasif dari cabang ini akan hilang.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={() => dispatch({ type: 'REMOVE_BRANCH', branchId: branch.id })}>
                              Ya, Jual
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
