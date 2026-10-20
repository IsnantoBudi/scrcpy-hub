import React from "react";
import { Play, Star, MonitorUp } from "lucide-react";
import { AppInfo } from "../types";

interface AppCardProps {
  app: AppInfo;
  onLaunch: (app: AppInfo) => void;
  isLaunching: boolean;
  isFavorite: boolean;
  onToggleFavorite: (pkg: string) => void;
  onCreateShortcut: (app: AppInfo) => void;
}

export const AppCard: React.FC<AppCardProps> = ({
  app,
  onLaunch,
  isLaunching,
  isFavorite,
  onToggleFavorite,
  onCreateShortcut,
}) => {
  const initial = app.name ? app.name.charAt(0).toUpperCase() : "A";

  return (
    <div
      onClick={() => onLaunch(app)}
      className="group relative flex flex-col items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-sm transition-all duration-150 cursor-pointer text-center select-none overflow-hidden"
    >
      {/* Top Action Bar: Pin Favorite (Left) & Create Shortcut (Right) */}
      <div className="absolute top-2 inset-x-2 flex items-center justify-between z-10">
        {/* Star / Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(app.package);
          }}
          title={isFavorite ? "Hapus dari Favorit" : "Pin ke Favorit"}
          className={`p-1 rounded-md transition-all cursor-pointer ${
            isFavorite
              ? "text-amber-400 opacity-100"
              : "text-slate-400 opacity-0 group-hover:opacity-100 hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${isFavorite ? "fill-current" : ""}`} />
        </button>

        {/* Desktop Shortcut Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCreateShortcut(app);
          }}
          title="Buat Shortcut di Desktop Windows"
          className="p-1 rounded-md text-slate-400 opacity-0 group-hover:opacity-100 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
        >
          <MonitorUp className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Modern Typographic Avatar (Zero ADB Overhead, Instant Render) */}
      <div className="relative w-14 h-14 mt-1 mb-2.5 flex items-center justify-center flex-shrink-0">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 flex items-center justify-center text-slate-800 dark:text-slate-100 font-bold text-xl shadow-xs group-hover:scale-105 group-hover:border-slate-300 dark:group-hover:border-slate-600 transition-all duration-150">
          {initial}
        </div>

        {/* Hover Launch Overlay Button */}
        <div className="absolute inset-0 bg-slate-900/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-150">
          <Play className="w-5 h-5 text-white fill-current ml-0.5" />
        </div>
      </div>

      {/* App Details: Strictly truncated to avoid overlap */}
      <div className="w-full flex flex-col items-center min-w-0">
        <span
          title={app.name}
          className="w-full text-xs font-semibold text-slate-800 dark:text-slate-200 truncate leading-snug"
        >
          {app.name}
        </span>
        <span
          title={app.package}
          className="w-full text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate mt-0.5"
        >
          {app.package}
        </span>
      </div>

      {/* System App indicator badge */}
      {app.is_system && (
        <span className="mt-2 text-[9px] px-1.5 py-0.2 rounded font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
          Sistem
        </span>
      )}

      {/* Loading indicator during launch */}
      {isLaunching && (
        <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs flex items-center justify-center rounded-xl z-20">
          <span className="text-[11px] font-medium text-slate-900 dark:text-slate-100 animate-pulse">
            Membuka...
          </span>
        </div>
      )}
    </div>
  );
};
