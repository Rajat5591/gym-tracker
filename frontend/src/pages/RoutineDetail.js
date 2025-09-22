import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  ArrowLeftIcon,
  PlayIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  ClockIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { routineAPI, workoutAPI } from '../utils/api';
import { useWorkout } from '../context/WorkoutContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDuration, getCategoryColor, getMuscleGroupEmoji } from '../utils/helpers';
import toast from 'react-hot-toast';

const RoutineDetailContainer = styled.div`
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

const HeaderInfo = styled.div`
  flex: 1;
`;

const RoutineTitle = styled.h1`
  margin: 0 0 0.5rem 0;
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
`;

const RoutineMeta = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid ${({ theme, variant }) => {
    if (variant === 'primary') return theme.colors.primary;
    if (variant === 'danger') return theme.colors.error;
    return theme.colors.border;
  }};
  background: ${({ theme, variant }) => {
    if (variant === 'primary') return theme.colors.primary;
    if (variant === 'danger') return theme.colors.error;
    return theme.colors.surface;
  }};
  color: ${({ theme, variant }) => {
    if (variant === 'primary' || variant === 'danger') return 'white';
    return theme.colors.text;
  }};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const InfoSection = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const InfoCard = styled.div`
  text-align: center;
`;

const InfoIcon = styled.div`
  width: 48px;
  height: 48px;
  margin: 0 auto 0.5rem;
  background: ${({ theme }) => theme.colors.primaryLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary};
`;

const InfoValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 0.25rem;
`;

const InfoLabel = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const Description = styled.div`
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const TagsSection = styled.div`
  margin-bottom: 1rem;
`;

const TagsTitle = styled.h4`
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Tag = styled.span`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0.25rem 0.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const MuscleGroupTag = styled.span`
  background: ${({ muscle }) => getCategoryColor(muscle)}20;
  color: ${({ muscle }) => getCategoryColor(muscle)};
  padding: 0.25rem 0.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
`;

const ExercisesSection = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
`;

const SectionTitle = styled.h3`
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.text};
`;

const ExerciseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ExerciseItem = styled.div`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 1rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderHover};
  }
`;

const ExerciseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const ExerciseName = styled.h4`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
`;

const ExerciseCategory = styled.span`
  background: ${({ category }) => getCategoryColor(category)}20;
  color: ${({ category }) => getCategoryColor(category)};
  padding: 0.25rem 0.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const ExerciseDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const ExerciseDetail = styled.div`
  text-align: center;
`;

const DetailLabel = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
`;

