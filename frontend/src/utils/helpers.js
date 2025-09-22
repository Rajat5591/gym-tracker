import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

// Date formatting helpers
export const formatDate = (date, formatStr = 'MMM d, yyyy') => {
  return format(new Date(date), formatStr);
};

export const formatTime = (date) => {
  return format(new Date(date), 'h:mm a');
};

export const formatRelativeTime = (date) => {
  const dateObj = new Date(date);
  
  if (isToday(dateObj)) {
    return `Today at ${formatTime(dateObj)}`;
  } else if (isYesterday(dateObj)) {
    return `Yesterday at ${formatTime(dateObj)}`;
  } else {
    return formatDistanceToNow(dateObj, { addSuffix: true });
  }
};

// Time formatting helpers
export const formatDuration = (minutes) => {
  if (!minutes) return '0 min';
  
  if (minutes < 60) {
    return `${minutes} min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
};

export const formatTimer = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Weight formatting helpers
export const formatWeight = (weight, unit = 'lbs') => {
  if (!weight) return `0 ${unit}`;
  
  const value = typeof weight === 'object' ? weight.value : weight;
  const displayUnit = typeof weight === 'object' ? weight.unit : unit;
  
  return `${value} ${displayUnit}`;
};

export const convertWeight = (weight, fromUnit, toUnit) => {
  if (fromUnit === toUnit) return weight;
  
  if (fromUnit === 'lbs' && toUnit === 'kg') {
    return Math.round((weight * 0.453592) * 100) / 100;
  } else if (fromUnit === 'kg' && toUnit === 'lbs') {
    return Math.round((weight * 2.20462) * 100) / 100;
  }
  
  return weight;
};

// Volume calculation helpers
export const calculateVolume = (sets) => {
  return sets.reduce((total, set) => {
    if (set.isCompleted && set.weight && set.reps) {
      const weight = typeof set.weight === 'object' ? set.weight.value : set.weight;
      return total + (weight * set.reps);
    }
    return total;
  }, 0);
};

export const formatVolume = (volume, unit = 'lbs') => {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}k ${unit}`;
  }
  return `${Math.round(volume)} ${unit}`;
};

// 1RM calculation using Epley formula
export const calculate1RM = (weight, reps) => {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
};

// Validation helpers
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateWorkoutName = (name) => {
  return name.trim().length >= 1 && name.length <= 100;
};

// Storage helpers
export const getStoredValue = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting stored value for key "${key}":`, error);
    return defaultValue;
  }
};

export const setStoredValue = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting stored value for key "${key}":`, error);
  }
};

export const removeStoredValue = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing stored value for key "${key}":`, error);
  }
};

// Array helpers
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {});
};

export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];
    
    if (aValue < bValue) {
      return order === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

// Debounce helper
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Generate unique IDs
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Color helpers for charts
export const getColorByIndex = (index) => {
  const colors = [
    '#3b82f6', // blue
    '#22c55e', // green
    '#fbbf24', // yellow
    '#a855f7', // purple
    '#ef4444', // red
    '#06b6d4', // cyan
    '#f97316', // orange
    '#8b5cf6', // violet
  ];
  return colors[index % colors.length];
};

// Exercise category colors
export const getCategoryColor = (category) => {
  const colors = {
    'Chest': '#ef4444',
    'Back': '#22c55e',
    'Shoulders': '#fbbf24',
    'Biceps': '#3b82f6',
    'Triceps': '#a855f7',
    'Quadriceps': '#06b6d4',
    'Hamstrings': '#f97316',
    'Glutes': '#ec4899',
    'Calves': '#84cc16',
    'Abs': '#6366f1',
    'Cardio': '#f59e0b',
    'Other': '#6b7280'
  };
  return colors[category] || colors['Other'];
};

// Muscle group helpers
export const getMuscleGroupEmoji = (muscle) => {
  const emojis = {
    'Chest': '💪',
    'Back': '🏋️',
    'Shoulders': '🤸',
    'Biceps': '💪',
    'Triceps': '💪',
    'Quadriceps': '🦵',
    'Hamstrings': '🦵',
    'Glutes': '🍑',
    'Calves': '🦵',
    'Abs': '🎯',
    'Cardio': '❤️',
    'Other': '🏃'
  };
  return emojis[muscle] || emojis['Other'];
};

export default {
  formatDate,
  formatTime,
  formatRelativeTime,
  formatDuration,
  formatTimer,
  formatWeight,
  convertWeight,
  calculateVolume,
  formatVolume,
  calculate1RM,
  validateEmail,
  validatePassword,
  validateWorkoutName,
  getStoredValue,
  setStoredValue,
  removeStoredValue,
  groupBy,
  sortBy,
  debounce,
  generateId,
  getColorByIndex,
  getCategoryColor,
  getMuscleGroupEmoji
};
