import api from './api';

/** GET /api/health-score -> { current: {...}, history: [{ date, overall, ... }] } */
export function getHealthScore() {
  return api.get('/api/health-score').then((res) => res.data);
}

export default { getHealthScore };
