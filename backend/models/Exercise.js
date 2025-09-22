const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Exercise name is required'],
        trim: true,
        maxlength: [100, 'Exercise name must be less than 100 characters']
    },
    category: {
        type: String,
        required: [true, 'Exercise category is required'],
        enum: [
            'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms',
            'Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Abs', 'Cardio', 'Other'
        ]
    },
    primaryMuscles: [{
        type: String,
        required: true
    }],
    secondaryMuscles: [{
        type: String
    }],
    equipment: {
        type: String,
        required: [true, 'Equipment type is required'],
        enum: [
            'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight', 
            'Kettlebell', 'Resistance Band', 'Medicine Ball', 'Other'
        ]
    },
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Beginner'
    },
    instructions: [{
        step: Number,
        description: {
            type: String,
            required: true,
            maxlength: [500, 'Instruction must be less than 500 characters']
        }
    }],
    tips: [{
        type: String,
        maxlength: [200, 'Tip must be less than 200 characters']
    }],
    media: {
        images: [{
            url: String,
            caption: String,
            isMainImage: {
                type: Boolean,
                default: false
            }
        }],
        videoUrl: String,
        gifUrl: String
    },
    metrics: {
        averageRating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        },
        totalRatings: {
            type: Number,
            default: 0
        },
        timesUsed: {
            type: Number,
            default: 0
        }
    },
    variations: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exercise'
    }],
    isCustom: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    tags: [{
        type: String,
        lowercase: true
    }]
}, {
    timestamps: true
});

// Indexes for performance
exerciseSchema.index({ name: 'text', category: 1 });
exerciseSchema.index({ category: 1, equipment: 1 });
exerciseSchema.index({ primaryMuscles: 1 });
exerciseSchema.index({ isCustom: 1, createdBy: 1 });
exerciseSchema.index({ isPublic: 1 });

// Update times used when exercise is added to workout
exerciseSchema.methods.incrementUsage = function() {
    this.metrics.timesUsed += 1;
    return this.save();
};

// Add rating
exerciseSchema.methods.addRating = function(rating) {
    const currentTotal = this.metrics.averageRating * this.metrics.totalRatings;
    this.metrics.totalRatings += 1;
    this.metrics.averageRating = (currentTotal + rating) / this.metrics.totalRatings;
    return this.save();
};

module.exports = mongoose.model('Exercise', exerciseSchema);
