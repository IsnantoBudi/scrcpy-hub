import React, { useState } from "react";
import { X, Sliders, Keyboard, Search, Zap, Check, Monitor, Shield } from "lucide-react";
import { QuickSettings, PerformancePreset } from "../types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: QuickSettings;
  onUpdateSettings: (newSettings: Partial<QuickSettings>) => void;
}

interface ShortcutItem {
  keys: string[];
  title: string;
  desc: string;
  category: "Navigasi" | "Tampilan" | "Daya & Layar" | "Papan Klip" | "Audio";
}

const SHORTCUTS: ShortcutItem[] = [
  // Navigasi
  { keys: ["MOD", "h"], title: "Home", desc: "Kembali ke layar utama Android", category: "Navigasi" },
  { keys: ["MOD", "b"], title: "Back", desc: "Kembali ke layar / menu sebelumnya (atau klik kanan)", category: "Navigasi" },
  { keys: ["MOD", "s"], title: "Recent Apps", desc: "Membuka tampilan beralih aplikasi (Overview)", category: "Navigasi" },
  { keys: ["MOD", "m"], title: "Buka Notifikasi", desc: "Menarik turun panel notifikasi sistem", category: "Navigasi" },
  { keys: ["MOD", "n"], title: "Tutup Notifikasi", desc: "Menutup panel notifikasi sistem", category: "Navigasi" },

  // Tampilan & Jendela
  { keys: ["MOD", "f"], title: "Fullscreen", desc: "Beralih mode layar penuh di PC", category: "Tampilan" },
  { keys: ["MOD", "w"], title: "Skala 1:1", desc: "Mengubah ukuran jendela agar sesuai 1:1 pixel perangkat", category: "Tampilan" },
  { keys: ["MOD", "g"], title: "Pas Jendela", desc: "Mengubah ukuran jendela untuk menghilangkan batas hitam", category: "Tampilan" },
  { keys: ["MOD", "r"], title: "Putar Layar", desc: "Memutar orientasi tampilan HP 90 derajat", category: "Tampilan" },

  // Daya & Layar HP
  { keys: ["MOD", "p"], title: "Tombol Power", desc: "Menyalakan / mengunci layar HP secara virtual", category: "Daya & Layar" },
  { keys: ["MOD", "o"], title: "Nyalakan Layar Fisik", desc: "Menyalakan kembali layar fisik HP", category: "Daya & Layar" },
  { keys: ["MOD", "Shift", "o"], title: "Matikan Layar Fisik", desc: "Mematikan layar fisik HP tanpa memutus mirroring", category: "Daya & Layar" },

  // Papan Klip
  { keys: ["MOD", "c"], title: "Salin dari HP", desc: "Menyalin clipboard HP ke clipboard komputer", category: "Papan Klip" },
  { keys: ["MOD", "v"], title: "Tempel ke HP", desc: "Menempelkan clipboard komputer ke HP", category: "Papan Klip" },
  { keys: ["MOD", "Shift", "v"], title: "Ketik Clipboard", desc: "Mengetikkan teks clipboard komputer ke HP sebagai karakter keyboard", category: "Papan Klip" },

  // Audio & Volume
  { keys: ["MOD", "↑"], title: "Volume Naik", desc: "Menaikkan volume suara perangkat", category: "Audio" },
  { keys: ["MOD", "↓"], title: "Volume Turun", desc: "Menurunkan volume suara perangkat", category: "Audio" },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [activeTab, setActiveTab] = useState<"performance" | "shortcuts">("performance");
  const [shortcutQuery, setShortcutQuery] = useState("");

  if (!isOpen) return null;

  const handleApplyPreset = (preset: PerformancePreset) => {
    switch (preset) {
      case "low_latency":
        onUpdateSettings({
          preset: "low_latency",
          max_size: 1024,
          bit_rate: "4M",
          max_fps: 30,
          turn_screen_off: true,
          no_audio: true,
          stay_awake: true,
        });
        break;
      case "balanced":
        onUpdateSettings({
          preset: "balanced",
          max_size: 1440,
          bit_rate: "8M",
          max_fps: 60,
          turn_screen_off: false,
          no_audio: false,
          stay_awake: true,
        });
        break;
      case "ultra":
        onUpdateSettings({
          preset: "ultra",
          max_size: 0,
          bit_rate: "16M",
          max_fps: 60,
          turn_screen_off: false,
          no_audio: false,
          stay_awake: true,
        });
        break;
      default:
        onUpdateSettings({ preset: "custom" });
        break;
    }
  };

  const filteredShortcuts = SHORTCUTS.filter(
    (s) =>
      s.title.toLowerCase().includes(shortcutQuery.toLowerCase()) ||
      s.desc.toLowerCase().includes(shortcutQuery.toLowerCase()) ||
      s.keys.join(" ").toLowerCase().includes(shortcutQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl max-h-[85vh] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col overflow-hidden text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight">Pengaturan & Panduan Scrcpy</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Konfigurasi resolusi, bitrate, latensi, dan cheat sheet tombol kontrol.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Two-Tier Underline Tabs */}
        <div className="px-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
          <nav className="flex space-x-6 -mb-px">
            <button
              onClick={() => setActiveTab("performance")}
              className={`pb-2.5 pt-3 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "performance"
                  ? "border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Kinerja & Preset Streaming</span>
            </button>
            <button
              onClick={() => setActiveTab("shortcuts")}
              className={`pb-2.5 pt-3 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === "shortcuts"
                  ? "border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Pintasan Keyboard (Shortcuts)</span>
            </button>
          </nav>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5">
          {activeTab === "performance" ? (
            <div className="space-y-5">
              {/* Preset Cards */}
              <div>
                <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mb-2">
                  Pilih Preset Cepat
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Preset 1: Low Latency */}
                  <div
                    onClick={() => handleApplyPreset("low_latency")}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
                      settings.preset === "low_latency"
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">Hemat & Rendah Latensi</span>
                      {settings.preset === "low_latency" && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <p className={`text-[11px] leading-relaxed ${settings.preset === "low_latency" ? "opacity-80" : "text-slate-500 dark:text-slate-400"}`}>
                      1024px, 4 Mbps, 30 FPS. Beban chip sangat ringan, tidak panas & latensi ultra-rendah.
                    </p>
                  </div>

                  {/* Preset 2: Balanced */}
                  <div
                    onClick={() => handleApplyPreset("balanced")}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
                      settings.preset === "balanced"
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">Seimbang (Standar)</span>
                      {settings.preset === "balanced" && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <p className={`text-[11px] leading-relaxed ${settings.preset === "balanced" ? "opacity-80" : "text-slate-500 dark:text-slate-400"}`}>
                      1440px, 8 Mbps, 60 FPS. Keseimbangan prima antara kejernihan grafis dan responsivitas.
                    </p>
                  </div>

                  {/* Preset 3: Ultra Quality */}
                  <div
                    onClick={() => handleApplyPreset("ultra")}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
                      settings.preset === "ultra"
                        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">Kualitas Maksimal</span>
                      {settings.preset === "ultra" && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <p className={`text-[11px] leading-relaxed ${settings.preset === "ultra" ? "opacity-80" : "text-slate-500 dark:text-slate-400"}`}>
                      Native, 16 Mbps, 60 FPS. Tampilan visual tajam tanpa kompresi agresif.
                    </p>
                  </div>
                </div>
              </div>

              {/* Fine-Tuning Controls */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 space-y-3.5">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-slate-500" />
                  <span>Kustomisasi Parameter Terperinci</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Max Size */}
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">
                      Resolusi Batas (--max-size)
                    </label>
                    <select
                      value={settings.max_size}
                      onChange={(e) =>
                        onUpdateSettings({
                          max_size: Number(e.target.value),
                          preset: "custom",
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-slate-400 cursor-pointer"
                    >
                      <option value={1024}>1024 px (Rendah Latensi)</option>
                      <option value={1440}>1440 px (Seimbang)</option>
                      <option value={1920}>1920 px (FHD)</option>
                      <option value={0}>Native (Resolusi Penuh HP)</option>
                    </select>
                  </div>

                  {/* Video Bitrate */}
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">
                      Bitrate Video (--video-bit-rate)
                    </label>
                    <select
                      value={settings.bit_rate}
                      onChange={(e) =>
                        onUpdateSettings({
                          bit_rate: e.target.value,
                          preset: "custom",
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-slate-400 cursor-pointer"
                    >
                      <option value="2M">2 Mbps (Sangat Ringan)</option>
                      <option value="4M">4 Mbps (Hemat Daya)</option>
                      <option value="8M">8 Mbps (Standar)</option>
                      <option value="16M">16 Mbps (Tinggi)</option>
                      <option value="default">Default Scrcpy</option>
                    </select>
                  </div>

                  {/* Max FPS */}
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">
                      Frame Rate Batas (--max-fps)
                    </label>
                    <select
                      value={settings.max_fps}
                      onChange={(e) =>
                        onUpdateSettings({
                          max_fps: Number(e.target.value),
                          preset: "custom",
                        })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-slate-400 cursor-pointer"
                    >
                      <option value={30}>30 FPS (Hemat Baterai)</option>
                      <option value={60}>60 FPS (Mulus)</option>
                      <option value={90}>90 FPS (High Refresh)</option>
                      <option value={120}>120 FPS (Ultra Smooth)</option>
                      <option value={0}>Tidak Dibatasi</option>
                    </select>
                  </div>
                </div>

                {/* Custom Flags Input */}
                <div>
                  <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400 block mb-1">
                    Argumen CLI Tambahan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={settings.custom_args}
                    onChange={(e) =>
                      onUpdateSettings({
                        custom_args: e.target.value,
                        preset: "custom",
                      })
                    }
                    placeholder="Contoh: --video-codec=h265 --tcpip=5555"
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-slate-400"
                  />
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                    Argumen ini akan disisipkan langsung ke perintah Scrcpy saat dieksekusi.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* MOD Key Banner */}
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5 text-xs">
                <Shield className="w-4 h-4 text-slate-600 dark:text-slate-400 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed text-slate-600 dark:text-slate-300 text-[11px]">
                  Pada sistem operasi Windows, tombol <span className="font-semibold text-slate-900 dark:text-slate-100">MOD</span> adalah tombol <b>Alt Kiri (Left Alt)</b>. Tekan kombinasi tombol ini saat jendela Scrcpy sedang aktif.
                </div>
              </div>

              {/* Search Shortcut */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={shortcutQuery}
                  onChange={(e) => setShortcutQuery(e.target.value)}
                  placeholder="Cari pintasan (misal: fullscreen, home, clipboard)..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-slate-400"
                />
              </div>

              {/* Shortcuts List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredShortcuts.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {item.desc}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex items-center justify-between text-[11px] text-slate-500">
          <span>Preset tersimpan otomatis di perangkat PC Anda.</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg font-medium text-xs bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors cursor-pointer shadow-xs"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
