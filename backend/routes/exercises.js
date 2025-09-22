const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Exercise = require('../models/Exercise');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/exercises
// @desc    Get all exercises with filters and search
// @access  Private
router.get('/', auth, [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('category').optional().isString(),
    query('equipment').optional().isString(),
    query('difficulty').optional().isIn(['Beginner', 'Intermediate', 'Advanced']),
    query('search').optional().isString().isLength({ max: 100 })
], async (req, res) => {
    try {
        // Check for validation errors
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
            limit = 20,
            category,
            equipment,
            difficulty,
            search,
            muscleGroup,
            isCustom
        } = req.query;

        // Build filter query
        let filter = {
            $or: [
                { isPublic: true },
                { createdBy: req.userId }
            ]
        };

        if (category) filter.category = category;
        if (equipment) filter.equipment = equipment;
        if (difficulty) filter.difficulty = difficulty;
        if (muscleGroup) filter.primaryMuscles = { $in: [muscleGroup] };
        if (isCustom !== undefined) {
            filter.isCustom = isCustom === 'true';
            if (isCustom === 'true') {
                filter.createdBy = req.userId;
            }
        }

        // Search functionality
        if (search) {
            filter.$text = { $search: search };
        }

        // Execute query with pagination
        const exercises = await Exercise.find(filter)
            .populate('createdBy', 'username profile.firstName profile.lastName')
            .select('-__v')
            .sort(search ? { score: { $meta: 'textScore' } } : { 'metrics.timesUsed': -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        // Get total count for pagination
        const total = await Exercise.countDocuments(filter);

        res.json({
            success: true,
            data: {
                exercises,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total,
                    hasNext: page * limit < total,
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Get exercises error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching exercises'
        });
    }
});

// @route   GET /api/exercises/:id
// @desc    Get single exercise by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const exercise = await Exercise.findById(req.params.id)
            .populate('createdBy', 'username profile.firstName profile.lastName')
            .populate('variations', 'name category equipment');

        if (!exercise) {
            return res.status(404).json({
                success: false,
                message: 'Exercise not found'
            });
        }

        // Check if user has access to this exercise
        if (!exercise.isPublic && exercise.createdBy._id.toString() !== req.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this exercise'
            });
        }

        res.json({
            success: true,
            data: { exercise }
        });

    } catch (error) {
        console.error('Get exercise error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching exercise'
        });
    }
});

// @route   POST /api/exercises
// @desc    Create a new custom exercise
// @access  Private
router.post('/', auth, [
    body('name')
        .trim()
        .notEmpty()
        .isLength({ max: 100 })
        .withMessage('Exercise name is required and must be less than 100 characters'),
    body('category')
        .isIn(['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms', 'Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Abs', 'Cardio', 'Other'])
        .withMessage('Invalid exercise category'),
    body('primaryMuscles')
        .isArray({ min: 1 })
        .withMessage('At least one primary muscle group is required'),
    body('equipment')
        .isIn(['Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight', 'Kettlebell', 'Resistance Band', 'Medicine Ball', 'Other'])
        .withMessage('Invalid equipment type'),
    body('difficulty')
        .optional()
        .isIn(['Beginner', 'Intermediate', 'Advanced'])
        .withMessage('Invalid difficulty level'),
    body('instructions')
        .optional()
        .isArray()
        .withMessage('Instructions must be an array')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const exerciseData = {
            ...req.body,
            createdBy: req.userId,
            isCustom: true,
            isPublic: req.body.isPublic || false
        };

        const exercise = new Exercise(exerciseData);
        await exercise.save();

        await exercise.populate('createdBy', 'username profile.firstName profile.lastName');

        res.status(201).json({
            success: true,
            message: 'Exercise created successfully',
            data: { exercise }
        });

    } catch (error) {
        console.error('Create exercise error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(err => ({
                    field: err.path,
                    message: err.message
                }))
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error while creating exercise'
        });
    }
});

// @route   PUT /api/exercises/:id
// @desc    Update a custom exercise
// @access  Private
router.put('/:id', auth, [
    body('name')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Exercise name must be less than 100 characters'),
    body('category')
        .optional()
        .isIn(['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms', 'Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Abs', 'Cardio', 'Other'])
        .withMessage('Invalid exercise category')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const exercise = await Exercise.findById(req.params.id);

        if (!exercise) {
            return res.status(404).json({
                success: false,
                message: 'Exercise not found'
            });
        }

        // Check if user owns this exercise
        if (exercise.createdBy.toString() !== req.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only edit your own exercises.'
            });
        }

        // Update exercise
        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined) {
                exercise[key] = req.body[key];
            }
        });

        await exercise.save();
        await exercise.populate('createdBy', 'username profile.firstName profile.lastName');

        res.json({
            success: true,
            message: 'Exercise updated successfully',
            data: { exercise }
        });

    } catch (error) {
        console.error('Update exercise error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating exercise'
        });
    }
});

// @route   DELETE /api/exercises/:id
// @desc    Delete a custom exercise
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const exercise = await Exercise.findById(req.params.id);

        if (!exercise) {
            return res.status(404).json({
                success: false,
                message: 'Exercise not found'
            });
        }

        // Check if user owns this exercise
        if (exercise.createdBy.toString() !== req.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only delete your own exercises.'
            });
        }

        await exercise.deleteOne();

        res.json({
            success: true,
            message: 'Exercise deleted successfully'
        });

    } catch (error) {
        console.error('Delete exercise error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting exercise'
        });
    }
});

// @route   GET /api/exercises/categories
// @desc    Get all exercise categories
// @access  Private
router.get('/meta/categories', auth, async (req, res) => {
    try {
        const categories = await Exercise.distinct('category');
        const equipment = await Exercise.distinct('equipment');
        const muscleGroups = await Exercise.distinct('primaryMuscles');

        res.json({
            success: true,
            data: {
                categories: categories.sort(),
                equipment: equipment.sort(),
                muscleGroups: muscleGroups.sort()
            }
        });

    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching categories'
        });
    }
});

module.exports = router;
