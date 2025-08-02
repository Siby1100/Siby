export interface User {
  id: string;
  email: string;
  name: string;
  role: 'professor' | 'student';
  createdAt: string;
}

export interface Class {
  id: string;
  name: string;
  code: string;
  description: string;
  professorId: string;
  createdAt: string;
}

export interface Group {
  id: string;
  classId: string;
  name: string;
  coordinatorId: string;
  members: string[];
  createdAt: string;
}

export interface Task {
  id: string;
  classId: string;
  title: string;
  description: string;
  dueDate: string;
  createdAt: string;
  status: 'pending' | 'submitted' | 'corrected';
}

export interface Submission {
  id: string;
  taskId: string;
  groupId: string;
  content: string;
  files: string[];
  submittedAt: string;
  correctionFiles?: string[];
  correctionComment?: string;
  grade?: number;
}

export interface Message {
  id: string;
  classId: string;
  senderId: string;
  receiverId?: string;
  content: string;
  isPublic: boolean;
  createdAt: string;
}

export interface Document {
  id: string;
  classId: string;
  title: string;
  fileName: string;
  filePath: string;
  uploadedBy: string;
  createdAt: string;
}

export interface ProjectProgress {
  id: string;
  groupId: string;
  stage: 'theme_submission' | 'theme_validated' | 'chapter1_draft' | 'chapter1_ok' | 
         'chapter2_draft' | 'chapter2_ok' | 'chapter3_draft' | 'chapter3_ok' | 
         'provisional_version' | 'presentation' | 'final_correction' | 'final_version';
  completedAt?: string;
  notes?: string;
}