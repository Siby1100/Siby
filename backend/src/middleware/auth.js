const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Token d\'accès requis' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verify user still exists and is active
        const [users] = await pool.execute(
            'SELECT id, email, first_name, last_name, role, is_active FROM users WHERE id = ? AND is_active = true',
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Utilisateur non trouvé ou inactif' 
            });
        }

        req.user = users[0];
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Token expiré' 
            });
        }
        
        return res.status(403).json({ 
            success: false, 
            message: 'Token invalide' 
        });
    }
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentification requise' 
            });
        }

        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Permissions insuffisantes' 
            });
        }

        next();
    };
};

const requireProfessor = requireRole('professor');
const requireStudent = requireRole('student');

module.exports = {
    authenticateToken,
    requireRole,
    requireProfessor,
    requireStudent
};