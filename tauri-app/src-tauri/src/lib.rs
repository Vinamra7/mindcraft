use std::fs;
use std::io::{BufRead, BufReader};
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::os::windows::process::CommandExt;
use tauri::async_runtime::spawn;
use tauri::{Emitter, Runtime}; // Note: Emitter is imported here so that .emit() is in scope
use lazy_static::lazy_static;
use std::sync::Mutex;
use std::collections::HashSet;

const CREATE_NO_WINDOW: u32 = 0x08000000;

lazy_static! {
  static ref PROCESS_IDS: Mutex<HashSet<u32>> = Mutex::new(HashSet::new());
}

fn track_process(pid: u32){
  let mut pids = PROCESS_IDS.lock().unwrap();
  pids.insert(pid);
}

/// Checks if a program is available using the “where” command.
fn is_program_installed(program: &str) -> bool {
  Command::new("where")
  .creation_flags(CREATE_NO_WINDOW)
    .arg(program)
    .output()
    .map(|output| output.status.success())
    .unwrap_or(false)
}

/// Installs a package using winget if available.
/// Returns an error message if winget isn’t installed or the install fails.
fn install_program(package_name: &str) -> Result<(), String> {
  // Check if winget exists by querying its version.
  if Command::new("winget").creation_flags(CREATE_NO_WINDOW).arg("--version").output().is_ok() {
    let output = Command::new("winget")
    .creation_flags(CREATE_NO_WINDOW)
      .args(&[
        "install",
        package_name,
        "--accept-source-agreements",
        "--accept-package-agreements",
        "-h", // hint for silent install
      ])
      .output()
      .map_err(|e| e.to_string())?;

    if !output.status.success() {
      return Err(format!(
        "Failed to install {}: {}",
        package_name,
        String::from_utf8_lossy(&output.stderr)
      ));
    }
  } else {
    return Err(
      "Winget is not available. Please install it from the Microsoft Store.".into()
    );
  }
  Ok(())
}

/// Clones the repository (branch 'desktop-app') to the given directory.
fn clone_repository(repo_dir: &PathBuf) -> Result<(), String> {
  let output = Command::new("git")
  .creation_flags(CREATE_NO_WINDOW)
    .args(&[
      "clone",
      "-b",
      "desktop-app",
      "https://github.com/Vinamra7/mindcraft.git",
      repo_dir.to_str().unwrap(),
    ])
    .output()
    .map_err(|e| e.to_string())?;

  if !output.status.success() {
    return Err(format!(
      "Failed to clone repository: {}",
      String::from_utf8_lossy(&output.stderr)
    ));
  }
  Ok(())
}

fn install_dependencies<R: Runtime>(repo_dir: &PathBuf, window: &tauri::Window<R>) -> Result<(), String> {
    println!("Installing dependencies in: {:?}", repo_dir);
    let mut child = Command::new("npm.cmd")
    .creation_flags(CREATE_NO_WINDOW)
        .current_dir(repo_dir)
        .arg("install")
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| e.to_string())?;

      track_process(child.id());

    // Handle stdout in a separate task
    if let Some(stdout) = child.stdout.take() {
        let window_clone = window.clone();
        spawn(async move {
            let reader = BufReader::new(stdout);
            reader.lines().for_each(|line| {
                if let Ok(line) = line {
                  println!("line: {:?}", line);
                    let _ = window_clone.emit("install-status", &line);
                }
            });
        });
    }

    // Handle stderr in a separate task
    if let Some(stderr) = child.stderr.take() {
        let window_clone = window.clone();
        spawn(async move {
            let reader = BufReader::new(stderr);
            reader.lines().for_each(|line| {
                if let Ok(line) = line {
                  println!("line: {:?}", line);
                    let _ = window_clone.emit("install-error", &line);
                }
            });
        });
    }

    let status = child.wait().map_err(|e| e.to_string())?;
    if !status.success() {
        return Err("Failed to install dependencies".into());
    }
    let _ = window.emit("install-status", "Dependencies installed successfully!");

    //remove the pid from the list
    PROCESS_IDS.lock().unwrap().remove(&child.id());
    Ok(())
}

