const express = require('express');
const { body } = require('express-validator');
const {
    createClass,
    getUserClasses,
    getClassDetails,
    joinClassByCode,
    updateClass,
    deleteClass,
    addStudentByEmail
} = require('../controllers/classController');
const { authenticateToken, requireProfessor, requireStudent } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createClassValidation = [
    body('name')
        .trim()
        .isLength({ min: 3, max: 255 })
        .withMessage('Le nom de la classe doit contenir entre 3 et 255 caractères'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('La description ne peut pas dépasser 1000 caractères'),
    body('academicYear')
        .matches(/^\d{4}-\d{4}$/)
        .withMessage('L\'année académique doit être au format YYYY-YYYY (ex: 2023-2024)'),
    body('semester')
        .isIn(['1', '2'])
        .withMessage('Le semestre doit être 1 ou 2')
];

const updateClassValidation = [
    body('name')
        .trim()
        .isLength({ min: 3, max: 255 })
        .withMessage('Le nom de la classe doit contenir entre 3 et 255 caractères'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('La description ne peut pas dépasser 1000 caractères'),
    body('academicYear')
        .matches(/^\d{4}-\d{4}$/)
        .withMessage('L\'année académique doit être au format YYYY-YYYY (ex: 2023-2024)'),
    body('semester')
        .isIn(['1', '2'])
        .withMessage('Le semestre doit être 1 ou 2')
];

const joinClassValidation = [
    body('classCode')
        .trim()
        .isLength({ min: 6, max: 10 })
        .isAlphanumeric()
        .withMessage('Code de classe invalide')
];

const addStudentValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email invalide')
];

// Routes

// Get all classes for current user
router.get('/', authenticateToken, getUserClasses);

// Create new class (professor only)
router.post('/', authenticateToken, requireProfessor, createClassValidation, createClass);

// Join class by code (student only)
router.post('/join', authenticateToken, requireStudent, joinClassValidation, joinClassByCode);

// Get specific class details
router.get('/:id', authenticateToken, getClassDetails);

// Update class (professor only)
router.put('/:id', authenticateToken, requireProfessor, updateClassValidation, updateClass);

// Delete class (professor only)
router.delete('/:id', authenticateToken, requireProfessor, deleteClass);

// Add student by email (professor only)
router.post('/:id/students', authenticateToken, requireProfessor, addStudentValidation, addStudentByEmail);

module.exports = router;