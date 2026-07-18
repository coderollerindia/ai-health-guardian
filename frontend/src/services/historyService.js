import api from './api';

/**
 * GET /api/history?type=&q=&from=&to=
 * -> { items: [{ id, type, title, subtitle, date, summary }] }
 */
export function getHistory({ type, q, from, to } = {}) {
  return api
    .get('/api/history', { params: { type, q, from, to } })
    .then((res) => res.data);
}

export default { getHistory };
