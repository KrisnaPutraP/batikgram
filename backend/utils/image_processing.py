import base64
import io
from PIL import Image
import numpy as np

def decode_base64_image(base64_string):
    """
    Decode base64 string to PIL Image
    
    Args:
        base64_string (str): Base64 encoded image string
        
    Returns:
        PIL.Image: Decoded image
    """
    try:
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        # Decode base64
        image_data = base64.b64decode(base64_string)
        
        # Create PIL Image
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
            
        return image
        
    except Exception as e:
        raise ValueError(f"Error decoding base64 image: {e}")

def encode_image_base64(image):
    """
    Encode PIL Image to base64 string
    
    Args:
        image (PIL.Image): Image to encode
        
    Returns:
        str: Base64 encoded image string with data URL prefix
    """
    try:
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Save to bytes buffer
        buffer = io.BytesIO()
        image.save(buffer, format='JPEG', quality=85)
        
        # Encode to base64
        img_str = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        # Return with data URL prefix
        return f"data:image/jpeg;base64,{img_str}"
        
    except Exception as e:
        raise ValueError(f"Error encoding image to base64: {e}")

def resize_image(image, target_size=(640, 480)):
    """
    Resize image while maintaining aspect ratio
    
    Args:
        image (PIL.Image): Input image
        target_size (tuple): Target size (width, height)
        
    Returns:
        PIL.Image: Resized image
    """
    try:
        # Calculate aspect ratio
        aspect_ratio = image.width / image.height
        target_width, target_height = target_size
        
        # Calculate new dimensions
        if aspect_ratio > target_width / target_height:
            new_width = target_width
            new_height = int(target_width / aspect_ratio)
        else:
            new_height = target_height
            new_width = int(target_height * aspect_ratio)
        
        # Resize image
        resized_image = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        return resized_image
        
    except Exception as e:
        raise ValueError(f"Error resizing image: {e}")

def create_alpha_mask(image, threshold=128):
    """
    Create an alpha mask from image
    
    Args:
        image (PIL.Image): Input image
        threshold (int): Threshold for creating binary mask
        
    Returns:
        numpy.ndarray: Alpha mask
    """
    try:
        # Convert to grayscale
        gray = image.convert('L')
        
        # Convert to numpy array
        mask = np.array(gray)
        
        # Create binary mask
        mask = (mask > threshold).astype(np.uint8) * 255
        
        return mask
        
    except Exception as e:
        raise ValueError(f"Error creating alpha mask: {e}")