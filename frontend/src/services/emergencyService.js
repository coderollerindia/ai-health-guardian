import api from './api';

/**
 * POST /api/emergency-check
 * json { symptoms }
 * -> { urgency, recommendation: { action, reasons[], nearby_action } }
 */
export function checkEmergency(symptoms) {
  return api.post('/api/emergency-check', { symptoms }).then((res) => res.data);
}

export default { checkEmergency };
