import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import styled from 'styled-components';
import toast, { Toaster } from 'react-hot-toast';
import { PoseDetector } from './PoseDetector';
import { ExerciseAnalyzer } from './ExerciseAnalyzer';

const CoachContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

const VideoContainer = styled.div`
  position: relative;
  width: 100%;
  height: 480px;
  background: #000;
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

const StatusOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%);
  padding: 1rem;
  z-index: 3;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const FormScore = styled.div`
  background: ${({ score }) => {
    if (score >= 90) return 'linear-gradient(135deg, #22c55e, #16a34a)';
    if (score >= 75) return 'linear-gradient(135deg, #3b82f6, #2563eb)';
    if (score >= 60) return 'linear-gradient(135deg, #f59e0b, #d97706)';
    return 'linear-gradient(135deg, #ef4444, #dc2626)';
  }};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-weight: bold;
  font-size: 1.1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const RepCounter = styled.div`
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-weight: bold;
  font-size: 1.2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const ConfidenceIndicator = styled.div`
  background: ${({ confidence }) => 
    confidence > 0.8 ? '#22c55e' : 
    confidence > 0.6 ? '#f59e0b' : '#ef4444'};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: bold;
`;

const FeedbackPanel = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.95));
  color: white;
  padding: 2rem 1rem 1rem;
  z-index: 3;
`;

const FeedbackMessage = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 0.5rem;
  color: ${({ status }) => {
    switch(status) {
      case 'perfect': return '#22d3ee';
      case 'excellent': return '#22c55e';
      case 'good': return '#3b82f6';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#ffffff';
    }
  }};
`;

const FeedbackDetails = styled.div`
  font-size: 0.95rem;
  text-align: center;
  opacity: 0.95;
  line-height: 1.4;
`;

const ControlPanel = styled.div`
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  z-index: 4;
`;

const ControlButton = styled.button`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  background: ${({ variant }) => {
    switch(variant) {
      case 'stop': return 'linear-gradient(135deg, #ef4444, #dc2626)';
      case 'reset': return 'linear-gradient(135deg, #6b7280, #4b5563)';
      case 'start': return 'linear-gradient(135deg, #22c55e, #16a34a)';
      default: return 'linear-gradient(135deg, #3b82f6, #2563eb)';
    }
  }};
  color: white;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 8px 15px -3px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  color: white;
  flex-direction: column;
  gap: 1rem;
`;

const StartOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(139, 92, 246, 0.9));
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  color: white;
  flex-direction: column;
  gap: 2rem;
`;

const StartButton = styled.button`
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.25rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
  }
`;

