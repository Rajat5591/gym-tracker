import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { PlusIcon, PlayIcon, StopIcon } from '@heroicons/react/24/outline';
import { useWorkout } from '../context/WorkoutContext';
import { exerciseAPI } from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

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

  useEffect(() => {
    if (showExerciseList) {
      fetchExercises();
    }
  }, [showExerciseList, searchTerm]);

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
    const workoutName = `Workout - ${new Date().toLocaleDateString()}`;
    startWorkout(workoutName);
  };

  const handleAddExercise = (exercise) => {
    addExercise(exercise);
    setShowExerciseList(false);
    setSearchTerm('');
  };

  const handleSetUpdate = (exerciseId, setId, field, value) => {
    updateSet(exerciseId, setId, { [field]: value });
  };

  const handleCompleteSet = (exerciseId, setId) => {
    completeSet(exerciseId, setId, 90); // 90 seconds rest
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
            <PlusIcon style={{ width: 20, height: 20, display: 'inline', marginRight: '0.5rem' }} />
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
              <LoadingSpinner fullHeight={false} />
            ) : (
              <ExerciseList>
                {exercises.map(exercise => (
                  <ExerciseItem
                    key={exercise._id}
                    onClick={() => handleAddExercise(exercise)}
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
              <h3 style={{ marginBottom: '1rem' }}>{exerciseLog.exercise.name}</h3>
              
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: '40px 80px 80px 80px 60px',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 'bold',
                color: '#64748b'
              }}>
                <div>Set</div>
                <div>Previous</div>
                <div>Weight</div>
                <div>Reps</div>
                <div>✓</div>
              </div>

              {exerciseLog.sets.map((set, setIndex) => (
                <SetRow key={set.id}>
                  <div>{setIndex + 1}</div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    -
                  </div>
                  <SetInput
                    type="number"
                    placeholder="0"
                    value={set.weight.value || ''}
                    onChange={(e) => handleSetUpdate(
                      exerciseLog.id, 
                      set.id, 
                      'weight', 
                      { value: parseFloat(e.target.value) || 0, unit: 'lbs' }
                    )}
                  />
                  <SetInput
                    type="number"
                    placeholder="0"
                    value={set.reps || ''}
                    onChange={(e) => handleSetUpdate(
                      exerciseLog.id, 
                      set.id, 
                      'reps', 
                      parseInt(e.target.value) || 0
                    )}
                  />
                  <SetButton
                    isCompleted={set.isCompleted}
                    onClick={() => handleCompleteSet(exerciseLog.id, set.id)}
                  >
                    ✓
                  </SetButton>
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
                  fontSize: '0.875rem'
                }}
              >
                Add Set
              </button>
            </ExerciseBlock>
          ))}
        </CurrentExercises>
      </WorkoutSession>
    </WorkoutContainer>
  );
};

export default WorkoutPage;
