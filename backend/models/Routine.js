const mongoose = require('mongoose');

const routineExerciseSchema = new mongoose.Schema({
    exercise: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise',
        required: [true, 'Exercise reference is required']
    },
    targetSets: {
        type: Number,
        required: [true, 'Target sets is required'],
        min: [1, 'Target sets must be at least 1']
    },
    targetReps: {
        type: String, // "8-12" or "5" or "AMRAP"
        required: [true, 'Target reps is required']
    },
    targetWeight: {
        value: Number,
        unit: {
            type: String,
            enum: ['lbs', 'kg']
        }
    },
    restTime: {
        type: Number, // in seconds
        default: 90,
        min: [0, 'Rest time cannot be negative']
    },
    notes: {
        type: String,
        maxlength: [300, 'Exercise notes must be less than 300 characters']
    },
    orderIndex: {
        type: Number,
        required: true
    },
    superset: {
        isSuperset: {
            type: Boolean,
            default: false
        },
        supersetGroup: String // A, B, C, etc.
    }
});

const routineSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required']
    },
    name: {
        type: String,
        required: [true, 'Routine name is required'],
        trim: true,
        maxlength: [100, 'Routine name must be less than 100 characters']
    },
    description: {
        type: String,
        maxlength: [500, 'Description must be less than 500 characters']
    },
    exercises: [routineExerciseSchema],
    category: {
        type: String,
        enum: [
            'Full Body', 'Upper/Lower', 'Push/Pull/Legs', 'Body Part Split',
            'Strength', 'Hypertrophy', 'Endurance', 'Custom'
        ],
        default: 'Custom'
    },
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Intermediate'
    },
    duration: {
        estimated: {
            type: Number, // in minutes
            min: [10, 'Duration must be at least 10 minutes']
        },
        actual: [{
            duration: Number,
            date: Date
        }]
    },
    frequency: {
        timesPerWeek: {
            type: Number,
            min: [1, 'Frequency must be at least once per week'],
            max: [7, 'Frequency cannot exceed 7 times per week']
        },
        restDays: {
            type: Number,
            min: [0, 'Rest days cannot be negative']
        }
    },
    tags: [{
        type: String,
        lowercase: true,
        maxlength: [30, 'Tag must be less than 30 characters']
    }],
    muscleGroups: [{
        muscle: String,
        priority: {
            type: String,
            enum: ['primary', 'secondary'],
            default: 'primary'
        }
    }],
    equipment: [{
        type: String,
        enum: [
            'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight',
            'Kettlebell', 'Resistance Band', 'Medicine Ball', 'Other'
        ]
    }],
    isPublic: {
        type: Boolean,
        default: false
    },
    isTemplate: {
        type: Boolean,
        default: true
    },
    timesUsed: {
        type: Number,
        default: 0
    },
    rating: {
        averageRating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        },
        totalRatings: {
            type: Number,
            default: 0
        }
    },
    clonedFrom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Routine'
    },
    versions: [{
        version: Number,
        date: Date,
        changes: String
    }],
    schedule: [{
        dayOfWeek: {
            type: Number, // 0 = Sunday, 1 = Monday, etc.
            min: 0,
            max: 6
        },
        time: String, // "09:00"
        isActive: {
            type: Boolean,
            default: true
        }
    }]
}, {
    timestamps: true
});

// Indexes for performance
routineSchema.index({ user: 1, createdAt: -1 });
routineSchema.index({ isPublic: 1, rating: -1 });
routineSchema.index({ category: 1, difficulty: 1 });
routineSchema.index({ muscleGroups: 1 });

// Calculate estimated duration based on exercises
routineSchema.pre('save', function(next) {
    if (this.isModified('exercises')) {
        let estimatedDuration = 0;
        
        this.exercises.forEach(exercise => {
            // Estimate time per exercise (sets * (exercise time + rest time))
            const exerciseTime = 30; // seconds per set
            const totalTime = exercise.targetSets * (exerciseTime + (exercise.restTime || 90));
            estimatedDuration += totalTime;
        });
        
        // Convert to minutes and add 10 minutes for setup/warmup
        this.duration.estimated = Math.round(estimatedDuration / 60) + 10;
        
        // Update muscle groups based on exercises
        if (this.populated('exercises.exercise')) {
            const muscleGroups = new Map();
            this.exercises.forEach(ex => {
                if (ex.exercise && ex.exercise.primaryMuscles) {
                    ex.exercise.primaryMuscles.forEach(muscle => {
                        muscleGroups.set(muscle, 'primary');
                    });
                }
                if (ex.exercise && ex.exercise.secondaryMuscles) {
                    ex.exercise.secondaryMuscles.forEach(muscle => {
                        if (!muscleGroups.has(muscle)) {
                            muscleGroups.set(muscle, 'secondary');
                        }
                    });
                }
            });
            
            this.muscleGroups = Array.from(muscleGroups.entries()).map(([muscle, priority]) => ({
                muscle,
                priority
            }));
        }
    }
    
    next();
});

// Increment usage count
routineSchema.methods.incrementUsage = function() {
    this.timesUsed += 1;
    return this.save();
};

// Add rating
routineSchema.methods.addRating = function(rating) {
    const currentTotal = this.rating.averageRating * this.rating.totalRatings;
    this.rating.totalRatings += 1;
    this.rating.averageRating = (currentTotal + rating) / this.rating.totalRatings;
    return this.save();
};

// Clone routine
routineSchema.methods.clone = function(userId, newName) {
    const clonedRoutine = new this.constructor({
        user: userId,
        name: newName || `${this.name} (Copy)`,
        description: this.description,
        exercises: this.exercises,
        category: this.category,
        difficulty: this.difficulty,
        tags: this.tags,
        clonedFrom: this._id
    });
    
    return clonedRoutine.save();
};

module.exports = mongoose.model('Routine', routineSchema);
