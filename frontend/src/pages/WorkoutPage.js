import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { PlusIcon, PlayIcon, StopIcon } from '@heroicons/react/24/outline';
import { useWorkout } from '../context/WorkoutContext';
import { exerciseAPI } from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AdvancedAICoach from '../components/ai-coach/AdvancedAICoach';
import toast from 'react-hot-toast';

const WorkoutContainer = styled.div`
  padding: 1rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  min-height: 100vh;
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
  gap: 0.75rem;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.2);

  &:hover {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    transform: translateY(-2px);
    box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.3);
  }
`;

const WorkoutSession = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
`;

const SessionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f3f4f6;
`;

const ExerciseSearch = styled.input`
  width: 100%;
  padding: 1rem 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: #f9fafb;
  color: #1f2937;
  font-size: 1rem;
  margin-bottom: 1rem;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    background: white;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: #9ca3af;
  }
`;

const ExerciseList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
`;

const ExerciseItem = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f8fafc;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const CurrentExercises = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ExerciseBlock = styled.div`
  background: #f8fafc;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: #d1d5db;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`;

const ExerciseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ExerciseInfo = styled.div`
  flex: 1;
`;

const ExerciseName = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
`;

const AICoachButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${({ isActive }) => 
    isActive 
      ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
      : 'linear-gradient(135deg, #22c55e, #16a34a)'
  };
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
  }
`;

const FormScoreDisplay = styled.div`
  font-size: 0.9rem;
  margin-top: 0.5rem;
  color: ${({ score }) => {
    if (score >= 85) return '#22c55e';
    if (score >= 70) return '#3b82f6';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  }};
  font-weight: 600;
`;

const AIRepCounter = styled.div`
  font-size: 0.9rem;
  color: #8b5cf6;
  margin-top: 0.25rem;
  font-weight: 600;
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
  grid-template-columns: 50px 100px 100px 100px 80px;
  gap: 0.75rem;
  align-items: center;
  padding: 0.75rem 0;
`;

const SetInput = styled.input`
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #1f2937;
  text-align: center;
  width: 100%;
  font-weight: 600;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const SetButton = styled.button`
  padding: 0.75rem;
  border: 2px solid ${({ isCompleted }) => isCompleted ? '#22c55e' : '#e5e7eb'};
  border-radius: 8px;
  background: ${({ isCompleted }) => isCompleted ? '#22c55e' : 'white'};
  color: ${({ isCompleted }) => isCompleted ? 'white' : '#6b7280'};
  cursor: pointer;
  font-weight: bold;
  font-size: 1.1rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ isCompleted }) => isCompleted ? '#16a34a' : '#f3f4f6'};
    transform: scale(1.05);
  }
`;

const PoseAnalyzerSection = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border: 2px solid #0ea5e9;
  border-radius: 16px;
  box-shadow: 0 10px 15px -3px rgba(14, 165, 233, 0.1);
`;

const PoseAnalyzerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const StatsContainer = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 600;
`;

const ActionButton = styled.button`
  padding: 0.75rem 1rem;
  background: transparent;
  border: 2px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  transition: all 0.2s ease;

  &:hover {
    border-color: #9ca3af;
    background: #f9fafb;
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
  
  // Enhanced AI Coach States
  const [activeAICoach, setActiveAICoach] = useState(null);
  const [aiCoachData, setAICoachData] = useState({});
  const [formScores, setFormScores] = useState({});

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
    completeSet(exerciseId, setId, 90);
  };

  // Enhanced AI Coach Functions
  const toggleAICoach = (exercise) => {
    if (activeAICoach === exercise.name) {
      setActiveAICoach(null);
      toast.success('🤖 AI Coach stopped');
    } else {
      setActiveAICoach(exercise.name);
      setAICoachData(prev => ({
        ...prev,
        [exercise.name]: {
          repCount: 0,
          bestScore: 0,
          avgScore: 0,
          totalReps: 0
        }
      }));
      
      toast.success(`🤖 AI Coach ready for ${exercise.name}!`, {
        duration: 2000
      });
    }
  };

  const handleAdvancedPoseFeedback = (feedback) => {
    if (!activeAICoach) return;

    setFormScores(prev => ({
      ...prev,
      [activeAICoach]: feedback.score
    }));

    setAICoachData(prev => ({
      ...prev,
      [activeAICoach]: {
        ...prev[activeAICoach],
        bestScore: Math.max(prev[activeAICoach]?.bestScore || 0, feedback.score),
        avgScore: ((prev[activeAICoach]?.avgScore || 0) + feedback.score) / 2
      }
    }));
  };

  const handleRepCount = (count, exerciseName) => {
    setAICoachData(prev => ({
      ...prev,
      [exerciseName]: {
        ...prev[exerciseName],
        repCount: count,
        totalReps: count
      }
    }));

    // Motivational messages every 5 reps
    if (count > 0 && count % 5 === 0) {
      const messages = [
        '🔥 Amazing progress!',
        '💪 You\'re unstoppable!',
        '⚡ Perfect rhythm!',
        '🎯 Keep dominating!',
        '🚀 Incredible work!'
      ];
      toast.success(messages[Math.floor(Math.random() * messages.length)], {
        duration: 2000
      });
    }
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
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1f2937', margin: 0 }}>
              Start Your Workout
            </h1>
            <p style={{ fontSize: '1.2rem', color: '#6b7280', margin: '0.5rem 0 0 0' }}>
              Ready to crush your goals with AI assistance?
            </p>
          </div>
        </Header>

        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <StartWorkoutButton onClick={handleStartWorkout}>
            <PlayIcon style={{ width: 24, height: 24 }} />
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
            <h2 style={{ fontSize: '2rem', fontWeight: '700', margin: 0, color: '#1f2937' }}>
              {currentWorkout?.name}
            </h2>
            <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280', fontSize: '1.1rem' }}>
              Started {currentWorkout?.startTime?.toLocaleTimeString()}
            </p>
          </div>
          <button 
            onClick={endWorkout}
            style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            <StopIcon style={{ width: 20, height: 20 }} />
            Finish Workout
          </button>
        </SessionHeader>

        {!showExerciseList && (
          <button
            onClick={() => setShowExerciseList(true)}
            style={{
              width: '100%',
              padding: '1rem',
              border: '2px dashed #d1d5db',
              borderRadius: '12px',
              background: 'transparent',
              color: '#6b7280',
              cursor: 'pointer',
              marginBottom: '1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.borderColor = '#9ca3af';
              e.target.style.background = '#f9fafb';
            }}
            onMouseOut={(e) => {
              e.target.style.borderColor = '#d1d5db';
              e.target.style.background = 'transparent';
            }}
          >
            <PlusIcon style={{ width: 24, height: 24, marginRight: '0.5rem', display: 'inline' }} />
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
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#1f2937' }}>
                      {exercise.name}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      {exercise.category} • {exercise.equipment}
                    </div>
                  </ExerciseItem>
                ))}
              </ExerciseList>
            )}
            
            <ActionButton
              onClick={() => setShowExerciseList(false)}
              style={{ marginTop: '1rem' }}
            >
              Cancel
            </ActionButton>
          </div>
        )}

        <CurrentExercises>
          {currentWorkout?.exercises?.map((exerciseLog) => (
            <ExerciseBlock key={exerciseLog.id}>
              <ExerciseHeader>

                <ExerciseInfo>
                  <ExerciseName>{exerciseLog.exercise.name}</ExerciseName>
                  {formScores[exerciseLog.exercise.name] && (
                    <FormScoreDisplay score={formScores[exerciseLog.exercise.name]}>
                      Current Form Score: {Math.round(formScores[exerciseLog.exercise.name])}% 
                      {formScores[exerciseLog.exercise.name] >= 90 ? ' 🎯' : 
                       formScores[exerciseLog.exercise.name] >= 75 ? ' 💪' :
                       formScores[exerciseLog.exercise.name] >= 50 ? ' ⚠️' : ' ❌'}
                    </FormScoreDisplay>
                  )}
                  {aiCoachData[exerciseLog.exercise.name]?.repCount > 0 && (
                    <AIRepCounter>
                      AI Counted Reps: {aiCoachData[exerciseLog.exercise.name].repCount} 🤖
                    </AIRepCounter>
                  )}
                </ExerciseInfo>
                
                <AICoachButton
                  isActive={activeAICoach === exerciseLog.exercise.name}
                  onClick={() => toggleAICoach(exerciseLog.exercise)}
                >
                  <span>🤖</span>
                  {activeAICoach === exerciseLog.exercise.name ? 'Stop AI Coach' : 'AI Coach'}
                </AICoachButton>
              </ExerciseHeader>
              
              <SetRow style={{ 
                fontWeight: 'bold', 
                color: '#374151',
                borderBottom: '2px solid #e5e7eb',
                paddingBottom: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <div>Set</div>
                <div>Previous</div>
                <div>Weight (lbs)</div>
                <div>Reps</div>
                <div>Complete</div>
              </SetRow>

              {exerciseLog.sets.map((set, index) => (
                <SetRow key={set.id}>

                  <div style={{ fontWeight: 'bold', color: '#1f2937' }}>{index + 1}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>-</div>
                  <SetInput
                    type="number"
                    min="0"
                    max="1000"
                    placeholder="0"
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
                    placeholder="0"
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

              <ActionButton
                onClick={() => addSet(exerciseLog.id)}
                style={{ marginTop: '1rem' }}
              >
                + Add Set
              </ActionButton>

              {/* Enhanced AI Coach Section for this specific exercise */}
              {activeAICoach === exerciseLog.exercise.name && (
                <PoseAnalyzerSection>
                  <PoseAnalyzerHeader>
                    <h4 style={{ margin: 0, color: '#0ea5e9', fontSize: '1.25rem', fontWeight: '700' }}>
                      🤖 AI Coach - {exerciseLog.exercise.name}
                    </h4>
                    {aiCoachData[exerciseLog.exercise.name] && (
                      <StatsContainer>
                        <span>Best: {Math.round(aiCoachData[exerciseLog.exercise.name].bestScore || 0)}%</span>
                        <span>Avg: {Math.round(aiCoachData[exerciseLog.exercise.name].avgScore || 0)}%</span>
                        <span>Total Reps: {aiCoachData[exerciseLog.exercise.name].repCount || 0}</span>
                      </StatsContainer>
                    )}
                  </PoseAnalyzerHeader>
                  
                  <AdvancedAICoach 
                    exerciseName={exerciseLog.exercise.name}
                    onFeedback={handleAdvancedPoseFeedback}
                    onRepCount={(count) => handleRepCount(count, exerciseLog.exercise.name)}
                  />
                </PoseAnalyzerSection>
              )}
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
