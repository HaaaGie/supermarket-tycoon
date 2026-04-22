import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor config — HYBRID mode.
 *
 * Saat APK pertama kali dibuka, Capacitor mencoba load dari `server.url`
 * (= live Lovable preview). Jadi setiap user klik "Publish" di Lovable,
 * APK yang sudah terinstal otomatis menampilkan versi terbaru tanpa
 * harus rebuild APK. Kalau offline, Capacitor fallback ke bundled
 * `dist/` (snapshot terakhir saat APK dibuild).
 *
 * Bagaimana cara build APK:
 *   1. Klik tombol "Export to GitHub" di Lovable (pojok kanan atas)
 *   2. Git pull project ke komputer Anda
 *   3. npm install
 *   4. npx cap add android       (pertama kali saja)
 *   5. npm run build
 *   6. npx cap sync android
 *   7. npx cap open android      (buka Android Studio → Build APK)
 *
 * Selama Lovable masih aktif, APK auto-update via Publish.
 * Kalau Lovable suatu hari hilang, APK tetap bekerja pakai bundled dist.
 */
const config: CapacitorConfig = {
  appId: 'app.lovable.f67ea3d2c05e424faa85a19b9f5be3cb',
  appName: 'Supermarket Incremental',
  webDir: 'dist',
  server: {
    url: 'https://supermarket-incremental.lovable.app',
    cleartext: true,
    // Allow fallback to bundled web assets if remote URL is unreachable.
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#0f172a',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#0f172a',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f172a',
    },
  },
};

export default config;
