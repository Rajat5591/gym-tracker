const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Workout = require('../models/Workout');
const Exercise = require('../models/Exercise');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/workouts
// @desc    Get user workouts with filters and pagination
// @access  Private
router.get('/', auth, [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('isTemplate').optional().isBoolean()
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

        const {
            page = 1,
            limit = 10,
            startDate,
            endDate,
            isTemplate = false
        } = req.query;

        // Build filter
        let filter = {
            user: req.userId,
            isTemplate: isTemplate === 'true'
        };

        // Date range filter
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        const workouts = await Workout.find(filter)
            .populate('exercises.exercise', 'name category equipment primaryMuscles')
            .populate('routine', 'name category')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Workout.countDocuments(filter);

        res.json({
            success: true,
            data: {
                workouts,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        console.error('Get workouts error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching workouts'
        });
    }
});

// @route   GET /api/workouts/:id
// @desc    Get single workout
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const workout = await Workout.findOne({
            _id: req.params.id,
            user: req.userId
        })
        .populate('exercises.exercise', 'name category equipment primaryMuscles instructions media')
        .populate('routine', 'name category difficulty')
        .populate('user', 'username profile.firstName profile.lastName');

        if (!workout) {
            return res.status(404).json({
                success: false,
                message: 'Workout not found'
            });
        }

        res.json({
            success: true,
            data: { workout }
        });

    } catch (error) {
        console.error('Get workout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching workout'
        });
    }
});

// @route   POST /api/workouts
// @desc    Create new workout
// @access  Private
router.post('/', auth, [
    body('name')
        .trim()
        .notEmpty()
        .isLength({ max: 100 })
        .withMessage('Workout name is required and must be less than 100 characters'),
    body('startTime')
        .isISO8601()
        .withMessage('Valid start time is required'),
    body('exercises')
        .optional()
        .isArray()
        .withMessage('Exercises must be an array'),
    body('exercises.*.exercise')
        .isMongoId()
        .withMessage('Valid exercise ID is required'),
    body('exercises.*.sets')
        .isArray({ min: 0 })
        .withMessage('Sets must be an array')
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

        // Validate exercises exist
        if (req.body.exercises && req.body.exercises.length > 0) {
            const exerciseIds = req.body.exercises.map(ex => ex.exercise);
            const exercises = await Exercise.find({ _id: { $in: exerciseIds } });
            
            if (exercises.length !== exerciseIds.length) {
                return res.status(400).json({
                    success: false,
                    message: 'One or more exercises not found'
                });
            }
        }

        const workoutData = {
            ...req.body,
            user: req.userId,
            totalVolume: {
                value: 0,
                unit: req.body.totalVolume?.unit || req.user.preferences.units === 'metric' ? 'kg' : 'lbs'
            }
        };

        const workout = new Workout(workoutData);
        await workout.save();

        // Populate the workout
        await workout.populate('exercises.exercise', 'name category equipment primaryMuscles');
        
        // Update user stats
        const user = await User.findById(req.userId);
        user.stats.totalWorkouts += 1;
        await user.save();

        res.status(201).json({
            success: true,
            message: 'Workout created successfully',
            data: { workout }
        });

    } catch (error) {
        console.error('Create workout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating workout'
        });
    }
});

// @route   PUT /api/workouts/:id
// @desc    Update workout
// @access  Private
router.put('/:id', auth, [
    body('name')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Workout name must be less than 100 characters'),
    body('endTime')
        .optional()
        .isISO8601()
        .withMessage('Valid end time required'),
    body('exercises')
        .optional()
        .isArray()
        .withMessage('Exercises must be an array')
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

        const workout = await Workout.findOne({
            _id: req.params.id,
            user: req.userId
        });

        if (!workout) {
            return res.status(404).json({
                success: false,
                message: 'Workout not found'
            });
        }

        // Update workout fields
        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined) {
                workout[key] = req.body[key];
            }
        });

        await workout.save();
        await workout.populate('exercises.exercise', 'name category equipment primaryMuscles');

        res.json({
            success: true,
            message: 'Workout updated successfully',
            data: { workout }
        });

    } catch (error) {
        console.error('Update workout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating workout'
        });
    }
});

