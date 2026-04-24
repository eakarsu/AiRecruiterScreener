import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH ====================
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
  requestPasswordReset: (data) => api.post('/auth/request-password-reset', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  verifyEmail: (data) => api.post('/auth/verify-email', data),
  resendVerification: () => api.post('/auth/resend-verification'),
  logout: () => api.post('/auth/logout'),
  getDemoCredentials: () => api.get('/auth/demo-credentials'),
};

// ==================== JOBS ====================
export const jobsApi = {
  getAll: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  bulkDelete: (ids) => api.post('/jobs/bulk/delete', { ids }),
  bulkUpdate: (ids, data) => api.post('/jobs/bulk/update', { ids, data }),
  exportCSV: () => api.get('/jobs/export/csv', { responseType: 'blob' }),
  generateDescription: (data) => api.post('/jobs/ai/generate-description', data),
  generateQuestions: (id, data) => api.post(`/jobs/${id}/ai/generate-questions`, data),
};

// ==================== CANDIDATES ====================
export const candidatesApi = {
  getAll: (params) => api.get('/candidates', { params }),
  getById: (id) => api.get(`/candidates/${id}`),
  create: (data) => api.post('/candidates', data),
  update: (id, data) => api.put(`/candidates/${id}`, data),
  delete: (id) => api.delete(`/candidates/${id}`),
  bulkDelete: (ids) => api.post('/candidates/bulk/delete', { ids }),
  bulkUpdate: (ids, data) => api.post('/candidates/bulk/update', { ids, data }),
  exportCSV: () => api.get('/candidates/export/csv', { responseType: 'blob' }),
  analyzeResume: (id) => api.post(`/candidates/${id}/ai/analyze-resume`),
  rankCandidates: (jobId) => api.post(`/candidates/job/${jobId}/ai/rank`),
  addNote: (id, data) => api.post(`/candidates/${id}/notes`, data),
};

// ==================== INTERVIEWS ====================
export const interviewsApi = {
  getAll: (params) => api.get('/interviews', { params }),
  getById: (id) => api.get(`/interviews/${id}`),
  create: (data) => api.post('/interviews', data),
  update: (id, data) => api.put(`/interviews/${id}`, data),
  delete: (id) => api.delete(`/interviews/${id}`),
  bulkDelete: (ids) => api.post('/interviews/bulk/delete', { ids }),
  bulkUpdate: (ids, data) => api.post('/interviews/bulk/update', { ids, data }),
  exportCSV: () => api.get('/interviews/export/csv', { responseType: 'blob' }),
  generateQuestions: (id, data) => api.post(`/interviews/${id}/ai/generate-questions`, data),
  submitFeedback: (id, data) => api.post(`/interviews/${id}/feedback`, data),
};

// ==================== COMMUNICATIONS ====================
export const communicationsApi = {
  getAll: (params) => api.get('/communications', { params }),
  getById: (id) => api.get(`/communications/${id}`),
  create: (data) => api.post('/communications', data),
  generateEmail: (data) => api.post('/communications/ai/generate-email', data),
  getTemplates: (params) => api.get('/communications/templates', { params }),
  createTemplate: (data) => api.post('/communications/templates', data),
};

// ==================== ASSESSMENTS ====================
export const assessmentsApi = {
  getAll: (params) => api.get('/assessments', { params }),
  getById: (id) => api.get(`/assessments/${id}`),
  create: (data) => api.post('/assessments', data),
  generate: (data) => api.post('/assessments/ai/generate', data),
  start: (id) => api.post(`/assessments/${id}/start`),
  submit: (id, data) => api.post(`/assessments/${id}/submit`, data),
};

// ==================== ANALYTICS ====================
export const analyticsApi = {
  getDashboardStats: () => api.get('/analytics/dashboard'),
  getPipelineOverview: () => api.get('/analytics/pipeline'),
  getHiringFunnel: (params) => api.get('/analytics/funnel', { params }),
  getRecentActivity: (params) => api.get('/analytics/activity', { params }),
  getSourceAnalytics: () => api.get('/analytics/sources'),
  getTimeToHire: () => api.get('/analytics/time-to-hire'),
};

