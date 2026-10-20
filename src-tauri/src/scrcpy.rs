use serde::{Deserialize, Serialize};
use std::process::Command;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[cfg(target_os = "windows")]
use crate::adb::CREATE_NO_WINDOW;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScrcpyLaunchConfig {
    pub device_id: Option<String>,
    pub package: Option<String>,
    pub app_title: Option<String>,
    pub width: Option<u32>,
    pub height: Option<u32>,
    pub density: Option<u32>,
    pub turn_screen_off: bool,
    pub stay_awake: bool,
    pub no_audio: bool,
    pub always_on_top: bool,
    pub max_size: Option<u32>,
    pub bit_rate: Option<String>,
    pub max_fps: Option<u32>,
    pub custom_args: Option<String>,
}

pub fn launch_scrcpy(config: ScrcpyLaunchConfig) -> Result<String, String> {
    let mut cmd = Command::new("scrcpy");

    #[cfg(target_os = "windows")]
    cmd.creation_flags(CREATE_NO_WINDOW);

    if let Some(id) = config.device_id {
        if !id.is_empty() {
            cmd.arg("-s").arg(&id);
        }
    }

    if let Some(package) = config.package {
        cmd.arg("--new-display");
        cmd.arg(format!("--start-app={}", package));

        let title = config.app_title.unwrap_or_else(|| package.clone());
        cmd.arg(format!("--window-title={} (Scrcpy Hub)", title));
    } else {
        cmd.arg("--window-title=Android Phone (Scrcpy Hub)");
    }

    if let Some(max_size) = config.max_size {
        if max_size > 0 {
            cmd.arg(format!("--max-size={}", max_size));
        }
    }

    if let Some(bit_rate) = config.bit_rate {
        let trimmed = bit_rate.trim();
        if !trimmed.is_empty() && trimmed != "default" {
            cmd.arg(format!("--video-bit-rate={}", trimmed));
        }
    }

    if let Some(max_fps) = config.max_fps {
        if max_fps > 0 {
            cmd.arg(format!("--max-fps={}", max_fps));
        }
    }

    if config.turn_screen_off {
        cmd.arg("-S");
    }
    if config.stay_awake {
        cmd.arg("-w");
    }
    if config.no_audio {
        cmd.arg("--no-audio");
    }
    if config.always_on_top {
        cmd.arg("--always-on-top");
    }

    if let Some(custom) = config.custom_args {
        for arg in custom.split_whitespace() {
            cmd.arg(arg);
        }
    }

    cmd.spawn()
        .map_err(|e| format!("Gagal menjalankan scrcpy: {}. Pastikan scrcpy terpasang di PATH.", e))?;

    Ok("Scrcpy berhasil diluncurkan".to_string())
}

pub fn create_desktop_shortcut(
    package: String,
    app_title: String,
    config: ScrcpyLaunchConfig,
) -> Result<String, String> {
    let desktop_dir = if let Ok(profile) = std::env::var("USERPROFILE") {
        std::path::PathBuf::from(profile).join("Desktop")
    } else {
        std::env::temp_dir()
    };

    let safe_title = app_title
        .replace(['\\', '/', ':', '*', '?', '"', '<', '>', '|'], "")
        .trim()
        .to_string();

    let shortcut_path = desktop_dir.join(format!("{} (Scrcpy Hub).bat", safe_title));

    let mut args = vec![
        "scrcpy".to_string(),
        "--new-display".to_string(),
        format!("--start-app={}", package),
    ];

    if let Some(id) = config.device_id {
        if !id.is_empty() && !id.contains(':') {
            args.push(format!("-s {}", id));
        }
    }

    if let Some(max_size) = config.max_size {
        if max_size > 0 {
            args.push(format!("--max-size={}", max_size));
        }
    }

    if let Some(bit_rate) = config.bit_rate {
        let trimmed = bit_rate.trim();
        if !trimmed.is_empty() && trimmed != "default" {
            args.push(format!("--video-bit-rate={}", trimmed));
        }
    }

    if let Some(max_fps) = config.max_fps {
        if max_fps > 0 {
            args.push(format!("--max-fps={}", max_fps));
        }
    }

    if config.turn_screen_off {
        args.push("-S".to_string());
    }
    if config.stay_awake {
        args.push("-w".to_string());
    }
    if config.no_audio {
        args.push("--no-audio".to_string());
    }
    if config.always_on_top {
        args.push("--always-on-top".to_string());
    }

    args.push(format!("--window-title=\"{} (Scrcpy Hub)\"", safe_title));

    let bat_content = format!(
        "@echo off\r\nstart \"\" {}\r\n",
        args.join(" ")
    );

    std::fs::write(&shortcut_path, bat_content)
        .map_err(|e| format!("Gagal membuat file shortcut di Desktop: {}", e))?;

    Ok(format!("Shortcut untuk '{}' berhasil dibuat di Desktop!", safe_title))
}

pub fn kill_all_scrcpy() -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        let mut cmd = Command::new("taskkill");
        cmd.creation_flags(CREATE_NO_WINDOW);
        cmd.args(["/F", "/IM", "scrcpy.exe"]);
        let _ = cmd.output();
    }

    #[cfg(not(target_os = "windows"))]
    {
        let mut cmd = Command::new("pkill");
        cmd.arg("scrcpy");
        let _ = cmd.output();
    }

    Ok("Semua proses scrcpy telah dihentikan".to_string())
}
