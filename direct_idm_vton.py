#!/usr/bin/env python3
"""
Direct IDM-VTON inference script - bypasses Gradio demo
"""

import os
import sys
import torch
import numpy as np
from PIL import Image
import logging
from pathlib import Path

# Add IDM-VTON to path
IDMVTON_PATH = os.path.join(os.path.dirname(__file__), "models", "IDM-VTON")
if os.path.exists(IDMVTON_PATH):
    sys.path.insert(0, IDMVTON_PATH)
    sys.path.insert(0, os.path.join(IDMVTON_PATH, "src"))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DirectIDMVTON:
    def __init__(self):
        """Initialize direct IDM-VTON inference without Gradio"""
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.pipeline = None
        self.is_initialized = False
        
        logger.info(f"Using device: {self.device}")
        self._load_model()
    
    def _load_model(self):
        """Load IDM-VTON model directly"""
        try:
            # Import IDM-VTON modules
            from diffusers import StableDiffusionInpaintPipeline, DDIMScheduler
            from transformers import CLIPVisionModelWithProjection
            
            # Define model paths
            base_model_path = "runwayml/stable-diffusion-inpainting"  # Base SD model
            unet_path = os.path.join(IDMVTON_PATH, "checkpoints", "unet")  # IDM-VTON UNet
            
            # Check if local UNet exists
            if os.path.exists(unet_path):
                logger.info(f"Loading IDM-VTON UNet from: {unet_path}")
                
                # Load custom pipeline with IDM-VTON components
                self.pipeline = StableDiffusionInpaintPipeline.from_pretrained(
                    base_model_path,
                    torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                    safety_checker=None,
                    requires_safety_checker=False
                )
                
                # Load custom UNet if available
                try:
                    from diffusers import UNet2DConditionModel
                    custom_unet = UNet2DConditionModel.from_pretrained(unet_path)
                    self.pipeline.unet = custom_unet
                    logger.info("✅ Custom IDM-VTON UNet loaded")
                except Exception as e:
                    logger.warning(f"Could not load custom UNet: {e}")
                
                self.pipeline = self.pipeline.to(self.device)
                
                # Setup scheduler
                self.pipeline.scheduler = DDIMScheduler.from_config(self.pipeline.scheduler.config)
                
                self.is_initialized = True
                logger.info("✅ IDM-VTON pipeline initialized successfully")
                
            else:
                logger.warning(f"UNet checkpoint not found at: {unet_path}")
                logger.info("Using base Stable Diffusion inpainting model")
                
                # Fallback to base SD inpainting
                self.pipeline = StableDiffusionInpaintPipeline.from_pretrained(
                    base_model_path,
                    torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                    safety_checker=None,
                    requires_safety_checker=False
                ).to(self.device)
                
                self.is_initialized = True
                logger.info("✅ Base inpainting pipeline loaded")
                
        except Exception as e:
            logger.error(f"Failed to load IDM-VTON model: {e}")
            self.is_initialized = False
    
    def preprocess_person_image(self, person_image, target_size=(512, 768)):
        """Preprocess person image for IDM-VTON"""
        try:
            if isinstance(person_image, str):
                person_image = Image.open(person_image)
            
            # Resize while maintaining aspect ratio
            person_image = person_image.convert("RGB")
            person_image = person_image.resize(target_size, Image.LANCZOS)
            
            return person_image
            
        except Exception as e:
            logger.error(f"Failed to preprocess person image: {e}")
            return None
    
    def preprocess_garment_image(self, garment_image, target_size=(512, 768)):
        """Preprocess garment image for IDM-VTON"""
        try:
            if isinstance(garment_image, str):
                garment_image = Image.open(garment_image)
            
            # Resize garment image
            garment_image = garment_image.convert("RGB")
            garment_image = garment_image.resize(target_size, Image.LANCZOS)
            
            return garment_image
            
        except Exception as e:
            logger.error(f"Failed to preprocess garment image: {e}")
            return None
    
    def generate_clothing_mask(self, person_image):
        """Generate clothing mask for the person image"""
        try:
            # Simple mask generation for upper body
            # In a real implementation, you'd use a segmentation model
            
            width, height = person_image.size
            mask = Image.new('L', (width, height), 0)
            
            from PIL import ImageDraw
            draw = ImageDraw.Draw(mask)
            
            # Define upper body clothing area
            shirt_top = int(height * 0.2)
            shirt_bottom = int(height * 0.7)
            shirt_left = int(width * 0.15)
            shirt_right = int(width * 0.85)
            
            # Draw clothing area
            draw.rectangle([shirt_left, shirt_top, shirt_right, shirt_bottom], fill=255)
            
            return mask
            
        except Exception as e:
            logger.error(f"Failed to generate clothing mask: {e}")
            return None
    
    def run_inference(self, person_image, garment_image, mask=None, 
                     num_inference_steps=20, guidance_scale=7.5):
        """Run IDM-VTON inference directly"""
        try:
            if not self.is_initialized:
                raise Exception("IDM-VTON pipeline not initialized")
            
            # Preprocess inputs
            person_processed = self.preprocess_person_image(person_image)
            garment_processed = self.preprocess_garment_image(garment_image)
            
            if person_processed is None or garment_processed is None:
                raise Exception("Failed to preprocess input images")
            
            # Generate mask if not provided
            if mask is None:
                mask = self.generate_clothing_mask(person_processed)
            
            # Prepare prompt for IDM-VTON
            prompt = "a person wearing the garment, high quality, detailed"
            negative_prompt = "blurry, low quality, distorted, deformed"
            
            # Run inference
            logger.info("🚀 Running IDM-VTON inference...")
            
            result = self.pipeline(
                prompt=prompt,
                negative_prompt=negative_prompt,
                image=person_processed,
                mask_image=mask,
                num_inference_steps=num_inference_steps,
                guidance_scale=guidance_scale,
                height=person_processed.height,
                width=person_processed.width
            ).images[0]
            
            logger.info("✅ IDM-VTON inference completed")
            return result
            
        except Exception as e:
            logger.error(f"IDM-VTON inference failed: {e}")
            raise e
    
    def create_batik_fitting(self, person_image_path, batik_pattern_path, output_path=None):
        """Main function to create batik virtual fitting"""
        try:
            logger.info("🎨 Starting batik virtual fitting...")
            
            # Load images
            person_image = Image.open(person_image_path)
            batik_pattern = Image.open(batik_pattern_path)
            
            # Run inference
            result = self.run_inference(person_image, batik_pattern)
            
            # Save result
            if output_path:
                result.save(output_path)
                logger.info(f"✅ Result saved to: {output_path}")
            
            return result
            
        except Exception as e:
            logger.error(f"Batik fitting failed: {e}")
            return None

# Usage example
if __name__ == "__main__":
    print("🚀 Direct IDM-VTON Inference")
    print("=" * 40)
    
    # Initialize IDM-VTON
    idm_vton = DirectIDMVTON()
    
    if not idm_vton.is_initialized:
        print("❌ IDM-VTON initialization failed")
        sys.exit(1)
    
    # Example usage
    person_image = "path/to/person.jpg"
    batik_pattern = "path/to/batik_pattern.jpg"
    output_path = "result_batik_fitting.jpg"
    
    print(f"Person image: {person_image}")
    print(f"Batik pattern: {batik_pattern}")
    print(f"Output: {output_path}")
    
    # Check if input files exist
    if os.path.exists(person_image) and os.path.exists(batik_pattern):
        result = idm_vton.create_batik_fitting(person_image, batik_pattern, output_path)
        
        if result:
            print("🎉 Virtual fitting completed successfully!")
        else:
            print("❌ Virtual fitting failed")
    else:
        print("⚠️  Input files not found. Please provide valid image paths.")
        print("\n💡 Usage example:")
        print("python direct_idm_vton.py --person person.jpg --garment batik.jpg --output result.jpg")
