import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../hooks/useTheme';

const NavContainer = styled.nav`
  background-color: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.sticky};

  @media (max-width: 768px) {
    display: none; /* Hide on mobile, use bottom nav instead */
  }
`;

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    color: ${({ theme }) => theme.colors.primaryHover};
  }
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ThemeToggle = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHover};
    border-color: ${({ theme }) => theme.colors.borderHover};
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const LogoutButton = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};

  &:hover {
    background-color: ${({ theme }) => theme.colors.surfaceHover};
    border-color: ${({ theme }) => theme.colors.borderHover};
  }
`;

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
  };

  return (
    <NavContainer>
      <NavContent>
        <Logo to={isAuthenticated ? "/dashboard" : "/"}>
          🏋️ GymTracker
        </Logo>

        <NavActions>
          <ThemeToggle onClick={toggleTheme} title="Toggle theme">
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </ThemeToggle>

          {isAuthenticated && (
            <>
              <UserInfo>
                Welcome, {user?.username}!
              </UserInfo>
              <LogoutButton onClick={handleLogout}>
                Logout
              </LogoutButton>
            </>
          )}
        </NavActions>
      </NavContent>
    </NavContainer>
  );
};

export default Navbar;
