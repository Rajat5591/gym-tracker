const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username must be less than 30 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    profile: {
        firstName: {
            type: String,
            trim: true,
            maxlength: [50, 'First name must be less than 50 characters']
        },
        lastName: {
            type: String,
            trim: true,
            maxlength: [50, 'Last name must be less than 50 characters']
        },
        age: {
            type: Number,
            min: [13, 'Age must be at least 13'],
            max: [120, 'Age must be realistic']
        },
        weight: {
            value: Number,
            unit: {
                type: String,
                enum: ['lbs', 'kg'],
                default: 'lbs'
            }
        },
        height: {
            feet: Number,
            inches: Number,
            cm: Number
        },
        profilePicture: String,
        bio: {
            type: String,
            maxlength: [500, 'Bio must be less than 500 characters']
        },
        fitnessGoal: {
            type: String,
            enum: ['strength', 'muscle', 'endurance', 'weight_loss', 'general_fitness'],
            default: 'general_fitness'
        }
    },
    preferences: {
        units: {
            type: String,
            enum: ['imperial', 'metric'],
            default: 'imperial'
        },
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'dark'
        },
        defaultRestTime: {
            type: Number,
            default: 90 // seconds
        },
        notifications: {
            workoutReminders: {
                type: Boolean,
                default: true
            },
            socialUpdates: {
                type: Boolean,
                default: true
            }
        }
    },
    stats: {
        totalWorkouts: {
            type: Number,
            default: 0
        },
        totalVolume: {
            value: {
                type: Number,
                default: 0
            },
            unit: String
        },
        currentStreak: {
            type: Number,
            default: 0
        },
        longestStreak: {
            type: Number,
            default: 0
        },
        personalRecords: [{
            exercise: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Exercise'
            },
            weight: Number,
            reps: Number,
            date: {
                type: Date,
                default: Date.now
            }
        }]
    },
    social: {
        followers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        following: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        isPublic: {
            type: Boolean,
            default: false
        }
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, {
    timestamps: true
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'social.followers': 1 });
userSchema.index({ 'social.following': 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Update last active
userSchema.methods.updateLastActive = function() {
    this.lastActive = new Date();
    return this.save();
};

// Get full name
userSchema.virtual('fullName').get(function() {
    if (this.profile.firstName && this.profile.lastName) {
        return `${this.profile.firstName} ${this.profile.lastName}`;
    }
    return this.username;
});

// Transform JSON output
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    delete user.resetPasswordToken;
    delete user.resetPasswordExpires;
    return user;
};

module.exports = mongoose.model('User', userSchema);
