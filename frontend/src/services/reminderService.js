import api from './api';

/** GET /api/medicine-reminder -> { reminders: [...] } */
export function getReminders() {
  return api.get('/api/medicine-reminder').then((res) => res.data);
}

/** POST /api/medicine-reminder json Reminder -> created Reminder */
export function createReminder(reminder) {
  return api.post('/api/medicine-reminder', reminder).then((res) => res.data);
}

/** PATCH /api/medicine-reminder/{id} partial Reminder -> updated Reminder */
export function updateReminder(id, partialReminder) {
  return api.patch(`/api/medicine-reminder/${id}`, partialReminder).then((res) => res.data);
}

/** DELETE /api/medicine-reminder/{id} -> { ok: true } */
export function deleteReminder(id) {
  return api.delete(`/api/medicine-reminder/${id}`).then((res) => res.data);
}

export default { getReminders, createReminder, updateReminder, deleteReminder };
