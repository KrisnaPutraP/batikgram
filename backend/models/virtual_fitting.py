import cv2
import numpy as np
from PIL import Image
import mediapipe as mp

class VirtualFitting:
    def __init__(self):
        # Initialize MediaPipe solutions
        self.mp_selfie_segmentation = mp.solutions.selfie_segmentation
        self.mp_pose = mp.solutions.pose
        
        # Initialize models
        self.selfie_segmentation = self.mp_selfie_segmentation.SelfieSegmentation(model_selection=1)
        self.pose = self.mp_pose.Pose(static_image_mode=True, min_detection_confidence=0.5)
        
    def apply_batik(self, user_image, pattern_path, pose_landmarks):
        """
        Apply batik pattern to detected clothing area
        """
        # Convert PIL to numpy if needed
        if hasattr(user_image, 'convert'):
            user_img = np.array(user_image)
        else:
            user_img = user_image.copy()
            
        height, width = user_img.shape[:2]
        
        # Load batik pattern
        pattern_img = cv2.imread(pattern_path)
        if pattern_img is None:
            raise ValueError(f"Could not load pattern from {pattern_path}")
        
        # Get person segmentation
        img_rgb = cv2.cvtColor(user_img, cv2.COLOR_BGR2RGB)
        segmentation_results = self.selfie_segmentation.process(img_rgb)
        person_mask = segmentation_results.segmentation_mask
        
        # Detect clothing region using color-based segmentation
        clothing_mask = self._detect_clothing_region(user_img, person_mask, pose_landmarks)
        
        # Apply pattern to clothing
        result = self._apply_pattern_to_clothing(user_img, pattern_img, clothing_mask, pose_landmarks)
        
        # Convert back to PIL
        return Image.fromarray(cv2.cvtColor(result, cv2.COLOR_BGR2RGB))
    
    def _detect_clothing_region(self, image, person_mask, pose_landmarks):
        """
        Detect clothing region using color segmentation and pose landmarks
        """
        height, width = image.shape[:2]
        
        # Convert pose landmarks to pixel coordinates
        def to_pixels(point):
            return (int(point[0] * width), int(point[1] * height))
        
        # Get key body points
        nose = to_pixels(pose_landmarks['nose'])
        left_shoulder = to_pixels(pose_landmarks['left_shoulder'])
        right_shoulder = to_pixels(pose_landmarks['right_shoulder'])
        left_hip = to_pixels(pose_landmarks['left_hip'])
        right_hip = to_pixels(pose_landmarks['right_hip'])
        
        # Define region of interest (torso area)
        roi_top = max(0, min(left_shoulder[1], right_shoulder[1]) - 20)
        roi_bottom = min(height, max(left_hip[1], right_hip[1]) + 40)
        roi_left = max(0, min(left_shoulder[0], left_hip[0]) - 40)
        roi_right = min(width, max(right_shoulder[0], right_hip[0]) + 40)
        
        # Create base mask for torso area
        torso_mask = np.zeros((height, width), dtype=np.uint8)
        
        # Define torso polygon
        torso_points = np.array([
            [left_shoulder[0], left_shoulder[1] - 10],
            [left_shoulder[0] - 20, left_shoulder[1] + 20],
            [left_hip[0] - 20, left_hip[1]],
            [left_hip[0], left_hip[1] + 20],
            [right_hip[0], right_hip[1] + 20],
            [right_hip[0] + 20, right_hip[1]],
            [right_shoulder[0] + 20, right_shoulder[1] + 20],
            [right_shoulder[0], right_shoulder[1] - 10]
        ], dtype=np.int32)
        
        cv2.fillPoly(torso_mask, [torso_points], 255)
        
        # Use color segmentation to refine clothing detection
        roi = image[roi_top:roi_bottom, roi_left:roi_right]
        
        # Convert to HSV for better color detection
        hsv_roi = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
        
        # Create a mask for non-skin colors (likely clothing)
        # Exclude skin tone ranges
        lower_skin = np.array([0, 20, 70], dtype=np.uint8)
        upper_skin = np.array([20, 255, 255], dtype=np.uint8)
        skin_mask = cv2.inRange(hsv_roi, lower_skin, upper_skin)
        
        # Invert to get non-skin (clothing) areas
        clothing_roi = cv2.bitwise_not(skin_mask)
        
        # Apply morphological operations to clean up
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
        clothing_roi = cv2.morphologyEx(clothing_roi, cv2.MORPH_CLOSE, kernel)
        clothing_roi = cv2.morphologyEx(clothing_roi, cv2.MORPH_OPEN, kernel)
        
        # Create full-size mask
        clothing_mask = np.zeros((height, width), dtype=np.uint8)
        clothing_mask[roi_top:roi_bottom, roi_left:roi_right] = clothing_roi
        
        # Combine with torso mask and person mask
        clothing_mask = cv2.bitwise_and(clothing_mask, torso_mask)
        clothing_mask = cv2.bitwise_and(clothing_mask, (person_mask * 255).astype(np.uint8))
        
        # Smooth the mask
        clothing_mask = cv2.GaussianBlur(clothing_mask, (21, 21), 10)
        
        return clothing_mask.astype(np.float32) / 255.0
    
    def _apply_pattern_to_clothing(self, image, pattern, clothing_mask, pose_landmarks):
        """
        Apply batik pattern to the detected clothing area with proper warping
        """
        height, width = image.shape[:2]
        
        # Get bounding box of clothing area
        mask_uint8 = (clothing_mask * 255).astype(np.uint8)
        contours, _ = cv2.findContours(mask_uint8, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            return image
        
        # Get the largest contour (main clothing area)
        largest_contour = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(largest_contour)
        
        # Ensure valid dimensions
        if w <= 0 or h <= 0:
            return image
        
        # Create tiled pattern larger than needed
        pattern_h, pattern_w = pattern.shape[:2]
        tiles_x = max(2, (w // pattern_w) + 2)
        tiles_y = max(2, (h // pattern_h) + 2)
        
        # Tile the pattern
        tiled_pattern = np.tile(pattern, (tiles_y, tiles_x, 1))
        
        # Resize to fit clothing area
        pattern_resized = cv2.resize(tiled_pattern, (w, h))
        
        # Apply perspective transform based on body pose
        src_pts = np.float32([[0, 0], [w, 0], [w, h], [0, h]])
        
        # Calculate slight perspective based on pose
        perspective_factor = 0.05
        dst_pts = np.float32([
            [w * perspective_factor, 0],
            [w * (1 - perspective_factor), 0],
            [w * (1 - perspective_factor * 0.5), h],
            [w * perspective_factor * 0.5, h]
        ])
        
        # Get perspective transform
        M = cv2.getPerspectiveTransform(src_pts, dst_pts)
        pattern_warped = cv2.warpPerspective(pattern_resized, M, (w, h))
        
        # Create result image
        result = image.copy()
        
        # Apply pattern to clothing area
        clothing_region = clothing_mask[y:y+h, x:x+w]
        
        # Ensure dimensions match
        if clothing_region.shape[:2] == pattern_warped.shape[:2]:
            for c in range(3):
                result[y:y+h, x:x+w, c] = (
                    image[y:y+h, x:x+w, c] * (1 - clothing_region) +
                    pattern_warped[:, :, c] * clothing_region
                )
        
        # Apply color matching to blend better
        result = self._match_colors(result, image, clothing_mask)
        
        return result
    
    def _match_colors(self, result, original, mask):
        """
        Match the color tone of the pattern to the original image
        """
        # Calculate mean colors in clothing area
        mask_bool = mask > 0.5
        
        if np.sum(mask_bool) > 0:
            # Get average color of original clothing
            original_mean = np.mean(original[mask_bool], axis=0)
            result_mean = np.mean(result[mask_bool], axis=0)
            
            # Calculate color shift
            color_shift = original_mean - result_mean
            
            # Apply subtle color matching
            mask_3d = np.stack([mask, mask, mask], axis=2)
            result = result.astype(np.float32)
            result += mask_3d * color_shift * 0.3  # Apply 30% color matching
            result = np.clip(result, 0, 255).astype(np.uint8)
        
        return result
    
    def __del__(self):
        """Cleanup MediaPipe resources"""
        if hasattr(self, 'selfie_segmentation'):
            self.selfie_segmentation.close()
        if hasattr(self, 'pose'):
            self.pose.close()