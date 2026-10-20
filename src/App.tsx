import { useState, useEffect, useMemo, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Header } from "./components/Header";
import { SearchFilter, FilterTab } from "./components/SearchFilter";
import { AppGrid } from "./components/AppGrid";
import { SettingsModal } from "./components/SettingsModal";
import { DeviceInfo, ScreenMetrics, AppInfo, QuickSettings } from "./types";
import "./App.css";

const SETTINGS_KEY = "scrcpy_hub_settings";
const FAVORITES_KEY = "scrcpy_hub_favorites";

const DEFAULT_SETTINGS: QuickSettings = {
  turn_screen_off: true,
  stay_awake: true,
  no_audio: true,
  always_on_top: false,
  preset: "low_latency",
  max_size: 1024,
  bit_rate: "4M",
  max_fps: 30,
  custom_args: "",
};

export function App() {
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  const [metrics, setMetrics] = useState<ScreenMetrics | null>(null);
  const [apps, setApps] = useState<AppInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<FilterTab>("user");
  const [launchingPkg, setLaunchingPkg] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSwitchingWireless, setIsSwitchingWireless] = useState<boolean>(false);

  // Load persisted favorites
  const [favoritePkgs, setFavoritePkgs] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [];
  });

  // Save favorites on update
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoritePkgs));
    } catch {
      // Ignore
    }
  }, [favoritePkgs]);

  // Load persisted settings or use default
  const [settings, setSettings] = useState<QuickSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_SETTINGS;
  });

  // Save settings on update
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // Ignore
    }
  }, [settings]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const devices = await invoke<DeviceInfo[]>("get_devices");
      if (devices && devices.length > 0) {
        const primary = devices[0];
        setDevice(primary);

        // Fetch metrics & apps in parallel (Instant < 50ms)
        const [screen, installed] = await Promise.all([
          invoke<ScreenMetrics>("get_screen_metrics", { deviceId: primary.id }),
          invoke<AppInfo[]>("get_installed_apps", { deviceId: primary.id }),
        ]);

        setMetrics(screen);
        setApps(installed);
      } else {
        setDevice(null);
        setMetrics(null);
        setApps([]);
      }
    } catch (err) {
      console.error("Gagal refresh perangkat:", err);
      showToast(String(err));
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const handleUpdateSettings = useCallback((newSettings: Partial<QuickSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // Toggle favorite app
  const handleToggleFavorite = useCallback((pkg: string) => {
    setFavoritePkgs((prev) =>
      prev.includes(pkg) ? prev.filter((p) => p !== pkg) : [...prev, pkg]
    );
  }, []);

  // Create Desktop Shortcut for an app
  const handleCreateShortcut = useCallback(
    async (app: AppInfo) => {
      try {
        const msg = await invoke<string>("create_desktop_shortcut", {
          package: app.package,
          name: app.name,
          config: {
            device_id: device ? device.id : null,
            package: app.package,
            app_title: app.name,
            width: null,
            height: null,
            density: null,
            turn_screen_off: settings.turn_screen_off,
            stay_awake: settings.stay_awake,
            no_audio: settings.no_audio,
            always_on_top: settings.always_on_top,
            max_size: settings.max_size > 0 ? settings.max_size : null,
            bit_rate: settings.bit_rate !== "default" ? settings.bit_rate : null,
            max_fps: settings.max_fps > 0 ? settings.max_fps : null,
            custom_args: settings.custom_args.trim() || null,
          },
        });
        showToast(msg);
      } catch (err) {
        showToast(String(err));
      }
    },
    [device, settings, showToast]
  );

  // Switch to Wireless ADB (1-Click)
  const handleSwitchWireless = useCallback(async () => {
    if (!device) return;
    setIsSwitchingWireless(true);
    showToast("Mengaktifkan mode Wi-Fi...");

    try {
      const target = await invoke<string>("switch_to_wireless", {
        deviceId: device.id,
      });
      showToast(`Terhubung via Wi-Fi ke ${target}! Kabel USB bisa dicabut.`);
      await refreshAll();
    } catch (err) {
      showToast(String(err));
    } finally {
      setIsSwitchingWireless(false);
    }
  }, [device, refreshAll, showToast]);

  // Launch Virtual Display for an app
  const handleLaunchApp = useCallback(
    async (app: AppInfo) => {
      if (!device) return;
      setLaunchingPkg(app.package);
      showToast(`Membuka ${app.name}...`);

      try {
        await invoke("launch_scrcpy", {
          config: {
            device_id: device.id,
            package: app.package,
            app_title: app.name,
            width: null,
            height: null,
            density: null,
            turn_screen_off: settings.turn_screen_off,
            stay_awake: settings.stay_awake,
            no_audio: settings.no_audio,
            always_on_top: settings.always_on_top,
            max_size: settings.max_size > 0 ? settings.max_size : null,
            bit_rate: settings.bit_rate !== "default" ? settings.bit_rate : null,
            max_fps: settings.max_fps > 0 ? settings.max_fps : null,
            custom_args: settings.custom_args.trim() || null,
          },
        });
      } catch (err) {
        console.error("Gagal menjalankan Scrcpy:", err);
        showToast(String(err));
      } finally {
        setTimeout(() => setLaunchingPkg(null), 1000);
      }
    },
    [device, settings, showToast]
  );

  // Launch Standard Full Mirroring
  const handleLaunchMirror = useCallback(async () => {
    if (!device) return;
    showToast("Membuka Cermin Layar Penuh...");

    try {
      await invoke("launch_scrcpy", {
        config: {
          device_id: device.id,
          package: null,
          app_title: null,
          width: null,
          height: null,
          density: null,
          turn_screen_off: settings.turn_screen_off,
          stay_awake: settings.stay_awake,
          no_audio: settings.no_audio,
          always_on_top: settings.always_on_top,
          max_size: settings.max_size > 0 ? settings.max_size : null,
          bit_rate: settings.bit_rate !== "default" ? settings.bit_rate : null,
          max_fps: settings.max_fps > 0 ? settings.max_fps : null,
          custom_args: settings.custom_args.trim() || null,
        },
      });
    } catch (err) {
      console.error("Gagal menjalankan Scrcpy mirror:", err);
      showToast(String(err));
    }
  }, [device, settings, showToast]);

  // Kill all running scrcpy processes
  const handleKillScrcpy = useCallback(async () => {
    try {
      const res = await invoke<string>("kill_all_scrcpy");
      showToast(res);
    } catch (err) {
      showToast(String(err));
    }
  }, [showToast]);

  // Counts
  const counts = useMemo(() => {
    let user = 0;
    let system = 0;
    for (const a of apps) {
      if (a.is_system) system++;
      else user++;
    }
    return { user, system, all: apps.length };
  }, [apps]);

  // Filtered Apps
  const filteredApps = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return apps.filter((app) => {
      // Tab filter
      if (activeTab === "user" && app.is_system) return false;
      if (activeTab === "system" && !app.is_system) return false;

      // Search query filter
      if (q) {
        return (
          app.name.toLowerCase().includes(q) ||
          app.package.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [apps, activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Header
        device={device}
        metrics={metrics}
        loading={loading}
        onRefresh={refreshAll}
        onLaunchMirror={handleLaunchMirror}
        onKillScrcpy={handleKillScrcpy}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSwitchWireless={handleSwitchWireless}
        isSwitchingWireless={isSwitchingWireless}
      />

      {device && (
        <SearchFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          counts={counts}
        />
      )}

      <div className="flex-1 overflow-y-auto">
        <AppGrid
          apps={filteredApps}
          favoritePkgs={favoritePkgs}
          device={device}
          loading={loading}
          searchQuery={searchQuery}
          onLaunch={handleLaunchApp}
          launchingPkg={launchingPkg}
          onToggleFavorite={handleToggleFavorite}
          onCreateShortcut={handleCreateShortcut}
        />
      </div>

      {/* Floating Minimal Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 px-3.5 py-2 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-medium shadow-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}

      {/* Settings & Shortcuts Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />
    </div>
  );
}

export default App;
