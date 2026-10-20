export interface DeviceInfo {
  id: string;
  model: string;
  product: string;
  state: string;
  is_wireless: boolean;
}

export interface ScreenMetrics {
  width: number;
  height: number;
  density: number;
}

export interface AppInfo {
  package: string;
  name: string;
  activity: string | null;
  is_system: boolean;
  icon_url: string | null;
}

export type PerformancePreset = "low_latency" | "balanced" | "ultra" | "custom";

export interface QuickSettings {
  turn_screen_off: boolean;
  stay_awake: boolean;
  no_audio: boolean;
  always_on_top: boolean;
  preset: PerformancePreset;
  max_size: number; // 0 for Native, 1024, 1440, 1920
  bit_rate: string; // "4M", "8M", "16M", "default"
  max_fps: number; // 30, 60, 90, 120, 0 for unlimited
  custom_args: string;
}