// ==================== HR APIs ====================
export const employeesApi = {
  getAll: (params) => api.get('/hr/employees', { params }),
  getById: (id) => api.get(`/hr/employees/${id}`),
  create: (data) => api.post('/hr/employees', data),
  update: (id, data) => api.put(`/hr/employees/${id}`, data),
  delete: (id) => api.delete(`/hr/employees/${id}`),
};

export const biasDetectorApi = {
  getAll: (params) => api.get('/hr/bias-reports', { params }),
  getById: (id) => api.get(`/hr/bias-reports/${id}`),
  analyze: (data) => api.post('/hr/bias-reports/analyze', data),
  update: (id, data) => api.put(`/hr/bias-reports/${id}`, data),
  delete: (id) => api.delete(`/hr/bias-reports/${id}`),
};

export const sentimentApi = {
  getAll: (params) => api.get('/hr/sentiment', { params }),
  getById: (id) => api.get(`/hr/sentiment/${id}`),
  analyze: (data) => api.post('/hr/sentiment/analyze', data),
  delete: (id) => api.delete(`/hr/sentiment/${id}`),
};

export const cultureFitApi = {
  getAll: (params) => api.get('/hr/culture-fit', { params }),
  getById: (id) => api.get(`/hr/culture-fit/${id}`),
  score: (data) => api.post('/hr/culture-fit/score', data),
  delete: (id) => api.delete(`/hr/culture-fit/${id}`),
};

export const performanceReviewsApi = {
  getAll: (params) => api.get('/hr/performance-reviews', { params }),
  getById: (id) => api.get(`/hr/performance-reviews/${id}`),
  create: (data) => api.post('/hr/performance-reviews', data),
  generate: (data) => api.post('/hr/performance-reviews/generate', data),
  update: (id, data) => api.put(`/hr/performance-reviews/${id}`, data),
  delete: (id) => api.delete(`/hr/performance-reviews/${id}`),
};

export const salaryBenchmarkApi = {
  getAll: (params) => api.get('/hr/salary-benchmarks', { params }),
  getById: (id) => api.get(`/hr/salary-benchmarks/${id}`),
  analyze: (data) => api.post('/hr/salary-benchmarks/analyze', data),
  delete: (id) => api.delete(`/hr/salary-benchmarks/${id}`),
};

export const exitInterviewsApi = {
  getAll: (params) => api.get('/hr/exit-interviews', { params }),
  getById: (id) => api.get(`/hr/exit-interviews/${id}`),
  create: (data) => api.post('/hr/exit-interviews', data),
  analyze: (id) => api.post(`/hr/exit-interviews/${id}/analyze`),
  update: (id, data) => api.put(`/hr/exit-interviews/${id}`, data),
  delete: (id) => api.delete(`/hr/exit-interviews/${id}`),
};

export const orgChartApi = {
  getAll: (params) => api.get('/hr/org-charts', { params }),
  getById: (id) => api.get(`/hr/org-charts/${id}`),
  create: (data) => api.post('/hr/org-charts', data),
  optimize: (id) => api.post(`/hr/org-charts/${id}/optimize`),
  delete: (id) => api.delete(`/hr/org-charts/${id}`),
};

export const interviewSchedulerApi = {
  getAll: (params) => api.get('/hr/interview-schedules', { params }),
  getById: (id) => api.get(`/hr/interview-schedules/${id}`),
  create: (data) => api.post('/hr/interview-schedules', data),
  update: (id, data) => api.put(`/hr/interview-schedules/${id}`, data),
  delete: (id) => api.delete(`/hr/interview-schedules/${id}`),
};

export const skillsAssessorApi = {
  getAll: (params) => api.get('/hr/skills/assessments', { params }),
  assess: (data) => api.post('/hr/skills/assess', data),
  delete: (id) => api.delete(`/hr/skills/assessments/${id}`),
};

// Helper to download blob as file
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};

export default api;
