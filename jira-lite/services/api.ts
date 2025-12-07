import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('access_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear token and redirect to login
            localStorage.removeItem('access_token');
            window.location.href = '/#/login';
        }
        return Promise.reject(error);
    }
);

// ============ AUTH API ============
export const authApi = {
    signup: (data: { email: string; name: string; password: string }) =>
        api.post('/auth/signup', data),

    login: (data: { email: string; password: string }) =>
        api.post<{ access_token: string; token_type: string }>('/auth/login', data),

    getMe: () => api.get('/auth/me'),

    updateProfile: (data: { name?: string; profile_image?: string }) =>
        api.put('/auth/me', data),

    changePassword: (data: { current_password: string; new_password: string; confirm_password: string }) =>
        api.post('/auth/change-password', data),
};

// ============ TEAMS API ============
export const teamsApi = {
    list: () => api.get('/teams'),

    get: (teamId: number) => api.get(`/teams/${teamId}`),

    create: (data: { name: string }) => api.post('/teams', data),

    update: (teamId: number, data: { name: string }) =>
        api.put(`/teams/${teamId}`, data),

    delete: (teamId: number) => api.delete(`/teams/${teamId}`),

    invite: (teamId: number, email: string) =>
        api.post(`/teams/${teamId}/invite`, { email }),

    changeMemberRole: (teamId: number, userId: number, role: string) =>
        api.post(`/teams/${teamId}/members/${userId}/role`, { role }),

    kickMember: (teamId: number, userId: number) =>
        api.delete(`/teams/${teamId}/members/${userId}`),

    leave: (teamId: number) => api.post(`/teams/${teamId}/leave`),
};

// ============ PROJECTS API ============
export const projectsApi = {
    list: (teamId?: number) =>
        api.get('/projects', { params: teamId ? { team_id: teamId } : {} }),

    get: (projectId: number) => api.get(`/projects/${projectId}`),

    create: (data: { name: string; description?: string; team_id: number }) =>
        api.post('/projects', data),

    update: (projectId: number, data: { name?: string; description?: string }) =>
        api.put(`/projects/${projectId}`, data),

    delete: (projectId: number) => api.delete(`/projects/${projectId}`),

    archive: (projectId: number) => api.post(`/projects/${projectId}/archive`),

    unarchive: (projectId: number) => api.post(`/projects/${projectId}/unarchive`),

    favorite: (projectId: number) => api.post(`/projects/${projectId}/favorite`),

    unfavorite: (projectId: number) => api.delete(`/projects/${projectId}/favorite`),
};

// ============ ISSUES API ============
export const issuesApi = {
    list: (filters?: { project_id?: number; status?: string; assignee_id?: number; priority?: string }) =>
        api.get('/issues', { params: filters }),

    get: (issueId: number) => api.get(`/issues/${issueId}`),

    create: (data: {
        title: string;
        description?: string;
        project_id: number;
        assignee_id?: number;
        due_date?: string;
        priority?: string;
        label_ids?: number[];
    }) => api.post('/issues', data),

    update: (issueId: number, data: {
        title?: string;
        description?: string;
        assignee_id?: number | null;
        due_date?: string | null;
        status?: string;
        priority?: string;
        label_ids?: number[];
    }) => api.put(`/issues/${issueId}`, data),

    updateStatus: (issueId: number, status: string, position?: number) =>
        api.patch(`/issues/${issueId}/status`, { status, position }),

    delete: (issueId: number) => api.delete(`/issues/${issueId}`),

    // AI Features
    getAISummary: (issueId: number) => api.post(`/issues/${issueId}/ai/summary`),

    getAISuggestion: (issueId: number) => api.post(`/issues/${issueId}/ai/suggestion`),

    // Subtasks
    createSubtask: (issueId: number, title: string) =>
        api.post(`/issues/${issueId}/subtasks`, { title }),

    updateSubtask: (issueId: number, subtaskId: number, data: { title?: string; is_completed?: boolean }) =>
        api.put(`/issues/${issueId}/subtasks/${subtaskId}`, data),
};

// ============ COMMENTS API ============
export const commentsApi = {
    list: (issueId: number) => api.get(`/comments/issue/${issueId}`),

    create: (data: { issue_id: number; content: string }) =>
        api.post('/comments', data),

    update: (commentId: number, content: string) =>
        api.put(`/comments/${commentId}`, { content }),

    delete: (commentId: number) => api.delete(`/comments/${commentId}`),
};

// ============ NOTIFICATIONS API ============
export const notificationsApi = {
    list: (unreadOnly?: boolean) =>
        api.get('/notifications', { params: unreadOnly ? { unread_only: true } : {} }),

    getUnreadCount: () => api.get('/notifications/unread-count'),

    markRead: (notificationId: number) =>
        api.patch(`/notifications/${notificationId}/read`),

    markAllRead: () => api.post('/notifications/mark-all-read'),
};

export default api;
