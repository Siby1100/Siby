import axios from 'axios';
import {
  User,
  Class,
  Group,
  Assignment,
  Submission,
  ProjectProgress,
  Announcement,
  Message,
  Correction,
  Document,
  ApiResponse
} from '../types';

const API_BASE_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Users API
export const userApi = {
  getAll: (): Promise<User[]> => api.get('/users').then(res => res.data),
  getById: (id: string): Promise<User> => api.get(`/users/${id}`).then(res => res.data),
  login: async (email: string, password: string): Promise<User | null> => {
    const users = await api.get('/users').then(res => res.data);
    const user = users.find((u: User) => u.email === email && u.password === password);
    return user || null;
  },
  create: (user: Omit<User, 'id'>): Promise<User> => api.post('/users', user).then(res => res.data),
  update: (id: string, user: Partial<User>): Promise<User> => api.patch(`/users/${id}`, user).then(res => res.data),
  delete: (id: string): Promise<void> => api.delete(`/users/${id}`).then(res => res.data),
};

// Classes API
export const classApi = {
  getAll: (): Promise<Class[]> => api.get('/classes').then(res => res.data),
  getById: (id: string): Promise<Class> => api.get(`/classes/${id}`).then(res => res.data),
  getByProfessor: (professorId: string): Promise<Class[]> => 
    api.get(`/classes?professorId=${professorId}`).then(res => res.data),
  getByStudent: async (studentId: string): Promise<Class[]> => {
    const classes = await api.get('/classes').then(res => res.data);
    return classes.filter((c: Class) => c.students.includes(studentId));
  },
  create: (classData: Omit<Class, 'id'>): Promise<Class> => api.post('/classes', classData).then(res => res.data),
  update: (id: string, classData: Partial<Class>): Promise<Class> => 
    api.patch(`/classes/${id}`, classData).then(res => res.data),
  delete: (id: string): Promise<void> => api.delete(`/classes/${id}`).then(res => res.data),
  joinByCode: async (code: string, studentId: string): Promise<Class | null> => {
    const classes = await api.get(`/classes?code=${code}`).then(res => res.data);
    if (classes.length > 0) {
      const classData = classes[0];
      if (!classData.students.includes(studentId)) {
        classData.students.push(studentId);
        return api.patch(`/classes/${classData.id}`, classData).then(res => res.data);
      }
      return classData;
    }
    return null;
  },
};

// Groups API
export const groupApi = {
  getAll: (): Promise<Group[]> => api.get('/groups').then(res => res.data),
  getById: (id: string): Promise<Group> => api.get(`/groups/${id}`).then(res => res.data),
  getByClass: (classId: string): Promise<Group[]> => 
    api.get(`/groups?classId=${classId}`).then(res => res.data),
  getByMember: async (memberId: string): Promise<Group[]> => {
    const groups = await api.get('/groups').then(res => res.data);
    return groups.filter((g: Group) => g.members.includes(memberId));
  },
  create: (group: Omit<Group, 'id'>): Promise<Group> => api.post('/groups', group).then(res => res.data),
  update: (id: string, group: Partial<Group>): Promise<Group> => 
    api.patch(`/groups/${id}`, group).then(res => res.data),
  delete: (id: string): Promise<void> => api.delete(`/groups/${id}`).then(res => res.data),
};

// Assignments API
export const assignmentApi = {
  getAll: (): Promise<Assignment[]> => api.get('/assignments').then(res => res.data),
  getById: (id: string): Promise<Assignment> => api.get(`/assignments/${id}`).then(res => res.data),
  getByClass: (classId: string): Promise<Assignment[]> => 
    api.get(`/assignments?classId=${classId}`).then(res => res.data),
  create: (assignment: Omit<Assignment, 'id'>): Promise<Assignment> => 
    api.post('/assignments', assignment).then(res => res.data),
  update: (id: string, assignment: Partial<Assignment>): Promise<Assignment> => 
    api.patch(`/assignments/${id}`, assignment).then(res => res.data),
  delete: (id: string): Promise<void> => api.delete(`/assignments/${id}`).then(res => res.data),
};

// Submissions API
export const submissionApi = {
  getAll: (): Promise<Submission[]> => api.get('/submissions').then(res => res.data),
  getById: (id: string): Promise<Submission> => api.get(`/submissions/${id}`).then(res => res.data),
  getByAssignment: (assignmentId: string): Promise<Submission[]> => 
    api.get(`/submissions?assignmentId=${assignmentId}`).then(res => res.data),
  getByGroup: (groupId: string): Promise<Submission[]> => 
    api.get(`/submissions?groupId=${groupId}`).then(res => res.data),
  getByUser: (userId: string): Promise<Submission[]> => 
    api.get(`/submissions?submittedBy=${userId}`).then(res => res.data),
  create: (submission: Omit<Submission, 'id'>): Promise<Submission> => 
    api.post('/submissions', submission).then(res => res.data),
  update: (id: string, submission: Partial<Submission>): Promise<Submission> => 
    api.patch(`/submissions/${id}`, submission).then(res => res.data),
  delete: (id: string): Promise<void> => api.delete(`/submissions/${id}`).then(res => res.data),
};

