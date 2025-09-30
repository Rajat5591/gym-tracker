import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { PlusIcon, PlayIcon, StopIcon } from '@heroicons/react/24/outline';
import { useWorkout } from '../context/WorkoutContext';
import { exerciseAPI } from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PoseAnalyzer from '../components/PoseAnalyzer';

const WorkoutContainer = styled.div`
  padding: 1rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const StartWorkoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 1rem 2rem;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-2px);
  }
`;

const WorkoutSession = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const SessionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ExerciseSearch = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ExerciseList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.surface};
`;

const ExerciseItem = styled.div`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const CurrentExercises = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ExerciseBlock = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 1rem;
`;

const ExerciseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const AICoachButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${({ isActive }) => isActive ? '#ef4444' : '#22c55e'};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

const SetRow = styled.div`
  display: grid;
  grid-template-columns: 40px 80px 80px 80px 60px;
  gap: 0.5rem;
  align-items: center;
  padding: 0.5rem 0;
`;

const SetInput = styled.input`
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  width: 100%;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SetButton = styled.button`
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ isCompleted, theme }) => 
    isCompleted ? theme.colors.success : theme.colors.surface};
  color: ${({ isCompleted }) => isCompleted ? 'white' : 'inherit'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ isCompleted, theme }) => 
      isCompleted ? '#059669' : theme.colors.surfaceHover};
  }
`;

const PoseAnalyzerSection = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: ${({ theme }) => theme.colors.surface};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
`;

const PoseAnalyzerHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1rem;
`;

