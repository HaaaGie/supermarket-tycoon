import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Install Prompt — 3 cara install:
 *  1) PWA install (Chrome/Edge desktop & Android Chrome) via beforeinstallprompt
 *  2) iOS Safari → instruksi manual "Add to Home Screen"
 *  3) Download APK Android (hybrid Capacitor) — APK terhubung ke Lovable URL,
 *     jadi setiap kali developer Publish, APK otomatis menampilkan versi terbaru
 *     tanpa user perlu update APK.
 *
 * APK download URL: ditaruh di public/downloads/supermarket-incremental.apk
 * (Anda perlu build APK lewat `npx cap` lalu upload file ke folder tersebut,
 *  atau host di GitHub Releases & ganti APK_URL di bawah.)
 */

// 👉 Ganti ini dengan URL APK Anda (GitHub Releases direkomendasikan agar gratis & cepat)
const APK_URL = '/downloads/supermarket-incremental.apk';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [showHelp, setShowHelp] = useState<null | 'ios' | 'android-apk' | 'pwa'>(null);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const android = /Android/.test(ua);
    setIsIOS(ios);
    setIsAndroid(android);

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

  const installPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowHelp('ios');
    } else {
      setShowHelp('pwa');
    }
  };

  const downloadAPK = () => {
    setShowHelp('android-apk');
  };

  if (installed) return null;

  return (
    <>
      {/* Install Web App (PWA) — works everywhere except iOS needs manual steps */}
      <Button
        variant="outline"
        size="sm"
        onClick={installPWA}
        className="gap-2"
        title="Install game ini sebagai Web App di perangkatmu"
      >
        📱 Install Web App
      </Button>

      {/* Download APK button — only show on Android or desktop */}
      {!isIOS && (
        <Button
          variant="outline"
          size="sm"
          onClick={downloadAPK}
          className="gap-2"
          title="Download APK Android (auto-update saat developer publish)"
        >
          🤖 Download APK
        </Button>
      )}

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
                  <li>Tap tombol <b>Share</b> (kotak dengan panah ke atas) di Safari</li>
                  <li>Scroll & pilih <b>"Add to Home Screen"</b></li>
                  <li>Tap <b>"Add"</b> — game muncul di home screen!</li>
                </ol>
              </>
            )}

            {showHelp === 'pwa' && (
              <>
                <h3 className="font-bold text-lg mb-3">📱 Install Web App</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Browser kamu belum nawarin install otomatis. Coba:
                </p>
                <ul className="text-sm space-y-2 list-disc list-inside text-muted-foreground">
                  <li><b>Chrome/Edge desktop:</b> klik ikon install (⊕) di address bar</li>
                  <li><b>Chrome Android:</b> menu ⋮ → "Install app" / "Add to Home Screen"</li>
                  <li><b>Firefox:</b> menu → "Install"</li>
                </ul>
              </>
            )}

            {showHelp === 'android-apk' && (
              <>
                <h3 className="font-bold text-lg mb-3">🤖 Install APK Android</h3>
                <div className="text-sm space-y-3 text-muted-foreground">
                  <p>
                    APK ini adalah aplikasi Android native yang <b>otomatis update</b> setiap
                    kali developer publish — kamu nggak perlu re-install APK.
                  </p>
                  <ol className="space-y-2 list-decimal list-inside">
                    <li>Tap tombol <b>Download APK</b> di bawah</li>
                    <li>Buka file APK setelah selesai download</li>
                    <li>
                      Kalau muncul peringatan "Install unknown apps", izinkan untuk browser
                      kamu (Settings → Apps → browser → Install unknown apps)
                    </li>
                    <li>Tap <b>Install</b> → buka game! 🎮</li>
                  </ol>
                  <p className="text-xs italic">
                    💡 Game butuh koneksi internet karena live-loaded dari server. Saat
                    offline, akan pakai snapshot terakhir.
                  </p>
                </div>
                <div className="flex gap-2 mt-4">
                  <a
                    href={APK_URL}
                    download
                    className="flex-1"
                    onClick={() => setTimeout(() => setShowHelp(null), 500)}
                  >
                    <Button className="w-full">⬇️ Download APK</Button>
                  </a>
                  <Button variant="outline" onClick={() => setShowHelp(null)}>
                    Batal
                  </Button>
                </div>
              </>
            )}

            {showHelp !== 'android-apk' && (
              <Button className="w-full mt-4" onClick={() => setShowHelp(null)}>
                OK, mengerti
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
