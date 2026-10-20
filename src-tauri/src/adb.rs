use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::process::Command;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[cfg(target_os = "windows")]
pub const CREATE_NO_WINDOW: u32 = 0x08000000;

pub fn adb_command() -> Command {
    let mut cmd = Command::new("adb");
    #[cfg(target_os = "windows")]
    cmd.creation_flags(CREATE_NO_WINDOW);
    cmd
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceInfo {
    pub id: String,
    pub model: String,
    pub product: String,
    pub state: String,
    pub is_wireless: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScreenMetrics {
    pub width: u32,
    pub height: u32,
    pub density: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppInfo {
    pub package: String,
    pub name: String,
    pub activity: Option<String>,
    pub is_system: bool,
    pub icon_url: Option<String>,
}

pub fn get_connected_devices() -> Result<Vec<DeviceInfo>, String> {
    let output = adb_command()
        .args(["devices", "-l"])
        .output()
        .map_err(|e| format!("Gagal menjalankan adb: {}", e))?;

    if !output.status.success() {
        return Err("Perintah 'adb devices' gagal dieksekusi".into());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut devices = Vec::new();

    for line in stdout.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with("List of devices") {
            continue;
        }

        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() >= 2 {
            let id = parts[0].to_string();
            let state = parts[1].to_string();
            let is_wireless = id.contains(':');

            let mut model = "Android Device".to_string();
            let mut product = "".to_string();

            for part in &parts[2..] {
                if let Some(val) = part.strip_prefix("model:") {
                    model = val.replace('_', " ");
                } else if let Some(val) = part.strip_prefix("product:") {
                    product = val.to_string();
                }
            }

            devices.push(DeviceInfo {
                id,
                model,
                product,
                state,
                is_wireless,
            });
        }
    }

    Ok(devices)
}

pub fn get_screen_metrics(device_id: Option<&str>) -> Result<ScreenMetrics, String> {
    let mut size_cmd = adb_command();
    if let Some(id) = device_id {
        size_cmd.arg("-s").arg(id);
    }
    size_cmd.args(["shell", "wm", "size"]);

    let size_output = size_cmd
        .output()
        .map_err(|e| format!("Gagal membaca wm size: {}", e))?;
    let size_str = String::from_utf8_lossy(&size_output.stdout);

    let mut width = 1080;
    let mut height = 2400;

    for line in size_str.lines() {
        let line = line.trim();
        if line.starts_with("Physical size:") || line.starts_with("Override size:") {
            if let Some(dims) = line.split(':').nth(1) {
                let parts: Vec<&str> = dims.trim().split('x').collect();
                if parts.len() == 2 {
                    if let (Ok(w), Ok(h)) = (parts[0].parse::<u32>(), parts[1].parse::<u32>()) {
                        width = w;
                        height = h;
                    }
                }
            }
        }
    }

    let mut density_cmd = adb_command();
    if let Some(id) = device_id {
        density_cmd.arg("-s").arg(id);
    }
    density_cmd.args(["shell", "wm", "density"]);

    let density_output = density_cmd
        .output()
        .map_err(|e| format!("Gagal membaca wm density: {}", e))?;
    let density_str = String::from_utf8_lossy(&density_output.stdout);

    let mut density = 440;
    for line in density_str.lines() {
        let line = line.trim();
        if line.starts_with("Physical density:") || line.starts_with("Override density:") {
            if let Some(d) = line.split(':').nth(1) {
                if let Ok(parsed) = d.trim().parse::<u32>() {
                    density = parsed;
                }
            }
        }
    }

    Ok(ScreenMetrics {
        width,
        height,
        density,
    })
}

pub fn get_installed_apps(device_id: Option<&str>) -> Result<Vec<AppInfo>, String> {
    // 1. Get list of 3rd party (User) packages
    let mut user_pkgs_cmd = adb_command();
    if let Some(id) = device_id {
        user_pkgs_cmd.arg("-s").arg(id);
    }
    user_pkgs_cmd.args(["shell", "pm", "list", "packages", "-3"]);
    let user_output = user_pkgs_cmd.output().map_err(|e| e.to_string())?;
    let user_str = String::from_utf8_lossy(&user_output.stdout);

    let mut user_packages = HashSet::new();
    for line in user_str.lines() {
        if let Some(pkg) = line.trim().strip_prefix("package:") {
            user_packages.insert(pkg.trim().to_string());
        }
    }

    // 2. Query launchable activities (applications with an app icon on the home screen)
    let mut launcher_cmd = adb_command();
    if let Some(id) = device_id {
        launcher_cmd.arg("-s").arg(id);
    }
    launcher_cmd.args([
        "shell",
        "cmd",
        "package",
        "query-activities",
        "--brief",
        "-a",
        "android.intent.action.MAIN",
        "-c",
        "android.intent.category.LAUNCHER",
    ]);

    let launcher_output = launcher_cmd.output();
    let mut apps_map = std::collections::BTreeMap::new();

    if let Ok(output) = launcher_output {
        let stdout = String::from_utf8_lossy(&output.stdout);
        for line in stdout.lines() {
            let line = line.trim();
            if line.contains('/') && !line.starts_with("Activity Resolver") && !line.starts_with("Non-Data Actions") {
                let parts: Vec<&str> = line.split('/').collect();
                if parts.len() == 2 {
                    let package = parts[0].trim().to_string();
                    let activity = parts[1].trim().to_string();
                    let is_system = !user_packages.contains(&package);
                    let name = format_app_name(&package);

                    apps_map.entry(package.clone()).or_insert(AppInfo {
                        package,
                        name,
                        activity: Some(activity),
                        is_system,
                        icon_url: None, // Zero ADB icon extraction for instant performance
                    });
                }
            }
        }
    }

    // Fallback if cmd query-activities was empty: use pm list packages -3
    if apps_map.is_empty() {
        for pkg in &user_packages {
            let name = format_app_name(pkg);
            apps_map.insert(
                pkg.clone(),
                AppInfo {
                    package: pkg.clone(),
                    name,
                    activity: None,
                    is_system: false,
                    icon_url: None,
                },
            );
        }
    }

    let mut apps: Vec<AppInfo> = apps_map.into_values().collect();
    apps.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

    Ok(apps)
}

pub fn switch_to_wireless(device_id: &str) -> Result<String, String> {
    // 1. Enable TCP port 5555
    let mut tcpip_cmd = adb_command();
    tcpip_cmd.arg("-s").arg(device_id).args(["tcpip", "5555"]);
    let tcpip_res = tcpip_cmd
        .output()
        .map_err(|e| format!("Gagal mengaktifkan mode tcpip: {}", e))?;

    if !tcpip_res.status.success() {
        return Err("Gagal menjalankan 'adb tcpip 5555'".to_string());
    }

    // 2. Query device IP on wlan0 or via ip route
    let mut ip_cmd = adb_command();
    ip_cmd
        .arg("-s")
        .arg(device_id)
        .args(["shell", "ip", "-f", "inet", "addr", "show", "wlan0"]);
    let ip_output = ip_cmd.output().map_err(|e| e.to_string())?;
    let ip_str = String::from_utf8_lossy(&ip_output.stdout);

    let mut found_ip = None;
    for line in ip_str.lines() {
        let trimmed = line.trim();
        if trimmed.starts_with("inet ") {
            if let Some(addr_part) = trimmed.split_whitespace().nth(1) {
                if let Some(ip) = addr_part.split('/').next() {
                    found_ip = Some(ip.to_string());
                    break;
                }
            }
        }
    }

    // Fallback using ip route
    if found_ip.is_none() {
        let mut route_cmd = adb_command();
        route_cmd
            .arg("-s")
            .arg(device_id)
            .args(["shell", "ip", "route"]);
        if let Ok(route_output) = route_cmd.output() {
            let route_str = String::from_utf8_lossy(&route_output.stdout);
            for line in route_str.lines() {
                let parts: Vec<&str> = line.split_whitespace().collect();
                if let Some(pos) = parts.iter().position(|&r| r == "src") {
                    if let Some(ip) = parts.get(pos + 1) {
                        found_ip = Some(ip.to_string());
                        break;
                    }
                }
            }
        }
    }

    let ip = found_ip.ok_or_else(|| {
        "Tidak dapat mendeteksi IP Wi-Fi perangkat. Pastikan HP terhubung ke jaringan Wi-Fi yang sama.".to_string()
    })?;

    // 3. Connect to IP:5555
    let target = format!("{}:5555", ip);
    let mut connect_cmd = adb_command();
    connect_cmd.args(["connect", &target]);
    let connect_res = connect_cmd
        .output()
        .map_err(|e| format!("Gagal menghubungkan ke {}: {}", target, e))?;

    let connect_str = String::from_utf8_lossy(&connect_res.stdout);
    if connect_str.contains("connected to") || connect_str.contains("already connected") {
        Ok(target)
    } else {
        Err(format!("Gagal menghubungkan ke {}: {}", target, connect_str.trim()))
    }
}

fn format_app_name(package: &str) -> String {
    match package {
        "com.whatsapp" => "WhatsApp".to_string(),
        "com.whatsapp.w4b" => "WhatsApp Business".to_string(),
        "org.videolan.vlc" => "VLC Media Player".to_string(),
        "com.google.android.youtube" => "YouTube".to_string(),
        "com.spotify.music" => "Spotify".to_string(),
        "com.instagram.android" => "Instagram".to_string(),
        "com.twitter.android" | "com.x.android" => "X (Twitter)".to_string(),
        "com.facebook.katana" => "Facebook".to_string(),
        "com.facebook.orca" => "Messenger".to_string(),
        "com.google.android.apps.photos" => "Google Photos".to_string(),
        "com.google.android.gm" => "Gmail".to_string(),
        "com.google.android.apps.maps" => "Google Maps".to_string(),
        "com.android.chrome" => "Google Chrome".to_string(),
        "org.mozilla.firefox" => "Firefox".to_string(),
        "com.microsoft.teams" => "Microsoft Teams".to_string(),
        "com.discord" => "Discord".to_string(),
        "com.shopee.id" => "Shopee".to_string(),
        "com.tokopedia.tkpd" => "Tokopedia".to_string(),
        "com.lazada.android" => "Lazada".to_string(),
        "com.gojek.app" => "Gojek".to_string(),
        "com.grabtaxi.passenger" => "Grab".to_string(),
        "app.bpjs.mobile" => "Mobile JKN (BPJS)".to_string(),
        "org.telegram.messenger" => "Telegram".to_string(),
        "id.bni.wondr" => "Wondr by BNI".to_string(),
        "id.dana" => "DANA".to_string(),
        "com.com.android.settings" | "com.android.settings" => "Settings".to_string(),
        "com.android.camera" | "com.android.camera2" => "Camera".to_string(),
        "com.android.gallery3d" | "com.miui.gallery" => "Gallery".to_string(),
        "com.android.vending" => "Google Play Store".to_string(),
        "com.android.calculator2" | "com.miui.calculator" => "Calculator".to_string(),
        "com.android.deskclock" => "Clock".to_string(),
        _ => {
            let last_part = package.split('.').last().unwrap_or(package);
            let mut name = String::new();
            let mut capitalize_next = true;

            for ch in last_part.chars() {
                if ch == '_' || ch == '-' {
                    name.push(' ');
                    capitalize_next = true;
                } else if ch.is_uppercase() && !name.is_empty() && !name.ends_with(' ') {
                    name.push(' ');
                    name.push(ch);
                    capitalize_next = false;
                } else if capitalize_next {
                    name.extend(ch.to_uppercase());
                    capitalize_next = false;
                } else {
                    name.push(ch);
                }
            }

            if name.is_empty() {
                package.to_string()
            } else {
                name
            }
        }
    }
}
