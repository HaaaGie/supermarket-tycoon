import { useMemo, useState } from 'react';
import { useGame } from '@/game/GameContext';
import { PRODUCTS, SHELF_TYPES, formatMoney, getDemandMultiplier } from '@/game/gameData';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';

export default function ShelfManager() {
  const { state, dispatch } = useGame();

  // Smart product recommendations: sort by stock quantity descending,
  // prioritize items NOT already assigned to any shelf
  const getSortedProducts = useMemo(() => {
    const assignedProductIds = new Set(
      state.shelves.filter(s => s.productId).map(s => s.productId!)
    );

    return [...PRODUCTS].sort((a, b) => {
      const aOnShelf = assignedProductIds.has(a.id) ? 1 : 0;
      const bOnShelf = assignedProductIds.has(b.id) ? 1 : 0;
      // Not on shelf first
      if (aOnShelf !== bOnShelf) return aOnShelf - bOnShelf;
      // Then by stock quantity descending
      const aStock = state.stock[a.id] || 0;
      const bStock = state.stock[b.id] || 0;
      return bStock - aStock;
    });
  }, [state.shelves, state.stock]);

  return (
    <div className="space-y-6">
      {/* Buy Shelves */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <span>🛒</span> Beli Rak Baru
            <span className="text-sm font-body text-muted-foreground ml-auto">
              {state.shelves.length}/{state.maxShelves} slot
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {SHELF_TYPES.map(shelf => (
              <button
                key={shelf.id}
                onClick={() => dispatch({ type: 'BUY_SHELF', shelfTypeId: shelf.id })}
                disabled={state.money < shelf.cost || state.shelves.length >= state.maxShelves}
                className="p-3 rounded-lg border border-border bg-card hover:border-primary hover:bg-primary/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-left"
              >
                <div className="text-2xl mb-1">{shelf.emoji}</div>
                <div className="font-heading font-semibold text-sm text-foreground">{shelf.name}</div>
                <div className="text-xs text-muted-foreground">{shelf.description}</div>
                <div className="font-heading font-bold text-primary mt-1">{formatMoney(shelf.cost)}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Existing Shelves */}
      {state.shelves.length > 0 && (
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="font-heading font-semibold text-sm text-foreground">
            🗄️ Rak Aktif ({state.shelves.length})
          </h3>
          <Button
            size="sm"
            variant="outline"
            onClick={() => dispatch({ type: 'RESTOCK_ALL_SHELVES' })}
            title="Isi semua rak dari gudang sekaligus"
          >
            📦 Restock Semua Rak
          </Button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {state.shelves.map(shelf => {
          const shelfType = SHELF_TYPES.find(s => s.id === shelf.shelfTypeId);
          const product = shelf.productId ? PRODUCTS.find(p => p.id === shelf.productId) : null;
          const fillPercent = shelf.capacity > 0 ? (shelf.currentStock / shelf.capacity) * 100 : 0;
          const demandMult = product ? getDemandMultiplier(shelf.customSellPrice, product.baseSellPrice) : 1;
          const demandLabel = demandMult >= 2 ? '🔥 Sangat Laris' : demandMult >= 1.2 ? '👍 Laris' : demandMult >= 0.8 ? '😐 Normal' : demandMult >= 0.5 ? '😕 Lambat' : '💀 Sangat Lambat';

          return (
            <Card key={shelf.id} className={`${fillPercent < 20 && shelf.productId ? 'border-destructive/50' : ''}`}>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{shelfType?.emoji}</span>
                    <span className="font-heading font-semibold text-foreground">{shelfType?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {product && (
                      <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full">
                        <span>{product.emoji}</span>
                        <span className="text-xs font-medium text-foreground">{product.name}</span>
                      </div>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" title="Hapus rak (refund 50%)">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus rak ini?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Rak <span className="font-semibold">{shelfType?.name}</span> akan dijual dan kamu mendapat refund <span className="font-semibold text-primary">{formatMoney(Math.floor((shelfType?.cost || 0) * 0.5))}</span> (50% harga beli).
                            {shelf.currentStock > 0 && product && (
                              <> Stok tersisa <span className="font-semibold">{shelf.currentStock} {product.name}</span> akan dikembalikan ke gudang.</>
                            )}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => dispatch({ type: 'REMOVE_SHELF', shelfId: shelf.id })}>
                            Ya, Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                {/* Product Selector - sorted with recommendations */}
                <Select
                  value={shelf.productId || ''}
                  onValueChange={(val) => dispatch({ type: 'ASSIGN_PRODUCT', shelfId: shelf.id, productId: val })}
                >
                  <SelectTrigger className="text-foreground">
                    <SelectValue placeholder="Pilih produk..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getSortedProducts.map(p => {
                      const inStock = state.stock[p.id] || 0;
                      const isOnShelf = state.shelves.some(s => s.id !== shelf.id && s.productId === p.id);
                      return (
                        <SelectItem key={p.id} value={p.id}>
                          <span className="flex items-center gap-1">
                            {p.emoji} {p.name}
                            <span className="text-muted-foreground ml-1">
                              ({formatMoney(p.baseSellPrice)})
                            </span>
                            {inStock > 0 && (
                              <span className="ml-1 text-xs bg-primary/15 text-primary px-1.5 rounded-full font-medium">
                                📦{inStock}
                              </span>
                            )}
                            {!isOnShelf && inStock > 0 && (
                              <span className="ml-1 text-xs bg-secondary/15 text-secondary px-1.5 rounded-full font-medium">
                                ⭐
                              </span>
                            )}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                {/* Sell Price + Customer Timer */}
                {shelf.productId && product && (
                  <>
                    {/* Custom Sell Price */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Harga Jual</span>
                        <span className={`font-medium ${demandMult >= 1 ? 'text-primary' : 'text-destructive'}`}>{demandLabel}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-heading text-foreground">$</span>
                        <Input
                          type="number"
                          min={1}
                          value={shelf.customSellPrice}
                          onChange={e => dispatch({ type: 'SET_SELL_PRICE', shelfId: shelf.id, price: Number(e.target.value) })}
                          className="h-8 text-sm"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => dispatch({ type: 'SET_SELL_PRICE', shelfId: shelf.id, price: product.baseSellPrice })}
                          className="text-xs whitespace-nowrap"
                        >
                          Reset
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Default: {formatMoney(product.baseSellPrice)} | Profit: {formatMoney(shelf.customSellPrice - (state.marketPrices[shelf.productId] ? Math.round(product.baseBuyCost * (state.marketPrices[shelf.productId] || 1)) : product.baseBuyCost))}/unit
                      </div>
                    </div>

                    {/* Customer Purchase Timer */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>🧑‍🛒 Pelanggan berikutnya...</span>
                        <span>{Math.min(99, Math.floor(shelf.customerTimer || 0))}%</span>
                      </div>
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${Math.min(100, shelf.customerTimer || 0)}%`,
                            background: `linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Stock Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Stok Rak</span>
                        <span>{shelf.currentStock}/{shelf.capacity}</span>
                      </div>
                      <Progress value={fillPercent} className="h-3" />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => dispatch({ type: 'RESTOCK_SHELF', shelfId: shelf.id, amount: 5 })}
                        disabled={!state.stock[shelf.productId]}
                        className="flex-1"
                      >
                        +5
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => dispatch({ type: 'RESTOCK_SHELF', shelfId: shelf.id, amount: 20 })}
                        disabled={!state.stock[shelf.productId]}
                        className="flex-1"
                      >
                        +20
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => dispatch({ type: 'RESTOCK_SHELF', shelfId: shelf.id, amount: 999 })}
                        disabled={!state.stock[shelf.productId]}
                        className="flex-1"
                      >
                        Isi Penuh
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Gudang: {state.stock[shelf.productId] || 0} unit
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
        
        {state.shelves.length === 0 && (
          <div className="col-span-2 text-center py-12 text-muted-foreground">
            <span className="text-4xl block mb-2">🏬</span>
            <p className="font-heading">Belum ada rak! Beli rak pertamamu di atas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
