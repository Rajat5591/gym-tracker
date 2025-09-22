const express = require('express');
const { body, query, validationResult } = require('express-validator');
const User = require('../models/User');
const Workout = require('../models/Workout');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .populate('stats.personalRecords.exercise', 'name category')
            .select('-password');

        res.json({
            success: true,
            data: { user }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching profile'
        });
    }
});

// @route   GET /api/users/stats
// @desc    Get detailed user statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
    try {
        const { timeframe = '30' } = req.query;
        
        const daysAgo = parseInt(timeframe);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysAgo);

        // Get workouts in timeframe
        const workouts = await Workout.find({
            user: req.userId,
            createdAt: { $gte: startDate },
            isTemplate: false
        }).populate('exercises.exercise', 'name category primaryMuscles');

        // Calculate stats
        const stats = {
            totalWorkouts: workouts.length,
            totalVolume: workouts.reduce((sum, w) => sum + (w.totalVolume.value || 0), 0),
            totalDuration: workouts.reduce((sum, w) => sum + (w.duration || 0), 0),
            averageWorkoutDuration: workouts.length ? 
                Math.round(workouts.reduce((sum, w) => sum + (w.duration || 0), 0) / workouts.length) : 0,
            
            // Muscle group distribution
            muscleGroups: {},
            
            // Weekly breakdown
            weeklyData: []
        };

        // Calculate muscle group stats
        workouts.forEach(workout => {
            workout.exercises.forEach(ex => {
                if (ex.exercise && ex.exercise.primaryMuscles) {
                    ex.exercise.primaryMuscles.forEach(muscle => {
                        if (!stats.muscleGroups[muscle]) {
                            stats.muscleGroups[muscle] = { sets: 0, volume: 0 };
                        }
                        stats.muscleGroups[muscle].sets += ex.sets.length;
                        ex.sets.forEach(set => {
                            stats.muscleGroups[muscle].volume += 
                                (set.weight.value || 0) * (set.reps || 0);
                        });
                    });
                }
            });
        });

        // Calculate weekly data
        const weeks = Math.ceil(daysAgo / 7);
        for (let i = 0; i < weeks; i++) {
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - (i * 7));
            const weekEnd = new Date();
            weekEnd.setDate(weekEnd.getDate() - ((i + 1) * 7));

            const weekWorkouts = workouts.filter(w => 
                w.createdAt >= weekEnd && w.createdAt < weekStart
            );

            stats.weeklyData.unshift({
                week: `Week ${weeks - i}`,
                workouts: weekWorkouts.length,
                volume: weekWorkouts.reduce((sum, w) => sum + (w.totalVolume.value || 0), 0),
                duration: weekWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0)
            });
        }

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching statistics'
        });
    }
});

// @route   POST /api/users/personal-record
// @desc    Add a personal record
// @access  Private
router.post('/personal-record', auth, [
    body('exercise')
        .isMongoId()
        .withMessage('Valid exercise ID is required'),
    body('weight')
        .isNumeric()
        .withMessage('Valid weight is required'),
    body('reps')
        .isInt({ min: 1 })
        .withMessage('Valid reps are required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { exercise, weight, reps } = req.body;
        
        const user = await User.findById(req.userId);
        
        // Check if PR already exists for this exercise
        const existingPRIndex = user.stats.personalRecords.findIndex(
            pr => pr.exercise.toString() === exercise
        );

        const newPR = { exercise, weight, reps, date: new Date() };

        if (existingPRIndex >= 0) {
            // Update existing PR
            user.stats.personalRecords[existingPRIndex] = newPR;
        } else {
            // Add new PR
            user.stats.personalRecords.push(newPR);
        }

        await user.save();
        await user.populate('stats.personalRecords.exercise', 'name category');

        res.json({
            success: true,
            message: 'Personal record updated successfully',
            data: { personalRecords: user.stats.personalRecords }
        });

    } catch (error) {
        console.error('Add PR error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while adding personal record'
        });
    }
});

// @route   GET /api/users/search
// @desc    Search for users (for social features)
// @access  Private
router.get('/search', auth, [
    query('q').notEmpty().withMessage('Search query is required'),
    query('limit').optional().isInt({ min: 1, max: 20 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { q, limit = 10 } = req.query;
        
        const users = await User.find({
            $and: [
                { _id: { $ne: req.userId } }, // Exclude current user
                { 'social.isPublic': true }, // Only public profiles
                {
                    $or: [
                        { username: { $regex: q, $options: 'i' } },
                        { 'profile.firstName': { $regex: q, $options: 'i' } },
                        { 'profile.lastName': { $regex: q, $options: 'i' } }
                    ]
                }
            ]
        })
        .select('username profile.firstName profile.lastName profile.profilePicture stats.totalWorkouts')
        .limit(parseInt(limit));

        res.json({
            success: true,
            data: { users }
        });

    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while searching users'
        });
    }
});

// @route   POST /api/users/follow/:userId
// @desc    Follow/unfollow a user
// @access  Private
router.post('/follow/:userId', auth, async (req, res) => {
    try {
        const targetUserId = req.params.userId;
        
        if (targetUserId === req.userId.toString()) {
            return res.status(400).json({
                success: false,
                message: 'You cannot follow yourself'
            });
        }

        const [currentUser, targetUser] = await Promise.all([
            User.findById(req.userId),
            User.findById(targetUserId)
        ]);

        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isFollowing = currentUser.social.following.includes(targetUserId);

        if (isFollowing) {
            // Unfollow
            currentUser.social.following = currentUser.social.following.filter(
                id => id.toString() !== targetUserId
            );
            targetUser.social.followers = targetUser.social.followers.filter(
                id => id.toString() !== req.userId.toString()
            );
        } else {
            // Follow
            currentUser.social.following.push(targetUserId);
            targetUser.social.followers.push(req.userId);
        }

        await Promise.all([currentUser.save(), targetUser.save()]);

        res.json({
            success: true,
            message: isFollowing ? 'User unfollowed successfully' : 'User followed successfully',
            data: { 
                isFollowing: !isFollowing,
                followersCount: targetUser.social.followers.length,
                followingCount: currentUser.social.following.length
            }
        });

    } catch (error) {
        console.error('Follow user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while following user'
        });
    }
});

module.exports = router;
