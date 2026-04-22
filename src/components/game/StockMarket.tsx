import { useGame } from '@/game/GameContext';
import { PRODUCTS, formatMoney } from '@/game/gameData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

export default function StockMarket() {
  const { state, dispatch, getMarketPrice } = useGame();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...new Set(PRODUCTS.map(p => p.category))];
  const filtered = selectedCategory === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === selectedCategory);

  // Time until next price change
  const ticksUntilChange = 60 - (state.tickCount % 60);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <span>📦</span> Gudang Stok
            <span className="ml-auto text-xs font-body text-muted-foreground bg-muted px-2 py-1 rounded-full">
              ⏱️ Harga berubah dalam {ticksUntilChange}s
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Active Event */}
          {state.activeEvent && (
            <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/30 flex items-center gap-2">
              <span className="text-2xl">{state.activeEvent.emoji}</span>
              <div>
                <div className="font-heading font-semibold text-sm text-foreground">{state.activeEvent.name}</div>
                <div className="text-xs text-muted-foreground">{state.activeEvent.description} ({state.activeEvent.ticksLeft}s tersisa)</div>
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap mb-4">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {cat === 'all' ? '🏷️ Semua' : cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(product => {
              const inStock = state.stock[product.id] || 0;
              const currentBuyPrice = getMarketPrice(product.id);
              const priceDiff = currentBuyPrice - product.baseBuyCost;
              const priceDirection = priceDiff > 0 ? '📈' : priceDiff < 0 ? '📉' : '➡️';

              return (
                <div key={product.id} className="p-3 rounded-lg border border-border bg-card hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{product.emoji}</span>
                      <div>
                        <div className="font-heading font-semibold text-foreground">{product.name}</div>
                        <div className="text-xs text-muted-foreground">{product.category}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Gudang</div>
                      <div className="font-heading font-bold text-foreground">{inStock}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs mb-1">
                    <span className="text-muted-foreground">
                      Beli: <span className={`font-bold ${priceDiff < 0 ? 'text-green-500' : priceDiff > 0 ? 'text-destructive' : 'text-foreground'}`}>
                        {formatMoney(currentBuyPrice)}
                      </span>
                    </span>
                    <span>{priceDirection}</span>
                    <span className="text-xs text-muted-foreground">
                      (Base: {formatMoney(product.baseBuyCost)})
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">
                    Jual default: <span className="font-bold text-primary">{formatMoney(product.baseSellPrice)}</span>
                  </div>

                  <div className="flex gap-1.5">
                    {[10, 50, 100].map(amount => (
                      <Button
                        key={amount}
                        size="sm"
                        variant={amount === 100 ? 'default' : 'outline'}
                        onClick={() => dispatch({ type: 'BUY_STOCK', productId: product.id, amount })}
                        disabled={state.money < currentBuyPrice * amount}
                        className="flex-1 text-xs"
                      >
                        {amount}x ({formatMoney(currentBuyPrice * amount)})
                      </Button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