const FeedbackToast = styled.div`
  position: fixed;
  top: 100px;
  right: 20px;
  background: ${({ type, theme }) => {
    switch(type) {
      case 'good': return theme.colors.success;
      case 'warning': return '#f59e0b';
      case 'error': return theme.colors.error;
      default: return theme.colors.primary;
    }
  }};
  color: white;
  padding: 1rem 1.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  z-index: 1000;
  max-width: 300px;
  animation: slideInRight 0.3s ease-out;

  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const WorkoutPage = () => {
  const { 
    isActive, 
    currentWorkout, 
    startWorkout, 
    endWorkout, 
    addExercise,
    addSet,
    updateSet,
    completeSet
  } = useWorkout();
  
  const [exercises, setExercises] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showExerciseList, setShowExerciseList] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // AI Pose Analysis States
  const [showPoseAnalyzer, setShowPoseAnalyzer] = useState(false);
  const [currentExerciseForAnalysis, setCurrentExerciseForAnalysis] = useState(null);
  const [feedbackToast, setFeedbackToast] = useState(null);

  useEffect(() => {
    if (showExerciseList) {
      fetchExercises();
    }
  }, [showExerciseList, searchTerm]);

  // Clear feedback toast after 3 seconds
  useEffect(() => {
    if (feedbackToast) {
      const timer = setTimeout(() => {
        setFeedbackToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [feedbackToast]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const response = await exerciseAPI.getAll({
        search: searchTerm,
        limit: 20
      });
      setExercises(response.data.data.exercises);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = () => {
    const startName = `Workout - ${new Date().toLocaleDateString()}`;
    startWorkout(startName);
  };

  const handleAddExercise = (exercise) => {
    addExercise(exercise);
    setShowExerciseList(false);
    setSearchTerm('');
  };

  const handleSetUpdate = (exerciseId, setId, field, value) => {
    // Input validation for weight and reps
    if(field === 'weight'){
      if(typeof value === 'object'){
        value.value = Math.min(Math.max(value.value, 0), 1000);
      } else {
        value = Math.min(Math.max(value, 0), 1000);
      }
    }
    if(field === 'reps'){
      value = Math.min(Math.max(value, 0), 50);
    }
    updateSet(exerciseId, setId, { [field]: value });
  };

  const handleCompleteSet = (exerciseId, setId) => {
    completeSet(exerciseId, setId, 90); // 90 seconds rest
  };

  // AI Pose Analysis Functions
  const togglePoseAnalyzer = (exercise) => {
    if (showPoseAnalyzer && currentExerciseForAnalysis?.name === exercise.name) {
      // Stop current analysis
      setShowPoseAnalyzer(false);
      setCurrentExerciseForAnalysis(null);
    } else {
      // Start new analysis
      setCurrentExerciseForAnalysis(exercise);
      setShowPoseAnalyzer(true);
    }
  };

  const handlePoseFeedback = (feedback) => {
    // Determine feedback type based on message content
    let type = 'info';
    if (feedback.message.includes('Great') || feedback.message.includes('Perfect') || feedback.message.includes('Good')) {
      type = 'good';
    } else if (feedback.message.includes('Keep') || feedback.message.includes('Maintain')) {
      type = 'warning';
    } else if (feedback.message.includes('Alert') || feedback.message.includes('Wrong')) {
      type = 'error';
    }

    setFeedbackToast({
      message: feedback.details,
      type: type
    });

    console.log('AI Coach Feedback:', feedback);
  };

  if (!isActive) {
    return (
      <WorkoutContainer>
        <Header>
          <div>
            <h1>Start Your Workout</h1>
            <p>Ready to crush your goals?</p>
          </div>
        </Header>

        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <StartWorkoutButton onClick={handleStartWorkout}>
            <PlayIcon style={{ width: 20, height: 20 }} />
            Start Workout
          </StartWorkoutButton>
        </div>
      </WorkoutContainer>
    );
  }

  return (
    <WorkoutContainer>
      <WorkoutSession>
        <SessionHeader>
          <div>
            <h2>{currentWorkout?.name}</h2>
            <p style={{ margin: 0, color: '#64748b' }}>
              Started {currentWorkout?.startTime?.toLocaleTimeString()}
            </p>
          </div>
          <button 
            onClick={endWorkout}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              padding: '0.5rem 1rem',
              cursor: 'pointer'
            }}
          >
            <StopIcon style={{ width: 16, height: 16 }} />
            Finish
          </button>
        </SessionHeader>

        {!showExerciseList && (
          <button
            onClick={() => setShowExerciseList(true)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px dashed #cbd5e1',
              borderRadius: '0.5rem',
              background: 'transparent',
              color: '#64748b',
              cursor: 'pointer',
              marginBottom: '1rem'
            }}
          >
            <PlusIcon style={{ width: 20, height: 20, marginRight: '0.5rem' }} />
            Add Exercise
          </button>
        )}

        {showExerciseList && (
          <div>
            <ExerciseSearch
              type="text"
              placeholder="Search exercises..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            {loading ? (
              <LoadingSpinner style={{ height: 150 }} />
            ) : (
              <ExerciseList>
                {exercises.map(exercise => (
                  <ExerciseItem
                    key={exercise._id}
                    onClick={() => handleAddExercise(exercise)}
                    tabIndex={0}
                    role="button"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddExercise(exercise)}
                  >
                    <div style={{ fontWeight: 'bold' }}>{exercise.name}</div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      {exercise.category} • {exercise.equipment}
                    </div>
                  </ExerciseItem>
                ))}
              </ExerciseList>
            )}
            
            <button
              onClick={() => setShowExerciseList(false)}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                background: 'transparent',
                border: '1px solid #cbd5e1',
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        )}

        <CurrentExercises>
          {currentWorkout?.exercises?.map((exerciseLog) => (
            <ExerciseBlock key={exerciseLog.id}>
              <ExerciseHeader>
                <h3 style={{ margin: 0 }}>{exerciseLog.exercise.name}</h3>
                <AICoachButton
                  isActive={showPoseAnalyzer && currentExerciseForAnalysis?.name === exerciseLog.exercise.name}
                  onClick={() => togglePoseAnalyzer(exerciseLog.exercise)}
                >
                  <span>🤖</span>
                  {showPoseAnalyzer && currentExerciseForAnalysis?.name === exerciseLog.exercise.name 
                    ? 'Stop AI Coach' 
                    : 'AI Coach'
                  }
                </AICoachButton>
              </ExerciseHeader>
              
              <SetRow>
                <div><strong>Set</strong></div>
                <div><strong>Weight</strong></div>
                <div><strong>Reps</strong></div>
                <div><strong>Done</strong></div>
                <div></div>
              </SetRow>

              {exerciseLog.sets.map((set, index) => (
                <SetRow key={set.id}>
                  <div>{index + 1}</div>
                  <SetInput
                    type="number"
                    min="0"
                    max="1000"
                    placeholder="Weight"
                    value={set.weight.value || ''}
                    onChange={(e) =>
                      handleSetUpdate(exerciseLog.id, set.id, 'weight', {
                        value: parseFloat(e.target.value || 0),
                        unit: 'lbs',
                      })
                    }
                  />
                  <SetInput
                    type="number"
                    min="0"
                    max="50"
                    placeholder="Reps"
                    value={set.reps || ''}
                    onChange={(e) =>
                      handleSetUpdate(
                        exerciseLog.id,
                        set.id,
                        'reps',
                        parseInt(e.target.value || 0)
                      )
                    }
                  />
                  <SetButton
                    isCompleted={set.isCompleted}
                    onClick={() => handleCompleteSet(exerciseLog.id, set.id)}
                  >
                    ✓
                  </SetButton>
                  <div></div>
                </SetRow>
              ))}

              <button
                onClick={() => addSet(exerciseLog.id)}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'transparent',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                }}
              >
                Add Set
              </button>
            </ExerciseBlock>
          ))}
        </CurrentExercises>

        {/* AI Pose Analyzer Section */}
        {showPoseAnalyzer && currentExerciseForAnalysis && (
          <PoseAnalyzerSection>
            <PoseAnalyzerHeader>
              <h3 style={{ margin: 0, color: '#22c55e' }}>
                🤖 AI Form Coach - {currentExerciseForAnalysis.name}
              </h3>
            </PoseAnalyzerHeader>
            <PoseAnalyzer 
              exerciseName={currentExerciseForAnalysis.name}
              onFeedback={handlePoseFeedback}
            />
          </PoseAnalyzerSection>
        )}
      </WorkoutSession>

      {/* Feedback Toast */}
      {feedbackToast && (
        <FeedbackToast type={feedbackToast.type}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {feedbackToast.type === 'good' && '✅ Great Form!'}
            {feedbackToast.type === 'warning' && '⚠️ Form Check'}
            {feedbackToast.type === 'error' && '❌ Form Alert'}
            {feedbackToast.type === 'info' && 'ℹ️ AI Coach'}
          </div>
          <div style={{ fontSize: '0.875rem' }}>
            {feedbackToast.message}
          </div>
        </FeedbackToast>
      )}
    </WorkoutContainer>
  );
};

export default WorkoutPage;
