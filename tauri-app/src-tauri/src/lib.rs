// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use std::process::Command;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn run_bat_file(path: &str) -> Result<u32, String> {
    let child = Command::new("cmd")
        .args(&["/C", path])
        .spawn()
        .map_err(|e| e.to_string())?;  
    let pid = child.id();
    println!("Started process with PID: {}", pid);
    Ok(pid)
}

#[tauri::command]
fn terminate_process(pid: u32) -> Result<(), String> {
    let status = Command::new("taskkill")
        .args(&["/PID", &pid.to_string(), "/F"])
        .status()
        .map_err(|e| e.to_string())?;
    
    if status.success() {
        println!("Successfully terminated process with PID: {}", pid);
        Ok(())
    } else {
        Err("Failed to kill process".into())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, run_bat_file, terminate_process])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
