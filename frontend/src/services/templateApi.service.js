import axios from 'axios';
import { API_BASE_URL } from '../config/api';

class TemplateApiService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/templates`,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async getAllTemplates() {
    const response = await this.api.get('/');
    return response.data;
  }

  async getTemplateById(id) {
    const response = await this.api.get(`/${id}`);
    return response.data;
  }

  async createTemplate(templateData) {
    const response = await this.api.post('/', templateData);
    return response.data;
  }

  async deleteTemplate(id) {
    const response = await this.api.delete(`/${id}`);
    return response.data;
  }

  async syncTemplates() {
    const response = await this.api.post('/sync');
    return response.data;
  }
}

export default new TemplateApiService();