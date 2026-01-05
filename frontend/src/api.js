import axios from 'axios';

// CHANGE THIS URL to match your XAMPP setup
// If you moved the 'backend' folder to C:/xampp/htdocs/canteen_api, use 'http://localhost/canteen_api/'
const API_BASE_URL = 'http://localhost/canteen/backend/';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
