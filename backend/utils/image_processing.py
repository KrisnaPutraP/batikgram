import base64
import io
from PIL import Image
import numpy as np

def decode_base64_image(base64_string):
    """Decode base64 string to PIL Image"""
    # Remove data URL prefix if present
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    
    # Decode base64
    image_data = base64.b64decode(base64_string)
    image = Image.open(io.BytesIO(image_data))
    
    # Convert to RGB if necessary
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    return image

def encode_image_base64(image):
    """Encode PIL Image to base64 string"""
    if isinstance(image, np.ndarray):
        image = Image.fromarray(image)
    
    # Save image to bytes
    buffer = io.BytesIO()
    image.save(buffer, format='JPEG')
    buffer.seek(0)
    
    # Encode to base64
    base64_string = base64.b64encode(buffer.read()).decode('utf-8')
    return f"data:image/jpeg;base64,{base64_string}"

def resize_image(image, max_size=(800, 800)):
    """Resize image while maintaining aspect ratio"""
    image.thumbnail(max_size, Image.Resampling.LANCZOS)
    return image