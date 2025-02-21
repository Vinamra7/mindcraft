import argparse
import json
import toml

def update_version(version_type):
    # Define file paths
    tauri_conf_path = "tauri-app/src-tauri/tauri.conf.json"
    cargo_toml_path = "tauri-app/src-tauri/Cargo.toml"

    # Read files
    with open(tauri_conf_path, "r") as f:
        tauri_conf = json.load(f)
    with open(cargo_toml_path, "r") as f:
        cargo_toml = toml.load(f)

    # Get current version
    version = tauri_conf["version"]
    major, minor, patch = map(int, version.split("."))

    # Increment version
    if version_type == "major":
        major += 1
        minor = 0
        patch = 0
    elif version_type == "minor":
        minor += 1
        patch = 0
    elif version_type == "patch":
        patch += 1
    else:
        raise ValueError("Invalid version type. Must be major, minor, or patch.")

    # Format new version
    new_version = f"{major}.{minor}.{patch}"

    # Update tauri.conf.json
    tauri_conf["version"] = new_version
    with open(tauri_conf_path, "w") as f:
        json.dump(tauri_conf, f, indent=2)

    # Update Cargo.toml
    cargo_toml["package"]["version"] = new_version
    with open(cargo_toml_path, "w") as f:
        toml.dump(cargo_toml, f)

    print(f"Version updated to {new_version}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Update the version of a Tauri app.")
    parser.add_argument(
        "version_type",
        choices=["major", "minor", "patch"],
        help="The type of version increment (major, minor, or patch).",
    )
    args = parser.parse_args()

    try:
        update_version(args.version_type)
    except ValueError as e:
        print(e)
        exit(1)
    except FileNotFoundError as e:
        print(f"File not found: {e.filename}")
        exit(1)
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        exit(1)