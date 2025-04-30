import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
    headers: {
        'Content-Type': 'application/json'

    },
    withCredentials: true
});

// Request interceptor to add auth token to requests
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

// Response interceptor to handle token-related errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token is invalid or expired
            localStorage.removeItem('token');
        }
        return Promise.reject(error);
    }
);

export const getProblems = async () => {
  const response = await api.get("/api/problem");
  return response.data;
};

export const getRecoveries = async () => {
  const response = await api.get("/api/recovery");
  return response.data;
};

export const getTasks = async () => {
  const response = await api.get("/api/task");
  return response.data;
};

export const getUsers = async () => {
  const response = await api.get("/api/user");
  return response.data;
};

export default api;
