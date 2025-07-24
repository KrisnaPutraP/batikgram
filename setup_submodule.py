#!/usr/bin/env python3
"""
Quick setup for IDM-VTON as submodule
"""

import os
import subprocess
from pathlib import Path

def setup_idm_vton_submodule():
    """Set up IDM-VTON as git submodule"""
    print("🚀 Setting up IDM-VTON as submodule...")
    
    project_root = Path(__file__).parent
    models_dir = project_root / "models"
    idmvton_path = models_dir / "IDM-VTON"
    
    try:
        # Create models directory
        models_dir.mkdir(exist_ok=True)
        print(f"📁 Models directory: {models_dir}")
        
        # Check if already exists
        if idmvton_path.exists():
            print("✅ IDM-VTON directory already exists")
            
            # Check if it's a git submodule
            gitmodules_file = project_root / ".gitmodules"
            if gitmodules_file.exists():
                with open(gitmodules_file, 'r') as f:
                    content = f.read()
                    if "IDM-VTON" in content:
                        print("✅ IDM-VTON is already configured as submodule")
                        return True
            
            print("⚠️  Directory exists but not as submodule")
            print("💡 You may want to remove it and run this script again")
            return False
        
        # Add as submodule
        print("📦 Adding IDM-VTON as submodule...")
        
        cmd = [
            "git", "submodule", "add",
            "https://github.com/yisol/IDM-VTON.git",
            "models/IDM-VTON"
        ]
        
        result = subprocess.run(cmd, cwd=project_root, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Submodule added successfully")
            
            # Initialize submodule
            print("🔄 Initializing submodule...")
            init_cmd = ["git", "submodule", "update", "--init", "--recursive"]
            init_result = subprocess.run(init_cmd, cwd=project_root, capture_output=True, text=True)
            
            if init_result.returncode == 0:
                print("✅ Submodule initialized")
                print("\n🎉 IDM-VTON submodule setup complete!")
                print("\n📋 Next steps:")
                print("1. Download model weights (if needed)")
                print("2. Install dependencies: pip install diffusers transformers torch")
                print("3. Test with: python direct_idm_vton.py")
                return True
            else:
                print(f"❌ Failed to initialize submodule: {init_result.stderr}")
                return False
        else:
            print(f"❌ Failed to add submodule: {result.stderr}")
            
            # Check if it's because we're not in a git repo
            if "not a git repository" in result.stderr.lower():
                print("\n💡 This is not a git repository. To use submodules:")
                print("1. Initialize git: git init")
                print("2. Add remote: git remote add origin <your-repo-url>")
                print("3. Run this script again")
            
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def check_git_status():
    """Check if we're in a git repository"""
    try:
        result = subprocess.run(["git", "status"], capture_output=True, text=True)
        return result.returncode == 0
    except:
        return False

if __name__ == "__main__":
    print("🔧 IDM-VTON Submodule Setup")
    print("=" * 40)
    
    # Check if git is available
    try:
        subprocess.run(["git", "--version"], capture_output=True, check=True)
        print("✅ Git is available")
    except:
        print("❌ Git is not installed or not in PATH")
        print("💡 Please install Git first: https://git-scm.com/")
        exit(1)
    
    # Check if in git repo
    if not check_git_status():
        print("⚠️  Not in a git repository")
        choice = input("Initialize git repository? (y/n): ").lower()
        
        if choice == 'y':
            try:
                subprocess.run(["git", "init"], check=True)
                print("✅ Git repository initialized")
            except:
                print("❌ Failed to initialize git repository")
                exit(1)
        else:
            print("💡 Please initialize git repository first: git init")
            exit(1)
    
    # Run setup
    success = setup_idm_vton_submodule()
    
    if success:
        print("\n🎯 Setup completed successfully!")
    else:
        print("\n❌ Setup failed. Please check the errors above.")
