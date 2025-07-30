const { validationResult } = require('express-validator');
const { pool } = require('../config/database');

// Generate unique class code
const generateClassCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// Create new class (professor only)
const createClass = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: errors.array()
            });
        }

        const { name, description, academicYear, semester } = req.body;
        const professorId = req.user.id;

        // Generate unique class code
        let classCode;
        let isUnique = false;
        let attempts = 0;

        while (!isUnique && attempts < 10) {
            classCode = generateClassCode();
            const [existing] = await pool.execute(
                'SELECT id FROM classes WHERE class_code = ?',
                [classCode]
            );
            isUnique = existing.length === 0;
            attempts++;
        }

        if (!isUnique) {
            return res.status(500).json({
                success: false,
                message: 'Impossible de générer un code de classe unique'
            });
        }

        // Create class
        const [result] = await pool.execute(
            `INSERT INTO classes (name, description, class_code, professor_id, academic_year, semester) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, description, classCode, professorId, academicYear, semester]
        );

        // Get created class with professor info
        const [newClass] = await pool.execute(
            `SELECT c.*, u.first_name as professor_first_name, u.last_name as professor_last_name
             FROM classes c
             JOIN users u ON c.professor_id = u.id
             WHERE c.id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: 'Classe créée avec succès',
            data: newClass[0]
        });
    } catch (error) {
        console.error('Create class error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
};

// Get classes for current user
const getUserClasses = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let query, params;

        if (userRole === 'professor') {
            // Get classes taught by professor
            query = `
                SELECT c.*, 
                       COUNT(DISTINCT ce.student_id) as student_count,
                       COUNT(DISTINCT g.id) as group_count
                FROM classes c
                LEFT JOIN class_enrollments ce ON c.id = ce.class_id
                LEFT JOIN groups g ON c.id = g.class_id
                WHERE c.professor_id = ? AND c.is_active = true
                GROUP BY c.id
                ORDER BY c.created_at DESC
            `;
            params = [userId];
        } else {
            // Get classes enrolled by student
            query = `
                SELECT c.*, u.first_name as professor_first_name, u.last_name as professor_last_name,
                       COUNT(DISTINCT ce2.student_id) as student_count,
                       COUNT(DISTINCT g.id) as group_count,
                       g2.id as user_group_id, g2.name as user_group_name,
                       (g2.coordinator_id = ?) as is_coordinator
                FROM classes c
                JOIN users u ON c.professor_id = u.id
                JOIN class_enrollments ce ON c.id = ce.class_id
                LEFT JOIN class_enrollments ce2 ON c.id = ce2.class_id
                LEFT JOIN groups g ON c.id = g.class_id
                LEFT JOIN group_members gm ON ce.student_id = gm.student_id
                LEFT JOIN groups g2 ON gm.group_id = g2.id AND g2.class_id = c.id
                WHERE ce.student_id = ? AND c.is_active = true
                GROUP BY c.id, g2.id
                ORDER BY c.created_at DESC
            `;
            params = [userId, userId];
        }

        const [classes] = await pool.execute(query, params);

        res.json({
            success: true,
            data: classes
        });
    } catch (error) {
        console.error('Get user classes error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
};

// Get class details
const getClassDetails = async (req, res) => {
    try {
        const classId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Check if user has access to this class
        let accessQuery;
        if (userRole === 'professor') {
            accessQuery = 'SELECT id FROM classes WHERE id = ? AND professor_id = ?';
        } else {
            accessQuery = `
                SELECT c.id FROM classes c
                JOIN class_enrollments ce ON c.id = ce.class_id
                WHERE c.id = ? AND ce.student_id = ?
            `;
        }

        const [access] = await pool.execute(accessQuery, [classId, userId]);
        if (access.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé à cette classe'
            });
        }

        // Get class details
        const [classDetails] = await pool.execute(
            `SELECT c.*, u.first_name as professor_first_name, u.last_name as professor_last_name
             FROM classes c
             JOIN users u ON c.professor_id = u.id
             WHERE c.id = ?`,
            [classId]
        );

        if (classDetails.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Classe non trouvée'
            });
        }

        // Get enrolled students
        const [students] = await pool.execute(
            `SELECT u.id, u.first_name, u.last_name, u.email, ce.enrolled_at,
                    g.id as group_id, g.name as group_name, (g.coordinator_id = u.id) as is_coordinator
             FROM class_enrollments ce
             JOIN users u ON ce.student_id = u.id
             LEFT JOIN group_members gm ON u.id = gm.student_id
             LEFT JOIN groups g ON gm.group_id = g.id AND g.class_id = ?
             WHERE ce.class_id = ?
             ORDER BY u.last_name, u.first_name`,
            [classId, classId]
        );

        // Get groups
        const [groups] = await pool.execute(
            `SELECT g.*, u.first_name as coordinator_first_name, u.last_name as coordinator_last_name,
                    COUNT(gm.student_id) as member_count
             FROM groups g
             JOIN users u ON g.coordinator_id = u.id
             LEFT JOIN group_members gm ON g.id = gm.group_id
             WHERE g.class_id = ?
             GROUP BY g.id
             ORDER BY g.name`,
            [classId]
        );

        // Get assignments count
        const [assignmentCount] = await pool.execute(
            'SELECT COUNT(*) as count FROM assignments WHERE class_id = ?',
            [classId]
        );

        res.json({
            success: true,
            data: {
                class: classDetails[0],
                students,
                groups,
                assignmentCount: assignmentCount[0].count
            }
        });
    } catch (error) {
        console.error('Get class details error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
};

// Join class by code (student only)
const joinClassByCode = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: errors.array()
            });
        }

        const { classCode } = req.body;
        const studentId = req.user.id;

        // Find class by code
        const [classes] = await pool.execute(
            'SELECT id, name, professor_id FROM classes WHERE class_code = ? AND is_active = true',
            [classCode]
        );

        if (classes.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Code de classe invalide'
            });
        }

        const classId = classes[0].id;

        // Check if student is already enrolled
        const [existing] = await pool.execute(
            'SELECT id FROM class_enrollments WHERE class_id = ? AND student_id = ?',
            [classId, studentId]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Vous êtes déjà inscrit à cette classe'
            });
        }

        // Enroll student
        await pool.execute(
            'INSERT INTO class_enrollments (class_id, student_id) VALUES (?, ?)',
            [classId, studentId]
        );

        // Get class details
        const [classInfo] = await pool.execute(
            `SELECT c.*, u.first_name as professor_first_name, u.last_name as professor_last_name
             FROM classes c
             JOIN users u ON c.professor_id = u.id
             WHERE c.id = ?`,
            [classId]
        );

        res.json({
            success: true,
            message: 'Inscription réussie',
            data: classInfo[0]
        });
    } catch (error) {
        console.error('Join class error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
};

// Update class (professor only)
const updateClass = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: errors.array()
            });
        }

        const classId = req.params.id;
        const professorId = req.user.id;
        const { name, description, academicYear, semester } = req.body;

        // Check if professor owns this class
        const [existingClass] = await pool.execute(
            'SELECT id FROM classes WHERE id = ? AND professor_id = ?',
            [classId, professorId]
        );

        if (existingClass.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé à cette classe'
            });
        }

        // Update class
        await pool.execute(
            `UPDATE classes 
             SET name = ?, description = ?, academic_year = ?, semester = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [name, description, academicYear, semester, classId]
        );

        // Get updated class
        const [updatedClass] = await pool.execute(
            'SELECT * FROM classes WHERE id = ?',
            [classId]
        );

        res.json({
            success: true,
            message: 'Classe mise à jour avec succès',
            data: updatedClass[0]
        });
    } catch (error) {
        console.error('Update class error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
};

// Delete class (professor only)
const deleteClass = async (req, res) => {
    try {
        const classId = req.params.id;
        const professorId = req.user.id;

        // Check if professor owns this class
        const [existingClass] = await pool.execute(
            'SELECT id FROM classes WHERE id = ? AND professor_id = ?',
            [classId, professorId]
        );

        if (existingClass.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé à cette classe'
            });
        }

        // Soft delete (mark as inactive)
        await pool.execute(
            'UPDATE classes SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [classId]
        );

        res.json({
            success: true,
            message: 'Classe supprimée avec succès'
        });
    } catch (error) {
        console.error('Delete class error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
};

// Add student by email (professor only)
const addStudentByEmail = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: errors.array()
            });
        }

        const classId = req.params.id;
        const professorId = req.user.id;
        const { email } = req.body;

        // Check if professor owns this class
        const [existingClass] = await pool.execute(
            'SELECT id FROM classes WHERE id = ? AND professor_id = ?',
            [classId, professorId]
        );

        if (existingClass.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé à cette classe'
            });
        }

        // Find student by email
        const [students] = await pool.execute(
            'SELECT id, first_name, last_name FROM users WHERE email = ? AND role = "student" AND is_active = true',
            [email]
        );

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Étudiant non trouvé avec cet email'
            });
        }

        const studentId = students[0].id;

        // Check if student is already enrolled
        const [existing] = await pool.execute(
            'SELECT id FROM class_enrollments WHERE class_id = ? AND student_id = ?',
            [classId, studentId]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Cet étudiant est déjà inscrit à cette classe'
            });
        }

        // Enroll student
        await pool.execute(
            'INSERT INTO class_enrollments (class_id, student_id) VALUES (?, ?)',
            [classId, studentId]
        );

        res.json({
            success: true,
            message: 'Étudiant ajouté avec succès',
            data: students[0]
        });
    } catch (error) {
        console.error('Add student error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
};

module.exports = {
    createClass,
    getUserClasses,
    getClassDetails,
    joinClassByCode,
    updateClass,
    deleteClass,
    addStudentByEmail
};