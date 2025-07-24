import cv2
import numpy as np
from PIL import Image

class VirtualFitting:
    def __init__(self):
        pass
    
    def apply_batik(self, user_image, pattern_path, pose_landmarks):
        """
        Apply batik pattern to user using 2D affine transformation
        """
        # Convert PIL to numpy if needed
        if hasattr(user_image, 'convert'):
            user_img = np.array(user_image)
        else:
            user_img = user_image.copy()
            
        # Load batik pattern
        pattern = cv2.imread(pattern_path)
        if pattern is None:
            raise ValueError(f"Could not load pattern from {pattern_path}")
        
        height, width = user_img.shape[:2]
        
        # Extract key points
        left_shoulder = pose_landmarks['left_shoulder']
        right_shoulder = pose_landmarks['right_shoulder']
        left_hip = pose_landmarks['left_hip']
        right_hip = pose_landmarks['right_hip']
        
        # Convert normalized coordinates to pixels
        def to_pixels(point):
            return (int(point[0] * width), int(point[1] * height))
        
        left_shoulder_px = to_pixels(left_shoulder)
        right_shoulder_px = to_pixels(right_shoulder)
        left_hip_px = to_pixels(left_hip)
        right_hip_px = to_pixels(right_hip)
        
        # Calculate torso dimensions
        shoulder_width = np.linalg.norm(np.array(right_shoulder_px) - np.array(left_shoulder_px))
        torso_height = np.linalg.norm(np.array(left_shoulder_px) - np.array(left_hip_px))
        
        # Add some padding for better coverage
        padding_factor = 1.3
        target_width = int(shoulder_width * padding_factor)
        target_height = int(torso_height * padding_factor)
        
        # Resize pattern to fit torso
        pattern_resized = cv2.resize(pattern, (target_width, target_height))
        
        # Calculate center of torso
        torso_center_x = (left_shoulder_px[0] + right_shoulder_px[0]) // 2
        torso_center_y = (left_shoulder_px[1] + left_hip_px[1]) // 2
        
        # Calculate rotation angle
        shoulder_angle = np.arctan2(
            right_shoulder_px[1] - left_shoulder_px[1],
            right_shoulder_px[0] - left_shoulder_px[0]
        )
        
        # Create transformation matrix
        M = cv2.getRotationMatrix2D(
            (pattern_resized.shape[1]//2, pattern_resized.shape[0]//2),
            np.degrees(shoulder_angle),
            1.0
        )
        
        # Apply rotation to pattern
        pattern_rotated = cv2.warpAffine(pattern_resized, M, 
                                        (pattern_resized.shape[1], pattern_resized.shape[0]))
        
        # Create mask for blending
        mask = self._create_body_mask(user_img, pose_landmarks)
        
        # Calculate placement position
        x_offset = torso_center_x - pattern_rotated.shape[1] // 2
        y_offset = torso_center_y - pattern_rotated.shape[0] // 2
        
        # Ensure pattern fits within image bounds
        x_offset = max(0, min(x_offset, width - pattern_rotated.shape[1]))
        y_offset = max(0, min(y_offset, height - pattern_rotated.shape[0]))
        
        # Apply pattern to user image
        result = user_img.copy()
        
        # Create region of interest
        roi_y1 = y_offset
        roi_y2 = min(y_offset + pattern_rotated.shape[0], height)
        roi_x1 = x_offset
        roi_x2 = min(x_offset + pattern_rotated.shape[1], width)
        
        # Adjust pattern size if it exceeds bounds
        pattern_roi = pattern_rotated[:roi_y2-roi_y1, :roi_x2-roi_x1]
        
        # Blend pattern with user image
        alpha = 0.7  # Transparency factor
        for c in range(3):
            result[roi_y1:roi_y2, roi_x1:roi_x2, c] = \
                result[roi_y1:roi_y2, roi_x1:roi_x2, c] * (1 - alpha) + \
                pattern_roi[:, :, c] * alpha
        
        # Apply mask to blend naturally
        if mask is not None:
            mask_roi = mask[roi_y1:roi_y2, roi_x1:roi_x2]
            for c in range(3):
                result[roi_y1:roi_y2, roi_x1:roi_x2, c] = \
                    user_img[roi_y1:roi_y2, roi_x1:roi_x2, c] * (1 - mask_roi) + \
                    result[roi_y1:roi_y2, roi_x1:roi_x2, c] * mask_roi
        
        # Convert back to PIL Image
        return Image.fromarray(cv2.cvtColor(result, cv2.COLOR_BGR2RGB))
    
    def _create_body_mask(self, image, pose_landmarks):
        """Create a mask for the body area"""
        height, width = image.shape[:2]
        mask = np.zeros((height, width), dtype=np.float32)
        
        # Convert normalized coordinates to pixels
        def to_pixels(point):
            return (int(point[0] * width), int(point[1] * height))
        
        # Create polygon from body points
        body_points = []
        
        # Check visibility before adding points
        visibility = pose_landmarks.get('visibility', {})
        
        # Add points in order to form body contour
        if visibility.get('left_shoulder', 0) > 0.5:
            body_points.append(to_pixels(pose_landmarks['left_shoulder']))
        if visibility.get('left_hip', 0) > 0.5:
            body_points.append(to_pixels(pose_landmarks['left_hip']))
        if visibility.get('right_hip', 0) > 0.5:
            body_points.append(to_pixels(pose_landmarks['right_hip']))
        if visibility.get('right_shoulder', 0) > 0.5:
            body_points.append(to_pixels(pose_landmarks['right_shoulder']))
        
        if len(body_points) >= 3:
            body_points = np.array(body_points, dtype=np.int32)
            cv2.fillPoly(mask, [body_points], 1.0)
            
            # Apply Gaussian blur for smooth edges
            mask = cv2.GaussianBlur(mask, (31, 31), 10)
        
        return mask