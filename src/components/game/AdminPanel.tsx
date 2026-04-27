import { useState, useEffect } from 'react';
import { useGame } from '@/game/GameContext';
import { GACHA_ITEMS } from '@/game/gachaData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

const ADMIN_PASSWORD = 'Ejebeh123';

type PlayerRow = {
  user_id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  day_reached: number;
  total_earned: number;
  items_sold: number;
  prestige_level: number;
  reputation: number;
  last_active: string | null;
};

export default function AdminPanel() {
  const { state, dispatch } = useGame();
  const [open, setOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [money, setMoney] = useState('');
  const [gems, setGems] = useState('');
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [playerSearch, setPlayerSearch] = useState('');

  const fetchPlayers = async () => {
    setLoadingPlayers(true);
    try {
      const [{ data: profiles }, { data: lb }] = await Promise.all([
        supabase.from('profiles').select('user_id,email,display_name,avatar_url,created_at').order('created_at', { ascending: false }).limit(500),
        supabase.from('leaderboard').select('user_id,day_reached,total_earned,items_sold,prestige_level,reputation,updated_at').limit(500),
      ]);
      const lbMap = new Map((lb || []).map(r => [r.user_id, r]));
      const merged: PlayerRow[] = (profiles || []).map(p => {
        const l = lbMap.get(p.user_id);
        return {
          user_id: p.user_id,
          email: p.email,
          display_name: p.display_name,
          avatar_url: p.avatar_url,
          created_at: p.created_at,
          day_reached: l?.day_reached || 0,
          total_earned: Number(l?.total_earned || 0),
          items_sold: Number(l?.items_sold || 0),
          prestige_level: l?.prestige_level || 0,
          reputation: l?.reputation || 0,
          last_active: l?.updated_at || null,
        };
      });
      setPlayers(merged);
    } catch (e) {
      console.error('Fetch players failed', e);
    } finally {
      setLoadingPlayers(false);
    }
  };

  useEffect(() => {
    if (authenticated && open) fetchPlayers();
  }, [authenticated, open]);

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

          <Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={() => { setAuthenticated(false); setPassword(''); setOpen(false); }}>
            🔒 Logout Admin
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
