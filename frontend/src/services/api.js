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
  (error) => {
    return Promise.reject(error);
  }
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

// API functions
export const jobsApi = {
  getAll: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  delete: (id) => api.delete(`/jobs/${id}`),
  generateDescription: (data) => api.post('/jobs/ai/generate-description', data),
  generateQuestions: (id, data) => api.post(`/jobs/${id}/ai/generate-questions`, data),
};

export const candidatesApi = {
  getAll: (params) => api.get('/candidates', { params }),
  getById: (id) => api.get(`/candidates/${id}`),
  create: (data) => api.post('/candidates', data),
  update: (id, data) => api.put(`/candidates/${id}`, data),
  delete: (id) => api.delete(`/candidates/${id}`),
  analyzeResume: (id) => api.post(`/candidates/${id}/ai/analyze-resume`),
  rankCandidates: (jobId) => api.post(`/candidates/job/${jobId}/ai/rank`),
  addNote: (id, data) => api.post(`/candidates/${id}/notes`, data),
};

export const interviewsApi = {
  getAll: (params) => api.get('/interviews', { params }),
  getById: (id) => api.get(`/interviews/${id}`),
  create: (data) => api.post('/interviews', data),
  update: (id, data) => api.put(`/interviews/${id}`, data),
  delete: (id) => api.delete(`/interviews/${id}`),
  generateQuestions: (id, data) => api.post(`/interviews/${id}/ai/generate-questions`, data),
  submitFeedback: (id, data) => api.post(`/interviews/${id}/feedback`, data),
};

export const communicationsApi = {
  getAll: (params) => api.get('/communications', { params }),
  getById: (id) => api.get(`/communications/${id}`),
  create: (data) => api.post('/communications', data),
  generateEmail: (data) => api.post('/communications/ai/generate-email', data),
  getTemplates: (params) => api.get('/communications/templates', { params }),
  createTemplate: (data) => api.post('/communications/templates', data),
};

export const assessmentsApi = {
  getAll: (params) => api.get('/assessments', { params }),
  getById: (id) => api.get(`/assessments/${id}`),
  create: (data) => api.post('/assessments', data),
  generate: (data) => api.post('/assessments/ai/generate', data),
  start: (id) => api.post(`/assessments/${id}/start`),
  submit: (id, data) => api.post(`/assessments/${id}/submit`, data),
};

export const analyticsApi = {
  getDashboardStats: () => api.get('/analytics/dashboard'),
  getPipelineOverview: () => api.get('/analytics/pipeline'),
  getHiringFunnel: (params) => api.get('/analytics/funnel', { params }),
  getRecentActivity: (params) => api.get('/analytics/activity', { params }),
  getSourceAnalytics: () => api.get('/analytics/sources'),
  getTimeToHire: () => api.get('/analytics/time-to-hire'),
};

export default api;
