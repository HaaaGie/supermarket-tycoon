import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { INITIAL_STATE, type GameState } from '@/game/GameContext';
import type { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import UpdateLog, { LATEST_VERSION } from './UpdateLog';
import Tutorial from './Tutorial';
import InstallPrompt from './InstallPrompt';

interface MainMenuProps {
  onStartGame: (state: GameState) => void;
}

interface SaveSlot {
  slot_number: number;
  slot_name: string;
  game_state: any;
  updated_at: string;
}

export default function MainMenu({ onStartGame }: MainMenuProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<(SaveSlot | null)[]>([null, null, null]);
  const [signingIn, setSigningIn] = useState(false);

  // 🛠️ FIX BUG TEMA: Saat MainMenu mount, bersihkan TOTAL semua sisa efek tema
  // (termasuk Frostbite Aurora, partikel ambient, flash, CSS vars, style tags).
  // Bug sebelumnya: kembali ke MainMenu lalu Main Tanpa Login kadang menampilkan
  // tema acak (sering Frostbite) karena <style data-theme-effects> & class .theme-card
  // dari sesi sebelumnya masih nempel di document.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    const themeProps = ['--primary', '--secondary', '--accent', '--background', '--card', '--ring', '--sidebar-primary', '--muted', '--border', '--input', '--foreground', '--muted-foreground'];
    themeProps.forEach(p => root.style.removeProperty(p));
    document.querySelectorAll('style[data-theme-effects]').forEach(el => el.remove());
    document.querySelectorAll('.theme-card').forEach(el => el.classList.remove('theme-card'));
    document.querySelectorAll('.theme-glow').forEach(el => el.classList.remove('theme-glow'));
    // Bersihkan partikel/flash yang mungkin tertinggal di body
    document.querySelectorAll('body > span[style*="z-index: 9998"], body > div[style*="z-index: 9997"]').forEach(el => el.remove());
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN' && session?.user) {
        const u = session.user;
        const displayName = u.user_metadata?.full_name || u.user_metadata?.name || (u.email?.split('@')[0]) || 'Player';
        supabase.from('leaderboard').upsert({
          user_id: u.id,
          display_name: displayName,
        }, { onConflict: 'user_id' }).then(() => {/* logged */});
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) loadSlots();
  }, [user]);

  const loadSlots = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('save_slots')
      .select('*')
      .eq('user_id', user.id)
      .order('slot_number');
    
    const newSlots: (SaveSlot | null)[] = [null, null, null];
    data?.forEach((s: any) => {
      if (s.slot_number >= 1 && s.slot_number <= 3) {
        newSlots[s.slot_number - 1] = s;
      }
    });
    setSlots(newSlots);
  };

  const handleGoogleLogin = async () => {
    setSigningIn(true);
    try {
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
        // Force account picker — pastikan user verifikasi akun Google sebelum masuk
        extraParams: { prompt: 'select_account' },
      });
      if (result.error) {
        console.error('Login error:', result.error);
      }
    } catch (e) {
      console.error(e);
    }
    setSigningIn(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSlots([null, null, null]);
  };

  const handleLoadSlot = (slot: SaveSlot) => {
    const gameState = { ...INITIAL_STATE, ...(slot.game_state as any), notifications: [], gameStarted: true };
    onStartGame(gameState);
  };

  const handleNewGame = async (slotNumber: number) => {
    const newState = { ...INITIAL_STATE, gameStarted: true };
    if (user) {
      const { notifications, ...toSave } = newState;
      await supabase.from('save_slots').upsert({
        user_id: user.id,
        slot_number: slotNumber,
        slot_name: `Slot ${slotNumber}`,
        game_state: toSave as any,
      }, { onConflict: 'user_id,slot_number' });
    }
    onStartGame(newState);
  };

  const handleDeleteSlot = async (slotNumber: number) => {
    if (!user) return;
    await supabase.from('save_slots').delete().eq('user_id', user.id).eq('slot_number', slotNumber);
    await loadSlots();
  };

  const handlePlayWithoutLogin = () => {
    const saved = localStorage.getItem('supermarket_save');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const merged = { ...INITIAL_STATE, ...parsed, notifications: [], gameStarted: true };
        onStartGame(merged);
        return;
      } catch {}
    }
    onStartGame({ ...INITIAL_STATE, gameStarted: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-4xl animate-float">🏪</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Title */}
      <div className="text-center mb-6 animate-fade-in">
        <div className="text-7xl mb-4 animate-float">🏪</div>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-2">
          Supermarket Incremental
        </h1>
        <p className="text-muted-foreground font-body text-lg">
          Bangun kerajaan supermarket-mu! 🛒💰
        </p>
        <p className="text-xs text-muted-foreground mt-1">{LATEST_VERSION}</p>
      </div>

      {/* Tutorial & Update Log & Install buttons */}
      <div className="flex gap-2 mb-6 animate-fade-in flex-wrap justify-center">
        <Tutorial autoOpenForNewPlayer />
        <UpdateLog />
        <InstallPrompt />
      </div>

      {/* Auth Section */}
      {!user ? (
        <div className="space-y-4 w-full max-w-md animate-slide-up">
          <Button 
            onClick={handleGoogleLogin} 
            disabled={signingIn}
            className="w-full h-14 text-lg font-heading gap-3"
            size="lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {signingIn ? 'Menghubungkan...' : 'Masuk dengan Google'}
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">atau</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            onClick={handlePlayWithoutLogin}
            className="w-full h-12 text-base font-heading"
          >
            🎮 Main Tanpa Login
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            🔐 Login pakai Google — email kamu otomatis terverifikasi via Google.
            <br />Login untuk menyimpan progress ke cloud ☁️ & tampil di leaderboard 🏆.
          </p>
        </div>
      ) : (
        <div className="w-full max-w-lg space-y-4 animate-slide-up">
          {/* User Info */}
          <div className="flex items-center justify-between bg-card p-3 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              {user.user_metadata?.avatar_url && (
                <img src={user.user_metadata.avatar_url} alt="" className="w-8 h-8 rounded-full" />
              )}
              <div>
                <div className="font-heading font-medium text-sm text-foreground">
                  {user.user_metadata?.full_name || user.email}
                </div>
                <div className="text-xs text-muted-foreground">☁️ Cloud Save Aktif</div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-xs">
              Logout
            </Button>
          </div>

          {/* Save Slots */}
          <h2 className="font-heading text-xl font-bold text-foreground text-center">📂 Pilih Save Slot</h2>
          <div className="grid gap-3">
            {[1, 2, 3].map(slotNum => {
              const slot = slots[slotNum - 1];
              return (
                <Card key={slotNum} className="overflow-hidden">
                  <CardContent className="p-4">
                    {slot ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-heading font-semibold text-foreground">
                            🏪 {(slot.game_state as any)?.storeName || `Slot ${slotNum}`}
                          </div>
                          <div className="text-xs text-muted-foreground space-x-3">
                            <span>📅 Hari {(slot.game_state as any)?.day || 1}</span>
                            <span>💰 ${Math.floor((slot.game_state as any)?.money || 0).toLocaleString()}</span>
                            <span>⭐ {Math.floor((slot.game_state as any)?.reputation || 0)}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Terakhir: {new Date(slot.updated_at).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleLoadSlot(slot)}>
                            ▶️ Main
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteSlot(slotNum)}>
                            🗑️
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="text-muted-foreground font-heading">
                          Slot {slotNum} — <span className="text-xs">Kosong</span>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleNewGame(slotNum)}>
                          ➕ Game Baru
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
