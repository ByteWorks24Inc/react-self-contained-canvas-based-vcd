import axios from 'axios';

const api = axios.create({
    baseURL: 'http://18.217.148.74:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Basic ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
