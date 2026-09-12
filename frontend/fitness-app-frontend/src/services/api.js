import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8095/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    if (userId) {
        config.headers['X-User-ID'] = userId;
    }
    return config;
});

export const getActivities = () => api.get('/activities');
export const addActivity = (activity) => api.post('/activities', activity);
export const getActivityDetails = (id) => api.get(`/recomendation/activity/${id}`);