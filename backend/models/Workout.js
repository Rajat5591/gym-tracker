const mongoose = require('mongoose');

const setSchema = new mongoose.Schema({
    reps: {
        type: Number,
        required: [true, 'Reps are required'],
        min: [0, 'Reps cannot be negative']
    },
    weight: {
        value: {
            type: Number,
            required: [true, 'Weight is required'],
            min: [0, 'Weight cannot be negative']
        },
        unit: {
            type: String,
            enum: ['lbs', 'kg'],
            required: true
        }
    },
    setType: {
        type: String,
        enum: ['normal', 'warmup', 'drop', 'failure', 'superset'],
        default: 'normal'
    },
    restTime: {
        type: Number, // in seconds
        min: [0, 'Rest time cannot be negative']
    },
    rpe: { // Rate of Perceived Exertion (1-10)
        type: Number,
        min: 1,
        max: 10
    },
    notes: {
        type: String,
        maxlength: [200, 'Set notes must be less than 200 characters']
    },
    isCompleted: {
        type: Boolean,
        default: true
    },
    completedAt: {
        type: Date,
        default: Date.now
    }
});

const exerciseLogSchema = new mongoose.Schema({
    exercise: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise',
        required: [true, 'Exercise reference is required']
    },
    sets: [setSchema],
    notes: {
        type: String,
        maxlength: [500, 'Exercise notes must be less than 500 characters']
    },
    personalRecord: {
        isNewPR: {
            type: Boolean,
            default: false
        },
        prType: {
            type: String,
            enum: ['1rm', 'volume', 'reps', 'weight']
        },
        previousBest: {
            weight: Number,
            reps: Number,
            volume: Number
        }
    },
    targetSets: Number,
    targetReps: String, // "8-12" or "5"
    targetWeight: Number,
    restTime: Number,
    orderIndex: {
        type: Number,
        required: false
    }
});

const workoutSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required']
    },
    name: {
        type: String,
        required: [true, 'Workout name is required'],
        trim: true,
        maxlength: [100, 'Workout name must be less than 100 characters']
    },
    exercises: [exerciseLogSchema],
    startTime: {
        type: Date,
        required: [true, 'Start time is required']
    },
    endTime: {
        type: Date
    },
    duration: {
        type: Number, // in minutes
        min: [0, 'Duration cannot be negative']
    },
    totalVolume: {
        value: {
            type: Number,
            default: 0
        },
        unit: {
            type: String,
            enum: ['lbs', 'kg'],
            required: true
        }
    },
    totalSets: {
        type: Number,
        default: 0
    },
    totalReps: {
        type: Number,
        default: 0
    },
    notes: {
        type: String,
        maxlength: [1000, 'Workout notes must be less than 1000 characters']
    },
    bodyWeight: {
        value: Number,
        unit: {
            type: String,
            enum: ['lbs', 'kg']
        }
    },
    mood: {
        type: String,
        enum: ['great', 'good', 'okay', 'tired', 'awful']
    },
    energy: {
        type: Number,
        min: 1,
        max: 10
    },
    location: {
        type: String,
        maxlength: [100, 'Location must be less than 100 characters']
    },
    routine: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Routine'
    },
    isTemplate: {
        type: Boolean,
        default: false
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String,
        lowercase: true
    }],
    weather: {
        temperature: Number,
        condition: String,
        humidity: Number
    }
}, {
    timestamps: true
});

// Indexes for performance
workoutSchema.index({ user: 1, createdAt: -1 });
workoutSchema.index({ user: 1, startTime: -1 });
workoutSchema.index({ isTemplate: 1, user: 1 });
workoutSchema.index({ isPublic: 1 });

// Calculate workout statistics before saving
workoutSchema.pre('save', function(next) {
    if (this.isModified('exercises')) {
        let totalVolume = 0;
        let totalSets = 0;
        let totalReps = 0;
        
        this.exercises.forEach(exercise => {
            exercise.sets.forEach(set => {
                if (set.isCompleted) {
                    totalSets += 1;
                    totalReps += set.reps;
                    totalVolume += (set.weight.value * set.reps);
                }
            });
        });
        
        this.totalVolume.value = totalVolume;
        this.totalSets = totalSets;
        this.totalReps = totalReps;
    }
    
    // Calculate duration if endTime is set
    if (this.endTime && this.startTime) {
        this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60));
    }
    
    next();
});

// Get workout statistics
workoutSchema.methods.getStats = function() {
    const stats = {
        totalVolume: this.totalVolume,
        totalSets: this.totalSets,
        totalReps: this.totalReps,
        duration: this.duration,
        exerciseCount: this.exercises.length,
        muscleGroups: []
    };
    
    // Get unique muscle groups
    if (this.populated('exercises.exercise')) {
        const muscleGroups = new Set();
        this.exercises.forEach(ex => {
            if (ex.exercise && ex.exercise.primaryMuscles) {
                ex.exercise.primaryMuscles.forEach(muscle => muscleGroups.add(muscle));
            }
        });
        stats.muscleGroups = Array.from(muscleGroups);
    }
    
    return stats;
};

module.exports = mongoose.model('Workout', workoutSchema);
