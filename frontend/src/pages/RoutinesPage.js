import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { PlusIcon } from '@heroicons/react/24/outline';
import { routineAPI } from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const RoutinesContainer = styled.div`
  padding: 1rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 0.75rem 1rem;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const RoutineGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
`;

const RoutineCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.md};
    transform: translateY(-2px);
  }
`;

const RoutineTitle = styled.h3`
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
`;

const RoutineDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-bottom: 1rem;
`;

const RoutineMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const RoutinesPage = () => {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoutines();
  }, []);

  const fetchRoutines = async () => {
    try {
      const response = await routineAPI.getAll();
      setRoutines(response.data.data.routines);
    } catch (error) {
      console.error('Error fetching routines:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <RoutinesContainer>
      <Header>
        <div>
          <h1>My Routines</h1>
          <p>Create and manage your workout routines</p>
        </div>
        <CreateButton>
          <PlusIcon style={{ width: 20, height: 20 }} />
          Create Routine
        </CreateButton>
      </Header>

      {routines.length > 0 ? (
        <RoutineGrid>
          {routines.map(routine => (
            <RoutineCard key={routine._id}>
              <RoutineTitle>{routine.name}</RoutineTitle>
              <RoutineDescription>
                {routine.description || 'No description'}
              </RoutineDescription>
              <RoutineMeta>
                <span>{routine.exercises?.length || 0} exercises</span>
                <span>{routine.category}</span>
              </RoutineMeta>
            </RoutineCard>
          ))}
        </RoutineGrid>
      ) : (
        <EmptyState>
          <h3>No routines yet</h3>
          <p>Create your first routine to get started</p>
          <CreateButton style={{ marginTop: '1rem' }}>
            <PlusIcon style={{ width: 20, height: 20 }} />
            Create Your First Routine
          </CreateButton>
        </EmptyState>
      )}
    </RoutinesContainer>
  );
};

export default RoutinesPage;
