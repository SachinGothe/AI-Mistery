import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', timeout: 180000 });
export const errMsg = e => {
  if (e.code === 'ECONNABORTED' || e.message?.includes('timeout')) {
    return 'The case generation took longer than expected. Please try again.';
  }
  return e.response?.data?.error || e.message || 'Could not reach the server. Check your connection and try again.';
};
export const createCase = (premise, difficulty) => api.post('/cases', { premise, difficulty }).then(r => r.data);
export const getCase = id => api.get(`/cases/${id}`).then(r => r.data);
export const discover = (id, clueId) => api.post(`/cases/${id}/clues/${clueId}/discover`).then(r => r.data);
export const getHint = id => api.post(`/cases/${id}/hints`).then(r => r.data);
export const accuse = (id, suspectId) => api.post(`/cases/${id}/accuse`, { suspectId }).then(r => r.data);
export const getResult = id => api.get(`/cases/${id}/result`).then(r => r.data);
export const interrogate = (id, suspectId, question) => api.post(`/cases/${id}/interrogate`, { suspectId, question }).then(r => r.data);
export const cloneCase = id => api.post(`/cases/${id}/clone`).then(r => r.data);
export const listCases = ids => api.get('/cases', { params: { ids: ids.join(',') } }).then(r => r.data);
