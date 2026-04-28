import { useState } from 'react';
import { useGame } from '@/game/GameContext';
import { GACHA_ITEMS } from '@/game/gachaData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const ADMIN_PASSWORD = 'Ejebeh123';

export default function AdminPanel() {
  const { state, dispatch } = useGame();
  const [open, setOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [money, setMoney] = useState('');
  const [gems, setGems] = useState('');

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setError('');
    } else {
      setError('Password salah!');
    }
  };

  if (!authenticated) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground opacity-50 hover:opacity-100">
            🔧
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">🔐 Admin Mode</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Masukkan password admin untuk mengakses.</p>
            <Input
              type="password"
              placeholder="Password..."
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={handleLogin} className="w-full">Masuk</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs text-amber-500 font-bold">
          🔧 Admin
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">🔧 Admin Panel</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Money */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading">💰 Uang</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground">Saat ini: ${Math.floor(state.money).toLocaleString()}</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Jumlah uang..."
                  value={money}
                  onChange={e => setMoney(e.target.value)}
                  className="flex-1"
                />
                <Button size="sm" onClick={() => { dispatch({ type: 'ADMIN_SET_MONEY', amount: Number(money) || 0 }); setMoney(''); }}>
                  Set
                </Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[10000, 100000, 1000000, 10000000].map(amt => (
                  <Button key={amt} size="sm" variant="outline" onClick={() => dispatch({ type: 'ADMIN_SET_MONEY', amount: amt })}>
                    ${(amt / 1000).toFixed(0)}K
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gems */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading">💎 Permata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-xs text-muted-foreground">Saat ini: {state.gems || 0}</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Jumlah gems..."
                  value={gems}
                  onChange={e => setGems(e.target.value)}
                  className="flex-1"
                />
                <Button size="sm" onClick={() => { dispatch({ type: 'ADMIN_SET_GEMS', amount: Number(gems) || 0 }); setGems(''); }}>
                  Set
                </Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[100, 500, 1000, 9999].map(amt => (
                  <Button key={amt} size="sm" variant="outline" onClick={() => dispatch({ type: 'ADMIN_SET_GEMS', amount: amt })}>
                    {amt} 💎
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading">⚡ Aksi Cepat</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => dispatch({ type: 'ADMIN_UNLOCK_ALL_GACHA' })}>
                  🎰 Unlock Semua Gacha
                </Button>
                <Button variant="outline" size="sm" onClick={() => dispatch({ type: 'ADMIN_MAX_REPUTATION' })}>
                  ⭐ Max Reputasi
                </Button>
                <Button variant="outline" size="sm" onClick={() => dispatch({ type: 'ADMIN_MAX_PRESTIGE' })}>
                  👑 Max Prestige
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  dispatch({ type: 'ADMIN_SET_MONEY', amount: 99999999 });
                  dispatch({ type: 'ADMIN_SET_GEMS', amount: 9999 });
                  dispatch({ type: 'ADMIN_UNLOCK_ALL_GACHA' });
                  dispatch({ type: 'ADMIN_MAX_REPUTATION' });
                  dispatch({ type: 'ADMIN_MAX_PRESTIGE' });
                }}>
                  🌟 Unlock SEMUA
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Overview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading">📦 Gacha Inventory ({(state.gachaInventory || []).length} item)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {[...new Set(state.gachaInventory || [])].map(id => {
                  const item = GACHA_ITEMS.find(i => i.id === id);
                  if (!item) return null;
                  const count = (state.gachaInventory || []).filter(i => i === id).length;
                  return (
                    <span key={id} className="text-xs bg-muted px-2 py-1 rounded">
                      {item.emoji} {item.name} x{count}
                    </span>
                  );
                })}
                {(state.gachaInventory || []).length === 0 && (
                  <span className="text-xs text-muted-foreground">Belum ada item</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Database Notice */}
          <Card className="border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading">🗄️ Database Pemain</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Demi keamanan, data pemain (email, progress, dll) <strong>tidak lagi tersedia di sini</strong>.
                Hanya pemilik project yang dapat melihatnya melalui <strong>Lovable Cloud → Database</strong>
                (buka tabel <code className="px-1 rounded bg-muted">player_overview</code>).
              </p>
            </CardContent>
          </Card>

          <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={() => { setAuthenticated(false); setPassword(''); setOpen(false); }}>
            🔒 Logout Admin
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
