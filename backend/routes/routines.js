const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Routine = require('../models/Routine');
const Exercise = require('../models/Exercise');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/routines
// @desc    Get user routines
// @access  Private
router.get('/', auth, [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('category').optional().isString(),
    query('isPublic').optional().isBoolean()
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
            category,
            isPublic
        } = req.query;

        // Build filter
        let filter = {
            $or: [
                { user: req.userId },
                { isPublic: true }
            ]
        };

        if (category) filter.category = category;
        if (isPublic !== undefined) filter.isPublic = isPublic === 'true';

        const routines = await Routine.find(filter)
            .populate('exercises.exercise', 'name category equipment primaryMuscles')
            .populate('user', 'username profile.firstName profile.lastName')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Routine.countDocuments(filter);

        res.json({
            success: true,
            data: {
                routines,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        console.error('Get routines error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching routines'
        });
    }
});

// @route   GET /api/routines/:id
// @desc    Get single routine
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const routine = await Routine.findById(req.params.id)
            .populate('exercises.exercise', 'name category equipment primaryMuscles instructions media')
            .populate('user', 'username profile.firstName profile.lastName')
            .populate('clonedFrom', 'name user');

        if (!routine) {
            return res.status(404).json({
                success: false,
                message: 'Routine not found'
            });
        }

        // Check if user has access
        if (!routine.isPublic && routine.user._id.toString() !== req.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this routine'
            });
        }

        res.json({
            success: true,
            data: { routine }
        });

    } catch (error) {
        console.error('Get routine error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching routine'
        });
    }
});

// @route   POST /api/routines
// @desc    Create new routine
// @access  Private
router.post('/', auth, [
    body('name')
        .trim()
        .notEmpty()
        .isLength({ max: 100 })
        .withMessage('Routine name is required and must be less than 100 characters'),
    body('exercises')
        .isArray({ min: 1 })
        .withMessage('At least one exercise is required'),
    body('exercises.*.exercise')
        .isMongoId()
        .withMessage('Valid exercise ID is required'),
    body('exercises.*.targetSets')
        .isInt({ min: 1 })
        .withMessage('Target sets must be at least 1'),
    body('exercises.*.targetReps')
        .notEmpty()
        .withMessage('Target reps is required'),
    body('category')
        .optional()
        .isIn(['Full Body', 'Upper/Lower', 'Push/Pull/Legs', 'Body Part Split', 'Strength', 'Hypertrophy', 'Endurance', 'Custom'])
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
        const exerciseIds = req.body.exercises.map(ex => ex.exercise);
        const exercises = await Exercise.find({ _id: { $in: exerciseIds } });
        
        if (exercises.length !== exerciseIds.length) {
            return res.status(400).json({
                success: false,
                message: 'One or more exercises not found'
            });
        }

        const routineData = {
            ...req.body,
            user: req.userId
        };

        const routine = new Routine(routineData);
        await routine.save();

        await routine.populate('exercises.exercise', 'name category equipment primaryMuscles');

        res.status(201).json({
            success: true,
            message: 'Routine created successfully',
            data: { routine }
        });

    } catch (error) {
        console.error('Create routine error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating routine'
        });
    }
});

// @route   PUT /api/routines/:id
// @desc    Update routine
// @access  Private
router.put('/:id', auth, [
    body('name')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Routine name must be less than 100 characters')
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

        const routine = await Routine.findById(req.params.id);

        if (!routine) {
            return res.status(404).json({
                success: false,
                message: 'Routine not found'
            });
        }

        // Check ownership
        if (routine.user.toString() !== req.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only edit your own routines.'
            });
        }

        // Update routine
        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined) {
                routine[key] = req.body[key];
            }
        });

        await routine.save();
        await routine.populate('exercises.exercise', 'name category equipment primaryMuscles');

        res.json({
            success: true,
            message: 'Routine updated successfully',
            data: { routine }
        });

    } catch (error) {
        console.error('Update routine error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating routine'
        });
    }
});

// @route   DELETE /api/routines/:id
// @desc    Delete routine
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const routine = await Routine.findById(req.params.id);

        if (!routine) {
            return res.status(404).json({
                success: false,
                message: 'Routine not found'
            });
        }

        // Check ownership
        if (routine.user.toString() !== req.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only delete your own routines.'
            });
        }

        await routine.deleteOne();

        res.json({
            success: true,
            message: 'Routine deleted successfully'
        });

    } catch (error) {
        console.error('Delete routine error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting routine'
        });
    }
});

// @route   POST /api/routines/:id/clone
// @desc    Clone a routine
// @access  Private
router.post('/:id/clone', auth, [
    body('name')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('New routine name must be less than 100 characters')
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

        const originalRoutine = await Routine.findById(req.params.id);

        if (!originalRoutine) {
            return res.status(404).json({
                success: false,
                message: 'Routine not found'
            });
        }

        // Check if routine is public or owned by user
        if (!originalRoutine.isPublic && originalRoutine.user.toString() !== req.userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to clone this routine'
            });
        }

        const newName = req.body.name || `${originalRoutine.name} (Copy)`;
        const clonedRoutine = await originalRoutine.clone(req.userId, newName);

        await clonedRoutine.populate('exercises.exercise', 'name category equipment primaryMuscles');

        res.status(201).json({
            success: true,
            message: 'Routine cloned successfully',
            data: { routine: clonedRoutine }
        });

    } catch (error) {
        console.error('Clone routine error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while cloning routine'
        });
    }
});

module.exports = router;