const ExerciseTitle = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const AdvancedAICoach = ({ exerciseName, onFeedback, onRepCount }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const poseDetectorRef = useRef(new PoseDetector());
  const animationFrameRef = useRef(null);
  const previousStateRef = useRef(null);
  
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({
    status: 'info',
    message: `Ready to start ${exerciseName}`,
    details: 'Position yourself in front of the camera',
    score: 0,
    confidence: 0
  });
  const [repCount, setRepCount] = useState(0);
  const [lastPhase, setLastPhase] = useState('unknown');

  // Load AI model on component mount
  useEffect(() => {
    const loadModel = async () => {
      setIsLoading(true);
      try {
        await poseDetectorRef.current.loadModel();
        toast.success('🤖 AI Coach ready!', { 
          duration: 2000,
          position: 'top-center',
        });
      } catch (error) {
        toast.error('❌ Failed to load AI model', {
          duration: 4000,
          position: 'top-center',
        });
        console.error('Model loading error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadModel();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Main pose detection and analysis loop
  const analyzeFrame = useCallback(async () => {
    if (!isActive || !webcamRef.current || !webcamRef.current.video) {
      return;
    }

    try {
      const video = webcamRef.current.video;
      if (video.readyState !== 4) {
        animationFrameRef.current = requestAnimationFrame(analyzeFrame);
        return;
      }

      // Detect pose
      const poseData = await poseDetectorRef.current.detectPose(video);
      
      if (poseData && poseData.keypoints) {
        // Draw pose on canvas
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        poseDetectorRef.current.drawSkeleton(ctx, poseData.keypoints, 0.5);
        poseDetectorRef.current.drawKeypoints(ctx, poseData.keypoints, 0.5);

        // Analyze exercise form
        let analysis = null;
        const exerciseLower = exerciseName.toLowerCase();
        
        if (exerciseLower.includes('push') || exerciseLower.includes('pushup')) {
          analysis = ExerciseAnalyzer.analyzePushUp(poseData.keypoints, previousStateRef.current);
        } else if (exerciseLower.includes('squat')) {
          analysis = ExerciseAnalyzer.analyzeSquat(poseData.keypoints, previousStateRef.current);
        } else if (exerciseLower.includes('press') || exerciseLower.includes('dumbbell')) {
          analysis = ExerciseAnalyzer.analyzeDumbbellPress(poseData.keypoints, previousStateRef.current);
        } else if (exerciseLower.includes('deadlift')) {
          analysis = ExerciseAnalyzer.analyzeDeadlift(poseData.keypoints, previousStateRef.current);
        } else {
          // Generic analysis
          analysis = {
            status: 'info',
            message: `Analyzing ${exerciseName}`,
            details: 'Maintain proper form',
            score: 75,
            confidence: poseData.score,
            phase: 'active'
          };
        }

        if (analysis) {
          setFeedback(analysis);
          previousStateRef.current = analysis.state;

          // Count reps based on phase transitions
          if (analysis.phase && analysis.phase !== lastPhase) {
            if ((exerciseLower.includes('push') && lastPhase === 'down' && analysis.phase === 'up') ||
                (exerciseLower.includes('squat') && lastPhase === 'squatting' && analysis.phase === 'standing') ||
                (exerciseLower.includes('press') && lastPhase === 'lowered' && analysis.phase === 'extended')) {
              
              const newRepCount = repCount + 1;
              setRepCount(newRepCount);
              
              if (onRepCount) {
                onRepCount(newRepCount);
              }

              // Provide feedback based on form quality
              if (analysis.score >= 85) {
                toast.success(`✅ Great rep #${newRepCount}!`, { 
                  duration: 1500,
                  position: 'top-center',
                });
              } else if (analysis.score >= 70) {
                toast.success(`👍 Good rep #${newRepCount}`, { 
                  duration: 1500,
                  position: 'top-center',
                });
              } else {
                toast.error(`❌ Poor form rep #${newRepCount}`, { 
                  duration: 2000,
                  position: 'top-center',
                });
              }
            }
            setLastPhase(analysis.phase);
          }

          if (onFeedback) {
            onFeedback(analysis);
          }
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
    }

    animationFrameRef.current = requestAnimationFrame(analyzeFrame);
  }, [isActive, exerciseName, repCount, lastPhase, onFeedback, onRepCount]);

  // Start analysis when camera becomes active
  useEffect(() => {
    if (isActive) {
      analyzeFrame();
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, analyzeFrame]);

  const startCoach = async () => {
    if (isLoading) {
      toast.error('Please wait for AI model to load', {
        duration: 3000,
        position: 'top-center',
      });
      return;
    }

    setIsActive(true);
    setRepCount(0);
    setLastPhase('unknown');
    previousStateRef.current = null;
    
    toast.success(`🚀 AI Coach started for ${exerciseName}!`, {
      duration: 2000,
      position: 'top-center',
    });

    // Exercise-specific tips
    setTimeout(() => {
      let tip = '';
      const exerciseLower = exerciseName.toLowerCase();
      
      if (exerciseLower.includes('push')) {
        tip = 'Keep your body straight and lower until chest nearly touches ground';
      } else if (exerciseLower.includes('squat')) {
        tip = 'Keep feet shoulder-width apart, go down until hips are below knees';
      } else if (exerciseLower.includes('press')) {
        tip = 'Keep elbows under wrists, press dumbbells directly overhead';
      } else if (exerciseLower.includes('deadlift')) {
        tip = 'Keep back straight, push hips back, lift with your legs';
      } else {
        tip = 'Maintain proper form throughout the exercise';
      }
      
      toast(`💡 ${tip}`, { 
        duration: 4000,
        position: 'top-center',
        icon: '💡',
      });
    }, 1000);
  };

  const stopCoach = () => {
    setIsActive(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    toast.success('🤖 AI Coach stopped', {
      duration: 2000,
      position: 'top-center',
    });
  };

  const resetCounter = () => {
    setRepCount(0);
    setLastPhase('unknown');
    previousStateRef.current = null;
    toast('🔄 Rep counter reset', {
      duration: 2000,
      position: 'top-center',
      icon: '🔄',
    });
  };

  return (
    <>
      <Toaster />
      <CoachContainer>
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
              videoConstraints={{
                width: 640,
                height: 480,
                facingMode: 'user'
              }}
            />
          </WebcamContainer>
          
          {isActive && (
            <>
              <Canvas ref={canvasRef} />
              
              <StatusOverlay>
                <div>
                  <FormScore score={feedback.score}>
                    {Math.round(feedback.score)}% 
                    {feedback.score >= 90 ? ' 🎯' : 
                     feedback.score >= 75 ? ' 💪' :
                     feedback.score >= 60 ? ' ⚠️' : ' ❌'}
                  </FormScore>
                  <ConfidenceIndicator confidence={feedback.confidence}>
                    Signal: {Math.round((feedback.confidence || 0) * 100)}%
                  </ConfidenceIndicator>
                </div>
                <RepCounter>
                  Reps: {repCount}
                </RepCounter>
              </StatusOverlay>

              <ControlPanel>
                <ControlButton onClick={resetCounter} variant="reset" title="Reset counter">
                  🔄
                </ControlButton>
                <ControlButton onClick={stopCoach} variant="stop" title="Stop AI coach">
                  ⏹️
                </ControlButton>
              </ControlPanel>

              <FeedbackPanel>
                <FeedbackMessage status={feedback.status}>
                  {feedback.message}
                </FeedbackMessage>
                <FeedbackDetails>
                  {feedback.details}
                </FeedbackDetails>
              </FeedbackPanel>
            </>
          )}

          {isLoading && (
            <LoadingOverlay>
              <div style={{ fontSize: '3rem' }}>🤖</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Loading AI Coach...</div>
              <div style={{ fontSize: '1rem', opacity: 0.8 }}>Please wait while we prepare your personal trainer</div>
            </LoadingOverlay>
          )}

          {!isActive && !isLoading && (
            <StartOverlay>
              <ExerciseTitle>🤖 AI Coach</ExerciseTitle>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{exerciseName}</div>
              <div style={{ textAlign: 'center', fontSize: '1.1rem', opacity: 0.9 }}>
                Get real-time form feedback and rep counting
              </div>
              <StartButton onClick={startCoach}>
                🚀 Start AI Coach
              </StartButton>
            </StartOverlay>
          )}
        </VideoContainer>
      </CoachContainer>
    </>
  );
};

export default AdvancedAICoach;
