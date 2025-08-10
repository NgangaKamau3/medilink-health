import axios from 'axios';
import { 
  savePatientOffline, 
  saveEncounterOffline,
  searchPatientsOffline,
  getPatientOffline,
  getPatientEncountersOffline
} from './database';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Check if online
const isOnline = () => navigator.onLine;

// Auth API
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  },
  
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
  }
};

// Patients API with offline fallback
export const patientsAPI = {
  search: async (searchData) => {
    if (!isOnline()) {
      return await searchPatientsOffline(searchData.query, searchData.search_type);
    }
    
    try {
      const response = await api.post('/patients/search', searchData);
      // Cache results offline
      for (const patient of response.data) {
        await savePatientOffline(patient);
      }
      return response.data;
    } catch (error) {
      console.log('Online search failed, using offline data');
      return await searchPatientsOffline(searchData.query, searchData.search_type);
    }
  },
  
  getById: async (patientId) => {
    if (!isOnline()) {
      return await getPatientOffline(patientId);
    }
    
    try {
      const response = await api.get(`/patients/${patientId}`);
      await savePatientOffline(response.data);
      return response.data;
    } catch (error) {
      console.log('Online fetch failed, using offline data');
      return await getPatientOffline(patientId);
    }
  },
  
  update: async (patientId, patientData) => {
    if (!isOnline()) {
      // Save offline and add to sync queue
      const updatedPatient = { ...patientData, patient_id: patientId };
      await savePatientOffline(updatedPatient);
      return { message: 'Saved offline, will sync when online' };
    }
    
    try {
      const response = await api.put(`/patients/${patientId}`, patientData);
      // Update offline cache
      const updatedPatient = { ...patientData, patient_id: patientId };
      await savePatientOffline(updatedPatient);
      return response.data;
    } catch (error) {
      // Fallback to offline save
      const updatedPatient = { ...patientData, patient_id: patientId };
      await savePatientOffline(updatedPatient);
      throw error;
    }
  },
  
  getEncounters: async (patientId) => {
    if (!isOnline()) {
      return await getPatientEncountersOffline(patientId);
    }
    
    try {
      const response = await api.get(`/patients/${patientId}/encounters`);
      // Cache encounters offline
      for (const encounter of response.data) {
        await saveEncounterOffline(encounter);
      }
      return response.data;
    } catch (error) {
      console.log('Online fetch failed, using offline data');
      return await getPatientEncountersOffline(patientId);
    }
  },
  
  createEncounter: async (patientId, encounterData) => {
    const encounter = { ...encounterData, patient_id: patientId };
    
    if (!isOnline()) {
      await saveEncounterOffline(encounter);
      return { message: 'Saved offline, will sync when online' };
    }
    
    try {
      const response = await api.post(`/patients/${patientId}/encounters`, encounterData);
      await saveEncounterOffline({ ...encounter, encounter_id: response.data.encounter_id });
      return response.data;
    } catch (error) {
      // Fallback to offline save
      await saveEncounterOffline(encounter);
      throw error;
    }
  }
};

// Audit API
export const auditAPI = {
  getLogs: async (filters = {}) => {
    try {
      const response = await api.get('/audit/logs', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch audit logs');
    }
  },
  
  getPatientHistory: async (patientId) => {
    try {
      const response = await api.get(`/audit/patient/${patientId}/history`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch patient history');
    }
  },
  
  getUserActivity: async (userId, days = 30) => {
    try {
      const response = await api.get(`/audit/user/${userId}/activity`, { params: { days } });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch user activity');
    }
  },
  
  getSummary: async () => {
    try {
      const response = await api.get('/audit/summary');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch audit summary');
    }
  }
};

export default api;