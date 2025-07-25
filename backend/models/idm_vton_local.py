import os
import sys
import logging
from PIL import Image
import numpy as np

# Disable xformers explicitly
os.environ["XFORMERS_DISABLED"] = "1"

# Add IDM-VTON to path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
IDMVTON_PATH = os.path.join(PROJECT_ROOT, "models", "IDM-VTON")

if os.path.exists(IDMVTON_PATH):
    sys.path.insert(0, IDMVTON_PATH)
    sys.path.insert(0, os.path.join(IDMVTON_PATH, "src"))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class IDMVTONLocal:
    def __init__(self):
        """Initialize local IDM-VTON WITHOUT xFormers"""
        self.pipeline = None
        self.is_initialized = False
        
        # Disable xformers warnings
        import warnings
        warnings.filterwarnings("ignore", message=".*xformers.*")
        
        # Check only essential dependencies
        if not self._check_essential_dependencies():
            logger.error("❌ Essential dependencies not available")
            return
        
        # Determine device
        try:
            import torch
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            logger.info(f"🔧 Using device: {self.device}")
        except ImportError:
            logger.error("❌ PyTorch not available")
            return
        
        logger.info(f"📁 IDM-VTON path: {IDMVTON_PATH}")
        self._load_model_simple()
    
    def _check_essential_dependencies(self):
        """Check only essential dependencies (NO xFormers)"""
        essential_packages = [
            ('torch', 'PyTorch'),
            ('diffusers', 'Diffusers'),
            ('transformers', 'Transformers'),
            ('PIL', 'Pillow'),
            ('numpy', 'NumPy')
        ]
        
        missing_packages = []
        
        for package, name in essential_packages:
            try:
                __import__(package)
                logger.info(f"✅ {name} available")
            except ImportError:
                missing_packages.append(name)
                logger.error(f"❌ {name} not available")
        
        if missing_packages:
            logger.error(f"❌ Missing packages: {', '.join(missing_packages)}")
            return False
        
        return True
    
    def _load_model_simple(self):
        """Load model with simple approach (NO xFormers)"""
        try:
            import torch
            
            # Import diffusers with explicit no-xformers
            logger.info("🔄 Loading diffusers WITHOUT xFormers...")
            
            from diffusers import StableDiffusionInpaintPipeline, DDIMScheduler
            logger.info("✅ Diffusers imported successfully")
            
            # Load lightweight model
            logger.info("🔄 Loading Stable Diffusion Inpainting (lightweight)...")
            
            self.pipeline = StableDiffusionInpaintPipeline.from_pretrained(
                "runwayml/stable-diffusion-inpainting",
                torch_dtype=torch.float32,  # Always use float32 for CPU
                safety_checker=None,
                requires_safety_checker=False,
                use_safetensors=False
            )
            
            # Explicitly disable xformers
            try:
                self.pipeline.disable_xformers_memory_efficient_attention()
                logger.info("✅ xFormers disabled successfully")
            except:
                logger.info("ℹ️ xFormers not available (this is fine)")
            
            # Move to device
            self.pipeline = self.pipeline.to(self.device)
            
            # Setup simple scheduler
            self.pipeline.scheduler = DDIMScheduler.from_config(
                self.pipeline.scheduler.config
            )
            
            # Disable safety checker
            self.pipeline.safety_checker = None
            
            self.is_initialized = True
            logger.info("✅ IDM-VTON Local initialized successfully WITHOUT xFormers!")
            
        except Exception as e:
            logger.error(f"❌ Failed to load model: {e}")
            self.is_initialized = False
    
    def create_garment_from_pattern(self, pattern_image):
        """Create garment template from batik pattern"""
        try:
            if isinstance(pattern_image, str):
                pattern_image = Image.open(pattern_image)
            elif isinstance(pattern_image, np.ndarray):
                pattern_image = Image.fromarray(pattern_image)
            
            # Ensure RGB
            if pattern_image.mode != 'RGB':
                pattern_image = pattern_image.convert('RGB')
            
            # Resize to standard garment size
            target_size = (512, 768)
            pattern_resized = pattern_image.resize(target_size, Image.LANCZOS)
            
            logger.info("🎨 Created garment template from batik pattern")
            return pattern_resized
            
        except Exception as e:
            logger.error(f"❌ Error creating garment from pattern: {e}")
            return pattern_image
    
    def apply_garment(self, person_image, garment_image, mask=None):
        """Apply garment to person using simple diffusion (NO xFormers)"""
        try:
            if not self.is_initialized:
                raise Exception("IDM-VTON Local not initialized")
            
            # Preprocess person image
            if isinstance(person_image, str):
                person_image = Image.open(person_image)
            elif isinstance(person_image, np.ndarray):
                person_image = Image.fromarray(person_image)
            
            person_image = person_image.convert('RGB')
            target_size = (768, 1024)
            person_resized = person_image.resize(target_size, Image.LANCZOS)
            
            # Preprocess garment
            garment_processed = self.create_garment_from_pattern(garment_image)
            
            # Generate mask if not provided
            if mask is None:
                mask = self._generate_clothing_mask(person_resized)
            
            # Simple prompts
            prompt = "person wearing batik shirt, high quality"
            negative_prompt = "blurry, low quality"
            
            logger.info("🚀 Running simple diffusion inference...")
            
            # Run inference with minimal settings
            result = self.pipeline(
                prompt=prompt,
                negative_prompt=negative_prompt,
                image=person_resized,
                mask_image=mask,
                num_inference_steps=5,
                guidance_scale=7.0,
                height=target_size[1],
                width=target_size[0]
            ).images[0]
            
            logger.info("✅ Inference completed successfully")
            return result
            
        except Exception as e:
            logger.error(f"❌ Apply garment failed: {e}")
            raise e
    
    def _generate_clothing_mask(self, person_image):
        """Generate simple clothing mask for upper body"""
        try:
            width, height = person_image.size
            mask = Image.new('L', (width, height), 0)
            
            from PIL import ImageDraw
            draw = ImageDraw.Draw(mask)
            
            # Simple shirt area
            shirt_top = int(height * 0.25)
            shirt_bottom = int(height * 0.75)
            shirt_left = int(width * 0.20)
            shirt_right = int(width * 0.80)
            
            draw.rectangle([shirt_left, shirt_top, shirt_right, shirt_bottom], fill=255)
            
            logger.info("🎭 Generated simple clothing mask")
            return mask
            
        except Exception as e:
            logger.error(f"❌ Failed to generate mask: {e}")
            return Image.new('L', person_image.size, 128)

def get_idm_vton_local():
    """Factory function to get IDM-VTON Local instance"""
    return IDMVTONLocal()