/// Sets up the environment by:
/// - Ensuring Git and Node.js are installed (installing via winget if needed)
/// - Cloning the repository (if not already present)
/// - Installing npm dependencies
/// This function emits "setup--status" events for UI feedback.
#[tauri::command]
async fn setup_environment<R: Runtime>(window: tauri::Window<R>) -> Result<(), String> {
  // Function to emit status updates to the frontend.
  let emit_status = |status: &str| {
    let _ = window.emit("setup-status", status);
  };

  emit_status("Checking Git installation...");
  if !is_program_installed("git") {
    emit_status("Git not found. Installing Git...");
    install_program("Git.Git")?;
  }
  println!("Git installed successfully");

  emit_status("Checking Node.js installation...");
  if !is_program_installed("node") {
    emit_status("Node.js not found. Installing Node.js...");
    install_program("OpenJS.NodeJS")?;
  }
  println!("Node.js installed successfully");

  emit_status("Checking npm installation...");
    if !is_program_installed("npm") {
        emit_status("npm not found. Installing npm...");
        println!("npm not found");
    }
  emit_status("Setting up repository...");
  let app_data = std::env::var("APPDATA").map_err(|e| e.to_string())?;
  let repo_dir = PathBuf::from(app_data).join("com.mindcraft.app").join("node-app");

  println!("Repo dir: {:?}", repo_dir);
  if !repo_dir.exists() {
    fs::create_dir_all(&repo_dir).map_err(|e| e.to_string())?;
    clone_repository(&repo_dir)?;
  }
  println!("repo dir: {:?}", repo_dir);

  emit_status("Installing dependencies please wait it may take a while...");
  install_dependencies(&repo_dir, &window)?; 

  emit_status("Setup completed successfully!");
  Ok(())
}

/// Runs the Node.js application (main.js) with additional command line arguments.
/// Captures stdout and stderr and emits lines to the frontend events "node-output" and "node-error".
#[tauri::command]
async fn run_node_app<R: Runtime>(
  command_args: Vec<String>,
  window: tauri::Window<R>,
) -> Result<u32, String> {
  let app_data = std::env::var("APPDATA").map_err(|e| e.to_string())?;
  let repo_dir = PathBuf::from(app_data).join("com.mindcraft.app").join("node-app");

  let mut child = Command::new("node")
    .creation_flags(CREATE_NO_WINDOW)
    .current_dir(&repo_dir)
    .arg("main.js")
    .args(&command_args)
    .stdout(Stdio::piped())
    .stderr(Stdio::piped())
    .spawn()
    .map_err(|e| e.to_string())?;

  let pid = child.id();
  track_process(pid);

  // Process stdout stream.
  if let Some(stdout) = child.stdout.take() {
    let window_clone = window.clone();
    spawn(async move {
      let reader = BufReader::new(stdout);
      reader.lines().for_each(|line| {
        if let Ok(line) = line {
          let _ = window_clone.emit("node-output", line);
        }
      });
    });
  }

  // Process stderr stream.
  if let Some(stderr) = child.stderr.take() {
    let window_clone = window.clone();
    spawn(async move {
      let reader = BufReader::new(stderr);
      reader.lines().for_each(|line| {
        if let Ok(line) = line {
          let _ = window_clone.emit("node-error", line);
        }
      });
    });
  }

  Ok(pid)
}


#[tauri::command]
async fn terminate_process(pid_: u32) -> Result<(), String> {

    track_process(pid_);

    let pids: Vec<u32> = {
        let pids = PROCESS_IDS.lock().unwrap();
        pids.iter().cloned().collect()
    };

    let mut error_message = String::new();

    for pid in pids {
        let taskkill_status = tauri::async_runtime::spawn_blocking(move || {
            Command::new("taskkill")
                .creation_flags(CREATE_NO_WINDOW)
                .args(&["/PID", &pid.to_string(), "/F"])
                .status()
        })
        .await
        .map_err(|e| e.to_string())?  
        .map_err(|e| e.to_string())?; 

        if !taskkill_status.success() {
            error_message.push_str(&format!(
                "Failed to terminate process with PID {}: {:?}\n",
                pid, taskkill_status
            ));
        }
        else{println!("Process with PID {} terminated successfully", pid);}
    }
    PROCESS_IDS.lock().unwrap().clear();
    if !error_message.is_empty() {
        Err(error_message)
    } else {
        Ok(())
    }
}


/// Entry point for the Tauri application.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_opener::init())
    .invoke_handler(tauri::generate_handler![
      setup_environment,
      run_node_app,
      terminate_process
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}