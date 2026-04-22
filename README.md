# Supermarket Incremental 🏪

Game incremental tycoon di mana kamu membangun kerajaan supermarket-mu sendiri. Dibuat dengan React, Vite, TypeScript, Tailwind, dan Lovable Cloud.

🎮 **Main online**: https://supermarket-incremental.lovable.app

---

## 📱 Install sebagai App

### Desktop (Windows/Mac/Linux)
1. Buka game di Chrome atau Edge
2. Klik tombol **"📱 Install App"** di menu utama (atau ikon install di address bar)
3. Game terinstall sebagai app standalone

### Android (PWA)
1. Buka game di Chrome Android
2. Klik tombol **"📱 Install App"** atau menu ⋮ → "Install app"
3. Game muncul di home screen seperti app biasa

### iPhone / iPad
1. Buka game di Safari
2. Tap tombol **Share** (kotak dengan panah)
3. Pilih **"Add to Home Screen"**

---

## 🤖 Build APK Android Native (Capacitor)

Game sudah dikonfigurasi pakai **Capacitor hybrid mode**:
- APK load dari live URL (`https://supermarket-incremental.lovable.app`)
- Setiap kali kamu klik **Publish** di Lovable, APK yang sudah terinstal **otomatis ikut update**
- Kalau offline, fallback ke versi `dist/` yang di-bundle saat build APK

### Cara build APK:

```bash
# 1. Klik "Export to GitHub" di Lovable (pojok kanan atas)
# 2. Clone project ke komputer
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# 3. Install dependencies
npm install

# 4. Tambah platform Android (sekali aja)
npx cap add android

# 5. Build web assets
npm run build

# 6. Sync ke native project
npx cap sync android

# 7. Buka di Android Studio
npx cap open android

# Di Android Studio:
# - Build → Build Bundle(s) / APK(s) → Build APK(s)
# - APK ada di: android/app/build/outputs/apk/debug/app-debug.apk
# - Transfer APK ke HP, install (aktifkan "Install from unknown sources")
```

### Update APK setelah ada perubahan:

Karena pakai **hybrid mode dengan remote URL**, kamu tidak perlu rebuild APK setiap kali update:

✅ **Cara mudah (recommended)**: Klik tombol **Publish** di Lovable. APK otomatis load versi terbaru saat dibuka (perlu internet sekali).

🔧 **Rebuild APK** (kalau mau update bundled fallback offline):
```bash
git pull
npm install
npm run build
npx cap sync android
npx cap open android   # build APK ulang
```

### iOS (Mac only):
```bash
npx cap add ios
npm run build
npx cap sync ios
npx cap open ios   # buka Xcode → Run di simulator/device
```

---

## 🛡️ Apa yang terjadi kalau Lovable suatu hari hilang?

✅ **Kamu tetap bisa update game ini selamanya**, karena:
1. Source code ada di GitHub kamu (setelah klik Export to GitHub)
2. Bisa di-host di mana saja: Vercel, Netlify, GitHub Pages, Cloudflare Pages, self-hosting
3. APK Capacitor bisa diarahkan ke URL hosting baru — edit `capacitor.config.ts` → field `server.url`
4. Lovable Cloud (Supabase backend) bisa di-export & di-self-host juga

---

## 🛠️ Development

```bash
npm install
npm run dev    # buka http://localhost:8080
npm run build  # build untuk production
```

## 📦 Tech Stack

- **Frontend**: React 18, Vite 5, TypeScript 5, Tailwind CSS v3
- **UI**: shadcn/ui, Radix UI primitives
- **Backend**: Supabase (Auth, Database, Storage)
- **Mobile**: Capacitor (Android & iOS)
- **PWA**: Web Manifest, installable

---

Made with ❤️ using [Lovable](https://lovable.dev)
