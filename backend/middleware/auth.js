const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        let token;
        
        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        
        // Check for token in cookies
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }
        
        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Find user and attach to request
            const user = await User.findById(decoded.userId).select('-password');
            
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token. User not found.'
                });
            }
            
            // Update last active
            user.updateLastActive();
            
            req.user = user;
            req.userId = user._id;
            next();
            
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token.'
                });
            } else if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired. Please log in again.'
                });
            } else {
                throw error;
            }
        }
        
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during authentication'
        });
    }
};

// Middleware to check if user is admin (optional)
const adminAuth = async (req, res, next) => {
    try {
        await auth(req, res, () => {
            if (req.user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Admin privileges required.'
                });
            }
            next();
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error during admin authentication'
        });
    }
};

// Middleware to check if user owns the resource
const ownerAuth = (model) => {
    return async (req, res, next) => {
        try {
            const Model = require(`../models/${model}`);
            const resource = await Model.findById(req.params.id);
            
            if (!resource) {
                return res.status(404).json({
                    success: false,
                    message: `${model} not found`
                });
            }
            
            if (resource.user.toString() !== req.userId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. You can only access your own resources.'
                });
            }
            
            req.resource = resource;
            next();
            
        } catch (error) {
            console.error('Owner auth error:', error);
            return res.status(500).json({
                success: false,
                message: 'Server error during ownership verification'
            });
        }
    };
};

module.exports = { auth, adminAuth, ownerAuth };
