const express = require('express');
const { body } = require('express-validator');
const {
    createGroup,
    getClassGroups,
    getGroupDetails,
    addMemberToGroup,
    removeMemberFromGroup,
    updateGroup,
    deleteGroup,
    getAvailableStudents
} = require('../controllers/groupController');
const { authenticateToken, requireProfessor } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createGroupValidation = [
    body('name')
        .trim()
        .isLength({ min: 3, max: 255 })
        .withMessage('Le nom du groupe doit contenir entre 3 et 255 caractères'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('La description ne peut pas dépasser 1000 caractères'),
    body('coordinatorId')
        .isInt({ min: 1 })
        .withMessage('ID du coordinateur invalide'),
    body('maxMembers')
        .optional()
        .isInt({ min: 2, max: 10 })
        .withMessage('Le nombre maximum de membres doit être entre 2 et 10'),
    body('classId')
        .isInt({ min: 1 })
        .withMessage('ID de classe invalide')
];

const updateGroupValidation = [
    body('name')
        .trim()
        .isLength({ min: 3, max: 255 })
        .withMessage('Le nom du groupe doit contenir entre 3 et 255 caractères'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('La description ne peut pas dépasser 1000 caractères'),
    body('maxMembers')
        .optional()
        .isInt({ min: 2, max: 10 })
        .withMessage('Le nombre maximum de membres doit être entre 2 et 10')
];

const addMemberValidation = [
    body('studentId')
        .isInt({ min: 1 })
        .withMessage('ID de l\'étudiant invalide')
];

// Routes

// Get groups for a specific class
router.get('/class/:classId', authenticateToken, getClassGroups);

// Get available students for a class (not in any group)
router.get('/class/:classId/available-students', authenticateToken, getAvailableStudents);

// Create new group (professor only)
router.post('/', authenticateToken, requireProfessor, createGroupValidation, createGroup);

// Get specific group details
router.get('/:id', authenticateToken, getGroupDetails);

// Update group
router.put('/:id', authenticateToken, updateGroupValidation, updateGroup);

// Delete group (professor only)
router.delete('/:id', authenticateToken, requireProfessor, deleteGroup);

// Add member to group
router.post('/:id/members', authenticateToken, addMemberValidation, addMemberToGroup);

// Remove member from group
router.delete('/:id/members/:studentId', authenticateToken, removeMemberFromGroup);

module.exports = router;