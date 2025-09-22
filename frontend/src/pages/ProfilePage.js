import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { CogIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { userAPI } from '../utils/api';

const ProfileContainer = styled.div`
  padding: 1rem;
`;

const ProfileHeader = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 2rem;
  text-align: center;
  margin-bottom: 2rem;
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  background: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin: 0 auto 1rem;
`;

const UserName = styled.h1`
  margin-bottom: 0.5rem;
`;

const UserEmail = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const Section = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SettingsGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const Toggle = styled.button`
  background: ${({ active, theme }) => 
    active ? theme.colors.primary : theme.colors.border};
  border: none;
  border-radius: 12px;
  width: 48px;
  height: 24px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ active }) => active ? '26px' : '2px'};
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: left 0.2s ease;
  }
`;

const ProfilePage = () => {
  const { user, updateProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await userAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const getInitials = (username) => {
    return username ? username.slice(0, 2).toUpperCase() : 'U';
  };

  return (
    <ProfileContainer>
      <ProfileHeader>
        <Avatar>{getInitials(user?.username)}</Avatar>
        <UserName>{user?.username}</UserName>
        <UserEmail>{user?.email}</UserEmail>
      </ProfileHeader>

      <StatsGrid>
        <StatCard>
          <StatNumber>{stats?.totalWorkouts || 0}</StatNumber>
          <StatLabel>Total Workouts</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{Math.round(stats?.totalVolume || 0)}</StatNumber>
          <StatLabel>lbs Lifted</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{Math.round((stats?.totalDuration || 0) / 60)}</StatNumber>
          <StatLabel>Hours Trained</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{user?.stats?.currentStreak || 0}</StatNumber>
          <StatLabel>Day Streak</StatLabel>
        </StatCard>
      </StatsGrid>

      <Section>
        <SectionTitle>
          <TrophyIcon style={{ width: 20, height: 20 }} />
          Personal Records
        </SectionTitle>
        {user?.stats?.personalRecords?.length > 0 ? (
          <div>
            {user.stats.personalRecords.slice(0, 3).map((pr, index) => (
              <SettingItem key={index}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>
                    {pr.exercise?.name || 'Exercise'}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    {pr.weight} lbs × {pr.reps} reps
                  </div>
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  {new Date(pr.date).toLocaleDateString()}
                </div>
              </SettingItem>
            ))}
          </div>
        ) : (
          <p style={{ color: '#64748b', textAlign: 'center' }}>
            No personal records yet. Keep lifting! 💪
          </p>
        )}
      </Section>

      <Section>
        <SectionTitle>
          <CogIcon style={{ width: 20, height: 20 }} />
          Settings
        </SectionTitle>
        <SettingsGrid>
          <SettingItem>
            <div>
              <div style={{ fontWeight: 'bold' }}>Dark Mode</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                Toggle dark/light theme
              </div>
            </div>
            <Toggle 
              active={theme === 'dark'}
              onClick={toggleTheme}
            />
          </SettingItem>
          
          <SettingItem>
            <div>
              <div style={{ fontWeight: 'bold' }}>Units</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                Imperial (lbs/ft)
              </div>
            </div>
            <button style={{
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: '1px solid #cbd5e1',
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}>
              Change
            </button>
          </SettingItem>
          
          <SettingItem>
            <div>
              <div style={{ fontWeight: 'bold' }}>Account</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                Logout of your account
              </div>
            </div>
            <button 
              onClick={logout}
              style={{
                padding: '0.5rem 1rem',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </SettingItem>
        </SettingsGrid>
      </Section>
    </ProfileContainer>
  );
};

export default ProfilePage;
