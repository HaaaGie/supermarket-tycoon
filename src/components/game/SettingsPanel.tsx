import { useState } from 'react';
import { useGame } from '@/game/GameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';

export default function SettingsPanel() {
  const { state, dispatch } = useGame();
  const [open, setOpen] = useState(false);
  const [storeName, setStoreName] = useState(state.storeName);

  const handleSaveStoreName = () => {
    if (storeName.trim()) {
      dispatch({ type: 'SET_STORE_NAME', name: storeName.trim() });
    }
  };

  const handleExportSave = () => {
    const { notifications, ...toSave } = state;
    const blob = new Blob([JSON.stringify(toSave, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supermarket_save_${state.storeName.replace(/\s+/g, '_')}_day${state.day}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportSave = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        dispatch({ type: 'LOAD_STATE', state: { ...data, notifications: [], gameStarted: true } });
      } catch {
        alert('File save tidak valid!');
      }
    };
    input.click();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
          ⚙️
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">⚙️ Pengaturan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Audio Settings */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading">🔊 Audio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="music" className="text-sm cursor-pointer">🎵 Musik Latar</Label>
                <Switch
                  id="music"
                  checked={state.musicEnabled}
                  onCheckedChange={() => dispatch({ type: 'TOGGLE_MUSIC' })}
                />
              </div>
              {state.musicEnabled && (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">🔈 Volume Musik</Label>
                      <span className="text-xs font-medium text-foreground">{Math.round((state.musicVolume ?? 0.5) * 100)}%</span>
                    </div>
                    <Slider
                      value={[state.musicVolume ?? 0.5]}
                      min={0}
                      max={1}
                      step={0.05}
                      onValueChange={([v]) => dispatch({ type: 'SET_MUSIC_VOLUME', volume: v })}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="loop" className="text-sm cursor-pointer">🔁 Loop Musik</Label>
                    <Switch
                      id="loop"
                      checked={state.musicLoop ?? true}
                      onCheckedChange={() => dispatch({ type: 'TOGGLE_MUSIC_LOOP' })}
                    />
                  </div>
                </>
              )}
              <div className="flex items-center justify-between">
                <Label htmlFor="sfx" className="text-sm cursor-pointer">🔔 Efek Suara (SFX)</Label>
                <Switch
                  id="sfx"
                  checked={state.sfxEnabled ?? true}
                  onCheckedChange={() => dispatch({ type: 'TOGGLE_SFX' })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Store Settings */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading">🏪 Toko</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Nama Toko</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={storeName}
                    onChange={e => setStoreName(e.target.value)}
                    maxLength={30}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleSaveStoreName}>Simpan</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Game Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading">📊 Info Game</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between"><span>Hari</span><span className="text-foreground font-medium">{state.day}</span></div>
              <div className="flex justify-between"><span>Total Pendapatan</span><span className="text-foreground font-medium">${Math.floor(state.totalEarned).toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Total Pengeluaran</span><span className="text-foreground font-medium">${Math.floor(state.totalSpent).toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Pelanggan Dilayani</span><span className="text-foreground font-medium">{state.customersServed}</span></div>
              <div className="flex justify-between"><span>Item Terjual</span><span className="text-foreground font-medium">{state.itemsSold}</span></div>
              <div className="flex justify-between"><span>Pegawai</span><span className="text-foreground font-medium">{state.employees.length}</span></div>
              <div className="flex justify-between"><span>Cabang</span><span className="text-foreground font-medium">{state.branches.length}</span></div>
              <div className="flex justify-between"><span>Prestige Level</span><span className="text-foreground font-medium">{state.prestigeLevel || 0}</span></div>
              <div className="flex justify-between"><span>Koleksi Gacha</span><span className="text-foreground font-medium">{[...new Set(state.gachaInventory || [])].length} unik</span></div>
            </CardContent>
          </Card>

          {/* Save/Load */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading">💾 Save/Load</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full" onClick={handleExportSave}>
                📥 Export Save ke File
              </Button>
              <Button variant="outline" size="sm" className="w-full" onClick={handleImportSave}>
                📤 Import Save dari File
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Backup save kamu ke file JSON
              </p>
            </CardContent>
          </Card>

          <Separator />
          
          <p className="text-xs text-center text-muted-foreground">
            Supermarket Incremental v1.2 — Made with ❤️
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
