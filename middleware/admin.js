const User = require('../models/User');
const logger = require('../utils/logger');

const isAdmin = async (req, res, next) => {
    try {
        // Ensure auth middleware has already run and populated req.user
        if (!req.user || !req.user.userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Admin privileges required'
            });
        }

        // Attach full user object to request for convenience in controllers
        req.currentUser = user;
        next();
    } catch (error) {
        logger.error('Admin middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during authorization'
        });
    }
};

module.exports = isAdmin;
