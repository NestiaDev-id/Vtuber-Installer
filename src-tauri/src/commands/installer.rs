use tauri::{AppHandle, Emitter, Runtime};
use std::path::Path;
use std::fs;
use std::io::Cursor;
use reqwest::Client;
use futures_util::StreamExt;
use serde::Serialize;
use std::process::Command;

#[derive(Clone, Serialize)]
struct DownloadProgress {
    total: u64,
    downloaded: u64,
    percentage: f64,
}

#[derive(Clone, Serialize)]
struct ExtractProgress {
    current_file: String,
    percentage: f64,
}

#[tauri::command]
pub async fn download_launcher<R: Runtime>(
    app: AppHandle<R>,
    download_url: String,
    install_path: String,
) -> Result<(), String> {
    let client = Client::new();
    let res = client.get(&download_url).send().await.map_err(|e| e.to_string())?;
    
    let total_size = res.content_length().unwrap_or(0);
    let mut stream = res.bytes_stream();
    let mut downloaded: u64 = 0;
    
    // Ensure install path exists
    fs::create_dir_all(&install_path).map_err(|e| e.to_string())?;

    // Grant Permissions (ICACLS)
    #[cfg(target_os = "windows")]
    {
        let _ = Command::new("icacls")
            .arg(&install_path)
            .arg("/grant")
            .arg("Users:(OI)(CI)F")
            .arg("/T")
            .output();
    }
    
    let mut file_buffer = Vec::new();

    while let Some(item) = stream.next().await {
        let chunk = item.map_err(|e| e.to_string())?;
        file_buffer.extend_from_slice(&chunk);
        downloaded += chunk.len() as u64;

        if total_size > 0 {
            let percentage = (downloaded as f64 / total_size as f64) * 100.0;
            app.emit("download-progress", DownloadProgress {
                total: total_size,
                downloaded,
                percentage,
            }).unwrap_or(());
        }
    }

    // Save zip temporarily
    let zip_path = Path::new(&install_path).join("launcher.zip");
    fs::write(&zip_path, &file_buffer).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn extract_launcher<R: Runtime>(
    app: AppHandle<R>,
    install_path: String,
) -> Result<(), String> {
    let zip_path = Path::new(&install_path).join("launcher.zip");
    let file = fs::File::open(&zip_path).map_err(|e| e.to_string())?;
    let mut archive = zip::ZipArchive::new(file).map_err(|e| e.to_string())?;

    let total_files = archive.len();

    for i in 0..total_files {
        let mut file = archive.by_index(i).map_err(|e| e.to_string())?;
        let outpath = Path::new(&install_path).join(file.mangled_name());

        if (&*file.name()).ends_with('/') {
            fs::create_dir_all(&outpath).map_err(|e| e.to_string())?;
        } else {
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                    fs::create_dir_all(&p).map_err(|e| e.to_string())?;
                }
            }
            let mut outfile = fs::File::create(&outpath).map_err(|e| e.to_string())?;
            std::io::copy(&mut file, &mut outfile).map_err(|e| e.to_string())?;
        }

        let percentage = ((i + 1) as f64 / total_files as f64) * 100.0;
        app.emit("extract-progress", ExtractProgress {
            current_file: file.name().to_string(),
            percentage,
        }).unwrap_or(());
    }

    // Clean up zip
    let _ = fs::remove_file(zip_path);

    Ok(())
}

