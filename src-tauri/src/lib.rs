pub mod adb;
pub mod scrcpy;

use adb::{AppInfo, DeviceInfo, ScreenMetrics};
use scrcpy::ScrcpyLaunchConfig;

#[tauri::command]
fn get_devices() -> Result<Vec<DeviceInfo>, String> {
    adb::get_connected_devices()
}

#[tauri::command]
fn get_screen_metrics(device_id: Option<String>) -> Result<ScreenMetrics, String> {
    adb::get_screen_metrics(device_id.as_deref())
}

#[tauri::command]
fn get_installed_apps(device_id: Option<String>) -> Result<Vec<AppInfo>, String> {
    adb::get_installed_apps(device_id.as_deref())
}

#[tauri::command]
fn switch_to_wireless(device_id: String) -> Result<String, String> {
    adb::switch_to_wireless(&device_id)
}

#[tauri::command]
fn create_desktop_shortcut(
    package: String,
    name: String,
    config: ScrcpyLaunchConfig,
) -> Result<String, String> {
    scrcpy::create_desktop_shortcut(package, name, config)
}

#[tauri::command]
fn launch_scrcpy(config: ScrcpyLaunchConfig) -> Result<String, String> {
    scrcpy::launch_scrcpy(config)
}

#[tauri::command]
fn kill_all_scrcpy() -> Result<String, String> {
    scrcpy::kill_all_scrcpy()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_devices,
            get_screen_metrics,
            get_installed_apps,
            switch_to_wireless,
            create_desktop_shortcut,
            launch_scrcpy,
            kill_all_scrcpy
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
