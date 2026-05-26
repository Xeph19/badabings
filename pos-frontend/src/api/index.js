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
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id)       => api.delete(`/categories/${id}`);

// ─── Menu Items ────────────────────────────────────────────
export const getMenuItems   = (params) => api.get('/menu-items', { params });
export const createMenuItem = (fd)     => api.post('/menu-items', fd, { headers: { 'Content-Type': undefined } });
export const updateMenuItem = (id, fd) => api.post(`/menu-items/${id}`, fd, { headers: { 'Content-Type': undefined } });
export const deleteMenuItem = (id)     => api.delete(`/menu-items/${id}`);

// ─── Discounts ─────────────────────────────────────────────
export const getDiscounts    = ()         => api.get('/discounts');
export const createDiscount  = (data)     => api.post('/discounts', data);
export const updateDiscount  = (id, data) => api.put(`/discounts/${id}`, data);
export const deleteDiscount  = (id)       => api.delete(`/discounts/${id}`);

// ─── Orders ────────────────────────────────────────────────
export const getOrders   = (params) => api.get('/orders', { params });
export const createOrder = (data)   => api.post('/orders', data);
export const getOrder    = (id)     => api.get(`/orders/${id}`);
export const updateStatus = (id, status) => api.patch(`/orders/${id}/status`, { status });
export const voidOrder   = (id)     => api.patch(`/orders/${id}/status`, { status: 'voided' });

// ─── Analytics ─────────────────────────────────────────────
export const getAnalytics     = (params) => api.get('/dashboard/analytics', { params });
export const getDashboardSummary  = ()   => api.get('/dashboard/summary');
export const getDailyRevenue  = (days)   => api.get('/dashboard/daily-revenue', { params: { days } });
export const getMonthlyRevenue = (months)=> api.get('/dashboard/monthly-revenue', { params: { months } });

// ─── Revenue Overrides ─────────────────────────────────────
export const getOverrides   = ()     => api.get('/revenue-overrides');
export const upsertOverride = (data) => api.post('/revenue-overrides', data);
export const deleteOverride = (id)   => api.delete(`/revenue-overrides/${id}`);

// ─── Shifts ────────────────────────────────────────────────
export const getCurrentShift = ()     => api.get('/shifts/current');
export const openShift  = (data)      => api.post('/shifts/open', data);
export const closeShift = (data)      => api.put('/shifts/close', data);
export const getShifts  = ()          => api.get('/shifts');
