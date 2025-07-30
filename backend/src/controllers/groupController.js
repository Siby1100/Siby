const { validationResult } = require('express-validator');
const { pool } = require('../config/database');

// Create new group (professor only)
const createGroup = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: errors.array()
            });
        }

        const { name, description, coordinatorId, maxMembers, classId } = req.body;
        const professorId = req.user.id;

        // Check if professor owns this class
        const [classCheck] = await pool.execute(
            'SELECT id FROM classes WHERE id = ? AND professor_id = ?',
            [classId, professorId]
        );

        if (classCheck.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé à cette classe'
            });
        }

        // Check if coordinator is enrolled in the class
        const [coordinatorCheck] = await pool.execute(
            `SELECT u.id, u.first_name, u.last_name 
             FROM users u 
             JOIN class_enrollments ce ON u.id = ce.student_id 
             WHERE u.id = ? AND ce.class_id = ? AND u.role = 'student'`,
            [coordinatorId, classId]
        );

        if (coordinatorCheck.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Le coordinateur doit être un étudiant inscrit à cette classe'
            });
        }

        // Check if coordinator is already in a group in this class
        const [existingGroup] = await pool.execute(
            `SELECT g.name FROM groups g
             JOIN group_members gm ON g.id = gm.group_id
             WHERE gm.student_id = ? AND g.class_id = ?`,
            [coordinatorId, classId]
        );

        if (existingGroup.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Cet étudiant fait déjà partie du groupe "${existingGroup[0].name}"`
            });
        }

        // Create group
        const [result] = await pool.execute(
            'INSERT INTO groups (name, description, class_id, coordinator_id, max_members) VALUES (?, ?, ?, ?, ?)',
            [name, description, classId, coordinatorId, maxMembers || 5]
        );

        const groupId = result.insertId;

        // Add coordinator as first member
        await pool.execute(
            'INSERT INTO group_members (group_id, student_id) VALUES (?, ?)',
            [groupId, coordinatorId]
        );

        // Get created group with coordinator info
        const [newGroup] = await pool.execute(
            `SELECT g.*, u.first_name as coordinator_first_name, u.last_name as coordinator_last_name,
                    COUNT(gm.student_id) as member_count
             FROM groups g
             JOIN users u ON g.coordinator_id = u.id
             LEFT JOIN group_members gm ON g.id = gm.group_id
             WHERE g.id = ?
             GROUP BY g.id`,
            [groupId]
        );

        res.status(201).json({
            success: true,
            message: 'Groupe créé avec succès',
            data: newGroup[0]
        });
    } catch (error) {
        console.error('Create group error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
};

// Get groups for a class
const getClassGroups = async (req, res) => {
    try {
        const classId = req.params.classId;
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

        // Get groups with member details
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

        // Get members for each group
        for (let group of groups) {
            const [members] = await pool.execute(
                `SELECT u.id, u.first_name, u.last_name, u.email, gm.joined_at,
                        (u.id = ?) as is_coordinator
                 FROM group_members gm
                 JOIN users u ON gm.student_id = u.id
                 WHERE gm.group_id = ?
                 ORDER BY is_coordinator DESC, u.last_name, u.first_name`,
                [group.coordinator_id, group.id]
            );
            group.members = members;
        }

        res.json({
            success: true,
            data: groups
        });
    } catch (error) {
        console.error('Get class groups error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
};

// Get group details
const getGroupDetails = async (req, res) => {
    try {
        const groupId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Check if user has access to this group
        let accessQuery;
        if (userRole === 'professor') {
            accessQuery = `
                SELECT g.id FROM groups g
                JOIN classes c ON g.class_id = c.id
                WHERE g.id = ? AND c.professor_id = ?
            `;
        } else {
            accessQuery = `
                SELECT g.id FROM groups g
                JOIN class_enrollments ce ON g.class_id = ce.class_id
                WHERE g.id = ? AND ce.student_id = ?
            `;
        }

        const [access] = await pool.execute(accessQuery, [groupId, userId]);
        if (access.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé à ce groupe'
            });
        }

        // Get group details
        const [groups] = await pool.execute(
            `SELECT g.*, u.first_name as coordinator_first_name, u.last_name as coordinator_last_name,
                    c.name as class_name, c.class_code,
                    COUNT(gm.student_id) as member_count
             FROM groups g
             JOIN users u ON g.coordinator_id = u.id
             JOIN classes c ON g.class_id = c.id
             LEFT JOIN group_members gm ON g.id = gm.group_id
             WHERE g.id = ?
             GROUP BY g.id`,
            [groupId]
        );

        if (groups.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Groupe non trouvé'
            });
        }

        const group = groups[0];

        // Get group members
        const [members] = await pool.execute(
            `SELECT u.id, u.first_name, u.last_name, u.email, gm.joined_at,
                    (u.id = ?) as is_coordinator
             FROM group_members gm
             JOIN users u ON gm.student_id = u.id
             WHERE gm.group_id = ?
             ORDER BY is_coordinator DESC, u.last_name, u.first_name`,
            [group.coordinator_id, groupId]
        );

        // Get assignments and submissions for this group
        const [assignments] = await pool.execute(
            `SELECT a.id, a.title, a.due_date, a.assignment_type,
                    s.id as submission_id, s.status as submission_status, s.submitted_at, s.grade
             FROM assignments a
             LEFT JOIN submissions s ON a.id = s.assignment_id AND s.group_id = ?
             WHERE a.class_id = ? AND a.is_published = true
             ORDER BY a.created_at DESC`,
            [groupId, group.class_id]
        );

        res.json({
            success: true,
            data: {
                group,
                members,
                assignments
            }
        });
    } catch (error) {
        console.error('Get group details error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
};

// Add member to group (professor or coordinator)
const addMemberToGroup = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: errors.array()
            });
        }

        const groupId = req.params.id;
        const { studentId } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Get group details
        const [groups] = await pool.execute(
            `SELECT g.*, c.professor_id, g.max_members,
                    COUNT(gm.student_id) as current_members
             FROM groups g
             JOIN classes c ON g.class_id = c.id
             LEFT JOIN group_members gm ON g.id = gm.group_id
             WHERE g.id = ?
             GROUP BY g.id`,
            [groupId]
        );

        if (groups.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Groupe non trouvé'
            });
        }

        const group = groups[0];

        // Check permissions (professor or coordinator)
        if (userRole !== 'professor' || group.professor_id !== userId) {
            if (group.coordinator_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Seul le professeur ou le coordinateur peut ajouter des membres'
                });
            }
        }

        // Check if group is full
        if (group.current_members >= group.max_members) {
            return res.status(400).json({
                success: false,
                message: 'Le groupe a atteint sa capacité maximale'
            });
        }

        // Check if student is enrolled in the class
        const [studentCheck] = await pool.execute(
            `SELECT u.id, u.first_name, u.last_name 
             FROM users u 
             JOIN class_enrollments ce ON u.id = ce.student_id 
             WHERE u.id = ? AND ce.class_id = ? AND u.role = 'student'`,
            [studentId, group.class_id]
        );

        if (studentCheck.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'L\'étudiant doit être inscrit à cette classe'
            });
        }

        // Check if student is already in a group in this class
        const [existingGroup] = await pool.execute(
            `SELECT g.name FROM groups g
             JOIN group_members gm ON g.id = gm.group_id
             WHERE gm.student_id = ? AND g.class_id = ?`,
            [studentId, group.class_id]
        );

        if (existingGroup.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Cet étudiant fait déjà partie du groupe "${existingGroup[0].name}"`
            });
        }

        // Add student to group
        await pool.execute(
            'INSERT INTO group_members (group_id, student_id) VALUES (?, ?)',
            [groupId, studentId]
        );

        res.json({
            success: true,
            message: 'Membre ajouté avec succès',
            data: studentCheck[0]
        });
    } catch (error) {
        console.error('Add member error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
};

// Remove member from group (professor or coordinator)
const removeMemberFromGroup = async (req, res) => {
    try {
        const groupId = req.params.id;
        const studentId = req.params.studentId;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Get group details
        const [groups] = await pool.execute(
            `SELECT g.*, c.professor_id
             FROM groups g
             JOIN classes c ON g.class_id = c.id
             WHERE g.id = ?`,
            [groupId]
        );

        if (groups.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Groupe non trouvé'
            });
        }

        const group = groups[0];

        // Check permissions (professor or coordinator, but coordinator cannot remove themselves)
        if (userRole !== 'professor' || group.professor_id !== userId) {
            if (group.coordinator_id !== userId || studentId === userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Permission refusée'
                });
            }
        }

        // Cannot remove coordinator
        if (studentId === group.coordinator_id) {
            return res.status(400).json({
                success: false,
                message: 'Le coordinateur ne peut pas être retiré du groupe'
            });
        }

        // Check if student is in the group
        const [memberCheck] = await pool.execute(
            'SELECT id FROM group_members WHERE group_id = ? AND student_id = ?',
            [groupId, studentId]
        );

        if (memberCheck.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cet étudiant ne fait pas partie du groupe'
            });
        }

        // Remove student from group
        await pool.execute(
            'DELETE FROM group_members WHERE group_id = ? AND student_id = ?',
            [groupId, studentId]
        );

        res.json({
            success: true,
            message: 'Membre retiré avec succès'
        });
    } catch (error) {
        console.error('Remove member error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
};

// Update group (professor or coordinator)
const updateGroup = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Données invalides',
                errors: errors.array()
            });
        }

        const groupId = req.params.id;
        const { name, description, maxMembers } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Get group details
        const [groups] = await pool.execute(
            `SELECT g.*, c.professor_id,
                    COUNT(gm.student_id) as current_members
             FROM groups g
             JOIN classes c ON g.class_id = c.id
             LEFT JOIN group_members gm ON g.id = gm.group_id
             WHERE g.id = ?
             GROUP BY g.id`,
            [groupId]
        );

        if (groups.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Groupe non trouvé'
            });
        }

        const group = groups[0];

        // Check permissions
        if (userRole !== 'professor' || group.professor_id !== userId) {
            if (group.coordinator_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Seul le professeur ou le coordinateur peut modifier le groupe'
                });
            }
        }

        // Check if new max_members is not less than current members
        if (maxMembers && maxMembers < group.current_members) {
            return res.status(400).json({
                success: false,
                message: `Le nombre maximum de membres ne peut pas être inférieur au nombre actuel (${group.current_members})`
            });
        }

        // Update group
        await pool.execute(
            `UPDATE groups 
             SET name = ?, description = ?, max_members = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [name, description, maxMembers || group.max_members, groupId]
        );

        // Get updated group
        const [updatedGroup] = await pool.execute(
            `SELECT g.*, u.first_name as coordinator_first_name, u.last_name as coordinator_last_name,
                    COUNT(gm.student_id) as member_count
             FROM groups g
             JOIN users u ON g.coordinator_id = u.id
             LEFT JOIN group_members gm ON g.id = gm.group_id
             WHERE g.id = ?
             GROUP BY g.id`,
            [groupId]
        );

        res.json({
            success: true,
            message: 'Groupe mis à jour avec succès',
            data: updatedGroup[0]
        });
    } catch (error) {
        console.error('Update group error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
};

// Delete group (professor only)
const deleteGroup = async (req, res) => {
    try {
        const groupId = req.params.id;
        const userId = req.user.id;

        // Check if professor owns this group's class
        const [groups] = await pool.execute(
            `SELECT g.id FROM groups g
             JOIN classes c ON g.class_id = c.id
             WHERE g.id = ? AND c.professor_id = ?`,
            [groupId, userId]
        );

        if (groups.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Accès non autorisé à ce groupe'
            });
        }

        // Delete group (this will cascade delete members due to foreign key constraints)
        await pool.execute('DELETE FROM groups WHERE id = ?', [groupId]);

        res.json({
            success: true,
            message: 'Groupe supprimé avec succès'
        });
    } catch (error) {
        console.error('Delete group error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
};

// Get available students for a class (not in any group)
const getAvailableStudents = async (req, res) => {
    try {
        const classId = req.params.classId;
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

        // Get students not in any group for this class
        const [students] = await pool.execute(
            `SELECT u.id, u.first_name, u.last_name, u.email, ce.enrolled_at
             FROM class_enrollments ce
             JOIN users u ON ce.student_id = u.id
             LEFT JOIN group_members gm ON u.id = gm.student_id
             LEFT JOIN groups g ON gm.group_id = g.id AND g.class_id = ce.class_id
             WHERE ce.class_id = ? AND g.id IS NULL
             ORDER BY u.last_name, u.first_name`,
            [classId]
        );

        res.json({
            success: true,
            data: students
        });
    } catch (error) {
        console.error('Get available students error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur interne du serveur'
        });
    }
};

module.exports = {
    createGroup,
    getClassGroups,
    getGroupDetails,
    addMemberToGroup,
    removeMemberFromGroup,
    updateGroup,
    deleteGroup,
    getAvailableStudents
};