// Project Progress API
export const projectProgressApi = {
  getAll: (): Promise<ProjectProgress[]> => api.get('/projectProgress').then(res => res.data),
  getById: (id: string): Promise<ProjectProgress> => api.get(`/projectProgress/${id}`).then(res => res.data),
  getByGroup: (groupId: string): Promise<ProjectProgress[]> => 
    api.get(`/projectProgress?groupId=${groupId}`).then(res => res.data),
  create: (progress: Omit<ProjectProgress, 'id'>): Promise<ProjectProgress> => 
    api.post('/projectProgress', progress).then(res => res.data),
  update: (id: string, progress: Partial<ProjectProgress>): Promise<ProjectProgress> => 
    api.patch(`/projectProgress/${id}`, progress).then(res => res.data),
  updateStep: async (groupId: string, stepName: string, status: 'pending' | 'in_progress' | 'completed'): Promise<ProjectProgress> => {
    const progressList = await api.get(`/projectProgress?groupId=${groupId}`).then(res => res.data);
    if (progressList.length > 0) {
      const progress = progressList[0];
      const stepIndex = progress.steps.findIndex((step: any) => step.name === stepName);
      if (stepIndex !== -1) {
        progress.steps[stepIndex].status = status;
        if (status === 'completed') {
          progress.steps[stepIndex].completedAt = new Date().toISOString();
        }
        return api.patch(`/projectProgress/${progress.id}`, progress).then(res => res.data);
      }
    }
    throw new Error('Progress not found');
  },
  delete: (id: string): Promise<void> => api.delete(`/projectProgress/${id}`).then(res => res.data),
};

// Announcements API
export const announcementApi = {
  getAll: (): Promise<Announcement[]> => api.get('/announcements').then(res => res.data),
  getById: (id: string): Promise<Announcement> => api.get(`/announcements/${id}`).then(res => res.data),
  getByClass: (classId: string): Promise<Announcement[]> => 
    api.get(`/announcements?classId=${classId}`).then(res => res.data),
  create: (announcement: Omit<Announcement, 'id'>): Promise<Announcement> => 
    api.post('/announcements', announcement).then(res => res.data),
  update: (id: string, announcement: Partial<Announcement>): Promise<Announcement> => 
    api.patch(`/announcements/${id}`, announcement).then(res => res.data),
  delete: (id: string): Promise<void> => api.delete(`/announcements/${id}`).then(res => res.data),
};

// Messages API
export const messageApi = {
  getAll: (): Promise<Message[]> => api.get('/messages').then(res => res.data),
  getById: (id: string): Promise<Message> => api.get(`/messages/${id}`).then(res => res.data),
  getByClass: (classId: string): Promise<Message[]> => 
    api.get(`/messages?classId=${classId}`).then(res => res.data),
  getByUser: async (userId: string): Promise<Message[]> => {
    const messages = await api.get('/messages').then(res => res.data);
    return messages.filter((m: Message) => m.fromId === userId || m.toId === userId);
  },
  getConversation: async (user1Id: string, user2Id: string): Promise<Message[]> => {
    const messages = await api.get('/messages').then(res => res.data);
    return messages.filter((m: Message) => 
      (m.fromId === user1Id && m.toId === user2Id) || 
      (m.fromId === user2Id && m.toId === user1Id)
    ).sort((a: Message, b: Message) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },
  create: (message: Omit<Message, 'id'>): Promise<Message> => 
    api.post('/messages', message).then(res => res.data),
  update: (id: string, message: Partial<Message>): Promise<Message> => 
    api.patch(`/messages/${id}`, message).then(res => res.data),
  markAsRead: (id: string): Promise<Message> => 
    api.patch(`/messages/${id}`, { readAt: new Date().toISOString() }).then(res => res.data),
  delete: (id: string): Promise<void> => api.delete(`/messages/${id}`).then(res => res.data),
};

// Corrections API
export const correctionApi = {
  getAll: (): Promise<Correction[]> => api.get('/corrections').then(res => res.data),
  getById: (id: string): Promise<Correction> => api.get(`/corrections/${id}`).then(res => res.data),
  getBySubmission: (submissionId: string): Promise<Correction[]> => 
    api.get(`/corrections?submissionId=${submissionId}`).then(res => res.data),
  create: (correction: Omit<Correction, 'id'>): Promise<Correction> => 
    api.post('/corrections', correction).then(res => res.data),
  update: (id: string, correction: Partial<Correction>): Promise<Correction> => 
    api.patch(`/corrections/${id}`, correction).then(res => res.data),
  delete: (id: string): Promise<void> => api.delete(`/corrections/${id}`).then(res => res.data),
};

// Documents API
export const documentApi = {
  getAll: (): Promise<Document[]> => api.get('/documents').then(res => res.data),
  getById: (id: string): Promise<Document> => api.get(`/documents/${id}`).then(res => res.data),
  getByClass: (classId: string): Promise<Document[]> => 
    api.get(`/documents?classId=${classId}`).then(res => res.data),
  create: (document: Omit<Document, 'id'>): Promise<Document> => 
    api.post('/documents', document).then(res => res.data),
  update: (id: string, document: Partial<Document>): Promise<Document> => 
    api.patch(`/documents/${id}`, document).then(res => res.data),
  delete: (id: string): Promise<void> => api.delete(`/documents/${id}`).then(res => res.data),
};

export default api;