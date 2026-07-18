import api from './api';

/**
 * POST /api/upload-bill
 * multipart: file, hospital_name?, location?, insurance_company?, notes?
 * -> BillAnalysisResponse
 */
export function uploadBill(file, { hospitalName, location, insuranceCompany, notes } = {}) {
  const formData = new FormData();
  formData.append('file', file);
  if (hospitalName) formData.append('hospital_name', hospitalName);
  if (location) formData.append('location', location);
  if (insuranceCompany) formData.append('insurance_company', insuranceCompany);
  if (notes) formData.append('notes', notes);
  return api
    .post('/api/upload-bill', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data);
}

export default { uploadBill };
