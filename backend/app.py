from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from PIL import Image
from datetime import datetime
import os
import logging
import sys

# Add simple IDM-VTON
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from simple_idm_vton import SimpleIDMVTON

from models.pose_estimation import PoseEstimator
from models.virtual_fitting import VirtualFitting
from models.chatbot import BatikChatbot
from utils.image_processing import decode_base64_image, encode_image_base64

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize models
pose_estimator = PoseEstimator()
virtual_fitting = VirtualFitting()
chatbot = BatikChatbot()

# Initialize IDM-VTON ONLY
logger.info("🔄 Initializing IDM-VTON ONLY...")
try:
    idm_vton = SimpleIDMVTON()
    IDM_VTON_AVAILABLE = idm_vton.is_initialized
    logger.info(f"✅ IDM-VTON Status: {IDM_VTON_AVAILABLE}")
except Exception as e:
    logger.error(f"❌ IDM-VTON FAILED: {e}")
    IDM_VTON_AVAILABLE = False
    idm_vton = None

# Create directories
os.makedirs('data/batik_patterns', exist_ok=True)
os.makedirs('saved_photos', exist_ok=True)

@app.route('/')
def serve_frontend():
    return send_file('../frontend/index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    frontend_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend')
    if os.path.exists(os.path.join(frontend_dir, filename)):
        return send_file(os.path.join(frontend_dir, filename))
    return "File not found", 404

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "idm_vton_available": IDM_VTON_AVAILABLE,
        "message": "IDM-VTON ONLY MODE"
    }), 200

@app.route('/virtual_fitting', methods=['POST'])
def virtual_fitting_endpoint():
    """Virtual fitting using ONLY IDM-VTON"""
    try:
        # CHECK IDM-VTON
        if not IDM_VTON_AVAILABLE or not idm_vton:
            return jsonify({
                'error': 'IDM-VTON NOT AVAILABLE',
                'message': 'Please fix IDM-VTON installation'
            }), 503
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        person_image_data = data.get('personImage')
        pattern_name = data.get('patternName')
        
        if not person_image_data or not pattern_name:
            return jsonify({'error': 'Missing data'}), 400
        
        # Process images
        logger.info("🎨 Processing with IDM-VTON ONLY...")
        
        person_image = decode_base64_image(person_image_data)
        if person_image is None:
            return jsonify({'error': 'Invalid person image'}), 400
        
        pattern_path = os.path.join('data/batik_patterns', pattern_name)
        if not os.path.exists(pattern_path):
            return jsonify({'error': f'Pattern not found: {pattern_name}'}), 404
        
        # Save temp person image
        temp_person_path = 'temp_person.jpg'
        person_image.save(temp_person_path)
        
        # RUN IDM-VTON ONLY
        logger.info("🚀 Running IDM-VTON...")
        
        result_image = idm_vton.run_vton(
            person_image_path=temp_person_path,
            garment_image_path=pattern_path,
            output_path=None
        )
        
        if result_image is None:
            # Clean up
            if os.path.exists(temp_person_path):
                os.remove(temp_person_path)
            
            return jsonify({
                'error': 'IDM-VTON FAILED',
                'message': 'IDM-VTON returned no result'
            }), 500
        
        # Save result
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        pattern_base = os.path.splitext(pattern_name)[0]
        result_filename = f"idm_vton_{pattern_base}_{timestamp}.jpg"
        result_path = os.path.join('saved_photos', result_filename)
        
        result_image.save(result_path, 'JPEG', quality=95)
        
        # Clean up temp
        if os.path.exists(temp_person_path):
            os.remove(temp_person_path)
        
        # Return result
        result_base64 = encode_image_base64(result_image)
        
        logger.info("✅ IDM-VTON SUCCESS!")
        
        return jsonify({
            'success': True,
            'resultImage': result_base64,
            'savedAs': result_filename,
            'message': 'IDM-VTON completed successfully!',
            'method': 'IDM-VTON ORIGINAL'
        })
        
    except Exception as e:
        # Clean up
        if os.path.exists('temp_person.jpg'):
            os.remove('temp_person.jpg')
        
        logger.error(f"❌ IDM-VTON ERROR: {e}")
        return jsonify({
            'error': 'IDM-VTON FAILED',
            'details': str(e)
        }), 500

@app.route('/get_batik_patterns', methods=['GET'])
def get_batik_patterns():
    patterns_dir = 'data/batik_patterns'
    patterns = []
    
    if os.path.exists(patterns_dir):
        for filename in os.listdir(patterns_dir):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                patterns.append({
                    'name': filename,
                    'url': f'/static/batik_patterns/{filename}'
                })
    
    return jsonify(patterns)

@app.route('/saved_photos/<filename>')
def serve_saved_photo(filename):
    file_path = os.path.join('saved_photos', filename)
    if os.path.exists(file_path):
        return send_file(file_path)
    return "File not found", 404

@app.route('/chat', methods=['POST'])
def chat_endpoint():
    try:
        data = request.get_json()
        message = data.get('message', '')
        
        if not message:
            return jsonify({'error': 'No message provided'}), 400
        
        response = chatbot.get_response(message)
        return jsonify({'response': response})
        
    except Exception as e:
        logger.error(f"Chat error: {e}")
        return jsonify({'error': 'Chat service unavailable'}), 500

if __name__ == '__main__':
    print("🚀 BatikGram - IDM-VTON ONLY MODE")
    print(f"📊 IDM-VTON Available: {IDM_VTON_AVAILABLE}")
    print("=" * 50)
    
    if not IDM_VTON_AVAILABLE:
        print("❌ IDM-VTON NOT AVAILABLE!")
        print("💡 Run: python fix_idm_vton_exact.py")
        print("💡 Then: python simple_idm_vton.py")
    
    app.run(debug=True, host='0.0.0.0', port=5000)