import axios from 'axios';
import toast from 'react-hot-toast';

// Configure axios defaults
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    return Promise.reject(error);
  }
);

// Exercise API
export const exerciseAPI = {
  getAll: (params = {}) => api.get('/exercises', { params }),
  getById: (id) => api.get(`/exercises/${id}`),
  create: (data) => api.post('/exercises', data),
  update: (id, data) => api.put(`/exercises/${id}`, data),
  delete: (id) => api.delete(`/exercises/${id}`),
  getCategories: () => api.get('/exercises/meta/categories'),
};

// Workout API
export const workoutAPI = {
  getAll: (params = {}) => api.get('/workouts', { params }),
  getById: (id) => api.get(`/workouts/${id}`),
  create: (data) => api.post('/workouts', data),
  update: (id, data) => api.put(`/workouts/${id}`, data),
  delete: (id) => api.delete(`/workouts/${id}`),
  finish: (id) => api.post(`/workouts/${id}/finish`),
  getStats: () => api.get('/workouts/stats/dashboard'),
};

// Routine API
export const routineAPI = {
  getAll: (params = {}) => api.get('/routines', { params }),
  getById: (id) => api.get(`/routines/${id}`),
  create: (data) => api.post('/routines', data),
  update: (id, data) => api.put(`/routines/${id}`, data),
  delete: (id) => api.delete(`/routines/${id}`),
  clone: (id, data) => api.post(`/routines/${id}/clone`, data),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  getStats: (params = {}) => api.get('/users/stats', { params }),
  addPersonalRecord: (data) => api.post('/users/personal-record', data),
  search: (params = {}) => api.get('/users/search', { params }),
  follow: (userId) => api.post(`/users/follow/${userId}`),
};

export default api;
