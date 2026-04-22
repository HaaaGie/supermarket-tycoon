import { useGame } from '@/game/GameContext';
import { formatMoney, PRODUCTS } from '@/game/gameData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DaySummary() {
  const { state, dispatch } = useGame();

  if (!state.showDaySummary || !state.daySummary) return null;

  const summary = state.daySummary;
  const isProfit = summary.profit >= 0;

  const topProducts = Object.entries(summary.itemsSoldByProduct)
    .map(([id, count]) => {
      const product = PRODUCTS.find(p => p.id === id);
      return { id, count, name: product?.name || id, emoji: product?.emoji || '📦' };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-md mx-4 animate-slide-up">
        <CardHeader className="text-center">
          <CardTitle className="font-heading text-2xl">
            🌙 Laporan Hari {summary.day}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Financial Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-primary/10 text-center">
              <div className="text-xs text-muted-foreground">💵 Pendapatan</div>
              <div className="font-heading font-bold text-lg text-primary">{formatMoney(summary.revenue)}</div>
            </div>
            <div className="p-3 rounded-lg bg-destructive/10 text-center">
              <div className="text-xs text-muted-foreground">💸 Pengeluaran</div>
              <div className="font-heading font-bold text-lg text-destructive">{formatMoney(summary.expenses)}</div>
            </div>
          </div>

          {/* Profit */}
          <div className={`p-4 rounded-lg text-center ${isProfit ? 'bg-primary/10' : 'bg-destructive/10'}`}>
            <div className="text-sm text-muted-foreground">{isProfit ? '📈 Laba Bersih' : '📉 Rugi Bersih'}</div>
            <div className={`font-heading font-bold text-2xl ${isProfit ? 'text-primary' : 'text-destructive'}`}>
              {isProfit ? '+' : ''}{formatMoney(summary.profit)}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-muted/50">
              <div className="text-lg">📦</div>
              <div className="font-heading font-bold text-foreground">{summary.itemsSold}</div>
              <div className="text-xs text-muted-foreground">Terjual</div>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <div className="text-lg">👥</div>
              <div className="font-heading font-bold text-foreground">{summary.customersServed}</div>
              <div className="text-xs text-muted-foreground">Pelanggan</div>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <div className="text-lg">🏪</div>
              <div className="font-heading font-bold text-foreground">{formatMoney(summary.branchIncome)}</div>
              <div className="text-xs text-muted-foreground">Cabang</div>
            </div>
          </div>

          {/* Top Products */}
          {topProducts.length > 0 && (
            <div>
              <div className="text-sm font-heading font-medium text-foreground mb-2">🏆 Produk Terlaris</div>
              <div className="space-y-1">
                {topProducts.map((p, i) => (
                  <div key={p.id} className="flex items-center justify-between text-sm px-2 py-1 rounded bg-muted/30">
                    <span>{i + 1}. {p.emoji} {p.name}</span>
                    <span className="font-heading font-bold text-foreground">{p.count}x</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button onClick={() => dispatch({ type: 'DISMISS_DAY_SUMMARY' })} className="w-full" size="lg">
            🌅 Mulai Hari {summary.day + 1}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
