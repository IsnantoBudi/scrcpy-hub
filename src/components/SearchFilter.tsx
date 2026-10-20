import React from "react";
import { Search, X } from "lucide-react";

export type FilterTab = "user" | "system" | "all";

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
  counts: {
    user: number;
    system: number;
    all: number;
  };
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  counts,
}) => {
  return (
    <div className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Two-Tier Underline Tabs (Anti-Slop Enterprise Style) */}
        <nav className="flex space-x-6 -mb-px" aria-label="Tabs">
          <button
            onClick={() => onTabChange("user")}
            className={`pb-3 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "user"
                ? "border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <span>Aplikasi Pengguna</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {counts.user}
            </span>
          </button>

          <button
            onClick={() => onTabChange("system")}
            className={`pb-3 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "system"
                ? "border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <span>Aplikasi Sistem</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {counts.system}
            </span>
          </button>

          <button
            onClick={() => onTabChange("all")}
            className={`pb-3 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === "all"
                ? "border-slate-900 text-slate-900 dark:border-slate-100 dark:text-slate-100"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <span>Semua</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {counts.all}
            </span>
          </button>
        </nav>

        {/* Search Bar */}
        <div className="relative mb-2 sm:mb-0 w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari nama aplikasi atau package..."
            className="w-full pl-8 pr-7 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-slate-400 dark:focus:border-slate-600 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
