import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { exerciseAPI } from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getCategoryColor, getMuscleGroupEmoji } from '../utils/helpers';

const Container = styled.div`
  padding: 1rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const SearchFilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const SearchInputWrapper = styled.div`
  flex: 1 1 300px;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.md};
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryLight};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.textMuted};
  pointer-events: none;
`;

const FilterSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  min-width: 160px;
  font-size: ${({ theme }) => theme.fontSizes.md};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primaryLight};
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
  padding: 0.75rem 1.2rem;
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const CategoryTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 3px;
  }
`;

const CategoryTab = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid ${({ theme, active }) => (active ? theme.colors.primary : theme.colors.border)};
  background: ${({ theme, active }) => (active ? theme.colors.primary : theme.colors.surface)};
  color: ${({ theme, active }) => (active ? 'white' : theme.colors.text)};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  white-space: nowrap;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  transition: background-color 0.2s ease;

  &:hover {
    background: ${({ theme, active }) => (active ? theme.colors.primaryHover : theme.colors.surfaceHover)};
  }
`;

const ExerciseGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;
`;

const ExerciseCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.2rem 1.5rem;
  cursor: pointer;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.md};
    transform: translateY(-2px);
  }
`;

const ExerciseCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;

const ExerciseTitle = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.text};
`;

const Badge = styled.span`
  background-color: ${({ category }) => `${getCategoryColor(category)}33` }; /* translucent */
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: 0.2rem 0.5rem;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ category }) => getCategoryColor(category)};
  height: 1.5rem;
  line-height: 1.1rem;
  white-space: nowrap;
  user-select: none;
`;

const ExerciseInfo = styled.div`
  margin-bottom: 0.75rem;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const MuscleGroup = styled.span`
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  padding: 0.15rem 0.5rem;
  margin-right: 0.3rem;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text};

  user-select: none;
`;

const StatsRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textMuted};
`;

const EmptyMsg = styled.div`
  font-style: italic;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.textMuted};
  text-align: center;
  margin-top: 3rem;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 2rem 0;
  gap: 0.5rem;
  flex-wrap: wrap;
  user-select: none;
`;

const PageButton = styled.button`
  background-color: ${({ theme, active }) =>
    active ? theme.colors.primary : theme.colors.surface};
  border: 1px solid
    ${({ theme, active }) => (active ? theme.colors.primary : theme.colors.border)};
  color: ${({ theme, active }) => (active ? 'white' : theme.colors.text)};
  padding: 0.375rem 0.75rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  transition: background-color 0.2s ease;
  min-width: 32px;

  &:hover:not(:disabled) {
    background-color: ${({ theme, active }) =>
      active ? theme.colors.primaryHover : theme.colors.surfaceHover};
  }

  &:disabled {
    cursor: default;
    opacity: 0.5;
  }
`;

