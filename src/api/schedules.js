import http from '@/axios';

// Schedules API
// listSchedules: filter by departmentId, doctorId, date (YYYY-MM-DD), session (MORNING/AFTERNOON/EVENING)

export const listSchedules = (params = {}) => {
  const { departmentId, doctorId, date, session } = params;
  return http.get('/api/v1/schedules', { params: { departmentId, doctorId, date, session } });
};
