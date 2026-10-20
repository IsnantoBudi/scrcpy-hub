import React, { useMemo } from "react";
import { Smartphone, SearchX, Star } from "lucide-react";
import { AppInfo, DeviceInfo } from "../types";
import { AppCard } from "./AppCard";

interface AppGridProps {
  apps: AppInfo[];
  favoritePkgs: string[];
  device: DeviceInfo | null;
  loading: boolean;
  searchQuery: string;
  onLaunch: (app: AppInfo) => void;
  launchingPkg: string | null;
  onToggleFavorite: (pkg: string) => void;
  onCreateShortcut: (app: AppInfo) => void;
}

export const AppGrid: React.FC<AppGridProps> = ({
  apps,
  favoritePkgs,
  device,
  loading,
  searchQuery,
  onLaunch,
  launchingPkg,
  onToggleFavorite,
  onCreateShortcut,
}) => {
  // Separate favorite apps from regular apps (only when not searching)
  const { favoriteApps, otherApps } = useMemo(() => {
    if (searchQuery.trim()) {
      return { favoriteApps: [], otherApps: apps };
    }
    const favSet = new Set(favoritePkgs);
    const favs: AppInfo[] = [];
    const others: AppInfo[] = [];

    for (const app of apps) {
      if (favSet.has(app.package)) {
        favs.push(app);
      } else {
        others.push(app);
      }
    }

    return { favoriteApps: favs, otherApps: others };
  }, [apps, favoritePkgs, searchQuery]);

  // 1. Loading State (Skeletons)
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center p-3.5 rounded-xl bg-white/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 animate-pulse"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800 mb-2.5" />
              <div className="w-20 h-3 bg-slate-200 dark:bg-slate-800 rounded mb-1.5" />
              <div className="w-14 h-2 bg-slate-100 dark:bg-slate-850 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. No Device Connected
  if (!device) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-500 dark:text-slate-400">
          <Smartphone className="w-7 h-7" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
          Menunggu Koneksi Smartphone
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
          Hubungkan HP Anda menggunakan kabel USB atau Wireless ADB. Pastikan opsi <b>USB Debugging</b> aktif.
        </p>

        <div className="text-left p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800/70 text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5">
          <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Petunjuk Cepat:</div>
          <div>1. Buka <b>Pengaturan &gt; Opsi Pengembang</b> di HP.</div>
          <div>2. Aktifkan <b>USB Debugging</b> dan <b>USB Debugging (Security settings)</b>.</div>
          <div>3. Izinkan prompt otorisasi komputer yang muncul di layar HP.</div>
        </div>
      </div>
    );
  }

  // 3. Search query no results
  if (apps.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
          <SearchX className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
          Aplikasi Tidak Ditemukan
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Tidak ada aplikasi yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
        </p>
      </div>
    );
  }

  // 4. Main App Grid with Favorites Section
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-6">
      {/* Pinned Favorites Section */}
      {favoriteApps.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 px-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
            <span>Aplikasi Favorit ({favoriteApps.length})</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {favoriteApps.map((app) => (
              <AppCard
                key={app.package}
                app={app}
                onLaunch={onLaunch}
                isLaunching={launchingPkg === app.package}
                isFavorite={true}
                onToggleFavorite={onToggleFavorite}
                onCreateShortcut={onCreateShortcut}
              />
            ))}
          </div>
        </div>
      )}

      {/* All / Other Apps Section */}
      <div>
        {favoriteApps.length > 0 && (
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 px-1">
            <span>Semua Aplikasi ({otherApps.length})</span>
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {otherApps.map((app) => (
            <AppCard
              key={app.package}
              app={app}
              onLaunch={onLaunch}
              isLaunching={launchingPkg === app.package}
              isFavorite={favoritePkgs.includes(app.package)}
              onToggleFavorite={onToggleFavorite}
              onCreateShortcut={onCreateShortcut}
            />
          ))}
        </div>
      </div>
    </main>
  );
};