const ExercisesPage = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [categories, setCategories] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
  });

  const categoryOptions = [
    'all',
    'Chest',
    'Back',
    'Shoulders',
    'Biceps',
    'Triceps',
    'Quadriceps',
    'Hamstrings',
    'Glutes',
    'Calves',
    'Abs',
    'Cardio',
  ];

  useEffect(() => {
    // Fetch categories and equipment data on mount
    const fetchMeta = async () => {
      try {
        const { data } = await exerciseAPI.getMeta();
        setCategories(data.categories);
        setEquipment(data.equipment);
      } catch {
        // handle error silently
      }
    };
    fetchMeta();
  }, []);

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      try {
        const params = {
          page: pagination.current,
          limit: 12,
          search: searchTerm || undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          equipment: selectedEquipment !== 'all' ? selectedEquipment : undefined,
          difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
        };
        const { data } = await exerciseAPI.getAll(params);
        setExercises(data.exercises);
        setPagination(data.pagination);
      } catch {
        setExercises([]);
        setPagination({ current: 1, pages: 1, total: 0 });
      }
      setLoading(false);
    };
    fetchExercises();
  }, [searchTerm, selectedCategory, selectedEquipment, selectedDifficulty, pagination.current]);

  const onSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const onCategoryChange = (cat) => {
    setSelectedCategory(cat);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const onEquipmentChange = (e) => {
    setSelectedEquipment(e.target.value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const onDifficultyChange = (e) => {
    setSelectedDifficulty(e.target.value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const onPageChange = (page) => {
    if (page < 1 || page > pagination.pages || page === pagination.current) return;
    setPagination((prev) => ({ ...prev, current: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Container>
      <Header>
        <h1>Exercise Library</h1>
        <p>Discover and learn proper form of thousands of exercises</p>
      </Header>

      <SearchFilterContainer>
        <SearchInputWrapper>
          <IconWrapper>
            <MagnifyingGlassIcon />
          </IconWrapper>
          <SearchInput
            type="search"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={onSearchChange}
            aria-label="Search exercises"
          />
        </SearchInputWrapper>

        <FilterSelect value={selectedEquipment} onChange={onEquipmentChange}>
          <option value="all">All Equipment</option>
          {equipment.map((eq) => (
            <option key={eq} value={eq}>
              {eq}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect value={selectedDifficulty} onChange={onDifficultyChange}>
          <option value="all">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </FilterSelect>

        <CreateButton>
          <PlusIcon />
          Create
        </CreateButton>
      </SearchFilterContainer>

      <CategoryTabs>
        {categoryOptions.map((cat) => (
          <CategoryTab key={cat} active={selectedCategory === cat} onClick={() => onCategoryChange(cat)}>
            {cat === 'all' ? '🏋️ All' : `${getMuscleGroupEmoji(cat)} ${cat}`}
          </CategoryTab>
        ))}
      </CategoryTabs>

      {loading ? (
        <LoadingSpinner />
      ) : exercises.length > 0 ? (
        <>
          <ExerciseGrid>
            {exercises.map(({ _id, name, category, equipment, difficulty, primaryMuscles, secondaryMuscles, metrics }) => (
              <ExerciseCard key={_id} tabIndex={0}>
                <ExerciseCardHeader>
                  <ExerciseTitle>{name}</ExerciseTitle>
                  <Badge category={category}>{category}</Badge>
                </ExerciseCardHeader>

                <ExerciseInfo>
                  <Row>
                    <span role="img" aria-label="equipment">
                      🏋️
                    </span>{' '}
                    {equipment}
                  </Row>
                  <Row>
                    <span role="img" aria-label="difficulty">
                      📊
                    </span>{' '}
                    {difficulty}
                  </Row>
                  <Row>
                    <span>Primary:</span>
                  </Row>
                  <MuscleGroup>
                    {primaryMuscles.map((muscle) => (
                      <span key={muscle} style={{ marginRight: 6 }}>
                        {getMuscleGroupEmoji(muscle)} {muscle}
                      </span>
                    ))}
                  </MuscleGroup>
                  {secondaryMuscles && secondaryMuscles.length > 0 && (
                    <>
                      <Row>
                        <span>Secondary:</span>
                      </Row>
                      <MuscleGroup>
                        {secondaryMuscles.map((muscle) => (
                          <span key={muscle} style={{ marginRight: 6 }}>
                            {getMuscleGroupEmoji(muscle)} {muscle}
                          </span>
                        ))}
                      </MuscleGroup>
                    </>
                  )}
                </ExerciseInfo>

                <StatsRow>
                  <span>Used {metrics.timesUsed}</span>
                  <span>⭐ {metrics.averageRating.toFixed(1)}</span>
                </StatsRow>
              </ExerciseCard>
            ))}
          </ExerciseGrid>

          {pagination.pages > 1 && (
            <PaginationContainer>
              <PageButton disabled={pagination.current === 1} onClick={() => onPageChange(1)}>
                First
              </PageButton>
              <PageButton disabled={pagination.current === 1} onClick={() => onPageChange(pagination.current - 1)}>
                Prev
              </PageButton>
              {[...Array(pagination.pages)].slice(0, 5).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <PageButton key={pageNum} active={pagination.current === pageNum} onClick={() => onPageChange(pageNum)}>
                    {pageNum}
                  </PageButton>
                );
              })}
              <PageButton
                disabled={pagination.current === pagination.pages}
                onClick={() => onPageChange(pagination.current + 1)}
              >
                Next
              </PageButton>
              <PageButton disabled={pagination.current === pagination.pages} onClick={() => onPageChange(pagination.pages)}>
                Last
              </PageButton>
            </PaginationContainer>
          )}
        </>
      ) : (
        <EmptyMsg>No exercises found. Try adjusting your search or filters.</EmptyMsg>
      )}
    </Container>
  );
};

export default ExercisesPage;
