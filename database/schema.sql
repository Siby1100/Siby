-- Enhanced Google Classroom Database Schema
-- Created for improved group management and project tracking

CREATE DATABASE IF NOT EXISTS enhanced_classroom CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE enhanced_classroom;

-- Users table (professors and students)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('professor', 'student') NOT NULL,
    avatar_url VARCHAR(255) DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Classes/Modules table
CREATE TABLE classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    class_code VARCHAR(10) UNIQUE NOT NULL,
    professor_id INT NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    semester ENUM('1', '2') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (professor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Class enrollments (students in classes)
CREATE TABLE class_enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    student_id INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_enrollment (class_id, student_id),
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Groups within classes
CREATE TABLE groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    class_id INT NOT NULL,
    coordinator_id INT NOT NULL,
    description TEXT,
    max_members INT DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (coordinator_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Group memberships
CREATE TABLE group_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    student_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_membership (group_id, student_id),
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Project progress steps (predefined stages)
CREATE TABLE progress_steps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    step_order INT NOT NULL,
    is_default BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assignments/Projects
CREATE TABLE assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    class_id INT NOT NULL,
    professor_id INT NOT NULL,
    due_date DATETIME,
    assignment_type ENUM('individual', 'group') DEFAULT 'group',
    max_file_size INT DEFAULT 10485760,
    allowed_file_types VARCHAR(255) DEFAULT 'pdf,doc,docx,ppt,pptx',
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (professor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Assignment progress tracking (which step each group is on)
CREATE TABLE assignment_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    group_id INT NOT NULL,
    progress_step_id INT NOT NULL,
    status ENUM('pending', 'in_progress', 'completed', 'needs_revision') DEFAULT 'pending',
    professor_feedback TEXT,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_assignment_group_step (assignment_id, group_id, progress_step_id),
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (progress_step_id) REFERENCES progress_steps(id) ON DELETE CASCADE
);

-- Submissions (work submitted by groups)
CREATE TABLE submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    group_id INT NOT NULL,
    submitted_by INT NOT NULL, -- coordinator who submitted
    progress_step_id INT NOT NULL,
    content TEXT,
    submission_files JSON, -- Array of file paths
    status ENUM('submitted', 'graded', 'needs_revision') DEFAULT 'submitted',
    grade DECIMAL(5,2) DEFAULT NULL,
    professor_feedback TEXT,
    correction_files JSON, -- Files attached by professor
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    graded_at TIMESTAMP NULL,
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (progress_step_id) REFERENCES progress_steps(id) ON DELETE CASCADE
);

-- Comments on submissions (group members can comment)
CREATE TABLE submission_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    submission_id INT NOT NULL,
    user_id INT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Messages (public announcements and private messages)
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    class_id INT NOT NULL,
    group_id INT DEFAULT NULL, -- NULL for class-wide messages
    message_type ENUM('announcement', 'private', 'group') NOT NULL,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    attachments JSON, -- Array of file paths
    is_read BOOLEAN DEFAULT FALSE,
    parent_message_id INT DEFAULT NULL, -- For replies
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_message_id) REFERENCES messages(id) ON DELETE CASCADE
);

-- Message recipients (for private messages)
CREATE TABLE message_recipients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message_id INT NOT NULL,
    recipient_id INT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Resources/Documentation shared in classes
CREATE TABLE resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    class_id INT NOT NULL,
    uploaded_by INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size INT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    download_count INT DEFAULT 0,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Notifications
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('assignment', 'message', 'grade', 'progress', 'general') NOT NULL,
    related_id INT DEFAULT NULL, -- ID of related entity (assignment, message, etc.)
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default progress steps
INSERT INTO progress_steps (name, description, step_order) VALUES
('Soumission du thème', 'Soumission et présentation du thème de projet', 1),
('Validation du thème', 'Validation du thème par le professeur', 2),
('Rédaction du chapitre 1', 'Rédaction du premier chapitre (Introduction/État de l\'art)', 3),
('Chapitre 1 validé', 'Validation du chapitre 1 par le professeur', 4),
('Rédaction du chapitre 2', 'Rédaction du deuxième chapitre (Analyse/Conception)', 5),
('Chapitre 2 validé', 'Validation du chapitre 2 par le professeur', 6),
('Rédaction du chapitre 3', 'Rédaction du troisième chapitre (Implémentation)', 7),
('Chapitre 3 validé', 'Validation du chapitre 3 par le professeur', 8),
('Version provisoire', 'Soumission de la version provisoire complète', 9),
('Diapo de présentation', 'Préparation et soumission des diapositives de présentation', 10),
('Correction après soutenance', 'Corrections suite aux remarques de la soutenance', 11),
('Version finale', 'Soumission de la version finale du projet', 12);

-- Create indexes for better performance
CREATE INDEX idx_classes_professor ON classes(professor_id);
CREATE INDEX idx_class_enrollments_class ON class_enrollments(class_id);
CREATE INDEX idx_class_enrollments_student ON class_enrollments(student_id);
CREATE INDEX idx_groups_class ON groups(class_id);
CREATE INDEX idx_groups_coordinator ON groups(coordinator_id);
CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_student ON group_members(student_id);
CREATE INDEX idx_assignments_class ON assignments(class_id);
CREATE INDEX idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX idx_submissions_group ON submissions(group_id);
CREATE INDEX idx_messages_class ON messages(class_id);
CREATE INDEX idx_messages_group ON messages(group_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);