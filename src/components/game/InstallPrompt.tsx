import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

/**
 * PWA Install Prompt — muncul tombol install di MainMenu kalau browser
 * support beforeinstallprompt event (Chrome/Edge desktop & Android Chrome).
 * Untuk iOS Safari, tampilkan instruksi manual ("Share → Add to Home Screen").
 */
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  useEffect(() => {
    // Detect iOS Safari (no beforeinstallprompt support there)
    const ua = window.navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(ios);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const installedHandler = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', installedHandler);

    // Already installed?
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const install = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSHelp(true);
    }
  };

  if (installed) return null;
  if (!deferredPrompt && !isIOS) return null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={install}
        className="gap-2 animate-pulse-slow"
        title="Install game ini sebagai app di perangkatmu"
      >
        📱 Install App
      </Button>
      {showIOSHelp && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowIOSHelp(false)}>
          <div className="bg-card border border-border rounded-lg p-6 max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-3">📱 Install di iPhone</h3>
            <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
              <li>Tap tombol <b>Share</b> (kotak dengan panah ke atas) di Safari</li>
              <li>Scroll & pilih <b>"Add to Home Screen"</b></li>
              <li>Tap <b>"Add"</b> — game muncul di home screen!</li>
            </ol>
            <Button className="w-full mt-4" onClick={() => setShowIOSHelp(false)}>OK, mengerti</Button>
          </div>
        </div>
      )}
    </>
  );
}