#[tauri::command]
pub async fn launch_app(
    install_path: String,
) -> Result<(), String> {
    let exe_path = Path::new(&install_path).join("vtuber-app.exe");
    
    if !exe_path.exists() {
        return Err("Executable not found in installation directory".to_string());
    }

    Command::new(exe_path)
        .spawn()
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn check_uninstall_mode() -> bool {
    std::env::args().any(|arg| arg == "--uninstall")
}

#[tauri::command]
pub async fn uninstall_app<R: Runtime>(
    app: AppHandle<R>,
    install_path: String,
    delete_user_data: bool,
    simulate: bool,
) -> Result<(), String> {
    let path = Path::new(&install_path);
    
    if simulate {
        emit_log(&app, "--- STARTING SIMULATION MODE ---");
        emit_log(&app, "No files will be physically deleted.");
    }

    // 🛡️ CRITICAL SAFETY CHECK
    if !path.exists() && !simulate {
        return Err("Path does not exist".to_string());
    }

    // Never allow deleting root or system folders
    let path_str = path.to_string_lossy().to_lowercase();
    let forbidden = vec!["c:\\", "c:\\windows", "c:\\program files", "c:\\users", "c:\\windows\\system32"];
    if forbidden.iter().any(|&f| path_str == f || path_str.starts_with(&(f.to_owned() + "\\"))) {
        emit_log(&app, "FATAL ERROR: Safety Triggered! System directory protection.");
        return Err("🛡️ Safety Triggered: Direct system directory deletion is forbidden!".to_string());
    }

    setStatusProgress(&app, "Preparing for uninstallation...", 10);
    emit_log(&app, &format!("Checking path: {}", install_path));

    // 1. Delete main launcher files
    let launcher_exe = path.join("vtuber-app.exe");
    if launcher_exe.exists() || simulate {
        emit_log(&app, "Delete: vtuber-app.exe");
        if !simulate {
            fs::remove_file(&launcher_exe).map_err(|e| format!("Failed to delete launcher: {}", e))?;
        }
    }

    // 2. Delete Assets (if exist)
    let assets_dir = path.join("Assets");
    if assets_dir.exists() || simulate {
        emit_log(&app, "Remove directory: Assets/");
        if !simulate {
            fs::remove_dir_all(&assets_dir).map_err(|e| format!("Failed to delete assets: {}", e))?;
        }
    }

    // 3. User Data (Optionally)
    if delete_user_data {
        let data_dir = path.join("Data");
        if data_dir.exists() || simulate {
            emit_log(&app, "Remove directory: Data/ (User settings & History)");
            if !simulate {
                fs::remove_dir_all(&data_dir).map_err(|e| format!("Failed to delete data: {}", e))?;
            }
        }
    } else {
        emit_log(&app, "Skipping: Data/ (User requested to keep data)");
    }

    // 4. Clean up the folder itself if empty
    if !simulate {
        // --- Registry Cleanup ---
        #[cfg(target_os = "windows")]
        {
            use winreg::enums::*;
            use winreg::RegKey;
            let hkcu = RegKey::predef(HKEY_CURRENT_USER);
            let base_path = "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall";
            if let Ok(uninstall_key) = hkcu.open_subkey_with_flags(base_path, KEY_ALL_ACCESS) {
                let _ = uninstall_key.delete_subkey("VTuberApp");
                emit_log(&app, "Cleaned up: Windows Registry (Add/Remove Programs)");
            }
        }

        if let Ok(entries) = fs::read_dir(path) {
            if entries.into_iter().next().is_none() {
                emit_log(&app, &format!("Remove empty parent dir: {}", install_path));
                let _ = fs::remove_dir(path);
            } else {
                emit_log(&app, "Notice: Installation directory not empty, keeping folder.");
            }
        }
    } else {
        emit_log(&app, "Simulate: Remove parent directory if empty.");
    }

    if simulate {
        emit_log(&app, "--- SIMULATION COMPLETE ---");
    }

    setStatusProgress(&app, "Uninstallation Complete", 100);
    Ok(())
}

#[tauri::command]
pub async fn finalize_installation(
    install_path: String,
) -> Result<(), String> {
    let path = Path::new(&install_path);
    
    // 1. Copy self as uninstall.exe
    let current_exe = std::env::current_exe().map_err(|e| e.to_string())?;
    let uninstall_exe = path.join("uninstall.exe");
    fs::copy(current_exe, &uninstall_exe).map_err(|e| format!("Failed to copy uninstaller: {}", e))?;

    // 2. Register in Windows Registry (Add/Remove Programs)
    #[cfg(target_os = "windows")]
    {
        use winreg::enums::*;
        use winreg::RegKey;

        let hkcu = RegKey::predef(HKEY_CURRENT_USER);
        let base_path = "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\VTuberApp";
        
        let (key, _) = hkcu.create_subkey(base_path).map_err(|e| e.to_string())?;
        
        key.set_value("DisplayName", &"VTuber App").map_err(|e| e.to_string())?;
        key.set_value("UninstallString", &format!("\"{}\" --uninstall", uninstall_exe.to_string_lossy())).map_err(|e| e.to_string())?;
        key.set_value("DisplayIcon", &path.join("vtuber-app.exe").to_string_lossy().to_string()).map_err(|e| e.to_string())?;
        key.set_value("Publisher", &"NestiaDev").map_err(|e| e.to_string())?;
        key.set_value("DisplayVersion", &"0.1.0").map_err(|e| e.to_string())?;
        key.set_value("InstallLocation", &install_path).map_err(|e| e.to_string())?;
    }

    Ok(())
}

fn emit_log<R: Runtime>(app: &AppHandle<R>, message: &str) {
    app.emit("uninstall-log", message).unwrap_or(());
}

fn setStatusProgress<R: Runtime>(app: &AppHandle<R>, msg: &str, percentage: i32) {
    app.emit("uninstall-progress", ExtractProgress {
        current_file: msg.to_string(),
        percentage: percentage as f64,
    }).unwrap_or(());
}
