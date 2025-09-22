const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Username can only contain letters, numbers, hyphens, and underscores'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
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

        const { username, email, password, firstName, lastName } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { username: username.toLowerCase() }
            ]
        });

        if (existingUser) {
            const field = existingUser.email === email.toLowerCase() ? 'email' : 'username';
            return res.status(400).json({
                success: false,
                message: `User with this ${field} already exists`
            });
        }

        // Create new user
        const user = new User({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password,
            profile: {
                firstName,
                lastName
            }
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        // Return success response
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    profile: user.profile,
                    preferences: user.preferences
                }
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
    body('login')
        .notEmpty()
        .withMessage('Username or email is required'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
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

        const { login, password } = req.body;

        // Find user by email or username
        const user = await User.findOne({
            $or: [
                { email: login.toLowerCase() },
                { username: login.toLowerCase() }
            ]
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last active
        await user.updateLastActive();

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    profile: user.profile,
                    preferences: user.preferences,
                    stats: user.stats
                }
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .populate('stats.personalRecords.exercise', 'name category')
            .select('-password');

        res.json({
            success: true,
            data: { user }
        });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching user data'
        });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
    body('profile.firstName')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('First name must be less than 50 characters'),
    body('profile.lastName')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Last name must be less than 50 characters'),
    body('profile.age')
        .optional()
        .isInt({ min: 13, max: 120 })
        .withMessage('Age must be between 13 and 120'),
    body('preferences.units')
        .optional()
        .isIn(['imperial', 'metric'])
        .withMessage('Units must be either imperial or metric'),
    body('preferences.theme')
        .optional()
        .isIn(['light', 'dark'])
        .withMessage('Theme must be either light or dark')
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

        const updates = req.body;
        const user = await User.findById(req.userId);

        // Update profile fields
        if (updates.profile) {
            Object.keys(updates.profile).forEach(key => {
                if (updates.profile[key] !== undefined) {
                    user.profile[key] = updates.profile[key];
                }
            });
        }

        // Update preferences
        if (updates.preferences) {
            Object.keys(updates.preferences).forEach(key => {
                if (updates.preferences[key] !== undefined) {
                    user.preferences[key] = updates.preferences[key];
                }
            });
        }

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating profile'
        });
    }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', auth, [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number')
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

        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.userId);

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while changing password'
        });
    }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', auth, (req, res) => {
    // In a stateless JWT setup, logout is handled client-side
    // by removing the token from storage
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

module.exports = router;
