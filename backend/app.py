from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import base64
import io
from PIL import Image
import json
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from models.pose_estimation import PoseEstimator
from models.virtual_fitting import VirtualFitting
from models.chatbot import BatikChatbot
from utils.image_processing import decode_base64_image, encode_image_base64
import numpy as np
import cv2

app = Flask(__name__)
CORS(app)

# Initialize models
pose_estimator = PoseEstimator()
virtual_fitting = VirtualFitting()
chatbot = BatikChatbot()

# Conditional import for IDM-VTON
try:
    from models.idm_vton import get_idm_vton_model
    IDM_VTON_AVAILABLE = True
    logger.info("✅ IDM-VTON wrapper available")
except ImportError as e:
    print(f"IDM-VTON not available: {e}")
    IDM_VTON_AVAILABLE = False
    
    class DummyIDMVTON:
        def create_garment_from_pattern(self, *args, **kwargs):
            raise Exception("IDM-VTON not available")
        def apply_garment(self, *args, **kwargs):
            raise Exception("IDM-VTON not available")
    
    def get_idm_vton_model():
        return DummyIDMVTON()
    
# Create necessary directories
os.makedirs('data/batik_patterns', exist_ok=True)
os.makedirs('saved_photos', exist_ok=True)

@app.route('/')
def serve_frontend():
    return send_file('../frontend/app/page.tsx')

@app.route('/<path:filename>')
def serve_static(filename):
    frontend_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend')
    if os.path.exists(os.path.join(frontend_dir, filename)):
        return send_file(os.path.join(frontend_dir, filename))
    return "File not found", 404

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

@app.route('/get_batik_patterns', methods=['GET'])
def get_batik_patterns():
    """Get list of available batik patterns"""
    patterns = []
    pattern_dir = 'data/batik_patterns'
    
    for filename in os.listdir(pattern_dir):
        if filename.endswith(('.png', '.jpg', '.jpeg')):
            pattern_id = os.path.splitext(filename)[0]
            patterns.append({
                'id': pattern_id,
                'name': pattern_id.replace('_', ' ').title(),
                'filename': filename
            })
    
    return jsonify({"patterns": patterns}), 200

@app.route('/virtual_fitting', methods=['POST'])
def apply_virtual_fitting():
    """Apply batik pattern to user image using IDM-VTON only"""
    try:
        data = request.json
        user_image_base64 = data.get('user_image')
        pattern_id = data.get('pattern_id')
        
        if not user_image_base64 or not pattern_id:
            return jsonify({"error": "Missing user_image or pattern_id"}), 400
        
        # Check if IDM-VTON is available
        if not IDM_VTON_AVAILABLE:
            return jsonify({"error": "IDM-VTON not available. Please install: pip install diffusers transformers accelerate"}), 500
        
        # Decode user image with proper validation
        try:
            if ',' in user_image_base64:
                user_image_base64 = user_image_base64.split(',')[1]
            
            user_image = decode_base64_image(user_image_base64)
            
            if user_image.mode != 'RGB':
                user_image = user_image.convert('RGB')
                
        except Exception as img_error:
            print(f"Image processing error: {img_error}")
            return jsonify({"error": f"Invalid image data: {str(img_error)}"}), 400
        
        # Load batik pattern
        pattern_path = None
        for ext in ['.jpg', '.jpeg', '.png']:
            test_path = f'data/batik_patterns/{pattern_id}{ext}'
            if os.path.exists(test_path):
                pattern_path = test_path
                break
        
        if not pattern_path:
            pattern_path = create_procedural_pattern(pattern_id)
        
        try:
            # Use IDM-VTON only - no fallback
            pattern_image = Image.open(pattern_path)
            idm_vton = get_idm_vton_model()
            
            # Create garment template from batik pattern
            garment_template = idm_vton.create_garment_from_pattern(pattern_image)
            
            # Apply virtual try-on using IDM-VTON API only
            result_image = idm_vton.apply_garment(user_image, garment_template)
            method_used = "IDM-VTON API"
            
        except Exception as vton_error:
            error_message = str(vton_error)
            print(f"IDM-VTON failed: {error_message}")
            
            # Check if it's an SSL error
            if "SSL" in error_message or "EOF occurred in violation of protocol" in error_message:
                return jsonify({
                    "error": "IDM-VTON API connection failed due to network/SSL issues. Please try again later or check your internet connection.",
                    "details": error_message,
                    "suggestion": "The Hugging Face API may be temporarily unavailable. Please retry in a few minutes."
                }), 503
            elif "not available" in error_message or "no token" in error_message:
                return jsonify({
                    "error": "IDM-VTON API not properly configured.",
                    "details": error_message,
                    "suggestion": "Please ensure HUGGING_FACE_TOKEN is set correctly in your .env file."
                }), 500
            else:
                return jsonify({
                    "error": "IDM-VTON processing failed.",
                    "details": error_message,
                    "suggestion": "Please try again with a different image or pattern."
                }), 500
        
        # Convert to base64
        result_base64 = encode_image_base64(result_image)
        
        return jsonify({
            "result_image": result_base64,
            "method_used": method_used,
            "pose_detected": True
        }), 200
        
    except Exception as e:
        print(f"Virtual fitting error: {e}")
        return jsonify({"error": str(e)}), 500

