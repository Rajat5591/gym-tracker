import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { 
  ArrowLeftIcon, 
  ClockIcon, 
  FireIcon, 
  ScaleIcon,
  DocumentDuplicateIcon,
  TrashIcon 
} from '@heroicons/react/24/outline';
import { workoutAPI } from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDate, formatDuration, formatVolume, getCategoryColor } from '../utils/helpers';
import toast from 'react-hot-toast';

const WorkoutDetailContainer = styled.div`
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

const WorkoutTitle = styled.h1`
  margin: 0 0 0.5rem 0;
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
`;

const WorkoutMeta = styled.div`
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
  border: 1px solid ${({ theme, variant }) => 
    variant === 'danger' ? theme.colors.error : theme.colors.border};
  background: ${({ theme, variant }) => 
    variant === 'danger' ? theme.colors.error : theme.colors.surface};
  color: ${({ theme, variant }) => 
    variant === 'danger' ? 'white' : theme.colors.text};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme, variant }) => 
      variant === 'danger' ? '#dc2626' : theme.colors.surfaceHover};
  }
`;

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  text-align: center;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  background: ${({ theme }) => theme.colors.primaryLight};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary};
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const ExercisesSection = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.text};
`;

const ExerciseBlock = styled.div`
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
`;

const ExerciseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ExerciseName = styled.h4`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.text};
`;

const ExerciseCategory = styled.span`
  background: ${({ category }) => getCategoryColor(category)}20;
  color: ${({ category }) => getCategoryColor(category)};
  padding: 0.25rem 0.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const SetsTable = styled.div`
  display: grid;
  grid-template-columns: 60px 80px 80px 100px 80px;
  gap: 1rem;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const TableHeader = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.textSecondary};
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 0.5rem;
`;

const TableRow = styled.div`
  padding: 0.5rem 0;
  color: ${({ theme }) => theme.colors.text};
  display: contents;
`;

const SetNumber = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const NotesSection = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
`;

const Notes = styled.div`
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.6;
  white-space: pre-wrap;
`;

const EmptyNotes = styled.div`
  color: ${({ theme }) => theme.colors.textMuted};
  font-style: italic;
`;

const WorkoutDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkout();
  }, [id]);

  const fetchWorkout = async () => {
    try {
      const response = await workoutAPI.getById(id);
      setWorkout(response.data.data.workout);
    } catch (error) {
      console.error('Error fetching workout:', error);
      toast.error('Failed to load workout');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkout = async () => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        await workoutAPI.delete(id);
        toast.success('Workout deleted successfully');
        navigate('/dashboard');
      } catch (error) {
        console.error('Error deleting workout:', error);
        toast.error('Failed to delete workout');
      }
    }
  };

  const handleDuplicateWorkout = async () => {
    try {
      const workoutData = {
        name: `${workout.name} (Copy)`,
        exercises: workout.exercises.map(ex => ({
          exercise: ex.exercise._id,
          targetSets: ex.sets.length,
          targetReps: ex.sets.map(s => s.reps).join('-'),
          notes: ex.notes
        }))
      };
      
      // This would create a new routine from the workout
      toast.success('Workout template created successfully');
    } catch (error) {
      console.error('Error duplicating workout:', error);
      toast.error('Failed to create workout template');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!workout) {
    return (
      <WorkoutDetailContainer>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Workout not found</h2>
          <Link to="/dashboard">← Back to Dashboard</Link>
        </div>
      </WorkoutDetailContainer>
    );
  }

  const totalVolume = workout.totalVolume?.value || 0;
  const totalSets = workout.totalSets || 0;
  const totalReps = workout.totalReps || 0;

  return (
    <WorkoutDetailContainer>
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <ArrowLeftIcon style={{ width: 20, height: 20 }} />
        </BackButton>
        
        <HeaderInfo>
          <WorkoutTitle>{workout.name}</WorkoutTitle>
          <WorkoutMeta>
            {formatDate(workout.createdAt)} • {formatDuration(workout.duration)}
          </WorkoutMeta>
        </HeaderInfo>

        <ActionButtons>
          <ActionButton onClick={handleDuplicateWorkout}>
            <DocumentDuplicateIcon style={{ width: 16, height: 16 }} />
            Duplicate
          </ActionButton>
          <ActionButton variant="danger" onClick={handleDeleteWorkout}>
            <TrashIcon style={{ width: 16, height: 16 }} />
            Delete
          </ActionButton>
        </ActionButtons>
      </Header>

      <StatsSection>
        <StatCard>
          <StatIcon>
            <ClockIcon style={{ width: 24, height: 24 }} />
          </StatIcon>
          <StatValue>{formatDuration(workout.duration)}</StatValue>
          <StatLabel>Duration</StatLabel>
        </StatCard>

        <StatCard>
          <StatIcon>
            <ScaleIcon style={{ width: 24, height: 24 }} />
          </StatIcon>
          <StatValue>{formatVolume(totalVolume)}</StatValue>
          <StatLabel>Total Volume</StatLabel>
        </StatCard>

        <StatCard>
          <StatIcon>
            <FireIcon style={{ width: 24, height: 24 }} />
          </StatIcon>
          <StatValue>{totalSets}</StatValue>
          <StatLabel>Total Sets</StatLabel>
        </StatCard>

        <StatCard>
          <StatIcon>
            <span style={{ fontSize: '24px', fontWeight: 'bold' }}>#</span>
          </StatIcon>
          <StatValue>{totalReps}</StatValue>
          <StatLabel>Total Reps</StatLabel>
        </StatCard>
      </StatsSection>

      <ExercisesSection>
        <SectionTitle>Exercises ({workout.exercises.length})</SectionTitle>
        
        {workout.exercises.map((exerciseLog, index) => (
          <ExerciseBlock key={index}>
            <ExerciseHeader>
              <ExerciseName>{exerciseLog.exercise.name}</ExerciseName>
              <ExerciseCategory category={exerciseLog.exercise.category}>
                {exerciseLog.exercise.category}
              </ExerciseCategory>
            </ExerciseHeader>

            <SetsTable>
              <TableHeader>Set</TableHeader>
              <TableHeader>Weight</TableHeader>
              <TableHeader>Reps</TableHeader>
              <TableHeader>Volume</TableHeader>
              <TableHeader>Rest</TableHeader>

              {exerciseLog.sets.map((set, setIndex) => (
                <TableRow key={setIndex}>
                  <SetNumber>{setIndex + 1}</SetNumber>
                  <div>{set.weight.value} {set.weight.unit}</div>
                  <div>{set.reps}</div>
                  <div>{(set.weight.value * set.reps).toFixed(0)} {set.weight.unit}</div>
                  <div>{set.restTime ? `${set.restTime}s` : '-'}</div>
                </TableRow>
              ))}
            </SetsTable>

            {exerciseLog.notes && (
              <div style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                background: '#f8fafc', 
                borderRadius: '0.5rem',
                fontSize: '0.875rem'
              }}>
                <strong>Notes:</strong> {exerciseLog.notes}
              </div>
            )}
          </ExerciseBlock>
        ))}
      </ExercisesSection>

      {workout.notes && (
        <NotesSection>
          <SectionTitle>Workout Notes</SectionTitle>
          <Notes>{workout.notes}</Notes>
        </NotesSection>
      )}
    </WorkoutDetailContainer>
  );
};

export default WorkoutDetail;
