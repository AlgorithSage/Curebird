// Configuration for API URL
// In development, this points to running backend at localhost:5001
// In production, you should set REACT_APP_API_URL environment variable

const getApiUrl = () => {
    if (process.env.NODE_ENV === 'production') {
        // Fallback to a production URL if env var is not set, or use the env var
        return process.env.REACT_APP_API_URL || 'https://curebird-backend-sgz7homzqq-uc.a.run.app';
    }
    return 'http://127.0.0.1:5001';
};

export const API_BASE_URL = getApiUrl();
