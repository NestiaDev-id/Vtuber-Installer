// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::installer::download_launcher,
            commands::installer::extract_launcher,
            commands::installer::launch_app,
            commands::installer::check_uninstall_mode,
            commands::installer::uninstall_app,
            commands::installer::finalize_installation
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
