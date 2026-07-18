import api from './api';

/**
 * POST /api/chat
 * json { message, session_id?, context_type?, context_id? }
 * -> { reply, session_id, suggested_followups[] }
 */
export function sendChatMessage({ message, sessionId, contextType, contextId } = {}) {
  return api
    .post('/api/chat', {
      message,
      session_id: sessionId,
      context_type: contextType,
      context_id: contextId,
    })
    .then((res) => res.data);
}

export default { sendChatMessage };
