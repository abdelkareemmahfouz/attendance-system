import axios from 'axios';

// Replace with your deployed Google Apps Script URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// API Functions

export const getStudents = async () => {
  try {
    const response = await api.get('?path=students');
    return response.data;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

export const markAttendance = async (qrCode, markedBy) => {
  try {
    const response = await api.post('?path=attendance/mark', {
      qr_code: qrCode,
      marked_by: markedBy,
      timestamp: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    console.error('Error marking attendance:', error);
    throw error;
  }
};

export const getTodayAttendance = async (date = null) => {
  try {
    const params = date ? `&date=${date}` : '';
    const response = await api.get(`?path=attendance/today${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching today attendance:', error);
    throw error;
  }
};

export const getAttendanceReport = async (startDate, endDate, studentId = null) => {
  try {
    let params = `?path=attendance/report&start_date=${startDate}&end_date=${endDate}`;
    if (studentId) {
      params += `&student_id=${studentId}`;
    }
    const response = await api.get(params);
    return response.data;
  } catch (error) {
    console.error('Error fetching attendance report:', error);
    throw error;
  }
};

export const getDashboardStats = async () => {
  try {
    const response = await api.get('?path=dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export const addStudent = async (studentData) => {
  try {
    const response = await api.post('?path=students/add', studentData);
    return response.data;
  } catch (error) {
    console.error('Error adding student:', error);
    throw error;
  }
};

export const importStudents = async (studentsArray) => {
  try {
    const response = await api.post('?path=students/import', {
      students: studentsArray
    });
    return response.data;
  } catch (error) {
    console.error('Error importing students:', error);
    throw error;
  }
};

export const getSettings = async () => {
  try {
    const response = await api.get('?path=settings');
    return response.data;
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
};

export default api;
