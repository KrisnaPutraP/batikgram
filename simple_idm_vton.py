#!/usr/bin/env python3
"""
SIMPLE IDM-VTON - NO FALLBACK, ONLY ORIGINAL
"""
import os
import sys
import torch
from PIL import Image
import logging

# Set environment
os.environ["CUDA_VISIBLE_DEVICES"] = "0" if torch.cuda.is_available() else ""

# Add IDM-VTON path
IDMVTON_PATH = os.path.join(os.path.dirname(__file__), "models", "IDM-VTON")
sys.path.insert(0, IDMVTON_PATH)
sys.path.insert(0, os.path.join(IDMVTON_PATH, "gradio_demo"))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SimpleIDMVTON:
    def __init__(self):
        """HANYA IDM-VTON ASLI"""
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.is_initialized = False
        
        logger.info(f"🔧 Device: {self.device}")
        logger.info(f"📁 IDM-VTON: {IDMVTON_PATH}")
        
        self._load_original_idm_vton()
    
    def _load_original_idm_vton(self):
        """Load ORIGINAL IDM-VTON dari gradio demo"""
        try:
            # Import dari gradio demo
            from app import start_tryon
            
            self.start_tryon = start_tryon
            self.is_initialized = True
            
            logger.info("✅ IDM-VTON ORIGINAL loaded!")
            
        except ImportError as e:
            logger.error(f"❌ GAGAL import IDM-VTON: {e}")
            raise Exception(f"IDM-VTON import failed: {e}")
        except Exception as e:
            logger.error(f"❌ GAGAL load IDM-VTON: {e}")
            raise Exception(f"IDM-VTON load failed: {e}")
    
    def run_vton(self, person_image_path, garment_image_path, output_path=None):
        """Run IDM-VTON ASLI"""
        if not self.is_initialized:
            raise Exception("IDM-VTON NOT INITIALIZED!")
        
        logger.info("🚀 Running ORIGINAL IDM-VTON...")
        
        # Load images
        person_img = Image.open(person_image_path)
        garment_img = Image.open(garment_image_path)
        
        # Run IDM-VTON ASLI
        result = self.start_tryon(
            person_img,      # person image
            garment_img,     # garment image  
            "wearing this garment",  # prompt
            True,           # is_checked
            True,           # is_checked_crop
            20,             # num_inference_steps
            2.5,            # guidance_scale
            42              # seed
        )
        
        # Extract result image
        if isinstance(result, tuple):
            result_image = result[0]
        else:
            result_image = result
        
        # Save
        if output_path:
            result_image.save(output_path, 'JPEG', quality=95)
            logger.info(f"💾 Saved: {output_path}")
        
        logger.info("✅ IDM-VTON DONE!")
        return result_image

# Test function
if __name__ == "__main__":
    print("🚀 SIMPLE IDM-VTON - NO FALLBACK")
    print("=" * 40)
    
    try:
        vton = SimpleIDMVTON()
        
        person_img = "backend/data/test_person.jpg"
        garment_img = "backend/data/batik_patterns/temp_ceplok_liring.jpg"
        output = "idm_vton_result.jpg"
        
        if os.path.exists(person_img) and os.path.exists(garment_img):
            result = vton.run_vton(person_img, garment_img, output)
            print("🎉 SUCCESS!")
        else:
            print("❌ Missing input files")
            
    except Exception as e:
        print(f"❌ FAILED: {e}")
        print("💡 Fix dependencies: python fix_idm_vton_exact.py")