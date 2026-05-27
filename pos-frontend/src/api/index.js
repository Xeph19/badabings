import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pos_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('pos_token');
      localStorage.removeItem('pos_user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default api;

// ─── Auth ──────────────────────────────────────────────────
export const login  = (data) => api.post('/auth/login', data);
export const logout = ()     => api.post('/auth/logout');
export const me     = ()     => api.get('/auth/me');

// ─── Categories ────────────────────────────────────────────
export const getCategories  = ()         => api.get('/categories');
export const createCategory = (data)     => api.post('/categories', data);
export const updateCategory = (id, data) => api.post(`/categories/${id}`, { ...data, _method: 'PUT' });
export const deleteCategory = (id)       => api.post(`/categories/${id}`, { _method: 'DELETE' });

// ─── Menu Items ────────────────────────────────────────────
export const getMenuItems   = (params) => api.get('/menu-items', { params });
export const createMenuItem = (fd)     => api.post('/menu-items', fd, { headers: { 'Content-Type': undefined } });
export const updateMenuItem = (id, fd) => api.post(`/menu-items/${id}`, fd, { headers: { 'Content-Type': undefined } }); // Note: updateMenuItem is already POST in Laravel with FormData
export const deleteMenuItem = (id)     => api.post(`/menu-items/${id}`, { _method: 'DELETE' });

// ─── Discounts ─────────────────────────────────────────────
export const getDiscounts    = ()         => api.get('/discounts');
export const createDiscount  = (data)     => api.post('/discounts', data);
export const updateDiscount  = (id, data) => api.post(`/discounts/${id}`, { ...data, _method: 'PUT' });
export const deleteDiscount  = (id)       => api.post(`/discounts/${id}`, { _method: 'DELETE' });

// ─── Orders ────────────────────────────────────────────────
export const getOrders   = (params) => api.get('/orders', { params });
export const createOrder = (data)   => api.post('/orders', data);
export const getOrder    = (id)     => api.get(`/orders/${id}`);
export const updateStatus = (id, status) => api.post(`/orders/${id}/status`, { status, _method: 'PATCH' });
export const voidOrder   = (id)     => api.post(`/orders/${id}/status`, { status: 'voided', _method: 'PATCH' });

// ─── Analytics ─────────────────────────────────────────────
export const getAnalytics     = (params) => api.get('/dashboard/analytics', { params });
export const getDashboardSummary  = ()   => api.get('/dashboard/summary');
export const getDailyRevenue  = (days)   => api.get('/dashboard/daily-revenue', { params: { days } });
export const getMonthlyRevenue = (months)=> api.get('/dashboard/monthly-revenue', { params: { months } });

// ─── Revenue Overrides ─────────────────────────────────────
export const getOverrides   = ()     => api.get('/revenue-overrides');
export const upsertOverride = (data) => api.post('/revenue-overrides', data);
export const deleteOverride = (id)   => api.post(`/revenue-overrides/${id}`, { _method: 'DELETE' });

// ─── Shifts ────────────────────────────────────────────────
export const getCurrentShift = ()     => api.get('/shifts/current');
export const openShift  = (data)      => api.post('/shifts/open', data);
export const closeShift = (data)      => api.post('/shifts/close', { ...data, _method: 'PUT' });
export const getShifts  = ()          => api.get('/shifts');
