import api from './api';

/**
 * POST /api/upload-prescription
 * multipart: file, notes?
 * -> PrescriptionAnalysisResponse
 */
export function uploadPrescription(file, notes) {
  const formData = new FormData();
  formData.append('file', file);
  if (notes) formData.append('notes', notes);
  return api
    .post('/api/upload-prescription', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data);
}

export default { uploadPrescription };
