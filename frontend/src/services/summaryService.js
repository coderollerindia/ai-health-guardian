import api from './api';

/** GET /api/summary?period=weekly|monthly -> AIInsightsResponse */
export function getSummary(period = 'weekly') {
  return api.get('/api/summary', { params: { period } }).then((res) => res.data);
}

export default { getSummary };
