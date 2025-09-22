import http from '@/axios';

// Doctors API

export const listDoctors = (params = {}) => {
  const { departmentId } = params;
  return http.get('/api/v1/doctors', { params: { departmentId } });
};
