import http from '@/axios';

// Appointments API
// createAppointment: { patientId, scheduleId, type: 'GENERAL'|'EXPERT' }

export const createAppointment = (payload) => {
  return http.post('/api/v1/appointments', payload);
};
