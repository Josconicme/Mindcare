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
// At the end of your app.js file, replace your current server listening code with this:

// Find an available port
const findAvailablePort = (startPort) => {
  return new Promise((resolve, reject) => {
    const server = require('http').createServer();
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Port is in use, try the next one
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });
    
    server.on('listening', () => {
      // Found an available port
      const port = server.address().port;
      server.close(() => {
        resolve(port);
      });
    });
    
    server.listen(startPort);
  });
};

// Start the server on an available port
const startServer = async () => {
  try {
    const desiredPort = process.env.PORT || 5000;
    const availablePort = await findAvailablePort(desiredPort);
    
    app.listen(availablePort, () => {
      if (availablePort !== desiredPort) {
        console.log(`Note: Port ${desiredPort} was in use. Using port ${availablePort} instead.`);
      }
      console.log(`Server running on port ${availablePort}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();