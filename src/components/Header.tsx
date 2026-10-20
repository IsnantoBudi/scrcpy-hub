import React from "react";
import { Smartphone, RefreshCw, ScreenShare, PowerOff, VolumeX, EyeOff, Layers, Sliders, Wifi } from "lucide-react";
import { DeviceInfo, ScreenMetrics, QuickSettings } from "../types";

interface HeaderProps {
  device: DeviceInfo | null;
  metrics: ScreenMetrics | null;
  loading: boolean;
  onRefresh: () => void;
  onLaunchMirror: () => void;
  onKillScrcpy: () => void;
  settings: QuickSettings;
  onUpdateSettings: (newSettings: Partial<QuickSettings>) => void;
  onOpenSettings: () => void;
  onSwitchWireless: () => void;
  isSwitchingWireless: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  device,
  metrics,
  loading,
  onRefresh,
  onLaunchMirror,
  onKillScrcpy,
  settings,
  onUpdateSettings,
  onOpenSettings,
  onSwitchWireless,
  isSwitchingWireless,
}) => {
  const getPresetLabel = () => {
    switch (settings.preset) {
      case "low_latency":
        return "1024p @ 30fps (4M)";
      case "balanced":
        return "1440p @ 60fps (8M)";
      case "ultra":
        return "Native @ 60fps (16M)";
      default:
        return settings.max_size > 0 ? `${settings.max_size}p` : "Custom";
    }
  };

  return (
    <header className="sticky top-0 z-20 backdrop-blur-md bg-white/90 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Brand & Device Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-slate-100">
              Scrcpy Hub
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              v0.1.0
            </span>
          </div>

          <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />

          {/* Device status badge */}
          {device ? (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              {device.is_wireless ? (
                <Wifi className="w-3.5 h-3.5 text-sky-500" />
              ) : (
                <Smartphone className="w-3.5 h-3.5" />
              )}
              <span>{device.model}</span>
              {metrics && (
                <span className="text-[10px] opacity-75 hidden md:inline">
                  ({metrics.width}×{metrics.height} @ {metrics.density}dpi)
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span>Tidak ada HP terhubung</span>
            </div>
          )}

          {/* Switch to Wireless Button */}
          {device && !device.is_wireless && (
            <button
              onClick={onSwitchWireless}
              disabled={isSwitchingWireless}
              title="Aktifkan Mode Wi-Fi (Kabel USB bisa dicabut setelah terhubung)"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Wifi className={`w-3 h-3 ${isSwitchingWireless ? "animate-pulse" : ""}`} />
              <span>{isSwitchingWireless ? "Menghubungkan..." : "Mode Wi-Fi"}</span>
            </button>
          )}

          <button
            onClick={onRefresh}
            disabled={loading}
            title="Muat ulang perangkat & aplikasi"
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Center / Right: Quick Toggles & Launch Actions */}
        <div className="flex items-center gap-2.5">
          {/* Active Preset Indicator Badge */}
          <button
            onClick={onOpenSettings}
            title="Ubah Preset Kinerja atau lihat Pintasan Keyboard"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <Sliders className="w-3 h-3 text-slate-500" />
            <span className="text-[11px] font-mono">{getPresetLabel()}</span>
          </button>

          {/* Quick Modifier Switches */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            {/* Screen Off Toggle */}
            <button
              onClick={() => onUpdateSettings({ turn_screen_off: !settings.turn_screen_off })}
              title="Matikan layar fisik HP saat streaming (-S)"
              className={`flex items-center gap-1 px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                settings.turn_screen_off
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <EyeOff className="w-3 h-3" />
              <span className="hidden lg:inline">Layar Mati</span>
            </button>

            {/* Audio Mute Toggle */}
            <button
              onClick={() => onUpdateSettings({ no_audio: !settings.no_audio })}
              title="Bungkam audio dari HP (--no-audio)"
              className={`flex items-center gap-1 px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                settings.no_audio
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <VolumeX className="w-3 h-3" />
              <span className="hidden lg:inline">Audio Mati</span>
            </button>

            {/* Always on Top */}
            <button
              onClick={() => onUpdateSettings({ always_on_top: !settings.always_on_top })}
              title="Jendela Scrcpy selalu di atas (--always-on-top)"
              className={`flex items-center gap-1 px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                settings.always_on_top
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Layers className="w-3 h-3" />
              <span className="hidden lg:inline">Always on Top</span>
            </button>
          </div>

          {/* Action: Cermin Layar Penuh (Scrcpy Standar) */}
          <button
            onClick={onLaunchMirror}
            disabled={!device || loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-xs disabled:opacity-40 cursor-pointer"
          >
            <ScreenShare className="w-3.5 h-3.5" />
            <span>Cermin Layar Penuh</span>
          </button>

          {/* Action: Open Settings Modal */}
          <button
            onClick={onOpenSettings}
            title="Buka Pengaturan Kinerja & Panduan Pintasan"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* Action: Kill All Scrcpy */}
          <button
            onClick={onKillScrcpy}
            title="Hentikan semua proses Scrcpy yang sedang berjalan"
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50 transition-colors cursor-pointer"
          >
            <PowerOff className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
