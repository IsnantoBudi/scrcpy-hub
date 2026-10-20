# Scrcpy Hub

Aplikasi desktop berbasis **Rust (Tauri v2)** dan antarmuka modern **React + Tailwind CSS** yang dirancang sebagai pusat kendali grafis (*GUI Companion*) resmi untuk Scrcpy. Aplikasi ini memungkinkan pengguna menjalankan aplikasi Android sebagai **Virtual Display mandiri** (`scrcpy --new-display`) serta melakukan **Cermin Layar Penuh** dengan integrasi logo/ikon aplikasi, preset kinerja (latensi rendah), dan cheat sheet pintasan keyboard dengan standar *Anti-Slop Enterprise 2026*.

---

## Fitur Utama

1. **Multi-Window Virtual Display per Aplikasi**:
   - Klik kartu aplikasi untuk meluncurkan aplikasi HP secara independen di Windows (`scrcpy --new-display --start-app=<pkg>`).
   - Layar smartphone tetap bebas digunakan untuk aktivitas lain tanpa terganggu.
2. **Cermin Layar Penuh (Full Screen Mirror)**:
   - Satu klik untuk membuka streaming layar smartphone secara penuh menggunakan Scrcpy standar.
3. **Ekstraksi Logo & Ikon Aplikasi Berkecepatan Tinggi**:
   - Ikon aplikasi diekstrak otomatis dari perangkat via ADB dan disimpan dalam *local disk cache* (`%APPDATA%/ScrcpyHub/icons/`).
   - Pemuatan latar belakang berurutan (*sequential background queue*) mencegah kemacetan server ADB dan mencegah status *(Not Responding)*.
4. **Preset Kinerja & Kontrol Streaming**:
   - **Hemat & Rendah Latensi**: `--turn-screen-off --stay-awake --no-audio --max-size=1024 --video-bit-rate=4M --max-fps=30`
   - **Seimbang**: 1440px, 8 Mbps, 60 FPS
   - **Kualitas Maksimal**: Resolusi native, 16 Mbps, 60 FPS
   - Pengaturan tersimpan permanen di perangkat PC Anda.
5. **Cheat Sheet Pintasan Keyboard (Scrcpy Shortcuts)**:
   - Akses cepat daftar pintasan resmi Scrcpy: Navigasi (`MOD+h`, `MOD+b`, `MOD+s`), Layar HP (`MOD+o`, `MOD+Shift+o`, `MOD+p`), Clipboard (`MOD+c`, `MOD+v`), dan Fullscreen (`MOD+f`).
6. **Desain Anti-Slop 2026**:
   - Palet netral Slate/Zinc (Dual Theme: Light & Dark otomatis mengikuti Windows), zero purple neon, *typography-first*, dan CSS Grid yang terisolasi dari masalah elemen bertumpuk.

---

## Prasyarat Sistem

1. **Scrcpy & ADB**:
   - Pastikan `scrcpy` dan `adb` sudah terpasang dan dapat diakses melalui Terminal / PATH sistem.
2. **Smartphone Android**:
   - Aktifkan **Opsi Pengembang (Developer Options)**.
   - Aktifkan **USB Debugging** dan **USB Debugging (Security settings)**.

---

## Cara Menjalankan

### Mode Pengembangan (Dev Mode)
```bash
npm run tauri dev
```

### Menjalankan Binary Hasil Kompilasi
```bash
src-tauri\target\debug\scrcpy-hub.exe
```

### Build Installer / Rilis Produksi
```bash
npm run tauri build
```
Executable dan installer akan dibuat di:
`src-tauri/target/release/bundle/msi/`
