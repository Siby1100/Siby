export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'professor' | 'student';
  avatar?: string;
  createdAt: string;
}

export interface Class {
  id: string;
  name: string;
  code: string;
  description: string;
  professorId: string;
  students: string[];
  createdAt: string;
  banner?: string;
}

export interface Group {
  id: string;
  name: string;
  classId: string;
  coordinatorId: string;
  members: string[];
  projectTheme?: string;
  createdAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  classId: string;
  dueDate: string;
  createdAt: string;
  files: string[];
  type: 'individual' | 'group';
  maxPoints: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  groupId?: string;
  submittedBy: string;
  content: string;
  files: string[];
  submittedAt: string;
  status: 'submitted' | 'graded' | 'returned';
  grade?: number;
  feedback?: string;
}

export interface ProjectStep {
  name: string;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt: string | null;
}

export interface ProjectProgress {
  id: string;
  groupId: string;
  steps: ProjectStep[];
}

export interface Announcement {
  id: string;
  classId: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  attachments: string[];
}

export interface Message {
  id: string;
  fromId: string;
  toId: string | null;
  classId: string;
  subject: string;
  content: string;
  isPrivate: boolean;
  groupId?: string | null;
  parentMessageId?: string | null;
  createdAt: string;
  readAt?: string | null;
}

export interface Correction {
  id: string;
  submissionId: string;
  correctorId: string;
  grade: number;
  feedback: string;
  correctionFiles: string[];
  correctedAt: string;
}

export interface Document {
  id: string;
  classId: string;
  title: string;
  description: string;
  fileName: string;
  uploadedBy: string;
  uploadedAt: string;
  category: 'course_material' | 'template' | 'submission' | 'correction';
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}