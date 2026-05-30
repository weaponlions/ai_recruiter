import axios from 'axios';

// Get base URL for Gateway from env or default
const GATEWAY_URL = 'http://3.107.174.120:3000/api/v1';

export const api = axios.create({
  baseURL: GATEWAY_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios Request Interceptor to dynamically inject current simulation headers
api.interceptors.request.use(
  (config) => {
    const tenantId = localStorage.getItem('sim_tenant_id') || 'tenant-starter-123';
    const userId = localStorage.getItem('sim_user_id') || 'user-admin-456';
    const userRole = localStorage.getItem('sim_user_role') || 'ADMIN';

    config.headers['X-Tenant-ID'] = tenantId;
    config.headers['X-User-ID'] = userId;
    config.headers['X-User-Role'] = userRole;

    // Simulate Authorization Bearer Token
    config.headers['Authorization'] = `Bearer mock-jwt-token-for-${userId}`;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// High-fidelity fallback database for simulation when microservices are offline
export const mockDb = {
  jobs: [
    { id: 'job-1', title: 'Senior AI Engineer', location: 'San Francisco, CA (Hybrid)', type: 'FULL_TIME', status: 'PUBLISHED', createdBy: 'admin', description: 'Lead LLM fine-tuning and retrieval-augmented generation pipelines.', applicants: 12 },
    { id: 'job-2', title: 'Lead Product Designer', location: 'Remote (US)', type: 'FULL_TIME', status: 'PUBLISHED', createdBy: 'admin', description: 'Design modern dark-mode enterprise web interfaces with glassmorphic systems.', applicants: 8 },
    { id: 'job-3', title: 'Backend Node.js Developer', location: 'New York, NY', type: 'FULL_TIME', status: 'DRAFT', createdBy: 'admin', description: 'Maintain and scale our NestJS microservices and BullMQ event pipelines.', applicants: 0 }
  ],
  candidates: [
    { id: 'c-1', firstName: 'Alexander', lastName: 'Mercer', email: 'alex@mercer.ai', tags: ['Python', 'PyTorch', 'LLMs'], matchScore: 94, status: 'Shortlist', phone: '+1 (555) 019-2834', resumeUrl: '#' },
    { id: 'c-2', firstName: 'Sophia', lastName: 'Chen', email: 'sophia@chen.design', tags: ['Figma', 'UX Research', 'CSS Grid'], matchScore: 89, status: 'Interview', phone: '+1 (555) 014-9843', resumeUrl: '#' },
    { id: 'c-3', firstName: 'Marcus', lastName: 'Vance', email: 'marcus.vance@dev.net', tags: ['NestJS', 'Postgres', 'Docker'], matchScore: 82, status: 'Screening', phone: '+1 (555) 017-3829', resumeUrl: '#' },
    { id: 'c-4', firstName: 'Elena', lastName: 'Rostova', email: 'elena.rostova@data.org', tags: ['Scikit-Learn', 'NLP', 'FastAPI'], matchScore: 78, status: 'Applied', phone: '+1 (555) 012-7493', resumeUrl: '#' }
  ],
  pipelines: [
    { id: 'stage-1', name: 'Applied', candidates: ['c-4'] },
    { id: 'stage-2', name: 'Screening', candidates: ['c-3'] },
    { id: 'stage-3', name: 'Interview', candidates: ['c-2'] },
    { id: 'stage-4', name: 'Shortlist', candidates: ['c-1'] }
  ],
  compliance: [
    { id: 'req-1', requestType: 'EXPORT', candidateEmail: 'alex@mercer.ai', status: 'COMPLETED', requestedBy: 'admin', createdAt: '2026-05-29' },
    { id: 'req-2', requestType: 'ERASURE', candidateEmail: 'marcus.vance@dev.net', status: 'PENDING', requestedBy: 'recruiter', createdAt: '2026-05-30' }
  ]
};
