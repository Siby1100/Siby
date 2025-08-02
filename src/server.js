import express from "express";
import sqlite3 from "better-sqlite3";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const app = express();
const port = 3001;
const JWT_SECRET = "your-secret-key-change-in-production";

// Database setup
const db = sqlite3("./classroom.db");

// Create tables
const initDb = () => {};
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      description TEXT,
      professor_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (professor_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS class_members (
      id TEXT PRIMARY KEY,
      class_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (class_id) REFERENCES classes (id),
      FOREIGN KEY (user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      class_id TEXT NOT NULL,
      name TEXT NOT NULL,
      coordinator_id TEXT NOT NULL,
      members TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (class_id) REFERENCES classes (id),
      FOREIGN KEY (coordinator_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      class_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      due_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (class_id) REFERENCES classes (id)
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      group_id TEXT NOT NULL,
      content TEXT,
      files TEXT,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      correction_files TEXT,
      correction_comment TEXT,
      grade INTEGER,
      FOREIGN KEY (task_id) REFERENCES tasks (id),
      FOREIGN KEY (group_id) REFERENCES groups (id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      class_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      receiver_id TEXT,
      content TEXT NOT NULL,
      is_public BOOLEAN DEFAULT false,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (class_id) REFERENCES classes (id),
      FOREIGN KEY (sender_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      class_id TEXT NOT NULL,
      title TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      uploaded_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (class_id) REFERENCES classes (id),
      FOREIGN KEY (uploaded_by) REFERENCES users (id)
    );
    CREATE TABLE IF NOT EXISTS group_members (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(group_id) REFERENCES groups(id),
    FOREIGN KEY(student_id) REFERENCES users(id)
);

    CREATE TABLE IF NOT EXISTS project_progress (
      id TEXT PRIMARY KEY,
      group_id TEXT NOT NULL,
      stage TEXT NOT NULL,
      completed_at DATETIME,
      notes TEXT,
      FOREIGN KEY (group_id) REFERENCES groups (id)
    );
  `);

initDb();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Route pour soumettre une tâche avec PDF
app.post(
  "/api/tasks/:taskId/submissions",
  authMiddleware,
  upload.single("file"),
  (req, res) => {
    const { taskId } = req.params;
    const userId = req.user.id;
    const id = uuidv4();

    if (!req.file) {
      return res.status(400).json({ error: "Fichier PDF requis" });
    }

    const fileName = req.file.filename;
    const filePath = `/uploads/${fileName}`; // Ton code ne crée pas de sous-dossier "submissions"

    // Étape clé : trouver le group_id de l'utilisateur
    // Trouver le groupe
    const group = db
      .prepare(
        `
    SELECT g.id AS group_id
    FROM groups g,
         json_each(g.members)
    WHERE json_each.value = ?
    LIMIT 1
  `
      )
      .get(userId);

    if (!group) {
      return res
        .status(400)
        .json({ error: "Aucun groupe trouvé pour cet utilisateur" });
    }

    const submission = {
      id: uuidv4(),
      task_id: taskId,
      user_id: userId,
      group_id: group.group_id,
      file_path: req.file.filename,
      submitted_at: new Date().toISOString(),
    };

    const insert = db.prepare(`
    INSERT INTO submissions (id, task_id, user_id, group_id, file_path, submitted_at)
    VALUES (@id, @task_id, @user_id, @group_id, @file_path, @submitted_at)
  `);

    insert.run(submission);

    res.status(200).json({ message: "Soumission réussie", submission });
  }
);

// Trouver un utilisateur par email (pour la création de groupe)
app.post("/api/users/by-email", authMiddleware, (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email requis" });
  const user = db
    .prepare("SELECT id, email, name, role FROM users WHERE email = ?")
    .get(email);
  if (!user) return res.status(404).json({ error: "Utilisateur non trouvé" });
  res.json(user);
});

// Routes
app.post("/api/register", async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const id = uuidv4();

    db.prepare(
      "INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)"
    ).run(id, email, hashedPassword, name, role);

    const token = jwt.sign({ id, email, role }, JWT_SECRET);
    res.json({ token, user: { id, email, name, role } });
  } catch (error) {
    res.status(400).json({ error: "Email already exists" });
  }
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET
  );
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
});

app.get("/api/classes", authMiddleware, (req, res) => {
  const { role, id } = req.user;
  let classes;

  if (role === "professor") {
    classes = db
      .prepare("SELECT * FROM classes WHERE professor_id = ?")
      .all(id);
  } else {
    classes = db
      .prepare(
        `
      SELECT c.* FROM classes c 
      JOIN class_members cm ON c.id = cm.class_id 
      WHERE cm.user_id = ?
    `
      )
      .all(id);
  }

  res.json(classes);
});

app.post("/api/classes", authMiddleware, (req, res) => {
  const { name, description } = req.body;
  const id = uuidv4();
  const code = "CLS-" + Math.random().toString(36).substr(2, 6).toUpperCase();

  db.prepare(
    "INSERT INTO classes (id, name, code, description, professor_id) VALUES (?, ?, ?, ?, ?)"
  ).run(id, name, code, description, req.user.id);

  res.json({ id, name, code, description, professorId: req.user.id });
});

// Ajout étudiant à une classe
app.post("/class-members", (req, res) => {
  const { classId, userId } = req.body;
  const id = uuidv4();

  const stmt = db.prepare(
    "INSERT INTO class_members (id, class_id, user_id) VALUES (?, ?, ?)"
  );

  try {
    stmt.run(id, classId, userId);
    res.status(200).json({ message: "Étudiant ajouté à la classe" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'ajout à la classe" });
  }
});

// Ajout étudiant à un groupe
app.post("/group-members", (req, res) => {
  const { groupId, userId } = req.body;
  const id = uuidv4();

  const stmt = db.prepare(
    "INSERT INTO group_members (id, group_id, user_id) VALUES (?, ?, ?)"
  );

  try {
    stmt.run(id, groupId, userId);
    res.status(200).json({ message: "Ajouté au groupe" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de l'ajout au groupe" });
  }
});

// Récupérer les membres d'une classe
app.get("/api/classes/:id/members", (req, res) => {
  const classId = req.params.id;

  try {
    const members = db
      .prepare(
        `SELECT users.id, users.name, users.email 
         FROM class_members 
         JOIN users ON class_members.user_id = users.id 
         WHERE class_members.class_id = ?`
      )
      .all(classId);

    res.json(members);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des membres" });
  }
});

app.post("/api/classes/join", authMiddleware, (req, res) => {
  const { code } = req.body;
  const classData = db
    .prepare("SELECT * FROM classes WHERE code = ?")
    .get(code);

  if (!classData) {
    return res.status(404).json({ error: "Class not found" });
  }

  try {
    const id = uuidv4();
    db.prepare(
      "INSERT INTO class_members (id, class_id, user_id) VALUES (?, ?, ?)"
    ).run(id, classData.id, req.user.id);
    res.json({ message: "Joined class successfully", class: classData });
  } catch (error) {
    res.status(400).json({ error: "Already a member" });
  }
});

app.get("/api/classes/:classId/groups", authMiddleware, (req, res) => {
  const groups = db
    .prepare("SELECT * FROM groups WHERE class_id = ?")
    .all(req.params.classId);
  const groupsWithMembers = groups.map((group) => ({
    ...group,
    members: JSON.parse(group.members),
  }));
  res.json(groupsWithMembers);
});

app.post("/api/classes/:classId/groups", authMiddleware, (req, res) => {
  const { name, coordinatorId, members } = req.body;
  const id = uuidv4();

  db.prepare(
    "INSERT INTO groups (id, class_id, name, coordinator_id, members) VALUES (?, ?, ?, ?, ?)"
  ).run(id, req.params.classId, name, coordinatorId, JSON.stringify(members));

  res.json({ id, name, coordinatorId, members });
});

app.get("/api/classes/:classId/tasks", authMiddleware, (req, res) => {
  const tasks = db
    .prepare("SELECT * FROM tasks WHERE class_id = ?")
    .all(req.params.classId);
  res.json(tasks);
});

app.post("/api/classes/:classId/tasks", authMiddleware, (req, res) => {
  const { title, description, dueDate } = req.body;
  const id = uuidv4();

  db.prepare(
    "INSERT INTO tasks (id, class_id, title, description, due_date) VALUES (?, ?, ?, ?, ?)"
  ).run(id, req.params.classId, title, description, dueDate);

  res.json({ id, title, description, dueDate });
});

app.get("/tasks/:id", (req, res) => {
  const taskId = req.params.id;

  const task = db
    .prepare(
      `
    SELECT t.id, t.title, t.description, t.due_date, t.created_at, c.name as class_name
    FROM tasks t
    LEFT JOIN classes c ON t.class_id = c.id
    WHERE t.id = ?
  `
    )
    .get(taskId);

  if (!task) {
    return res.status(404).json({ error: "Tâche introuvable" });
  }

  res.json(task);
});

app.post("/groups/:groupId/add-member", (req, res) => {
  const { groupId } = req.params;
  const { studentId } = req.body;

  if (!studentId) {
    return res.status(400).json({ error: "studentId requis" });
  }

  try {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO group_members (id, group_id, student_id)
      VALUES (?, ?, ?)
    `);
    stmt.run(id, groupId, studentId);

    res.json({
      success: true,
      message: "Étudiant ajouté au groupe avec succès",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur lors de l'ajout" });
  }
});

app.get("/api/classes/:classId/messages", authMiddleware, (req, res) => {
  const messages = db
    .prepare(
      `
    SELECT m.*, u.name as sender_name 
    FROM messages m 
    JOIN users u ON m.sender_id = u.id 
    WHERE m.class_id = ? AND (m.is_public = 1 OR m.sender_id = ? OR m.receiver_id = ?)
    ORDER BY m.created_at DESC
  `
    )
    .all(req.params.classId, req.user.id, req.user.id);

  res.json(messages);
});

app.post("/api/classes/:classId/messages", authMiddleware, (req, res) => {
  const { content, receiverId, isPublic } = req.body;
  const id = uuidv4();

  db.prepare(
    "INSERT INTO messages (id, class_id, sender_id, receiver_id, content, is_public) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(
    String(id),
    String(req.params.classId),
    String(req.user.id),
    receiverId ? String(receiverId) : null,
    String(content),
    isPublic ? 1 : 0 // SQLite ne comprend pas `true` ou `false`
  );

  res.json({ id, content, senderId: req.user.id });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
