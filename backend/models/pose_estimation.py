import cv2
import numpy as np
import mediapipe as mp

class PoseEstimator:
    def __init__(self):
        # Initialize MediaPipe Pose (BlazePose)
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=True,
            model_complexity=1,
            min_detection_confidence=0.5
        )
        self.mp_drawing = mp.solutions.drawing_utils
        
    def detect_pose(self, image):
        """
        Detect human pose in image using BlazePose
        Returns pose landmarks or None if no pose detected
        """
        # Convert PIL to numpy array if needed
        if hasattr(image, 'convert'):
            image = np.array(image)
        
        # Convert BGR to RGB if needed
        if len(image.shape) == 3 and image.shape[2] == 3:
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        else:
            image_rgb = image
            
        # Process image
        results = self.pose.process(image_rgb)
        
        if results.pose_landmarks:
            # Extract key points for virtual fitting
            landmarks = results.pose_landmarks.landmark
            
            # Get important body points for clothing fitting
            body_points = {
                'left_shoulder': (landmarks[11].x, landmarks[11].y),
                'right_shoulder': (landmarks[12].x, landmarks[12].y),
                'left_hip': (landmarks[23].x, landmarks[23].y),
                'right_hip': (landmarks[24].x, landmarks[24].y),
                'left_elbow': (landmarks[13].x, landmarks[13].y),
                'right_elbow': (landmarks[14].x, landmarks[14].y),
                'left_wrist': (landmarks[15].x, landmarks[15].y),
                'right_wrist': (landmarks[16].x, landmarks[16].y),
                'nose': (landmarks[0].x, landmarks[0].y),
                'left_eye': (landmarks[2].x, landmarks[2].y),
                'right_eye': (landmarks[5].x, landmarks[5].y),
                'visibility': {
                    'left_shoulder': landmarks[11].visibility,
                    'right_shoulder': landmarks[12].visibility,
                    'left_hip': landmarks[23].visibility,
                    'right_hip': landmarks[24].visibility,
                    'left_elbow': landmarks[13].visibility,
                    'right_elbow': landmarks[14].visibility
                }
            }
            
            return body_points
        
        return None
    
    def draw_pose(self, image, pose_landmarks):
        """Draw pose landmarks on image for debugging"""
        if hasattr(image, 'convert'):
            image = np.array(image)
            
        height, width = image.shape[:2]
        
        # Draw connections
        connections = [
            ('left_shoulder', 'right_shoulder'),
            ('left_shoulder', 'left_elbow'),
            ('right_shoulder', 'right_elbow'),
            ('left_elbow', 'left_wrist'),
            ('right_elbow', 'right_wrist'),
            ('left_shoulder', 'left_hip'),
            ('right_shoulder', 'right_hip'),
            ('left_hip', 'right_hip')
        ]
        
        # Convert normalized coordinates to pixel coordinates
        points = {}
        for key, (x, y) in pose_landmarks.items():
            if key != 'visibility':
                points[key] = (int(x * width), int(y * height))
        
        # Draw skeleton
        for start, end in connections:
            if start in points and end in points:
                cv2.line(image, points[start], points[end], (0, 255, 0), 2)
        
        # Draw joints
        for point in points.values():
            cv2.circle(image, point, 5, (0, 0, 255), -1)
        
        return image