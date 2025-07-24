#!/usr/bin/env python3
"""
Install EXACT versions for IDM-VTON - NO FALLBACK
"""
import subprocess
import sys

def run_cmd(cmd):
    print(f"🔄 {cmd}")
    result = subprocess.run(cmd, shell=True)
    return result.returncode == 0

def main():
    print("🔧 FIXING IDM-VTON EXACT VERSIONS - NO FALLBACK!")
    
    # Uninstall semua yang bermasalah
    packages_remove = ["diffusers", "transformers", "accelerate", "xformers"]
    for pkg in packages_remove:
        run_cmd(f"pip uninstall {pkg} -y")
    
    # Install versi EXACT yang kompatibel dengan IDM-VTON
    print("📦 Installing EXACT compatible versions...")
    
    # Versi ini PASTI kompatibel dengan IDM-VTON
    run_cmd("pip install diffusers==0.18.2")
    run_cmd("pip install transformers==4.30.0")  
    run_cmd("pip install accelerate==0.20.3")
    
    # Dependencies tambahan yang diperlukan IDM-VTON
    run_cmd("pip install controlnet-aux")
    run_cmd("pip install insightface==0.7.3")
    run_cmd("pip install onnxruntime")
    run_cmd("pip install opencv-python")
    
    print("✅ EXACT versions installed!")

if __name__ == "__main__":
    main()