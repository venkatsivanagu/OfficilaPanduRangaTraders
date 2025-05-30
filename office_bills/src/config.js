const config = {
  api: {
    // Development URL - points to your local backend
    dev: 'http://localhost:10000/api',
    // Production URL - update this with your deployed backend URL
    prod: 'https://panduranga-traders-backend.onrender.com/api'
  }
};

// Use the appropriate API URL based on the environment
const API_BASE_URL = import.meta.env.PROD ? config.api.prod : config.api.dev;

export { API_BASE_URL };
