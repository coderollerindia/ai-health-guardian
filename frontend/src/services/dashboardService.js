import api from './api';

/** GET /api/dashboard -> DashboardResponse */
export function getDashboard() {
  return api.get('/api/dashboard').then((res) => res.data);
}

export default { getDashboard };
