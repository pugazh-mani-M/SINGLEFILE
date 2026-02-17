import React, { useState } from 'react';

const TemplateForm = ({ onSubmit, onCancel, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    category: initialData?.category || 'UTILITY',
    language: initialData?.language || 'en_US',
    components: initialData?.components || [
      { type: 'BODY', text: '' }
    ]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateComponent = (index, field, value) => {
    const newComponents = [...formData.components];
    newComponents[index] = { ...newComponents[index], [field]: value };
    setFormData({ ...formData, components: newComponents });
  };

  const addComponent = (type) => {
    setFormData({
      ...formData,
      components: [...formData.components, { type, text: '' }]
    });
  };

  const removeComponent = (index) => {
    const newComponents = formData.components.filter((_, i) => i !== index);
    setFormData({ ...formData, components: newComponents });
  };

  return (
    <form onSubmit={handleSubmit} className="template-form">
      <div className="form-group">
        <label className="form-label">
          Template Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="form-input"
          required
        />
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="form-select"
          >
            <option value="UTILITY">Utility</option>
            <option value="MARKETING">Marketing</option>
            <option value="AUTHENTICATION">Authentication</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">
            Language
          </label>
          <select
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            className="form-select"
          >
            <option value="en_US">English (US)</option>
            <option value="es">Spanish</option>
            <option value="pt_BR">Portuguese (Brazil)</option>
          </select>
        </div>
      </div>

      <div className="component-section">
        <label className="form-label">
          Components
        </label>
        {formData.components.map((component, index) => (
          <div key={index} className="component-card">
            <div className="component-header">
              <select
                value={component.type}
                onChange={(e) => updateComponent(index, 'type', e.target.value)}
                className="component-type-select"
              >
                <option value="HEADER">Header</option>
                <option value="BODY">Body</option>
                <option value="FOOTER">Footer</option>
              </select>
              {formData.components.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeComponent(index)}
                  className="remove-component-btn"
                >
                  Remove
                </button>
              )}
            </div>
            <textarea
              value={component.text}
              onChange={(e) => updateComponent(index, 'text', e.target.value)}
              placeholder={`Enter ${component.type.toLowerCase()} text...`}
              className="form-textarea"
              required
            />
          </div>
        ))}
        
        <div className="add-component-buttons">
          <button
            type="button"
            onClick={() => addComponent('HEADER')}
            className="add-component-btn"
          >
            Add Header
          </button>
          <button
            type="button"
            onClick={() => addComponent('FOOTER')}
            className="add-component-btn"
          >
            Add Footer
          </button>
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="btn-cancel"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn-submit"
        >
          {initialData ? 'Update' : 'Create'} Template
        </button>
      </div>
    </form>
  );
};

export default TemplateForm;