// @route   DELETE /api/workouts/:id
// @desc    Delete workout
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const workout = await Workout.findOne({
            _id: req.params.id,
            user: req.userId
        });

        if (!workout) {
            return res.status(404).json({
                success: false,
                message: 'Workout not found'
            });
        }

        await workout.deleteOne();

        // Update user stats
        const user = await User.findById(req.userId);
        user.stats.totalWorkouts = Math.max(0, user.stats.totalWorkouts - 1);
        await user.save();

        res.json({
            success: true,
            message: 'Workout deleted successfully'
        });

    } catch (error) {
        console.error('Delete workout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting workout'
        });
    }
});

// @route   POST /api/workouts/:id/finish
// @desc    Finish an active workout
// @access  Private
router.post('/:id/finish', auth, async (req, res) => {
    try {
        const workout = await Workout.findOne({
            _id: req.params.id,
            user: req.userId
        });

        if (!workout) {
            return res.status(404).json({
                success: false,
                message: 'Workout not found'
            });
        }

        // Set end time if not already set
        if (!workout.endTime) {
            workout.endTime = new Date();
        }

        // Calculate duration
        workout.duration = Math.round((workout.endTime - workout.startTime) / (1000 * 60));

        await workout.save();
        await workout.populate('exercises.exercise', 'name category equipment primaryMuscles');

        // Update user volume stats
        const user = await User.findById(req.userId);
        user.stats.totalVolume.value += workout.totalVolume.value;
        user.stats.totalVolume.unit = workout.totalVolume.unit;
        await user.save();

        res.json({
            success: true,
            message: 'Workout finished successfully',
            data: { workout }
        });

    } catch (error) {
        console.error('Finish workout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while finishing workout'
        });
    }
});

// @route   GET /api/workouts/stats/dashboard
// @desc    Get workout statistics for dashboard
// @access  Private
router.get('/stats/dashboard', auth, async (req, res) => {
    try {
        const userId = req.userId;
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Get this week's workouts
        const thisWeekWorkouts = await Workout.find({
            user: userId,
            createdAt: { $gte: startOfWeek },
            isTemplate: false
        });

        // Get this month's workouts
        const thisMonthWorkouts = await Workout.find({
            user: userId,
            createdAt: { $gte: startOfMonth },
            isTemplate: false
        });

        // Get recent workouts
        const recentWorkouts = await Workout.find({
            user: userId,
            isTemplate: false
        })
        .populate('exercises.exercise', 'name category')
        .sort({ createdAt: -1 })
        .limit(5);

        // Calculate weekly volume data
        const weeklyVolumeData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const startOfDay = new Date(date.setHours(0, 0, 0, 0));
            const endOfDay = new Date(date.setHours(23, 59, 59, 999));

            const dayWorkouts = await Workout.find({
                user: userId,
                createdAt: { $gte: startOfDay, $lte: endOfDay },
                isTemplate: false
            });

            const totalVolume = dayWorkouts.reduce((sum, workout) => 
                sum + (workout.totalVolume.value || 0), 0);

            weeklyVolumeData.push({
                date: startOfDay.toISOString().split('T')[0],
                day: startOfDay.toLocaleDateString('en-US', { weekday: 'short' }),
                volume: totalVolume
            });
        }

        const stats = {
            thisWeek: {
                workouts: thisWeekWorkouts.length,
                totalVolume: thisWeekWorkouts.reduce((sum, w) => sum + (w.totalVolume.value || 0), 0),
                totalDuration: thisWeekWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0)
            },
            thisMonth: {
                workouts: thisMonthWorkouts.length,
                totalVolume: thisMonthWorkouts.reduce((sum, w) => sum + (w.totalVolume.value || 0), 0),
                totalDuration: thisMonthWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0)
            },
            recentWorkouts: recentWorkouts.slice(0, 3),
            weeklyVolumeData
        };

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching dashboard stats'
        });
    }
});

module.exports = router;
