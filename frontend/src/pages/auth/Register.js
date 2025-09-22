import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';

const RegisterContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background-color: ${({ theme }) => theme.colors.background};
`;

const RegisterCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  cursor: pointer;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
  }
`;

const Register = () => {
  const { register: registerUser, loading, isAuthenticated } = useAuth();
  const { register, handleSubmit } = useForm();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data) => {
    await registerUser(data);
  };

  return (
    <RegisterContainer>
      <RegisterCard>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1>Create Account</h1>
          <p>Join GymTracker today</p>
        </div>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <Input
            type="text"
            placeholder="Username"
            {...register('username', { required: true })}
          />
          <Input
            type="email"
            placeholder="Email"
            {...register('email', { required: true })}
          />
          <Input
            type="password"
            placeholder="Password"
            {...register('password', { required: true })}
          />
          <Input
            type="text"
            placeholder="First Name"
            {...register('firstName')}
          />
          <Input
            type="text"
            placeholder="Last Name"
            {...register('lastName')}
          />
          <SubmitButton type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </SubmitButton>
        </Form>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <p>
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default Register;
