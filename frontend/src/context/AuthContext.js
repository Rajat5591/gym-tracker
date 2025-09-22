import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };

    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`;
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };

    case 'LOGOUT':
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      return {
        ...initialState,
        loading: false
      };

    case 'AUTH_ERROR':
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };

    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on app start if token exists
  useEffect(() => {
    if (state.token) {
      loadUser();
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Set token in axios headers if it exists
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    }
  }, [state.token]);

  const loadUser = async () => {
    try {
      const response = await axios.get('/auth/me');
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.data.data.user,
          token: state.token
        }
      });
    } catch (error) {
      console.error('Load user error:', error);
      dispatch({
        type: 'AUTH_ERROR',
        payload: error.response?.data?.message || 'Failed to load user'
      });
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await axios.post('/auth/login', credentials);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response.data.data
      });

      toast.success('Login successful!');
      return { success: true };
      
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      
      dispatch({
        type: 'AUTH_ERROR',
        payload: message
      });

      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await axios.post('/auth/register', userData);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: response.data.data
      });

      toast.success('Registration successful!');
      return { success: true };
      
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      
      dispatch({
        type: 'AUTH_ERROR',
        payload: message
      });

      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('/auth/profile', profileData);
      
      dispatch({
        type: 'UPDATE_USER',
        payload: response.data.data.user
      });

      toast.success('Profile updated successfully');
      return { success: true };
      
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      await axios.post('/auth/change-password', passwordData);
      toast.success('Password changed successfully');
      return { success: true };
      
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    loadUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
