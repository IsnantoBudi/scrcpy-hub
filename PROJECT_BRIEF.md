# Project Brief: Scrcpy Hub (Desktop Client)

Scrcpy Hub adalah aplikasi desktop berbasis **Rust (Tauri v2)** dan antarmuka modern **React + Tailwind CSS** yang dirancang sebagai pusat kendali grafis dan peluncur aplikasi (*GUI Companion*) untuk Scrcpy. Aplikasi ini memungkinkan pengguna meluncurkan aplikasi HP secara independen di Windows menggunakan fitur *Virtual Display* (`scrcpy --new-display`) serta melakukan *Mirroring Penuh* dengan sekali klik, dilengkapi visualisasi ikon aplikasi, preset performa, dan cheat sheet pintasan keyboard *Anti-Slop Enterprise*.

---

## 1. Spesifikasi Kebutuhan & Hasil Interview (/grill-me)

| Parameter | Keputusan Desain |
| :--- | :--- |
| **Identitas & Branding** | **Scrcpy Hub**: Fokus sebagai utility/companion resmi untuk Scrcpy. |
| **Arsitektur Utama** | **Tauri v2 (Rust Core + Modern Web UI)**: Rust mengelola ADB, proses Scrcpy, file caching; Web UI mengelola tampilan visual. |
| **Peluncuran Aplikasi** | `scrcpy --new-display --start-app=<package>`: Menggunakan negosiasi resolusi native otomatis tanpa distorsi atau overload encoder. |
| **Kategori Aplikasi** | **User Apps secara default** dengan Tab/Toggle cepat untuk beralih ke **System Apps**. |
| **Ikon Aplikasi** | Ekstraksi otomatis logo aplikasi HP dengan sistem **Local Cache Disk** di `%APPDATA%/ScrcpyHub/icons/`. |
| **Preset Kinerja** | Pilihan 1-klik: **Hemat & Rendah Latensi** (1024, 4M, 30fps), **Seimbang** (1440, 8M, 60fps), dan **Kualitas Maksimal** (Native, 16M, 60fps). |
| **Cheat Sheet Pintasan** | Akses cepat daftar pintasan resmi Scrcpy dengan kartu visual `<kbd>` dan kotak pencarian instan. |
| **Gaya Visual & Tema** | **Dual Theme (Light & Dark)** mengikuti preferensi sistem Windows; palet **Slate/Zinc**, tanpa ungu neon, *typography-first*, bebas tumpang tindih (*zero-overlap*). |
