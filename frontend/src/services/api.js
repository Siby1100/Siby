import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
};

// Classes API
export const classAPI = {
  getUserClasses: () => api.get('/classes'),
  createClass: (classData) => api.post('/classes', classData),
  getClassDetails: (classId) => api.get(`/classes/${classId}`),
  updateClass: (classId, classData) => api.put(`/classes/${classId}`, classData),
  deleteClass: (classId) => api.delete(`/classes/${classId}`),
  joinClassByCode: (classCode) => api.post('/classes/join', { classCode }),
  addStudentByEmail: (classId, email) => api.post(`/classes/${classId}/students`, { email }),
};

// Groups API
export const groupAPI = {
  getClassGroups: (classId) => api.get(`/groups/class/${classId}`),
  getGroupDetails: (groupId) => api.get(`/groups/${groupId}`),
  createGroup: (groupData) => api.post('/groups', groupData),
  updateGroup: (groupId, groupData) => api.put(`/groups/${groupId}`, groupData),
  deleteGroup: (groupId) => api.delete(`/groups/${groupId}`),
  addMemberToGroup: (groupId, studentId) => api.post(`/groups/${groupId}/members`, { studentId }),
  removeMemberFromGroup: (groupId, studentId) => api.delete(`/groups/${groupId}/members/${studentId}`),
  getAvailableStudents: (classId) => api.get(`/groups/class/${classId}/available-students`),
};

// Assignments API (placeholder for future implementation)
export const assignmentAPI = {
  getClassAssignments: (classId) => api.get(`/assignments/class/${classId}`),
  createAssignment: (assignmentData) => api.post('/assignments', assignmentData),
  getAssignmentDetails: (assignmentId) => api.get(`/assignments/${assignmentId}`),
  updateAssignment: (assignmentId, assignmentData) => api.put(`/assignments/${assignmentId}`, assignmentData),
  deleteAssignment: (assignmentId) => api.delete(`/assignments/${assignmentId}`),
  submitAssignment: (assignmentId, submissionData) => api.post(`/assignments/${assignmentId}/submit`, submissionData),
  gradeSubmission: (submissionId, gradeData) => api.put(`/submissions/${submissionId}/grade`, gradeData),
};

// Messages API (placeholder for future implementation)
export const messageAPI = {
  getClassMessages: (classId) => api.get(`/messages/class/${classId}`),
  getGroupMessages: (groupId) => api.get(`/messages/group/${groupId}`),
  sendMessage: (messageData) => api.post('/messages', messageData),
  markMessageAsRead: (messageId) => api.put(`/messages/${messageId}/read`),
  replyToMessage: (messageId, replyData) => api.post(`/messages/${messageId}/reply`, replyData),
};

// Progress tracking API (placeholder for future implementation)
export const progressAPI = {
  getProgressSteps: () => api.get('/progress/steps'),
  getGroupProgress: (groupId, assignmentId) => api.get(`/progress/group/${groupId}/assignment/${assignmentId}`),
  updateProgressStep: (progressId, statusData) => api.put(`/progress/${progressId}`, statusData),
};

// File upload helper
export const uploadFile = async (file, endpoint) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export default api;