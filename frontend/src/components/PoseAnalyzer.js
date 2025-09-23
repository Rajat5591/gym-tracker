import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import styled from 'styled-components';

const PoseContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
`;

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  height: 480px;
`;

const Canvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
`;

const WebcamContainer = styled.div`
  width: 100%;
  height: 100%;
  
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const FeedbackPanel = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
  color: white;
  padding: 2rem 1rem 1rem;
  z-index: 3;
`;

const FeedbackText = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  text-align: center;
  margin-bottom: 0.5rem;
`;

const FeedbackDetails = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-align: center;
  opacity: 0.9;
`;

const ToggleButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 0.5rem 1rem;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;
  z-index: 4;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const PoseAnalyzer = ({ exerciseName, onFeedback }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const poseRef = useRef(null);
  const cameraRef = useRef(null);
  
  const [isActive, setIsActive] = useState(false);
  const [feedback, setFeedback] = useState({
    message: "Position yourself in front of the camera",
    details: "Make sure your full body is visible"
  });

  useEffect(() => {
    if (isActive) {
      initializePoseDetection();
    } else {
      cleanupPoseDetection();
    }

    return () => cleanupPoseDetection();
  }, [isActive]);

  const initializePoseDetection = () => {
    const pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      }
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    pose.onResults(onPoseResults);
    poseRef.current = pose;

    if (webcamRef.current && webcamRef.current.video) {
      const camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          if (poseRef.current) {
            await poseRef.current.send({ image: webcamRef.current.video });
          }
        },
        width: 640,
        height: 480
      });
      cameraRef.current = camera;
      camera.start();
    }
  };

  const cleanupPoseDetection = () => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
    if (poseRef.current) {
      poseRef.current.close();
      poseRef.current = null;
    }
  };

  const onPoseResults = (results) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = 640;
    canvas.height = 480;
    
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (results.poseLandmarks) {
      // Draw pose landmarks
      drawConnectors(ctx, results.poseLandmarks, Pose.POSE_CONNECTIONS, {
        color: '#00ff00',
        lineWidth: 2
      });
      drawLandmarks(ctx, results.poseLandmarks, {
        color: '#ff0000',
        lineWidth: 1,
        radius: 3
      });

      // Analyze pose and provide feedback
      const analysis = analyzePose(results.poseLandmarks, exerciseName);
      setFeedback(analysis);
      
      if (onFeedback) {
        onFeedback(analysis);
      }
    }
    
    ctx.restore();
  };

  const analyzePose = (landmarks, exercise) => {
    if (!landmarks || landmarks.length === 0) {
      return {
        message: "Stand in front of the camera",
        details: "Make sure your body is fully visible"
      };
    }

    // Get key body landmarks
    const nose = landmarks[0];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];
    const leftWrist = landmarks[15];
    const rightWrist = landmarks[16];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];
    const leftAnkle = landmarks[27];
    const rightAnkle = landmarks[28];

    // Exercise-specific analysis
    switch (exercise?.toLowerCase()) {
      case 'squat':
      case 'squat (barbell)':
        return analyzeSquat({
          leftHip, rightHip, leftKnee, rightKnee, 
          leftAnkle, rightAnkle, leftShoulder, rightShoulder
        });
      
      case 'deadlift':
        return analyzeDeadlift({
          leftHip, rightHip, leftKnee, rightKnee,
          leftShoulder, rightShoulder, nose
        });
      
      case 'bench press (barbell)':
      case 'dumbbell bench press':
        return analyzeBenchPress({
          leftShoulder, rightShoulder, leftElbow, rightElbow,
          leftWrist, rightWrist
        });
      
      case 'overhead press':
      case 'dumbbell shoulder press':
        return analyzeOverheadPress({
          leftShoulder, rightShoulder, leftElbow, rightElbow,
          leftWrist, rightWrist, nose
        });
      
      default:
        return analyzeGeneralPose({
          leftShoulder, rightShoulder, leftHip, rightHip,
          leftKnee, rightKnee
        });
    }
  };

  const analyzeSquat = ({ leftHip, rightHip, leftKnee, rightKnee, leftAnkle, rightAnkle, leftShoulder, rightShoulder }) => {
    const hipHeight = (leftHip.y + rightHip.y) / 2;
    const kneeHeight = (leftKnee.y + rightKnee.y) / 2;
    const shoulderHeight = (leftShoulder.y + rightShoulder.y) / 2;

    // Check squat depth
    if (hipHeight < kneeHeight) {
      // Good squat depth
      if (shoulderHeight - hipHeight > 0.1) {
        return {
          message: "Great squat depth! 🎯",
          details: "Keep your chest up and core tight"
        };
      } else {
        return {
          message: "Keep your chest up! 📐",
          details: "Maintain upright torso throughout the movement"
        };
      }
    } else {
      return {
        message: "Go deeper! 🔽",
        details: "Lower your hips below knee level for full range of motion"
      };
    }
  };

  const analyzeDeadlift = ({ leftHip, rightHip, leftKnee, rightKnee, leftShoulder, rightShoulder, nose }) => {
    const hipHeight = (leftHip.y + rightHip.y) / 2;
    const shoulderHeight = (leftShoulder.y + rightShoulder.y) / 2;
    
    // Check back alignment
    const backAngle = Math.abs(nose.y - shoulderHeight);
    
    if (backAngle < 0.05) {
      return {
        message: "Perfect back position! 💪",
        details: "Drive through your heels and keep the bar close"
      };
    } else {
      return {
        message: "Keep your back straight! 📏",
        details: "Maintain neutral spine throughout the lift"
      };
    }
  };

  const analyzeBenchPress = ({ leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist }) => {
    const shoulderWidth = Math.abs(leftShoulder.x - rightShoulder.x);
    const wristWidth = Math.abs(leftWrist.x - rightWrist.x);
    
    if (wristWidth > shoulderWidth * 1.2) {
      return {
        message: "Perfect grip width! 👌",
        details: "Lower the bar to your chest with control"
      };
    } else {
      return {
        message: "Widen your grip slightly 🤏",
        details: "Hands should be slightly wider than shoulders"
      };
    }
  };

  const analyzeOverheadPress = ({ leftShoulder, rightShoulder, leftElbow, rightElbow, leftWrist, rightWrist, nose }) => {
    const avgWristHeight = (leftWrist.y + rightWrist.y) / 2;
    const avgShoulderHeight = (leftShoulder.y + rightShoulder.y) / 2;
    
    if (avgWristHeight < avgShoulderHeight - 0.1) {
      return {
        message: "Great overhead position! 🎯",
        details: "Keep your core tight and press straight up"
      };
    } else {
      return {
        message: "Press higher! ⬆️",
        details: "Fully extend your arms overhead"
      };
    }
  };

  const analyzeGeneralPose = ({ leftShoulder, rightShoulder, leftHip, rightHip, leftKnee, rightKnee }) => {
    return {
      message: "Ready for exercise! 🏋️‍♂️",
      details: "Maintain good posture throughout your workout"
    };
  };

  return (
    <PoseContainer>
      <VideoContainer>
        <WebcamContainer>
          <Webcam
            ref={webcamRef}
            style={{
              visibility: isActive ? 'visible' : 'hidden',
              width: '100%',
              height: '100%'
            }}
            mirrored={true}
          />
        </WebcamContainer>
        
        {isActive && (
          <Canvas ref={canvasRef} />
        )}

        <ToggleButton onClick={() => setIsActive(!isActive)}>
          {isActive ? '📷 Stop Camera' : '📷 Start AI Coach'}
        </ToggleButton>

        {isActive && (
          <FeedbackPanel>
            <FeedbackText>{feedback.message}</FeedbackText>
            <FeedbackDetails>{feedback.details}</FeedbackDetails>
          </FeedbackPanel>
        )}
      </VideoContainer>
    </PoseContainer>
  );
};

export default PoseAnalyzer;
