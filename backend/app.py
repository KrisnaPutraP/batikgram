from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import os
import base64
import io
from PIL import Image
import json
from datetime import datetime

from models.pose_estimation import PoseEstimator
from models.virtual_fitting import VirtualFitting
from models.chatbot import BatikChatbot
from utils.image_processing import decode_base64_image, encode_image_base64

app = Flask(__name__)
CORS(app)

# Initialize models
pose_estimator = PoseEstimator()
virtual_fitting = VirtualFitting()
chatbot = BatikChatbot()

# Create necessary directories
os.makedirs('data/batik_patterns', exist_ok=True)
os.makedirs('saved_photos', exist_ok=True)

@app.route('/')
def serve_frontend():
    frontend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', 'index.html')
    return send_file(frontend_path)

# Route untuk serve static files (jika diperlukan)
@app.route('/<path:filename>')
def serve_static(filename):
    frontend_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend')
    return send_from_directory(frontend_dir, filename)

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
    """Apply batik pattern to user image using pose estimation"""
    try:
        data = request.json
        user_image_base64 = data.get('user_image')
        pattern_id = data.get('pattern_id')
        
        if not user_image_base64 or not pattern_id:
            return jsonify({"error": "Missing user_image or pattern_id"}), 400
        
        # Decode user image
        user_image = decode_base64_image(user_image_base64)
        
        # Load batik pattern
        pattern_path = f'data/batik_patterns/{pattern_id}.jpg'
        if not os.path.exists(pattern_path):
            return jsonify({"error": "Pattern not found"}), 404
        
        # Detect pose
        pose_landmarks = pose_estimator.detect_pose(user_image)
        
        if pose_landmarks is None:
            return jsonify({"error": "Could not detect pose"}), 400
        
        # Apply virtual fitting
        result_image = virtual_fitting.apply_batik(user_image, pattern_path, pose_landmarks)
        
        # Convert result to base64
        result_base64 = encode_image_base64(result_image)
        
        return jsonify({
            "result_image": result_base64,
            "pose_detected": True
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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

if __name__ == '__main__':
    app.run(debug=True, port=5000)