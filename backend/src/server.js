const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const classRoutes = require('./routes/classRoutes');
const groupRoutes = require('./routes/groupRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: {
        success: false,
        message: 'Trop de requêtes, veuillez réessayer plus tard.'
    }
});
app.use(limiter);

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (for uploaded files)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/groups', groupRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Enhanced Classroom API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint non trouvé'
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    
    // Mongoose validation error
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Données invalides',
            errors: Object.values(error.errors).map(err => err.message)
        });
    }
    
    // JWT errors
    if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Token invalide'
        });
    }
    
    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expiré'
        });
    }
    
    // MySQL errors
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            success: false,
            message: 'Cette entrée existe déjà'
        });
    }
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
            success: false,
            message: 'Référence invalide'
        });
    }
    
    // File upload errors
    if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            success: false,
            message: 'Fichier trop volumineux'
        });
    }
    
    // Default error
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Erreur interne du serveur'
    });
});

// Start server
const startServer = async () => {
    try {
        // Test database connection
        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.error('❌ Cannot start server: Database connection failed');
            process.exit(1);
        }
        
        // Create uploads directory if it doesn't exist
        const fs = require('fs');
        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
            console.log('📁 Created uploads directory');
        }
        
        app.listen(PORT, () => {
            console.log(`
🚀 Enhanced Classroom API Server Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Environment: ${process.env.NODE_ENV || 'development'}
🔌 Port: ${PORT}
📍 URL: http://localhost:${PORT}
📊 Health Check: http://localhost:${PORT}/api/health
🔒 CORS Origin: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            `);
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

startServer();