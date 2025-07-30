const express = require('express');
const { body } = require('express-validator');
const {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email invalide'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Le mot de passe doit contenir au moins 6 caractères')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
    body('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
    body('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
    body('role')
        .isIn(['professor', 'student'])
        .withMessage('Le rôle doit être professor ou student')
];

const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email invalide'),
    body('password')
        .notEmpty()
        .withMessage('Mot de passe requis')
];

const updateProfileValidation = [
    body('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
    body('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Le nom doit contenir entre 2 et 50 caractères')
];

const changePasswordValidation = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Mot de passe actuel requis'),
    body('newPassword')
        .isLength({ min: 6 })
        .withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Le nouveau mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfileValidation, updateProfile);
router.put('/change-password', authenticateToken, changePasswordValidation, changePassword);

module.exports = router;