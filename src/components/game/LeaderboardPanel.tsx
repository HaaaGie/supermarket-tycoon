import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGame } from '@/game/GameContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { User } from '@supabase/supabase-js';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  display_name: string;
  total_earned: number;
  day_reached: number;
  prestige_level: number;
  items_sold: number;
  reputation: number;
  updated_at: string;
}

type SortKey = 'total_earned' | 'day_reached' | 'prestige_level' | 'items_sold' | 'reputation';

export default function LeaderboardPanel() {
  const { state } = useGame();
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortKey>('total_earned');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchLeaderboard();
    } else {
      setLoading(false);
    }
  }, [user, sortBy]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order(sortBy, { ascending: false })
      .limit(50);

    if (!error && data) {
      setEntries(data as LeaderboardEntry[]);
    }
    setLoading(false);
  };

  const syncScore = async () => {
    if (!user) return;
    setSyncing(true);
    
    const profile = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', user.id)
      .single();

    const displayName = profile.data?.display_name || user.email?.split('@')[0] || 'Player';

    const payload = {
      user_id: user.id,
      display_name: displayName,
      total_earned: Math.floor(state.totalEarned),
      day_reached: state.day,
      prestige_level: state.prestigeLevel || 0,
      items_sold: state.itemsSold,
      reputation: Math.floor(state.reputation),
    };

    // Upsert
    const { data: existing } = await supabase
      .from('leaderboard')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existing) {
      await supabase.from('leaderboard').update(payload).eq('user_id', user.id);
    } else {
      await supabase.from('leaderboard').insert(payload);
    }

    setSyncing(false);
    fetchLeaderboard();
  };

  const sortOptions: { key: SortKey; label: string; emoji: string }[] = [
    { key: 'total_earned', label: 'Total Uang', emoji: '💰' },
    { key: 'day_reached', label: 'Hari', emoji: '📅' },
    { key: 'prestige_level', label: 'Prestige', emoji: '👑' },
    { key: 'items_sold', label: 'Item Terjual', emoji: '📦' },
    { key: 'reputation', label: 'Reputasi', emoji: '⭐' },
  ];

  const getRankEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (!user) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-heading font-bold">🏆 Leaderboard</h2>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p className="text-2xl mb-2">🔒</p>
            <p>Login terlebih dahulu untuk melihat dan berpartisipasi di leaderboard!</p>
            <p className="text-xs mt-1">Kembali ke menu utama untuk login.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-heading font-bold">🏆 Leaderboard</h2>
        <Button onClick={syncScore} disabled={syncing} size="sm">
          {syncing ? '⏳ Menyimpan...' : '📤 Sync Skor'}
        </Button>
      </div>

      {/* Sort buttons */}
      <div className="flex gap-1 flex-wrap">
        {sortOptions.map(opt => (
          <Button
            key={opt.key}
            size="sm"
            variant={sortBy === opt.key ? 'default' : 'outline'}
            onClick={() => setSortBy(opt.key)}
            className="text-xs"
          >
            {opt.emoji} {opt.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Memuat leaderboard...
          </CardContent>
        </Card>
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>Belum ada data. Klik "Sync Skor" untuk menambahkan skormu!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, idx) => {
            const isMe = entry.user_id === user.id;
            return (
              <Card key={entry.id} className={`transition-all ${isMe ? 'ring-2 ring-primary bg-primary/5' : ''}`}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold min-w-[2.5rem] text-center">
                      {getRankEmoji(idx + 1)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-heading font-medium text-sm truncate">
                          {entry.display_name}
                        </span>
                        {isMe && (
                          <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-bold">
                            KAMU
                          </span>
                        )}
                      </div>
                      <div className="flex gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                        <span>💰 ${entry.total_earned.toLocaleString()}</span>
                        <span>📅 Hari {entry.day_reached}</span>
                        <span>👑 P{entry.prestige_level}</span>
                        <span>📦 {entry.items_sold.toLocaleString()}</span>
                        <span>⭐ {entry.reputation}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardContent className="py-3">
          <p className="text-xs text-muted-foreground text-center">
            💡 Klik "Sync Skor" untuk memperbarui skormu di leaderboard. Skor disimpan secara online!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
