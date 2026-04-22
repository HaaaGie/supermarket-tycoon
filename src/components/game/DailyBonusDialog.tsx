import { useEffect, useState } from 'react';
import { useGame } from '@/game/GameContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

/**
 * Daily Login Bonus + Offline Reward.
 * - Streak-based bonus: $250 + 5💎 base, +50% per streak day, capped at 7 days.
 * - Resets streak if >36h since last claim.
 * - Offline reward: $0.5/minute (capped at 8h = 480 min) of away-time.
 *   Only shown if >5 minutes since last session and player has earned >$1k total.
 */
export default function DailyBonusDialog() {
  const { state, dispatch } = useGame();
  const [show, setShow] = useState(false);
  const [bonus, setBonus] = useState({ money: 0, gems: 0, streak: 1 });
  const [offline, setOffline] = useState<{ money: number; minutes: number } | null>(null);

  useEffect(() => {
    const now = Date.now();
    const last = state.lastDailyClaimAt || 0;
    const lastSession = state.lastSessionEndAt || 0;
    const hoursSinceClaim = (now - last) / (1000 * 60 * 60);
    const minutesAway = Math.max(0, Math.floor((now - lastSession) / (1000 * 60)));

    // Daily bonus: claimable every 20+ hours
    if (hoursSinceClaim >= 20) {
      const prevStreak = state.dailyStreak || 0;
      const newStreak = hoursSinceClaim < 48 ? Math.min(7, prevStreak + 1) : 1;
      const money = Math.floor(250 * (1 + 0.5 * (newStreak - 1)));
      const gems = 5 + (newStreak - 1) * 2;
      setBonus({ money, gems, streak: newStreak });
      setShow(true);
    }

    // Offline reward (only if game ran before, away >5min, ≤8h)
    if (lastSession > 0 && minutesAway > 5 && state.totalEarned > 1000) {
      const cappedMinutes = Math.min(minutesAway, 480);
      const money = Math.floor(cappedMinutes * 0.5 * (1 + (state.prestigeLevel || 0) * 0.1));
      if (money > 0) setOffline({ money, minutes: cappedMinutes });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track session end on unload
  useEffect(() => {
    const onUnload = () => {
      try {
        const saved = localStorage.getItem('supermarket_save');
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.lastSessionEndAt = Date.now();
          localStorage.setItem('supermarket_save', JSON.stringify(parsed));
        }
      } catch {}
    };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, []);

  const claim = () => {
    dispatch({ type: 'CLAIM_DAILY_BONUS', money: bonus.money, gems: bonus.gems, streak: bonus.streak });
    if (offline) dispatch({ type: 'CLAIM_OFFLINE_REWARD', money: offline.money, minutes: offline.minutes });
    setShow(false);
  };

  if (!show) return null;

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">🎁 Daily Login Bonus!</DialogTitle>
          <DialogDescription className="text-center">
            Selamat datang kembali! Klaim hadiah harianmu.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <div className="text-sm text-muted-foreground">Streak</div>
            <div className="text-3xl font-bold">{bonus.streak}🔥 / 7</div>
            <div className="flex gap-1 justify-center mt-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${
                  i < bonus.streak ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>{i + 1}</div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card border border-border rounded-lg p-3 text-center">
              <div className="text-2xl">💰</div>
              <div className="font-bold">+${bonus.money.toLocaleString()}</div>
            </div>
            <div className="bg-card border border-border rounded-lg p-3 text-center">
              <div className="text-2xl">💎</div>
              <div className="font-bold">+{bonus.gems}</div>
            </div>
          </div>
          {offline && (
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-3 text-center">
              <div className="text-sm text-muted-foreground">💤 Hadiah Offline ({offline.minutes} menit)</div>
              <div className="font-bold text-lg">+${offline.money.toLocaleString()}</div>
            </div>
          )}
          <Button className="w-full h-12 text-lg" onClick={claim}>
            ✨ Klaim Sekarang
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