const DetailValue = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const StartWorkoutButton = styled.button`
  width: 100%;
  padding: 1rem 2rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  margin-top: 2rem;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const RoutineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { startWorkout } = useWorkout();
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoutine();
  }, [id]);

  const fetchRoutine = async () => {
    try {
      const response = await routineAPI.getById(id);
      setRoutine(response.data.data.routine);
    } catch (error) {
      console.error('Error fetching routine:', error);
      toast.error('Failed to load routine');
      navigate('/routines');
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = () => {
    startWorkout(`${routine.name} - ${new Date().toLocaleDateString()}`);
    
    // Add exercises to workout
    routine.exercises.forEach(routineExercise => {
      // This would add each exercise to the current workout
      toast.success(`Started workout: ${routine.name}`);
    });
    
    navigate('/workout');
  };

  const handleEditRoutine = () => {
    // Navigate to edit routine page (would need to be implemented)
    toast.info('Edit routine functionality coming soon!');
  };

  const handleDuplicateRoutine = async () => {
    try {
      await routineAPI.clone(id, { name: `${routine.name} (Copy)` });
      toast.success('Routine duplicated successfully');
      navigate('/routines');
    } catch (error) {
      console.error('Error duplicating routine:', error);
      toast.error('Failed to duplicate routine');
    }
  };

  const handleDeleteRoutine = async () => {
    if (window.confirm('Are you sure you want to delete this routine?')) {
      try {
        await routineAPI.delete(id);
        toast.success('Routine deleted successfully');
        navigate('/routines');
      } catch (error) {
        console.error('Error deleting routine:', error);
        toast.error('Failed to delete routine');
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!routine) {
    return (
      <RoutineDetailContainer>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Routine not found</h2>
          <Link to="/routines">← Back to Routines</Link>
        </div>
      </RoutineDetailContainer>
    );
  }

  return (
    <RoutineDetailContainer>
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <ArrowLeftIcon style={{ width: 20, height: 20 }} />
        </BackButton>
        
        <HeaderInfo>
          <RoutineTitle>{routine.name}</RoutineTitle>
          <RoutineMeta>
            <span>{routine.exercises.length} exercises</span>
            <span>•</span>
            <span>{routine.category}</span>
            <span>•</span>
            <span>{routine.difficulty}</span>
          </RoutineMeta>
        </HeaderInfo>

        <ActionButtons>
          <ActionButton onClick={handleEditRoutine}>
            <PencilIcon style={{ width: 16, height: 16 }} />
            Edit
          </ActionButton>
          <ActionButton onClick={handleDuplicateRoutine}>
            <DocumentDuplicateIcon style={{ width: 16, height: 16 }} />
            Duplicate
          </ActionButton>
          <ActionButton variant="danger" onClick={handleDeleteRoutine}>
            <TrashIcon style={{ width: 16, height: 16 }} />
            Delete
          </ActionButton>
        </ActionButtons>
      </Header>

      <InfoSection>
        <InfoGrid>
          <InfoCard>
            <InfoIcon>
              <ClockIcon style={{ width: 24, height: 24 }} />
            </InfoIcon>
            <InfoValue>{formatDuration(routine.duration?.estimated || 0)}</InfoValue>
            <InfoLabel>Estimated Duration</InfoLabel>
          </InfoCard>

          <InfoCard>
            <InfoIcon>
              <FireIcon style={{ width: 24, height: 24 }} />
            </InfoIcon>
            <InfoValue>{routine.timesUsed}</InfoValue>
            <InfoLabel>Times Used</InfoLabel>
          </InfoCard>

          <InfoCard>
            <InfoIcon>
              <span style={{ fontSize: '24px' }}>⭐</span>
            </InfoIcon>
            <InfoValue>{routine.rating?.averageRating?.toFixed(1) || 'N/A'}</InfoValue>
            <InfoLabel>Rating</InfoLabel>
          </InfoCard>

          <InfoCard>
            <InfoIcon>
              <span style={{ fontSize: '24px' }}>📅</span>
            </InfoIcon>
            <InfoValue>{routine.frequency?.timesPerWeek || 'Custom'}</InfoValue>
            <InfoLabel>Per Week</InfoLabel>
          </InfoCard>
        </InfoGrid>

        {routine.description && (
          <Description>{routine.description}</Description>
        )}

        {routine.muscleGroups?.length > 0 && (
          <TagsSection>
            <TagsTitle>Target Muscle Groups</TagsTitle>
            <Tags>
              {routine.muscleGroups.map(({ muscle, priority }) => (
                <MuscleGroupTag key={muscle} muscle={muscle}>
                  {getMuscleGroupEmoji(muscle)}
                  {muscle}
                  {priority === 'primary' && ' (Primary)'}
                </MuscleGroupTag>
              ))}
            </Tags>
          </TagsSection>
        )}

        {routine.equipment?.length > 0 && (
          <TagsSection>
            <TagsTitle>Equipment Needed</TagsTitle>
            <Tags>
              {routine.equipment.map(eq => (
                <Tag key={eq}>{eq}</Tag>
              ))}
            </Tags>
          </TagsSection>
        )}
      </InfoSection>

      <ExercisesSection>
        <SectionTitle>Exercises ({routine.exercises.length})</SectionTitle>
        
        <ExerciseList>
          {routine.exercises.map((routineExercise, index) => (
            <ExerciseItem key={index}>
              <ExerciseHeader>
                <ExerciseName>{routineExercise.exercise.name}</ExerciseName>
                <ExerciseCategory category={routineExercise.exercise.category}>
                  {routineExercise.exercise.category}
                </ExerciseCategory>
              </ExerciseHeader>

              <ExerciseDetails>
                <ExerciseDetail>
                  <DetailLabel>Sets</DetailLabel>
                  <DetailValue>{routineExercise.targetSets}</DetailValue>
                </ExerciseDetail>

                <ExerciseDetail>
                  <DetailLabel>Reps</DetailLabel>
                  <DetailValue>{routineExercise.targetReps}</DetailValue>
                </ExerciseDetail>

                <ExerciseDetail>
                  <DetailLabel>Weight</DetailLabel>
                  <DetailValue>
                    {routineExercise.targetWeight?.value 
                      ? `${routineExercise.targetWeight.value} ${routineExercise.targetWeight.unit}` 
                      : 'Variable'}
                  </DetailValue>
                </ExerciseDetail>

                <ExerciseDetail>
                  <DetailLabel>Rest</DetailLabel>
                  <DetailValue>{routineExercise.restTime || 90}s</DetailValue>
                </ExerciseDetail>
              </ExerciseDetails>

              {routineExercise.notes && (
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '0.75rem', 
                  background: '#f8fafc', 
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  color: '#64748b'
                }}>
                  <strong>Notes:</strong> {routineExercise.notes}
                </div>
              )}
            </ExerciseItem>
          ))}
        </ExerciseList>

        <StartWorkoutButton onClick={handleStartWorkout}>
          <PlayIcon style={{ width: 24, height: 24 }} />
          Start This Workout
        </StartWorkoutButton>
      </ExercisesSection>
    </RoutineDetailContainer>
  );
};

export default RoutineDetail;
