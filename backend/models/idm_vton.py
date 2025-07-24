import torch
import cv2
import numpy as np
from PIL import Image
import os
import requests
from io import BytesIO
import logging
import base64
import json
import time
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    from .idm_vton_local import get_idm_vton_local
    LOCAL_IDMVTON_AVAILABLE = True
    logger.info("✅ Local IDM-VTON available")
except ImportError as e:
    LOCAL_IDMVTON_AVAILABLE = False
    logger.warning(f"⚠️ Local IDM-VTON not available: {e}")

class IDMVTONWrapper:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model_id = "yisol/IDM-VTON"
        self.is_initialized = False
        
        # Hugging Face token
        self.hf_token = os.getenv("HUGGING_FACE_TOKEN", None)
        
        # API endpoints (backup)
        self.api_endpoints = [
            "https://api-inference.huggingface.co/models/yisol/IDM-VTON",
            "https://hf.space/yisol-IDM-VTON/api/predict",
        ]
        
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize IDM-VTON model - prioritize local, fallback to API"""
        try:
            # Priority 1: Try local IDM-VTON
            if LOCAL_IDMVTON_AVAILABLE:
                logger.info("🔄 Attempting to use Local IDM-VTON...")
                self.local_model = get_idm_vton_local()
                if self.local_model and self.local_model.is_initialized:
                    self.is_initialized = True
                    self.use_local = True
                    logger.info("✅ Using Local IDM-VTON")
                    return
                else:
                    logger.warning("⚠️ Local IDM-VTON failed to initialize")
            
            # Priority 2: Try API endpoints
            if self.hf_token:
                logger.info("🔄 Local failed, trying API endpoints...")
                working_endpoints = []
                
                for endpoint in self.api_endpoints:
                    if self._test_api_endpoint(endpoint):
                        working_endpoints.append(endpoint)
                
                if working_endpoints:
                    self.api_endpoint = working_endpoints[0]
                    self.is_initialized = True
                    self.use_local = False
                    logger.info(f"✅ Using API endpoint: {self.api_endpoint}")
                    return
            
            # No working options
            logger.error("❌ No working IDM-VTON options available")
            self.is_initialized = False
            self.use_local = False
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize IDM-VTON: {e}")
            self.is_initialized = False
            self.use_local = False
    
    def _test_api_endpoint(self, endpoint):
        """Test if API endpoint is available"""
        try:
            headers = {"Authorization": f"Bearer {self.hf_token}"}
            # Add SSL verification and timeout settings
            response = requests.get(
                endpoint, 
                headers=headers, 
                timeout=10,
                verify=True,
                allow_redirects=True
            )
            return response.status_code not in [404, 500, 502, 503]
        except requests.exceptions.SSLError as ssl_error:
            logger.warning(f"SSL error testing endpoint {endpoint}: {ssl_error}")
            return False
        except requests.exceptions.Timeout:
            logger.warning(f"Timeout testing endpoint {endpoint}")
            return False
        except requests.exceptions.ConnectionError as conn_error:
            logger.warning(f"Connection error testing endpoint {endpoint}: {conn_error}")
            return False
        except Exception as e:
            logger.warning(f"Error testing endpoint {endpoint}: {e}")
            return False
    
    def create_garment_from_pattern(self, pattern_image):
        """Create garment template from batik pattern"""
        try:
            logger.info("🎨 Creating garment template from pattern")
            
            if self.use_local and hasattr(self, 'local_model'):
                return self.local_model.create_garment_from_pattern(pattern_image)
            else:
                # Fallback to simple processing for API
                return self._create_shirt_shaped_garment(pattern_image)
                
        except Exception as e:
            logger.error(f"❌ Error creating garment from pattern: {e}")
            return pattern_image if isinstance(pattern_image, Image.Image) else Image.fromarray(pattern_image)
    
    def _create_shirt_shaped_garment(self, pattern):
        """Create shirt-shaped garment from pattern"""
        try:
            # Standard shirt dimensions (aspect ratio approximately 3:4)
            shirt_width = 400
            shirt_height = 600
            
            # Resize pattern to shirt size
            pattern_resized = cv2.resize(pattern, (shirt_width, shirt_height))
            
            # Create shirt mask
            shirt_mask = self._create_detailed_shirt_mask(shirt_height, shirt_width)
            
            # Apply shirt mask to pattern
            shirt_shaped = np.zeros_like(pattern_resized)
            for c in range(3):  # RGB channels
                shirt_shaped[:, :, c] = pattern_resized[:, :, c] * shirt_mask
            
            # Add some texture and depth
            shirt_shaped = self._add_shirt_details(shirt_shaped, shirt_mask)
            
            return shirt_shaped
            
        except Exception as e:
            logger.error(f"Error creating shirt shape: {e}")
            return pattern
    
    def _create_detailed_shirt_mask(self, height, width):
        """Create detailed shirt-shaped mask"""
        mask = np.zeros((height, width), dtype=np.float32)
        
        # Main shirt body
        body_top = int(height * 0.15)
        body_bottom = int(height * 0.85)
        body_left = int(width * 0.2)
        body_right = int(width * 0.8)
        
        # Create main body rectangle
        cv2.rectangle(mask, (body_left, body_top), (body_right, body_bottom), 1.0, -1)
        
        # Add sleeves
        sleeve_top = body_top
        sleeve_bottom = int(height * 0.45)
        sleeve_width = int(width * 0.15)
        
        # Left sleeve
        cv2.rectangle(mask, (body_left - sleeve_width, sleeve_top), 
                     (body_left, sleeve_bottom), 1.0, -1)
        
        # Right sleeve  
        cv2.rectangle(mask, (body_right, sleeve_top), 
                     (body_right + sleeve_width, sleeve_bottom), 1.0, -1)
        
        # Add neck opening
        neck_center_x = width // 2
        neck_top = body_top
        neck_width = int(width * 0.08)
        neck_height = int(height * 0.06)
        
        cv2.ellipse(mask, (neck_center_x, neck_top), 
                   (neck_width, neck_height), 0, 0, 180, 0.0, -1)
        
        # Smooth the edges
        mask = cv2.GaussianBlur(mask, (15, 15), 5)
        
        return mask
    
    def _add_shirt_details(self, shirt, mask):
        """Add realistic shirt details"""
        try:
            # Add subtle shading for depth
            h, w = shirt.shape[:2]
            
            # Create lighting gradient
            y, x = np.mgrid[0:h, 0:w]
            center_x, center_y = w // 2, h // 3
            
            # Distance from light source
            distance = np.sqrt((x - center_x)**2 + (y - center_y)**2)
            max_distance = np.sqrt(center_x**2 + (h - center_y)**2)
            
            # Normalize and create gradient
            gradient = 1 - (distance / max_distance) * 0.15
            gradient = np.clip(gradient, 0.85, 1.15)
            
            # Apply gradient only where mask exists
            detailed_shirt = shirt.astype(np.float32)
            for c in range(3):
                detailed_shirt[:, :, c] *= gradient
                detailed_shirt[:, :, c] *= (mask > 0.1)  # Only apply to shirt areas
            
            # Add subtle texture
            noise = np.random.normal(0, 2, shirt.shape).astype(np.float32)
            detailed_shirt += noise * np.stack([mask, mask, mask], axis=2) * 0.3
            
            return np.clip(detailed_shirt, 0, 255).astype(np.uint8)
            
        except Exception as e:
            logger.error(f"Error adding shirt details: {e}")
            return shirt

    def apply_garment(self, person_image, garment_template):
        """Apply garment to person image"""
        try:
            if not self.is_initialized:
                raise Exception("IDM-VTON not initialized")
            
            if self.use_local and hasattr(self, 'local_model'):
                logger.info("🎯 Using Local IDM-VTON for inference")
                return self.local_model.apply_garment(person_image, garment_template)
            else:
                logger.info("🌐 Using API IDM-VTON for inference")
                return self._api_inference(person_image, garment_template)
                
        except Exception as e:
            logger.error(f"❌ IDM-VTON apply_garment failed: {e}")
            raise e
    
    def _use_api_inference(self, person_image, garment_image):
        """Use actual IDM-VTON API with proper format and retry mechanism"""
        max_retries = 3
        retry_delay = 2
        
        for attempt in range(max_retries):
            try:
                if not hasattr(self, 'active_endpoint'):
                    return None
                    
                headers = {
                    "Authorization": f"Bearer {self.hf_token}",
                    "Content-Type": "application/json",
                    "User-Agent": "Python/requests"
                }
                
                # Convert images to base64
                person_b64 = self._image_to_base64(person_image)
                garment_b64 = self._image_to_base64(garment_image)
                
                # Different payload formats for different endpoints
                if "gradio" in self.active_endpoint or "space" in self.active_endpoint:
                    # Gradio space format
                    payload = {
                        "data": [
                            person_b64,  # person image
                            garment_b64,  # garment image
                            "upper_body",  # category
                            True,  # is_checked
                            True,  # is_checked_crop
                            20,    # denoise_steps
                            42     # seed
                        ]
                    }
                else:
                    # Standard inference API format
                    payload = {
                        "inputs": {
                            "person_image": person_b64,
                            "garment_image": garment_b64,
                            "category": "upper_body"
                        },
                        "parameters": {
                            "num_inference_steps": 20,
                            "guidance_scale": 2.0
                        }
                    }
                
                logger.info(f"Attempt {attempt + 1}/{max_retries} - Calling IDM-VTON API...")
                
                # Enhanced request with better error handling
                response = requests.post(
                    self.active_endpoint, 
                    headers=headers, 
                    json=payload, 
                    timeout=120,  # Increased timeout for better reliability
                    verify=True,
                    allow_redirects=True
                )
                
                if response.status_code == 200:
                    try:
                        # Handle different response formats
                        if response.headers.get('content-type', '').startswith('image/'):
                            # Direct image response
                            result_image = Image.open(BytesIO(response.content))
                        else:
                            # JSON response
                            result_data = response.json()
                            if 'data' in result_data and len(result_data['data']) > 0:
                                # Gradio format
                                image_data = result_data['data'][0]
                                if image_data.startswith('data:image'):
                                    image_data = image_data.split(',')[1]
                                result_image = Image.open(BytesIO(base64.b64decode(image_data)))
                            else:
                                logger.warning("No image data in API response")
                                continue  # Try next attempt
                        
                        logger.info(f"API inference successful on attempt {attempt + 1}")
                        return result_image
                        
                    except Exception as parse_error:
                        logger.error(f"Failed to parse API response on attempt {attempt + 1}: {parse_error}")
                        if attempt == max_retries - 1:
                            raise parse_error
                        continue
                        
                else:
                    logger.warning(f"API request failed with status {response.status_code} on attempt {attempt + 1}")
                    logger.debug(f"Response: {response.text[:500]}")
                    if attempt == max_retries - 1:
                        raise Exception(f"API returned status code {response.status_code}: {response.text[:200]}")
                    continue
                    
            except requests.exceptions.SSLError as ssl_error:
                logger.warning(f"SSL error on attempt {attempt + 1}: {ssl_error}")
                if attempt == max_retries - 1:
                    raise ssl_error
                time.sleep(retry_delay)
                continue
                
            except requests.exceptions.Timeout:
                logger.warning(f"Timeout on attempt {attempt + 1}")
                if attempt == max_retries - 1:
                    raise Exception("API request timeout after multiple attempts")
                time.sleep(retry_delay)
                continue
                
            except requests.exceptions.ConnectionError as conn_error:
                logger.warning(f"Connection error on attempt {attempt + 1}: {conn_error}")
                if attempt == max_retries - 1:
                    raise conn_error
                time.sleep(retry_delay)
                continue
                
            except Exception as e:
                logger.error(f"Unexpected error on attempt {attempt + 1}: {e}")
                if attempt == max_retries - 1:
                    raise e
                time.sleep(retry_delay)
                continue
        
        return None
    
    def _ai_enhanced_overlay(self, person_image, garment_image, mask=None):
        """AI-enhanced overlay method with advanced techniques"""
        try:
            logger.info("Using AI-enhanced overlay method")
            
            # Convert to numpy arrays
            if isinstance(person_image, Image.Image):
                person_np = np.array(person_image)
            else:
                person_np = person_image
            
            if isinstance(garment_image, Image.Image):
                garment_np = np.array(garment_image)
            else:
                garment_np = garment_image
            
            h, w = person_np.shape[:2]
            
            # 1. Advanced body segmentation using color and edge detection
            body_mask = self._advanced_body_detection(person_np)
            
            # 2. Create realistic garment with perspective and wrapping
            realistic_garment = self._create_realistic_garment_v2(garment_np, (w, h), person_np)
            
            # 3. Apply physics-based deformation
            deformed_garment = self._apply_garment_physics(realistic_garment, body_mask, person_np)
            
            # 4. Advanced blending with multiple layers
            result = self._multi_layer_blending(person_np, deformed_garment, body_mask)
            
            # 5. Post-processing for realism
            final_result = self._post_process_realism(result, person_np)
            
            return Image.fromarray(final_result)
            
        except Exception as e:
            logger.error(f"AI-enhanced overlay failed: {e}")
            return self._simple_overlay_v2(person_image, garment_image)
    
    def _advanced_body_detection(self, image):
        """Advanced body detection using multiple techniques"""
        try:
            h, w = image.shape[:2]
            
            # Method 1: Color-based skin detection
            hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
            
            # Multiple skin tone ranges
            skin_ranges = [
                ([0, 20, 70], [20, 255, 255]),    # Light skin
                ([0, 40, 60], [25, 255, 255]),    # Medium skin
                ([0, 60, 50], [30, 255, 255])     # Dark skin
            ]
            
            skin_mask = np.zeros((h, w), dtype=np.uint8)
            for lower, upper in skin_ranges:
                mask = cv2.inRange(hsv, np.array(lower), np.array(upper))
                skin_mask = cv2.bitwise_or(skin_mask, mask)
            
            # Method 2: Edge detection for clothing boundaries
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
            edges = cv2.Canny(gray, 50, 150)
            
            # Method 3: Template-based shirt area
            shirt_template = self._create_shirt_template(w, h)
            
            # Combine all methods
            clothing_mask = cv2.bitwise_and(
                cv2.bitwise_not(skin_mask),
                shirt_template
            )
            
            # Refine with edge information
            clothing_mask = cv2.bitwise_and(clothing_mask, cv2.bitwise_not(edges))
            
            # Morphological operations
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
            clothing_mask = cv2.morphologyEx(clothing_mask, cv2.MORPH_CLOSE, kernel)
            clothing_mask = cv2.morphologyEx(clothing_mask, cv2.MORPH_OPEN, kernel)
            
            # Smooth the mask
            clothing_mask = cv2.GaussianBlur(clothing_mask, (21, 21), 8)
            
            return clothing_mask.astype(np.float32) / 255.0
            
        except Exception as e:
            logger.error(f"Advanced body detection failed: {e}")
            return self._simple_shirt_mask(image.shape[:2])
    
    def _create_realistic_garment_v2(self, pattern, target_size, person_image):
        """Create realistic garment with advanced techniques"""
        try:
            w, h = target_size
            
            # 1. Analyze person's body shape
            body_shape = self._analyze_body_shape(person_image)
            
            # 2. Create adaptive pattern based on body
            adapted_pattern = self._adapt_pattern_to_body(pattern, body_shape, (w, h))
            
            # 3. Add realistic fabric effects
            fabric_pattern = self._add_advanced_fabric_effects(adapted_pattern)
            
            # 4. Apply perspective distortion
            perspective_pattern = self._apply_perspective_distortion(fabric_pattern, body_shape)
            
            return perspective_pattern
            
        except Exception as e:
            logger.error(f"Realistic garment creation failed: {e}")
            return cv2.resize(pattern, (w, h))
    
    def _analyze_body_shape(self, image):
        """Analyze body shape for garment fitting"""
        h, w = image.shape[:2]
        
        # Simple body analysis
        return {
            'shoulder_width': int(w * 0.6),
            'torso_length': int(h * 0.5),
            'center_x': w // 2,
            'center_y': h // 2,
            'body_angle': 0  # Could be enhanced with pose detection
        }
    
    def _adapt_pattern_to_body(self, pattern, body_shape, target_size):
        """Adapt pattern to match body shape"""
        w, h = target_size
        
        # Resize pattern to body dimensions
        pattern_resized = cv2.resize(pattern, (body_shape['shoulder_width'], body_shape['torso_length']))
        
        # Create full-size image
        result = np.zeros((h, w, 3), dtype=np.uint8)
        
        # Place pattern on body area
        start_x = max(0, body_shape['center_x'] - body_shape['shoulder_width'] // 2)
        start_y = max(0, int(h * 0.25))
        end_x = min(w, start_x + body_shape['shoulder_width'])
        end_y = min(h, start_y + body_shape['torso_length'])
        
        pattern_h, pattern_w = pattern_resized.shape[:2]
        result_h = end_y - start_y
        result_w = end_x - start_x
        
        if result_h > 0 and result_w > 0:
            pattern_fit = cv2.resize(pattern_resized, (result_w, result_h))
            result[start_y:end_y, start_x:end_x] = pattern_fit
        
        return result
    
    def _add_advanced_fabric_effects(self, pattern):
        """Add advanced fabric texture and lighting"""
        try:
            # 1. Fabric texture
            noise = np.random.normal(0, 3, pattern.shape).astype(np.int16)
            textured = pattern.astype(np.int16) + noise
            textured = np.clip(textured, 0, 255).astype(np.uint8)
            
            # 2. Fabric weave pattern
            weave = self._create_weave_pattern(pattern.shape[:2])
            textured = cv2.addWeighted(textured, 0.9, weave, 0.1, 0)
            
            # 3. Lighting and shadow
            lit_pattern = self._add_realistic_lighting(textured)
            
            # 4. Fabric softness
            soft_pattern = cv2.bilateralFilter(lit_pattern, 9, 75, 75)
            
            return soft_pattern
            
        except Exception as e:
            logger.error(f"Fabric effects failed: {e}")
            return pattern
    
    def _create_weave_pattern(self, shape):
        """Create fabric weave texture"""
        h, w = shape
        weave = np.zeros((h, w, 3), dtype=np.uint8)
        
        # Create subtle weave pattern
        for y in range(0, h, 4):
            for x in range(0, w, 4):
                if (x // 4 + y // 4) % 2 == 0:
                    cv2.rectangle(weave, (x, y), (x+2, y+2), (20, 20, 20), -1)
                else:
                    cv2.rectangle(weave, (x+2, y+2), (x+4, y+4), (20, 20, 20), -1)
        
        return weave
    
    def _add_realistic_lighting(self, image):
        """Add realistic lighting effects"""
        h, w = image.shape[:2]
        
        # Create lighting gradient
        center_x, center_y = w // 2, h // 3
        
        y, x = np.ogrid[:h, :w]
        distance = np.sqrt((x - center_x)**2 + (y - center_y)**2)
        max_distance = np.sqrt(center_x**2 + (h - center_y)**2)
        
        # Soft lighting gradient
        gradient = 1 - (distance / max_distance) * 0.2
        gradient = np.clip(gradient, 0.8, 1.2)
        
        # Apply lighting
        lit_image = image.astype(np.float32)
        for c in range(3):
            lit_image[:, :, c] *= gradient
        
        return np.clip(lit_image, 0, 255).astype(np.uint8)
    
    def _apply_perspective_distortion(self, pattern, body_shape):
        """Apply perspective distortion for realism"""
        try:
            h, w = pattern.shape[:2]
            
            # Define perspective transform
            src_points = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
            
            # Slight perspective based on body angle
            angle_factor = body_shape.get('body_angle', 0) * 0.1
            dst_points = np.float32([
                [angle_factor * w, 0],
                [w - angle_factor * w, 0],
                [w - angle_factor * w * 0.5, h],
                [angle_factor * w * 0.5, h]
            ])
            
            # Apply transform
            matrix = cv2.getPerspectiveTransform(src_points, dst_points)
            distorted = cv2.warpPerspective(pattern, matrix, (w, h))
            
            return distorted
            
        except Exception as e:
            logger.error(f"Perspective distortion failed: {e}")
            return pattern
    
    def _apply_garment_physics(self, garment, mask, person_image):
        """Apply physics-based garment deformation"""
        try:
            # Simple wrinkle simulation
            h, w = garment.shape[:2]
            
            # Create wrinkle map based on body curvature
            wrinkle_map = self._create_wrinkle_map(person_image, mask)
            
            # Apply displacement
            displaced = self._apply_displacement(garment, wrinkle_map)
            
            return displaced
            
        except Exception as e:
            logger.error(f"Garment physics failed: {e}")
            return garment
    
    def _create_wrinkle_map(self, person_image, mask):
        """Create wrinkle displacement map"""
        h, w = person_image.shape[:2]
        
        # Simple wrinkle pattern
        wrinkle_map = np.zeros((h, w, 2), dtype=np.float32)
        
        # Add subtle random displacement
        for i in range(0, h, 20):
            for j in range(0, w, 20):
                if mask[i, j] > 0.5:
                    displacement = np.random.normal(0, 2, 2)
                    wrinkle_map[i:i+20, j:j+20] = displacement
        
        # Smooth the displacement
        wrinkle_map[:, :, 0] = cv2.GaussianBlur(wrinkle_map[:, :, 0], (15, 15), 5)
        wrinkle_map[:, :, 1] = cv2.GaussianBlur(wrinkle_map[:, :, 1], (15, 15), 5)
        
        return wrinkle_map
    
    def _apply_displacement(self, image, displacement_map):
        """Apply displacement to image"""
        try:
            h, w = image.shape[:2]
            
            # Create coordinate maps
            y, x = np.mgrid[0:h, 0:w]
            
            # Apply displacement
            new_x = x + displacement_map[:, :, 0]
            new_y = y + displacement_map[:, :, 1]
            
            # Ensure coordinates are within bounds
            new_x = np.clip(new_x, 0, w-1)
            new_y = np.clip(new_y, 0, h-1)
            
            # Remap image
            displaced = cv2.remap(image, new_x.astype(np.float32), new_y.astype(np.float32), cv2.INTER_LINEAR)
            
            return displaced
            
        except Exception as e:
            logger.error(f"Displacement failed: {e}")
            return image
    
    def _multi_layer_blending(self, person, garment, mask):
        """Multi-layer blending for realistic integration"""
        try:
            # Create multiple mask levels
            mask_3d = np.stack([mask, mask, mask], axis=2)
            
            # Different blending modes for different areas
            strong_mask = (mask_3d > 0.9)
            medium_mask = (mask_3d > 0.6) & (mask_3d <= 0.9)
            weak_mask = (mask_3d > 0.3) & (mask_3d <= 0.6)
            edge_mask = (mask_3d > 0.1) & (mask_3d <= 0.3)
            
            result = person.copy().astype(np.float32)
            garment_f = garment.astype(np.float32)
            
            # Layer 1: Core garment area (replace)
            result[strong_mask] = garment_f[strong_mask]
            
            # Layer 2: Medium blend
            alpha = 0.8
            result[medium_mask] = (
                garment_f[medium_mask] * alpha + 
                result[medium_mask] * (1 - alpha)
            )
            
            # Layer 3: Soft blend
            alpha = 0.6
            result[weak_mask] = (
                garment_f[weak_mask] * alpha + 
                result[weak_mask] * (1 - alpha)
            )
            
            # Layer 4: Edge feathering
            alpha = 0.3
            result[edge_mask] = (
                garment_f[edge_mask] * alpha + 
                result[edge_mask] * (1 - alpha)
            )
            
            return np.clip(result, 0, 255).astype(np.uint8)
            
        except Exception as e:
            logger.error(f"Multi-layer blending failed: {e}")
            return person
    
    def _post_process_realism(self, image, original):
        """Post-process for enhanced realism"""
        try:
            # Color correction
            color_corrected = self._match_color_tone(image, original)
            
            # Sharpening
            sharpened = self._apply_unsharp_mask(color_corrected)
            
            # Final noise reduction
            denoised = cv2.fastNlMeansDenoisingColored(sharpened, None, 3, 3, 7, 21)
            
            return denoised
            
        except Exception as e:
            logger.error(f"Post-processing failed: {e}")
            return image
    
    def _match_color_tone(self, target, reference):
        """Match color tone between images"""
        try:
            # Simple color matching
            target_mean = np.mean(target, axis=(0, 1))
            reference_mean = np.mean(reference, axis=(0, 1))
            
            adjustment = reference_mean - target_mean
            
            adjusted = target.astype(np.float32)
            adjusted += adjustment * 0.2  # Subtle adjustment
            
            return np.clip(adjusted, 0, 255).astype(np.uint8)
            
        except Exception:
            return target
    
    def _apply_unsharp_mask(self, image, strength=0.5):
        """Apply unsharp mask for sharpening"""
        try:
            blurred = cv2.GaussianBlur(image, (3, 3), 1)
            sharpened = cv2.addWeighted(image, 1 + strength, blurred, -strength, 0)
            return sharpened
        except Exception:
            return image
    
    def _create_shirt_template(self, w, h):
        """Create shirt template mask"""
        mask = np.zeros((h, w), dtype=np.uint8)
        
        # Improved shirt shape
        shirt_top = int(h * 0.22)
        shirt_bottom = int(h * 0.72)
        shirt_left = int(w * 0.18)
        shirt_right = int(w * 0.82)
        
        cv2.rectangle(mask, (shirt_left, shirt_top), (shirt_right, shirt_bottom), 255, -1)
        
        # Add sleeves
        sleeve_width = int(w * 0.12)
        sleeve_height = int(h * 0.28)
        cv2.rectangle(mask, (shirt_left - sleeve_width, shirt_top), 
                     (shirt_left, shirt_top + sleeve_height), 255, -1)
        cv2.rectangle(mask, (shirt_right, shirt_top), 
                     (shirt_right + sleeve_width, shirt_top + sleeve_height), 255, -1)
        
        return mask
    
    def _simple_shirt_mask(self, shape):
        """Simple fallback shirt mask"""
        h, w = shape
        mask = np.zeros((h, w), dtype=np.float32)
        shirt_top = int(h * 0.25)
        shirt_bottom = int(h * 0.75)
        shirt_left = int(w * 0.2)
        shirt_right = int(w * 0.8)
        mask[shirt_top:shirt_bottom, shirt_left:shirt_right] = 1.0
        return mask
    
    def _image_to_base64(self, image):
        """Convert PIL image to base64 string"""
        if isinstance(image, np.ndarray):
            image = Image.fromarray(image)
        
        buffer = BytesIO()
        image.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        return f"data:image/png;base64,{img_str}"
    
    def _simple_overlay_v2(self, person_image, garment_image):
        """Enhanced simple overlay"""
        if isinstance(person_image, Image.Image):
            person_np = np.array(person_image)
        else:
            person_np = person_image
        
        if isinstance(garment_image, Image.Image):
            garment_np = np.array(garment_image)
        else:
            garment_np = garment_image
        
        h, w = person_np.shape[:2]
        result = person_np.copy()
        
        # Better shirt area definition
        shirt_top = int(h * 0.22)
        shirt_bottom = int(h * 0.72)
        shirt_left = int(w * 0.18)
        shirt_right = int(w * 0.82)
        
        garment_resized = cv2.resize(garment_np, (shirt_right - shirt_left, shirt_bottom - shirt_top))
        
        # Enhanced blending
        alpha = 0.75
        result[shirt_top:shirt_bottom, shirt_left:shirt_right] = (
            result[shirt_top:shirt_bottom, shirt_left:shirt_right] * (1 - alpha) +
            garment_resized * alpha
        ).astype(np.uint8)
        
        return Image.fromarray(result)

# Global instance
idm_vton_model = None

def get_idm_vton_model():
    """Get or create IDM-VTON model instance"""
    global idm_vton_model
    if idm_vton_model is None:
        idm_vton_model = IDMVTONWrapper()
    return idm_vton_model
