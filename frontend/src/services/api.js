import axios from 'axios';
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api/v1', withCredentials: true });
let csrf = '';
export const setCsrf = (v) => csrf = v;
api.interceptors.request.use(c => { if (csrf && ['post', 'patch', 'put', 'delete'].includes((c.method || '').toLowerCase()))
    c.headers['X-CSRF-Token'] = csrf; return c; });
