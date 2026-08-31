import { api, setToken } from './client.js';

export const auth = {
  login: (email, password) => api.post('/auth/login', { email, password }).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data.admin),
  logout: () => setToken(null),
};

export const products = {
  list: (params) => api.get('/products', { params }).then((r) => r.data),
  get: (id) => api.get(`/products/${id}`).then((r) => r.data.data),
  create: (body) => api.post('/products', body).then((r) => r.data.data),
  update: (id, body) => api.patch(`/products/${id}`, body).then((r) => r.data.data),
  remove: (id) => api.delete(`/products/${id}`).then((r) => r.data),
};

export const customers = {
  list: (params) => api.get('/customers', { params }).then((r) => r.data),
  get: (id) => api.get(`/customers/${id}`).then((r) => r.data.data),
  update: (id, body) => api.patch(`/customers/${id}`, body).then((r) => r.data.data),
};

export const orders = {
  list: (params) => api.get('/orders', { params }).then((r) => r.data),
  get: (id) => api.get(`/orders/${id}`).then((r) => r.data.data),
  update: (id, body) => api.patch(`/orders/${id}`, body).then((r) => r.data.data),
};

export const conversations = {
  list: (params) => api.get('/conversations', { params }).then((r) => r.data),
  get: (id) => api.get(`/conversations/${id}`).then((r) => r.data.data),
};

export const cannedResponses = {
  list: (params) => api.get('/canned-responses', { params }).then((r) => r.data.data),
  create: (body) => api.post('/canned-responses', body).then((r) => r.data.data),
  update: (id, body) => api.patch(`/canned-responses/${id}`, body).then((r) => r.data.data),
  remove: (id) => api.delete(`/canned-responses/${id}`).then((r) => r.data),
};

export const chat = {
  ingest: (body) => api.post('/chat/ingest', body).then((r) => r.data.data),
  streamUrl: () => `${import.meta.env.VITE_API_URL || ''}/api/chat/stream`,
};

export function exportUrl(entity, format) {
  return `${import.meta.env.VITE_API_URL || ''}/api/export/${entity}/${format}`;
}
