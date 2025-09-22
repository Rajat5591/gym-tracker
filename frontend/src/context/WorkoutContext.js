import React, { createContext, useContext, useReducer, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

const WorkoutContext = createContext();

const initialState = {
  currentWorkout: null,
  isActive: false,
  startTime: null,
  exercises: [],
  activeExerciseIndex: null,
  activeSetIndex: null,
  restTimer: {
    isActive: false,
    timeLeft: 0,
    duration: 90
  },
  sessionTimer: {
    startTime: null,
    elapsed: 0
  }
};

function workoutReducer(state, action) {
  switch (action.type) {
    case 'START_WORKOUT':
      const startTime = new Date();
      return {
        ...state,
        isActive: true,
        startTime,
        currentWorkout: {
          id: uuidv4(),
          name: action.payload.name || 'New Workout',
          startTime,
          exercises: []
        },
        sessionTimer: {
          startTime,
          elapsed: 0
        }
      };

    case 'END_WORKOUT':
      return {
        ...initialState,
        currentWorkout: null
      };

    case 'ADD_EXERCISE':
      return {
        ...state,
        currentWorkout: {
          ...state.currentWorkout,
          exercises: [
            ...state.currentWorkout.exercises,
            {
              id: uuidv4(),
              exercise: action.payload.exercise,
              sets: [{
                id: uuidv4(),
                reps: 0,
                weight: { value: 0, unit: 'lbs' },
                setType: 'normal',
                isCompleted: false
              }],
              notes: ''
            }
          ]
        }
      };

    case 'REMOVE_EXERCISE':
      return {
        ...state,
        currentWorkout: {
          ...state.currentWorkout,
          exercises: state.currentWorkout.exercises.filter(
            ex => ex.id !== action.payload.exerciseId
          )
        }
      };

    case 'ADD_SET':
      return {
        ...state,
        currentWorkout: {
          ...state.currentWorkout,
          exercises: state.currentWorkout.exercises.map(ex =>
            ex.id === action.payload.exerciseId
              ? {
                  ...ex,
                  sets: [...ex.sets, {
                    id: uuidv4(),
                    reps: ex.sets.length > 0 ? ex.sets[ex.sets.length - 1].reps : 0,
                    weight: ex.sets.length > 0 ? { ...ex.sets[ex.sets.length - 1].weight } : { value: 0, unit: 'lbs' },
                    setType: 'normal',
                    isCompleted: false
                  }]
                }
              : ex
          )
        }
      };

    case 'REMOVE_SET':
      return {
        ...state,
        currentWorkout: {
          ...state.currentWorkout,
          exercises: state.currentWorkout.exercises.map(ex =>
            ex.id === action.payload.exerciseId
              ? {
                  ...ex,
                  sets: ex.sets.filter(set => set.id !== action.payload.setId)
                }
              : ex
          )
        }
      };

    case 'UPDATE_SET':
      return {
        ...state,
        currentWorkout: {
          ...state.currentWorkout,
          exercises: state.currentWorkout.exercises.map(ex =>
            ex.id === action.payload.exerciseId
              ? {
                  ...ex,
                  sets: ex.sets.map(set =>
                    set.id === action.payload.setId
                      ? { ...set, ...action.payload.updates }
                      : set
                  )
                }
              : ex
          )
        }
      };

    case 'COMPLETE_SET':
      return {
        ...state,
        currentWorkout: {
          ...state.currentWorkout,
          exercises: state.currentWorkout.exercises.map(ex =>
            ex.id === action.payload.exerciseId
              ? {
                  ...ex,
                  sets: ex.sets.map(set =>
                    set.id === action.payload.setId
                      ? { ...set, isCompleted: true, completedAt: new Date() }
                      : set
                  )
                }
              : ex
          )
        }
      };

    case 'START_REST_TIMER':
      return {
        ...state,
        restTimer: {
          isActive: true,
          timeLeft: action.payload.duration,
          duration: action.payload.duration
        }
      };

    case 'TICK_REST_TIMER':
      return {
        ...state,
        restTimer: {
          ...state.restTimer,
          timeLeft: Math.max(0, state.restTimer.timeLeft - 1)
        }
      };

    case 'STOP_REST_TIMER':
      return {
        ...state,
        restTimer: {
          ...state.restTimer,
          isActive: false,
          timeLeft: 0
        }
      };

    case 'UPDATE_SESSION_TIMER':
      return {
        ...state,
        sessionTimer: {
          ...state.sessionTimer,
          elapsed: action.payload.elapsed
        }
      };

    default:
      return state;
  }
}

export function WorkoutProvider({ children }) {
  const [state, dispatch] = useReducer(workoutReducer, initialState);

  const startWorkout = useCallback((name) => {
    dispatch({ type: 'START_WORKOUT', payload: { name } });
    toast.success('Workout started!');
  }, []);

  const endWorkout = useCallback(async () => {
    if (!state.currentWorkout) return;

    try {
      // Calculate workout stats
      const endTime = new Date();
      const duration = Math.round((endTime - state.startTime) / (1000 * 60)); // minutes
      
      let totalVolume = 0;
      let totalSets = 0;
      let totalReps = 0;

      const exercises = state.currentWorkout.exercises.map(ex => ({
        exercise: ex.exercise._id,
        sets: ex.sets.filter(set => set.isCompleted).map(set => ({
          reps: set.reps,
          weight: set.weight,
          setType: set.setType,
          restTime: set.restTime,
          notes: set.notes,
          isCompleted: true,
          completedAt: set.completedAt
        })),
        notes: ex.notes
      }));

      // Calculate totals
      exercises.forEach(ex => {
        ex.sets.forEach(set => {
          totalSets += 1;
          totalReps += set.reps;
          totalVolume += (set.weight.value * set.reps);
        });
      });

      const workoutData = {
        name: state.currentWorkout.name,
        startTime: state.startTime,
        endTime,
        duration,
        exercises,
        totalVolume: {
          value: totalVolume,
          unit: 'lbs' // TODO: Get from user preferences
        },
        totalSets,
        totalReps
      };

      // Save workout to backend
      const response = await axios.post('/workouts', workoutData);
      
      dispatch({ type: 'END_WORKOUT' });
      toast.success('Workout saved successfully!');
      
      return { success: true, workout: response.data.data.workout };
      
    } catch (error) {
      console.error('Save workout error:', error);
      toast.error('Failed to save workout');
      return { success: false };
    }
  }, [state.currentWorkout, state.startTime]);

  const addExercise = useCallback((exercise) => {
    dispatch({ type: 'ADD_EXERCISE', payload: { exercise } });
  }, []);

  const removeExercise = useCallback((exerciseId) => {
    dispatch({ type: 'REMOVE_EXERCISE', payload: { exerciseId } });
  }, []);

  const addSet = useCallback((exerciseId) => {
    dispatch({ type: 'ADD_SET', payload: { exerciseId } });
  }, []);

  const removeSet = useCallback((exerciseId, setId) => {
    dispatch({ type: 'REMOVE_SET', payload: { exerciseId, setId } });
  }, []);

  const updateSet = useCallback((exerciseId, setId, updates) => {
    dispatch({ type: 'UPDATE_SET', payload: { exerciseId, setId, updates } });
  }, []);

  const completeSet = useCallback((exerciseId, setId, restDuration = 90) => {
    dispatch({ type: 'COMPLETE_SET', payload: { exerciseId, setId } });
    
    // Start rest timer
    if (restDuration > 0) {
      startRestTimer(restDuration);
    }
    
    toast.success('Set completed! 💪');
  }, []);

  const startRestTimer = useCallback((duration) => {
    dispatch({ type: 'START_REST_TIMER', payload: { duration } });
  }, []);

  const stopRestTimer = useCallback(() => {
    dispatch({ type: 'STOP_REST_TIMER' });
  }, []);

  const value = {
    ...state,
    startWorkout,
    endWorkout,
    addExercise,
    removeExercise,
    addSet,
    removeSet,
    updateSet,
    completeSet,
    startRestTimer,
    stopRestTimer
  };

  return (
    <WorkoutContext.Provider value={value}>
      {children}
    </WorkoutContext.Provider>
  );
}

export const useWorkout = () => {
  const context = useContext(WorkoutContext);
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
};
