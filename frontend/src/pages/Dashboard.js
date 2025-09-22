import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { workoutAPI } from '../utils/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const DashboardContainer = styled.div`
  padding: 1rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const WelcomeText = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  margin-bottom: 0.5rem;
`;

const StatsGrid = styled.div`
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

const StatNumber = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const ChartContainer = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const RecentWorkouts = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
`;

const WorkoutItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await workoutAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <DashboardContainer>
      <Header>
        <WelcomeText>
          Welcome back, {user?.username || 'User'}! 👋
        </WelcomeText>
        <p>Ready for today's workout?</p>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatNumber>{stats?.thisWeek?.workouts || 0}</StatNumber>
          <StatLabel>Workouts This Week</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats?.thisWeek?.totalVolume?.toLocaleString() || 0}</StatNumber>
          <StatLabel>lbs Lifted</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats?.thisWeek?.totalDuration || 0}</StatNumber>
          <StatLabel>Minutes Trained</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{user?.stats?.currentStreak || 0}</StatNumber>
          <StatLabel>Day Streak</StatLabel>
        </StatCard>
      </StatsGrid>

      <ChartContainer>
        <h3 style={{ marginBottom: '1rem' }}>Weekly Volume</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats?.weeklyVolumeData || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="volume" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      <RecentWorkouts>
        <h3 style={{ marginBottom: '1rem' }}>Recent Workouts</h3>
        {stats?.recentWorkouts?.length > 0 ? (
          stats.recentWorkouts.map((workout) => (
            <WorkoutItem key={workout._id}>
              <div>
                <div style={{ fontWeight: 'bold' }}>{workout.name}</div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  {new Date(workout.createdAt).toLocaleDateString()} • {workout.duration} min
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div>{workout.exercises?.length || 0} exercises</div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  {workout.totalVolume?.value || 0} lbs
                </div>
              </div>
            </WorkoutItem>
          ))
        ) : (
          <p style={{ textAlign: 'center', color: '#64748b' }}>
            No workouts yet. Start your first workout!
          </p>
        )}
      </RecentWorkouts>
    </DashboardContainer>
  );
};

export default Dashboard;