def apply_intelligent_batik_overlay(user_image, pattern_path, pattern_id):
    """Apply intelligent batik overlay with body detection - overlay mode (no blending)"""
    try:
        import mediapipe as mp
        
        # Initialize MediaPipe
        mp_selfie_segmentation = mp.solutions.selfie_segmentation
        mp_pose = mp.solutions.pose
        
        # Load pattern
        pattern = cv2.imread(pattern_path)
        if pattern is None:
            pattern = create_procedural_pattern_cv(pattern_id)
        
        h, w = user_image.shape[:2]
        
        # Get person segmentation
        with mp_selfie_segmentation.SelfieSegmentation(model_selection=1) as selfie_segmentation:
            img_rgb = cv2.cvtColor(user_image, cv2.COLOR_BGR2RGB)
            segmentation_results = selfie_segmentation.process(img_rgb)
            person_mask = segmentation_results.segmentation_mask
        
        # Get pose landmarks for clothing area detection
        clothing_mask = np.zeros((h, w), dtype=np.float32)
        
        with mp_pose.Pose(static_image_mode=True, min_detection_confidence=0.5) as pose:
            pose_results = pose.process(img_rgb)
            
            if pose_results.pose_landmarks:
                # Extract key landmarks
                landmarks = pose_results.pose_landmarks.landmark
                
                # Define clothing area based on body landmarks
                left_shoulder = (int(landmarks[11].x * w), int(landmarks[11].y * h))
                right_shoulder = (int(landmarks[12].x * w), int(landmarks[12].y * h))
                left_hip = (int(landmarks[23].x * w), int(landmarks[23].y * h))
                right_hip = (int(landmarks[24].x * w), int(landmarks[24].y * h))
                
                # Create clothing area polygon (shirt area)
                shirt_points = np.array([
                    [left_shoulder[0] - 30, left_shoulder[1] - 20],  # Left shoulder extended
                    [right_shoulder[0] + 30, right_shoulder[1] - 20],  # Right shoulder extended
                    [right_shoulder[0] + 40, right_shoulder[1] + 80],  # Right side extended
                    [right_hip[0] + 20, right_hip[1]],  # Right hip
                    [left_hip[0] - 20, left_hip[1]],   # Left hip
                    [left_shoulder[0] - 40, left_shoulder[1] + 80]   # Left side extended
                ], dtype=np.int32)
                
                # Create clothing mask
                cv2.fillPoly(clothing_mask, [shirt_points], 1.0)
                
                # Add sleeves
                sleeve_left = np.array([
                    [left_shoulder[0] - 80, left_shoulder[1] - 10],
                    [left_shoulder[0] - 30, left_shoulder[1] - 20],
                    [left_shoulder[0] - 40, left_shoulder[1] + 80],
                    [left_shoulder[0] - 120, left_shoulder[1] + 60]
                ], dtype=np.int32)
                
                sleeve_right = np.array([
                    [right_shoulder[0] + 30, right_shoulder[1] - 20],
                    [right_shoulder[0] + 80, right_shoulder[1] - 10],
                    [right_shoulder[0] + 120, right_shoulder[1] + 60],
                    [right_shoulder[0] + 40, right_shoulder[1] + 80]
                ], dtype=np.int32)
                
                cv2.fillPoly(clothing_mask, [sleeve_left], 1.0)
                cv2.fillPoly(clothing_mask, [sleeve_right], 1.0)
            else:
                # Fallback: create basic shirt shape if pose detection fails
                shirt_top = int(h * 0.2)
                shirt_bottom = int(h * 0.7)
                shirt_left = int(w * 0.15)
                shirt_right = int(w * 0.85)
                
                cv2.rectangle(clothing_mask, (shirt_left, shirt_top), (shirt_right, shirt_bottom), 1.0, -1)
                
                # Add sleeves
                sleeve_width = int(w * 0.15)
                cv2.rectangle(clothing_mask, (shirt_left - sleeve_width, shirt_top), 
                            (shirt_left, int(shirt_top + h * 0.25)), 1.0, -1)
                cv2.rectangle(clothing_mask, (shirt_right, shirt_top), 
                            (shirt_right + sleeve_width, int(shirt_top + h * 0.25)), 1.0, -1)
        
        # Combine with person segmentation to avoid applying pattern to background
        person_mask_binary = (person_mask > 0.5).astype(np.float32)
        final_mask = clothing_mask * person_mask_binary
        
        # Smooth the mask edges for better blending at boundaries only
        final_mask = cv2.GaussianBlur(final_mask, (5, 5), 1)
        
        # Prepare pattern - create seamless tiled pattern
        pattern_tile_size = min(w, h) // 6  # Smaller tiles for more detailed pattern
        if pattern_tile_size > 50:  # Minimum tile size
            pattern_small = cv2.resize(pattern, (pattern_tile_size, pattern_tile_size))
            tiles_x = (w // pattern_tile_size) + 2
            tiles_y = (h // pattern_tile_size) + 2
            pattern_tiled = np.tile(pattern_small, (tiles_y, tiles_x, 1))
            pattern_resized = cv2.resize(pattern_tiled, (w, h))
        else:
            pattern_resized = cv2.resize(pattern, (w, h))
        
        # Create result image - DIRECT OVERLAY (no blending with original clothing)
        result = user_image.copy().astype(np.float32)
        pattern_f = pattern_resized.astype(np.float32)
        
        # Create 3D mask
        final_mask_3d = np.stack([final_mask, final_mask, final_mask], axis=2)
        
        # Apply pattern directly where mask is active (complete replacement)
        # Only blend at the very edges of the mask for smooth transitions
        mask_threshold = 0.8  # High threshold for direct replacement
        
        # Areas with high mask value get full pattern replacement
        strong_mask = (final_mask_3d > mask_threshold).astype(np.float32)
        weak_mask = ((final_mask_3d > 0.1) & (final_mask_3d <= mask_threshold)).astype(np.float32)
        
        # Direct replacement for strong mask areas
        result = result * (1 - strong_mask) + pattern_f * strong_mask
        
        # Gentle blending only at edges for smooth transition
        blend_factor = 0.7
        result = result * (1 - weak_mask * blend_factor) + pattern_f * weak_mask * blend_factor
        
        result = np.clip(result, 0, 255).astype(np.uint8)
        
        return result
        
    except Exception as e:
        print(f"Intelligent overlay error: {e}")
        # Ultimate fallback: simple overlay
        return apply_simple_batik_overlay(user_image, pattern_path, pattern_id)

def apply_simple_batik_overlay(user_image, pattern_path, pattern_id):
    """Apply simple batik overlay - direct replacement mode"""
    try:
        # Load pattern
        pattern = cv2.imread(pattern_path)
        if pattern is None:
            pattern = create_procedural_pattern_cv(pattern_id)
        
        # Resize pattern to match user image
        h, w = user_image.shape[:2]
        
        # Create tiled pattern for better coverage
        pattern_tile_size = min(w, h) // 8
        if pattern_tile_size > 30:
            pattern_small = cv2.resize(pattern, (pattern_tile_size, pattern_tile_size))
            tiles_x = (w // pattern_tile_size) + 2
            tiles_y = (h // pattern_tile_size) + 2
            pattern_tiled = np.tile(pattern_small, (tiles_y, tiles_x, 1))
            pattern_resized = cv2.resize(pattern_tiled, (w, h))
        else:
            pattern_resized = cv2.resize(pattern, (w, h))
        
        # Create a shirt-like mask (upper body region)
        mask = np.zeros((h, w), dtype=np.uint8)
        
        # Improved shirt shape
        shirt_top = int(h * 0.22)
        shirt_bottom = int(h * 0.72)
        shirt_left = int(w * 0.18)
        shirt_right = int(w * 0.82)
        
        # Main shirt body
        cv2.rectangle(mask, (shirt_left, shirt_top), (shirt_right, shirt_bottom), 255, -1)
        
        # Add sleeves
        sleeve_width = int(w * 0.12)
        sleeve_height = int(h * 0.28)
        cv2.rectangle(mask, (shirt_left - sleeve_width, shirt_top), 
                     (shirt_left, shirt_top + sleeve_height), 255, -1)
        cv2.rectangle(mask, (shirt_right, shirt_top), 
                     (shirt_right + sleeve_width, shirt_top + sleeve_height), 255, -1)
        
        # Add neckline (remove rectangular area at top center)
        neck_width = int(w * 0.15)
        neck_height = int(h * 0.08)
        neck_left = int(w * 0.425)
        neck_right = neck_left + neck_width
        cv2.rectangle(mask, (neck_left, shirt_top), (neck_right, shirt_top + neck_height), 0, -1)
        
        # Slightly blur mask edges for smoother transitions
        mask = cv2.GaussianBlur(mask, (7, 7), 2)
        
        # Convert mask to 0-1 range
        mask_normalized = mask.astype(np.float32) / 255.0
        mask_3d = np.stack([mask_normalized, mask_normalized, mask_normalized], axis=2)
        
        # Direct replacement with minimal blending
        result = user_image.astype(np.float32)
        pattern_f = pattern_resized.astype(np.float32)
        
        # Use high threshold for direct replacement
        strong_mask = (mask_3d > 0.7).astype(np.float32)
        weak_mask = ((mask_3d > 0.2) & (mask_3d <= 0.7)).astype(np.float32)
        
        # Direct pattern replacement for main areas
        result = result * (1 - strong_mask) + pattern_f * strong_mask
        
        # Light blending only at edges
        result = result * (1 - weak_mask * 0.8) + pattern_f * weak_mask * 0.8
        
        result = np.clip(result, 0, 255).astype(np.uint8)
        
        return result
        
    except Exception as e:
        print(f"Simple overlay error: {e}")
        return user_image

def create_procedural_pattern_cv(pattern_id):
    """Create a procedural batik pattern using OpenCV"""
    width, height = 512, 512
    pattern = np.zeros((height, width, 3), dtype=np.uint8)
    
    # Generate different patterns based on pattern_id
    if 'kawung' in pattern_id:
        # Create circular pattern
        for y in range(0, height, 100):
            for x in range(0, width, 100):
                cv2.circle(pattern, (x + 50, y + 50), 40, (139, 69, 19), -1)
                cv2.circle(pattern, (x + 50, y + 50), 30, (205, 133, 63), -1)
    elif 'ceplok' in pattern_id:
        # Create square pattern
        for y in range(0, height, 80):
            for x in range(0, width, 80):
                cv2.rectangle(pattern, (x + 10, y + 10), (x + 70, y + 70), (160, 82, 45), -1)
                cv2.rectangle(pattern, (x + 20, y + 20), (x + 60, y + 60), (210, 105, 30), -1)
    elif 'sekar' in pattern_id:
        # Create flower-like pattern
        for y in range(0, height, 120):
            for x in range(0, width, 120):
                # Draw petals
                for angle in range(0, 360, 45):
                    end_x = int(x + 60 + 40 * np.cos(np.radians(angle)))
                    end_y = int(y + 60 + 40 * np.sin(np.radians(angle)))
                    cv2.ellipse(pattern, ((x + 60 + end_x) // 2, (y + 60 + end_y) // 2), 
                               (20, 10), angle, 0, 360, (184, 134, 11), -1)
                cv2.circle(pattern, (x + 60, y + 60), 15, (255, 215, 0), -1)
    else:
        # Default geometric pattern
        for y in range(0, height, 60):
            for x in range(0, width, 60):
                if (x // 60 + y // 60) % 2 == 0:
                    cv2.rectangle(pattern, (x, y), (x + 60, y + 60), (139, 90, 43), -1)
                else:
                    cv2.circle(pattern, (x + 30, y + 30), 25, (184, 134, 11), -1)
    
    return pattern

def decode_base64_image(base64_string):
    """Decode base64 string to PIL Image with validation"""
    try:
        # Remove data URL prefix if present
        if 'data:image' in base64_string and ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        # Decode base64
        image_data = base64.b64decode(base64_string)
        
        if len(image_data) == 0:
            raise ValueError("Empty image data")
        
        # Create PIL Image
        image = Image.open(io.BytesIO(image_data))
        
        # Validate image
        if image.size[0] == 0 or image.size[1] == 0:
            raise ValueError("Invalid image dimensions")
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
            
        return image
        
    except Exception as e:
        raise ValueError(f"Error decoding base64 image: {e}")

def encode_image_base64(image):
    """Encode PIL Image to base64 string"""
    import base64
    from io import BytesIO
    buffer = BytesIO()
    image.save(buffer, format='JPEG')
    img_str = base64.b64encode(buffer.getvalue()).decode()
    return f"data:image/jpeg;base64,{img_str}"

@app.route('/save_photo', methods=['POST'])
def save_photo():
    """Save the virtual fitting result"""
    try:
        data = request.json
        image_base64 = data.get('image')
        pattern_id = data.get('pattern_id')
        
        if not image_base64:
            return jsonify({"error": "Missing image data"}), 400
        
        # Decode and save image
        image = decode_base64_image(image_base64)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'batik_{pattern_id}_{timestamp}.jpg'
        filepath = os.path.join('saved_photos', filename)
        
        image.save(filepath, 'JPEG')
        
        return jsonify({
            "filename": filename,
            "message": "Photo saved successfully"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/chatbot', methods=['POST'])
def chatbot_endpoint():
    """Handle chatbot queries about batik"""
    try:
        data = request.json
        query = data.get('query')
        pattern_id = data.get('pattern_id', None)
        
        if not query:
            return jsonify({"error": "Missing query"}), 400
        
        response = chatbot.get_response(query, pattern_id)
        
        return jsonify({
            "response": response,
            "pattern_id": pattern_id
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_saved_photos', methods=['GET'])
def get_saved_photos():
    """Get list of saved photos"""
    try:
        photos = []
        for filename in os.listdir('saved_photos'):
            if filename.endswith(('.jpg', '.jpeg', '.png')):
                photos.append({
                    'filename': filename,
                    'path': f'/saved_photos/{filename}'
                })
        
        return jsonify({"photos": photos}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/saved_photos/<filename>')
def serve_saved_photo(filename):
    """Serve saved photo"""
    return send_file(os.path.join('saved_photos', filename))

@app.route('/pattern_images/<pattern_id>')
def serve_pattern_image(pattern_id):
    """Serve batik pattern images"""
    pattern_path = f'data/batik_patterns/{pattern_id}.jpg'
    if os.path.exists(pattern_path):
        return send_file(pattern_path)
    # If .jpg doesn't exist, try .png
    pattern_path = f'data/batik_patterns/{pattern_id}.png'
    if os.path.exists(pattern_path):
        return send_file(pattern_path)
    return "Pattern not found", 404

def create_procedural_pattern(pattern_id):
    """Create a procedural batik pattern if file doesn't exist"""
    # Create a simple procedural pattern based on pattern_id
    width, height = 512, 512
    pattern = np.zeros((height, width, 3), dtype=np.uint8)
    
    # Generate different patterns based on pattern_id
    if 'kawung' in pattern_id:
        # Create circular pattern
        for y in range(0, height, 100):
            for x in range(0, width, 100):
                cv2.circle(pattern, (x + 50, y + 50), 40, (139, 69, 19), -1)
                cv2.circle(pattern, (x + 50, y + 50), 30, (205, 133, 63), -1)
    elif 'ceplok' in pattern_id:
        # Create square pattern
        for y in range(0, height, 80):
            for x in range(0, width, 80):
                cv2.rectangle(pattern, (x + 10, y + 10), (x + 70, y + 70), (160, 82, 45), -1)
                cv2.rectangle(pattern, (x + 20, y + 20), (x + 60, y + 60), (210, 105, 30), -1)
    elif 'sekar' in pattern_id:
        # Create flower-like pattern
        for y in range(0, height, 120):
            for x in range(0, width, 120):
                # Draw petals
                for angle in range(0, 360, 45):
                    end_x = int(x + 60 + 40 * np.cos(np.radians(angle)))
                    end_y = int(y + 60 + 40 * np.sin(np.radians(angle)))
                    cv2.ellipse(pattern, ((x + 60 + end_x) // 2, (y + 60 + end_y) // 2), 
                               (20, 10), angle, 0, 360, (184, 134, 11), -1)
                cv2.circle(pattern, (x + 60, y + 60), 15, (255, 215, 0), -1)
    else:
        # Default geometric pattern
        for y in range(0, height, 60):
            for x in range(0, width, 60):
                if (x // 60 + y // 60) % 2 == 0:
                    cv2.rectangle(pattern, (x, y), (x + 60, y + 60), (139, 90, 43), -1)
                else:
                    cv2.circle(pattern, (x + 30, y + 30), 25, (184, 134, 11), -1)
    
    # Save the pattern temporarily
    temp_path = f'data/batik_patterns/temp_{pattern_id}.jpg'
    cv2.imwrite(temp_path, pattern)
    return temp_path

if __name__ == '__main__':
    app.run(debug=True, port=5000)