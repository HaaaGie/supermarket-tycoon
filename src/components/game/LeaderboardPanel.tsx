import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGame } from '@/game/GameContext';
import { Card, CardContent } from '@/components/ui/card';
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
  last_active: string;
}

type SortKey = 'total_earned' | 'day_reached' | 'prestige_level' | 'items_sold' | 'reputation';

const ONLINE_WINDOW_MS = 3 * 60 * 1000; // 3 minutes

function isOnline(lastActive?: string) {
  if (!lastActive) return false;
  return Date.now() - new Date(lastActive).getTime() < ONLINE_WINDOW_MS;
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}d lalu`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}j lalu`;
  return `${Math.floor(diff / 86400)}h lalu`;
}

export default function LeaderboardPanel() {
  const { state } = useGame();
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortKey>('total_earned');
  const [now, setNow] = useState(Date.now());

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

  // Realtime: instantly refresh when any leaderboard row changes
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leaderboard' },
        () => fetchLeaderboard()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, sortBy]);

  // Tick clock every 15s so "online" dots & timeAgo refresh
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(t);
  }, []);

  // Refetch every 30s as a safety net (in case realtime drops)
  useEffect(() => {
    if (!user) return;
    const t = setInterval(() => fetchLeaderboard(), 30000);
    return () => clearInterval(t);
  }, [user, sortBy]);

  const fetchLeaderboard = async () => {
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

  const onlineCount = entries.filter(e => isOnline(e.last_active)).length;
  const champion = entries[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-heading font-bold">🏆 Leaderboard</h2>
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Auto-update
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted text-muted-foreground">
            👥 {entries.length} pemain
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-medium">
            🟢 {onlineCount} online
          </span>
        </div>
      </div>

      {/* Champion banner */}
      {champion && (
        <Card className="bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-primary/10 border-yellow-500/30">
          <CardContent className="py-3 px-4 flex items-center gap-3">
            <span className="text-3xl">👑</span>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                Champion Saat Ini
              </div>
              <div className="font-heading font-bold truncate flex items-center gap-2">
                {champion.display_name}
                {isOnline(champion.last_active) && (
                  <span className="text-[10px] text-green-600 dark:text-green-400 font-bold">● ONLINE</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                💰 ${champion.total_earned.toLocaleString()} · 📅 Hari {champion.day_reached} · 👑 P{champion.prestige_level}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
            <p>Belum ada data. Mulai main untuk masuk ke leaderboard!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {entries.map((entry, idx) => {
            const isMe = entry.user_id === user.id;
            const online = isOnline(entry.last_active);
            return (
              <Card key={entry.id} className={`transition-all ${isMe ? 'ring-2 ring-primary bg-primary/5' : ''}`}>
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold min-w-[2.5rem] text-center">
                      {getRankEmoji(idx + 1)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-heading font-medium text-sm truncate flex items-center gap-1.5">
                          {online && (
                            <span
                              className="inline-block h-2 w-2 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.8)]"
                              title="Online sekarang"
                            />
                          )}
                          {entry.display_name}
                        </span>
                        {isMe && (
                          <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded font-bold">
                            KAMU
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground ml-auto">
                          {online ? 'online' : timeAgo(entry.last_active || entry.updated_at)}
                        </span>
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
            ✨ Leaderboard otomatis ter-update setiap kali progres tersimpan ke cloud (±15 detik). Tidak perlu sync manual lagi!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
