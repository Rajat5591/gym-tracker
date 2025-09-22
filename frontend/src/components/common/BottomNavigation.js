import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { 
  HomeIcon, 
  FireIcon, 
  ClipboardDocumentListIcon, 
  UserIcon 
} from '@heroicons/react/24/outline';

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.colors.surface};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0.5rem 0;
  z-index: ${({ theme }) => theme.zIndex.fixed};
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const NavList = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  max-width: 600px;
  margin: 0 auto;
`;

const NavItem = styled(NavLink)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: color 0.2s ease;
  min-width: 60px;

  &.active {
    color: ${({ theme }) => theme.colors.primary};
  }

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const NavIcon = styled.div`
  width: 24px;
  height: 24px;
  margin-bottom: 0.25rem;
`;

const NavLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const BottomNavigation = () => {
  const navItems = [
    {
      to: '/dashboard',
      icon: HomeIcon,
      label: 'Home'
    },
    {
      to: '/workout',
      icon: FireIcon,
      label: 'Workout'
    },
    {
      to: '/routines',
      icon: ClipboardDocumentListIcon,
      label: 'Routines'
    },
    {
      to: '/profile',
      icon: UserIcon,
      label: 'Profile'
    }
  ];

  return (
    <NavContainer>
      <NavList>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavItem
            key={to}
            to={to}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <NavIcon>
              <Icon />
            </NavIcon>
            <NavLabel>{label}</NavLabel>
          </NavItem>
        ))}
      </NavList>
    </NavContainer>
  );
};

export default BottomNavigation;
