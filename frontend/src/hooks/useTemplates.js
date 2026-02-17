import { useState, useEffect } from 'react';
import templateApiService from '../services/templateApi.service';

export const useTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await templateApiService.getAllTemplates();
      setTemplates(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await templateApiService.createTemplate(templateData);
      setTemplates(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create template');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await templateApiService.deleteTemplate(id);
      setTemplates(prev => prev.filter(template => template.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete template');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const syncTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      await templateApiService.syncTemplates();
      await fetchTemplates(); // Refresh templates after sync
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to sync templates');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    createTemplate,
    deleteTemplate,
    syncTemplates
  };
};