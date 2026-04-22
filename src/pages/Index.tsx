import { useState, useEffect, useRef, useCallback } from 'react';
import { GameProvider, INITIAL_STATE, type GameState } from '@/game/GameContext';
import { useGame } from '@/game/GameContext';
import { supabase } from '@/integrations/supabase/client';
import GameHeader from '@/components/game/GameHeader';
import ShelfManager from '@/components/game/ShelfManager';
import StockMarket from '@/components/game/StockMarket';
import EmployeePanel from '@/components/game/EmployeePanel';
import UpgradeShop from '@/components/game/UpgradeShop';
import PrestigePanel from '@/components/game/PrestigePanel';
import StatsPanel from '@/components/game/StatsPanel';
import Notifications from '@/components/game/Notifications';
import MainMenu from '@/components/game/MainMenu';
import DaySummary from '@/components/game/DaySummary';
import BranchPanel from '@/components/game/BranchPanel';
import MusicPlayer from '@/components/game/MusicPlayer';
import GachaPanel from '@/components/game/GachaPanel';
import AdminPanel from '@/components/game/AdminPanel';
import SfxManager from '@/components/game/SfxManager';
import SettingsPanel from '@/components/game/SettingsPanel';
import ThemeBackground from '@/components/game/ThemeBackground';
import ThemeEffects from '@/components/game/ThemeEffects';
import SideJobPanel from '@/components/game/SideJobPanel';
import ChoiceEventDialog from '@/components/game/ChoiceEventDialog';
import LeaderboardPanel from '@/components/game/LeaderboardPanel';
import LimitedMarketPanel from '@/components/game/LimitedMarketPanel';
import DailyBonusDialog from '@/components/game/DailyBonusDialog';

const TABS = [
  { id: 'shelves', label: '🛒 Rak', component: ShelfManager },
  { id: 'stock', label: '📦 Stok', component: StockMarket },
  { id: 'sidejobs', label: '💼 Side Job', component: SideJobPanel },
  { id: 'employees', label: '👥 Pegawai', component: EmployeePanel },
  { id: 'branches', label: '🏢 Cabang', component: BranchPanel },
  { id: 'upgrades', label: '⬆️ Upgrade', component: UpgradeShop },
  { id: 'gacha', label: '🎰 Gacha', component: GachaPanel },
  { id: 'limited', label: '🌸 Market Limited', component: LimitedMarketPanel },
  { id: 'prestige', label: '👑 Prestige', component: PrestigePanel },
  { id: 'leaderboard', label: '🏆 Ranking', component: LeaderboardPanel },
  { id: 'stats', label: '📊 Statistik', component: StatsPanel },
];

function AutoSave() {
  const { state } = useGame();
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const interval = setInterval(() => {
      const { notifications, ...toSave } = stateRef.current;
      localStorage.setItem('supermarket_save', JSON.stringify(toSave));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const activeSlot = localStorage.getItem('active_slot');
      if (!activeSlot) return;
      const { notifications, ...toSave } = stateRef.current;
      await supabase.from('save_slots').update({
        game_state: toSave as any,
      }).eq('user_id', session.user.id).eq('slot_number', parseInt(activeSlot));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return null;
}

function GameContent({ onBackToMenu }: { onBackToMenu: () => void }) {
  const [activeTab, setActiveTab] = useState('shelves');
  const ActiveComponent = TABS.find(t => t.id === activeTab)!.component;

  return (
    <SfxManager>
      <div className="min-h-screen bg-background relative">
        <ThemeBackground />
        <ThemeEffects />
        <div className="relative z-10">
          <GameHeader />
          <Notifications />
          <DaySummary />
          <MusicPlayer />
          <AutoSave />
          <ChoiceEventDialog />
          <DailyBonusDialog />
          
          <div className="bg-card/90 backdrop-blur-sm border-b border-border sticky top-0 z-40">
            <div className="max-w-6xl mx-auto flex overflow-x-auto items-center">
              <button
                onClick={onBackToMenu}
                className="px-3 py-3 text-sm text-muted-foreground hover:text-foreground transition-all border-b-2 border-transparent"
                title="Kembali ke Menu"
              >
                🏠
              </button>
              <div className="flex items-center">
                <SettingsPanel />
                <AdminPanel />
              </div>
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 font-heading font-medium text-sm whitespace-nowrap transition-all border-b-2 ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="max-w-6xl mx-auto p-4">
            <ActiveComponent />
          </div>
        </div>
      </div>
    </SfxManager>
  );
}

export default function Index() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showMenu, setShowMenu] = useState(true);

  const handleStartGame = useCallback((state: GameState) => {
    setGameState(state);
    setShowMenu(false);
  }, []);

  const handleBackToMenu = useCallback(() => {
    if (gameState) {
      const { notifications, ...toSave } = gameState;
      localStorage.setItem('supermarket_save', JSON.stringify(toSave));
    }
    setShowMenu(true);
    setGameState(null);
    // 🛠️ Bersihkan SEMUA sisa tema saat balik ke menu — fix bug tema (mis. Frostbite) "menempel"
    const root = document.documentElement;
    root.classList.remove('dark');
    const themeProps = ['--primary', '--secondary', '--accent', '--background', '--card', '--ring', '--sidebar-primary', '--muted', '--border', '--input', '--foreground'];
    themeProps.forEach(p => root.style.removeProperty(p));
    // Hapus <style data-theme-effects="..."> yang di-inject ThemeEffects
    document.querySelectorAll('style[data-theme-effects]').forEach(el => el.remove());
    // Hapus class theme-card / theme-glow yang di-tambah ThemeEffects
    document.querySelectorAll('.theme-card').forEach(el => el.classList.remove('theme-card'));
    document.querySelectorAll('.theme-glow').forEach(el => el.classList.remove('theme-glow'));
  }, [gameState]);

  if (showMenu) {
    return <MainMenu onStartGame={handleStartGame} />;
  }

  return (
    <GameProvider initialState={gameState || INITIAL_STATE}>
      <GameContent onBackToMenu={handleBackToMenu} />
    </GameProvider>
  );
}
