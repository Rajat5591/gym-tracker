import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowRightIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const LandingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary} 0%, ${({ theme }) => theme.colors.primaryHover} 100%);
  color: white;
  text-align: center;
  padding: 2rem 1rem;
`;

const ContentWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const Hero = styled.div`
  margin-bottom: 4rem;
`;

const Title = styled.h1`
  font-size: 4rem;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  margin-bottom: 1rem;
  line-height: 1.1;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 2rem 1.5rem;
  text-align: left;
`;

const FeatureIcon = styled.div`
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
`;

const FeatureTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin-bottom: 0.5rem;
`;

const FeatureDescription = styled.p`
  opacity: 0.9;
  line-height: 1.5;
  margin: 0;
`;

const CTASection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: center;
  }
`;

const CTAButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  color: ${({ theme }) => theme.colors.primary};
  padding: 1rem 2rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  text-decoration: none;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  transition: all 0.2s ease;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
  }
`;

const SecondaryButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  color: white;
  padding: 1rem 2rem;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: ${({ theme }) => theme.borderRadius.md};
  text-decoration: none;
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: white;
  }
`;

const Landing = () => {
  const { isAuthenticated } = useAuth();

  // Redirect to dashboard if already logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    {
      icon: '📊',
      title: 'Track Progress',
      description: 'Monitor your strength gains with detailed analytics and progress charts.'
    },
    {
      icon: '💪',
      title: 'Exercise Library',
      description: '300+ exercises with instructions and videos to perfect your form.'
    },
    {
      icon: '⏱️',
      title: 'Rest Timer',
      description: 'Built-in timer to optimize rest periods between sets for maximum gains.'
    },
    {
      icon: '📱',
      title: 'Mobile Ready',
      description: 'Access your workouts anywhere with our responsive mobile design.'
    }
  ];

  return (
    <LandingContainer>
      <ContentWrapper>
        <Hero>
          <Title>Your Fitness Journey Starts Here</Title>
          <Subtitle>
            Track workouts, monitor progress, and achieve your fitness goals 
            with the most intuitive gym tracker ever built.
          </Subtitle>
        </Hero>

        <FeatureGrid>
          {features.map((feature, index) => (
            <FeatureCard key={index}>
              <FeatureIcon>
                <span style={{ fontSize: '24px' }}>{feature.icon}</span>
              </FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCard>
          ))}
        </FeatureGrid>

        <CTASection>
          <CTAButton to="/register">
            Get Started Free
            <ArrowRightIcon style={{ width: 20, height: 20 }} />
          </CTAButton>
          <SecondaryButton to="/login">
            Sign In
          </SecondaryButton>
        </CTASection>
      </ContentWrapper>
    </LandingContainer>
  );
};

export default Landing;
