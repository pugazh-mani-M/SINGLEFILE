import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { useTemplates } from '../hooks/useTemplates';
import TemplateList from '../components/templates/TemplateList';
import TemplateForm from '../components/templates/TemplateForm';
import TemplatePreview from '../components/templates/TemplatePreview';
import SyncHelpModal from '../components/templates/SyncHelpModal';
import '../styles/templates.css';

const Templates = () => {
  const { isDark } = useTheme();
  const toast = useToast();
  const { templates, loading, error, createTemplate, deleteTemplate, syncTemplates } = useTemplates();
  const [showForm, setShowForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showSyncHelp, setShowSyncHelp] = useState(false);

  const handleCreateTemplate = async (templateData) => {
    try {
      await createTemplate(templateData);
      setShowForm(false);
      toast.success('Template created successfully!');
    } catch (error) {
      toast.error('Failed to create template');
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteTemplate(id);
        toast.success('Template deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete template');
      }
    }
  };

  const handleSyncTemplates = async () => {
    try {
      await syncTemplates();
      const message = import.meta.env.DEV 
        ? 'Templates synced! (Development mode - using mock data)'
        : 'Templates synced with Meta WhatsApp Business API!';
      toast.success(message);
    } catch (error) {
      toast.error('Failed to sync templates: ' + error.message);
    }
  };

  const handlePreview = (template) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  if (loading && templates.length === 0) {
    return (
      <div className="loading-state">
        <div>Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="templates-container">
      <div className="templates-header">
          <div>
            <h1 className="templates-title">WhatsApp Templates</h1>
            <p className="templates-subtitle">
              Manage your WhatsApp message templates
              <button 
                onClick={() => setShowSyncHelp(true)}
                className="info-btn"
                title="Learn about template sync"
              >
                ℹ️ What is sync?
              </button>
            </p>
          </div>
          <div className="templates-actions">
            <button
              onClick={handleSyncTemplates}
              disabled={loading}
              className="btn btn-success"
              title="Synchronize templates with Meta WhatsApp Business API"
            >
              {loading ? 'Syncing...' : 'Sync with Meta'}
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
              title="Create a new WhatsApp message template"
            >
              Create Template
            </button>
          </div>
        </div>

        {error && (
          <div className="error-alert">
            {error}
          </div>
        )}

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number blue">{templates.length}</div>
            <div className="stat-label">Total Templates</div>
          </div>
          <div className="stat-card">
            <div className="stat-number green">
              {templates.filter(t => t.status === 'APPROVED').length}
            </div>
            <div className="stat-label">Approved</div>
          </div>
          <div className="stat-card">
            <div className="stat-number yellow">
              {templates.filter(t => t.status === 'PENDING').length}
            </div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-number red">
              {templates.filter(t => t.status === 'REJECTED').length}
            </div>
            <div className="stat-label">Rejected</div>
          </div>
        </div>

        <TemplateList
          templates={templates}
          onEdit={(template) => {
            setSelectedTemplate(template);
            setShowForm(true);
          }}
          onDelete={handleDeleteTemplate}
          onPreview={handlePreview}
        />

        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title">
                  {selectedTemplate ? 'Edit Template' : 'Create New Template'}
                </h2>
              </div>
              <div className="modal-body">
                <TemplateForm
                  initialData={selectedTemplate}
                  onSubmit={handleCreateTemplate}
                  onCancel={() => {
                    setShowForm(false);
                    setSelectedTemplate(null);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {showPreview && (
          <TemplatePreview
            template={selectedTemplate}
            onClose={() => {
              setShowPreview(false);
              setSelectedTemplate(null);
            }}
          />
        )}

        {showSyncHelp && (
          <SyncHelpModal
            isOpen={showSyncHelp}
            onClose={() => setShowSyncHelp(false)}
          />
        )}
    </div>
  );
};

export default Templates;