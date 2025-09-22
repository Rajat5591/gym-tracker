import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from 'styled-components';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { WorkoutProvider } from './context/WorkoutContext';
import { ThemeProvider as CustomThemeProvider } from './context/ThemeContext';

// Components
import Navbar from './components/common/Navbar';
import BottomNavigation from './components/common/BottomNavigation';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import WorkoutPage from './pages/WorkoutPage';
import RoutinesPage from './pages/RoutinesPage';
import ProfilePage from './pages/ProfilePage';
import ExercisesPage from './pages/ExercisesPage';
import WorkoutDetail from './pages/WorkoutDetail';
import RoutineDetail from './pages/RoutineDetail';

// Styles
import GlobalStyle from './styles/GlobalStyle';
import { lightTheme, darkTheme } from './styles/theme';

// Custom Hooks
import { useTheme } from './hooks/useTheme';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CustomThemeProvider>
          <AppContent />
        </CustomThemeProvider>
      </AuthProvider>
    </Router>
  );
}

function AppContent() {
  const { theme } = useTheme();
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={currentTheme}>
      <WorkoutProvider>
        <GlobalStyle />
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/workout" element={
                <ProtectedRoute>
                  <WorkoutPage />
                </ProtectedRoute>
              } />
              
              <Route path="/workouts/:id" element={
                <ProtectedRoute>
                  <WorkoutDetail />
                </ProtectedRoute>
              } />
              
              <Route path="/routines" element={
                <ProtectedRoute>
                  <RoutinesPage />
                </ProtectedRoute>
              } />
              
              <Route path="/routines/:id" element={
                <ProtectedRoute>
                  <RoutineDetail />
                </ProtectedRoute>
              } />
              
              <Route path="/exercises" element={
                <ProtectedRoute>
                  <ExercisesPage />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              
              {/* Redirect to dashboard for authenticated users */}
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </main>
          <BottomNavigation />
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: currentTheme.colors.surface,
                color: currentTheme.colors.text,
                border: `1px solid ${currentTheme.colors.border}`,
              },
              success: {
                iconTheme: {
                  primary: currentTheme.colors.success,
                  secondary: currentTheme.colors.surface,
                },
              },
              error: {
                iconTheme: {
                  primary: currentTheme.colors.error,
                  secondary: currentTheme.colors.surface,
                },
              },
            }}
          />
        </div>
      </WorkoutProvider>
    </ThemeProvider>
  );
}

export default App;
