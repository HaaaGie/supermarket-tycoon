import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Install Prompt — versi PWA-only (paling mudah & tanpa bug).
 *
 * Kenapa PWA?
 *  - Tidak perlu build APK manual (yang sebelumnya error "problem parsing the package"
 *    karena file APK belum benar-benar ada di /downloads/).
 *  - Bisa install di Android (Chrome/Edge), iPhone (Safari → Add to Home Screen),
 *    dan Desktop (Chrome/Edge).
 *  - Otomatis update setiap kali developer klik Publish — user nggak perlu
 *    re-install apa pun.
 *  - Bisa dibuka full-screen seperti aplikasi native.
 */
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showHelp, setShowHelp] = useState<null | 'ios' | 'manual'>(null);

  useEffect(() => {
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

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowHelp('ios');
    } else {
      setShowHelp('manual');
    }
  };

  if (installed) return null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleInstall}
        className="gap-2"
        title="Install game ini ke perangkatmu (auto-update)"
      >
        📱 Install Game
      </Button>

      {showHelp && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowHelp(null)}
        >
          <div
            className="bg-card border border-border rounded-lg p-6 max-w-sm max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {showHelp === 'ios' && (
              <>
                <h3 className="font-bold text-lg mb-3">📱 Install di iPhone</h3>
                <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
                  <li>Buka game ini di <b>Safari</b> (bukan Chrome)</li>
                  <li>Tap tombol <b>Share</b> (kotak dengan panah ke atas)</li>
                  <li>Scroll & pilih <b>"Add to Home Screen"</b></li>
                  <li>Tap <b>"Add"</b> — game muncul di home screen seperti aplikasi!</li>
                </ol>
                <p className="text-xs italic text-muted-foreground mt-3">
                  💡 Game otomatis update tiap kali developer publish — nggak perlu install ulang.
                </p>
              </>
            )}

            {showHelp === 'manual' && (
              <>
                <h3 className="font-bold text-lg mb-3">📱 Cara Install</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Browser kamu belum nawarin install otomatis. Coba salah satu cara ini:
                </p>
                <ul className="text-sm space-y-2 list-disc list-inside text-muted-foreground">
                  <li><b>Chrome Android:</b> tap menu ⋮ → <b>"Install app"</b> atau <b>"Add to Home Screen"</b></li>
                  <li><b>Chrome / Edge Desktop:</b> klik ikon install (⊕) di address bar, atau menu ⋮ → <b>"Install Game…"</b></li>
                  <li><b>Firefox Android:</b> menu ⋮ → <b>"Install"</b></li>
                  <li><b>Samsung Internet:</b> menu → <b>"Add page to" → "Home screen"</b></li>
                </ul>
                <p className="text-xs italic text-muted-foreground mt-3">
                  💡 Setelah terinstall, game jalan full-screen & otomatis update tiap publish.
                </p>
              </>
            )}

            <Button className="w-full mt-4" onClick={() => setShowHelp(null)}>
              OK, mengerti
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
