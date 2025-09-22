import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MagnifyingGlassIcon, FunnelIcon, PlusIcon } from '@heroicons/react/24/outline';
import { exerciseAPI } from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getCategoryColor, getMuscleGroupEmoji } from '../utils/helpers';

const ExercisesContainer = styled.div`
  padding: 1rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const SearchSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
  }
`;

const SearchInputWrapper = styled.div`
  position: relative;
  flex: 1;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSize.base};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryLight};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const FilterSection = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const FilterSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
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

const CategoryTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 2px;
  }
`;

const CategoryTab = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid ${({ theme, active }) => 
    active ? theme.colors.primary : theme.colors.border};
  background: ${({ theme, active }) => 
    active ? theme.colors.primary : theme.colors.surface};
  color: ${({ theme, active }) => 
    active ? 'white' : theme.colors.text};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  white-space: nowrap;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme, active }) => 
      active ? theme.colors.primaryHover : theme.colors.surfaceHover};
  }
`;

const ExerciseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
`;

const ExerciseCard = styled.div`
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

const ExerciseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const ExerciseTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
`;

const CategoryBadge = styled.span`
  background: ${({ category }) => getCategoryColor(category)}20;
  color: ${({ category }) => getCategoryColor(category)};
  padding: 0.25rem 0.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const ExerciseInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const MuscleGroup = styled.span`
  background: ${({ theme }) => theme.colors.background};
  padding: 0.25rem 0.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
`;

const MuscleGroups = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const ExerciseStats = styled.div`
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

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
`;

const PageButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme, active }) => 
    active ? theme.colors.primary : theme.colors.surface};
  color: ${({ theme, active }) => 
    active ? 'white' : theme.colors.text};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${({ theme, active }) => 
      active ? theme.colors.primaryHover : theme.colors.surfaceHover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ExercisesPage = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [categories, setCategories] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  const exerciseCategories = [
    'all', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 
    'Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Abs', 'Cardio'
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchExercises();
  }, [searchTerm, selectedCategory, selectedEquipment, selectedDifficulty, pagination.current]);

  const fetchCategories = async () => {
    try {
      const response = await exerciseAPI.getCategories();
      setCategories(response.data.data.categories);
      setEquipment(response.data.data.equipment);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: 12,
        search: searchTerm || undefined,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        equipment: selectedEquipment !== 'all' ? selectedEquipment : undefined,
        difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined
      };

      const response = await exerciseAPI.getAll(params);
      setExercises(response.data.data.exercises);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleFilterChange = (type, value) => {
    if (type === 'equipment') setSelectedEquipment(value);
    if (type === 'difficulty') setSelectedDifficulty(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ExercisesContainer>
      <Header>
        <h1>Exercise Library</h1>
        <p>Discover and learn proper form for hundreds of exercises</p>
      </Header>

      <SearchSection>
        <SearchInputWrapper>
          <SearchIcon>
            <MagnifyingGlassIcon />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </SearchInputWrapper>

        <FilterSection>
          <FilterSelect
            value={selectedEquipment}
            onChange={(e) => handleFilterChange('equipment', e.target.value)}
          >
            <option value="all">All Equipment</option>
            {equipment.map(eq => (
              <option key={eq} value={eq}>{eq}</option>
            ))}
          </FilterSelect>

          <FilterSelect
            value={selectedDifficulty}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
          >
            <option value="all">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </FilterSelect>

          <CreateButton>
            <PlusIcon style={{ width: 16, height: 16 }} />
            Create
          </CreateButton>
        </FilterSection>
      </SearchSection>

      <CategoryTabs>
        {exerciseCategories.map(category => (
          <CategoryTab
            key={category}
            active={selectedCategory === category}
            onClick={() => handleCategoryChange(category)}
          >
            {category === 'all' ? '🏋️ All' : `${getMuscleGroupEmoji(category)} ${category}`}
          </CategoryTab>
        ))}
      </CategoryTabs>

      {loading ? (
        <LoadingSpinner />
      ) : exercises.length > 0 ? (
        <>
          <ExerciseGrid>
            {exercises.map(exercise => (
              <ExerciseCard key={exercise._id}>
                <ExerciseHeader>
                  <ExerciseTitle>{exercise.name}</ExerciseTitle>
                  <CategoryBadge category={exercise.category}>
                    {exercise.category}
                  </CategoryBadge>
                </ExerciseHeader>

                <ExerciseInfo>
                  <InfoRow>
                    <span>🏋️</span>
                    <span>{exercise.equipment}</span>
                  </InfoRow>

                  <InfoRow>
                    <span>📊</span>
                    <span>{exercise.difficulty}</span>
                  </InfoRow>

                  <InfoRow>
                    <span>💪 Primary:</span>
                  </InfoRow>
                  <MuscleGroups>
                    {exercise.primaryMuscles.map(muscle => (
                      <MuscleGroup key={muscle}>
                        {getMuscleGroupEmoji(muscle)}
                        {muscle}
                      </MuscleGroup>
                    ))}
                  </MuscleGroups>

                  {exercise.secondaryMuscles?.length > 0 && (
                    <>
                      <InfoRow>
                        <span>🎯 Secondary:</span>
                      </InfoRow>
                      <MuscleGroups>
                        {exercise.secondaryMuscles.map(muscle => (
                          <MuscleGroup key={muscle}>
                            {getMuscleGroupEmoji(muscle)}
                            {muscle}
                          </MuscleGroup>
                        ))}
                      </MuscleGroups>
                    </>
                  )}
                </ExerciseInfo>

                <ExerciseStats>
                  <span>Used {exercise.metrics.timesUsed} times</span>
                  <span>⭐ {exercise.metrics.averageRating.toFixed(1)}</span>
                </ExerciseStats>
              </ExerciseCard>
            ))}
          </ExerciseGrid>

          {pagination.pages > 1 && (
            <Pagination>
              <PageButton
                onClick={() => handlePageChange(pagination.current - 1)}
                disabled={pagination.current === 1}
              >
                Previous
              </PageButton>

              {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                const pageNum = Math.max(1, Math.min(
                  pagination.pages - 4,
                  pagination.current - 2
                )) + i;

                if (pageNum > pagination.pages) return null;

                return (
                  <PageButton
                    key={pageNum}
                    active={pageNum === pagination.current}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </PageButton>
                );
              })}

              <PageButton
                onClick={() => handlePageChange(pagination.current + 1)}
                disabled={pagination.current === pagination.pages}
              >
                Next
              </PageButton>
            </Pagination>
          )}
        </>
      ) : (
        <EmptyState>
          <h3>No exercises found</h3>
          <p>Try adjusting your search or filters</p>
        </EmptyState>
      )}
    </ExercisesContainer>
  );
};

export default ExercisesPage;
