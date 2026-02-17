import React from 'react';
import TemplateStatus from './TemplateStatus';

const TemplateList = ({ templates, onEdit, onDelete, onPreview }) => {
  if (!templates.length) {
    return (
      <div className="empty-state">
        No templates found. Create your first template to get started.
      </div>
    );
  }

  return (
    <div className="templates-list">
      {templates.map((template) => (
        <div key={template.id} className="template-card">
          <div className="template-header">
            <div className="template-info">
              <h3>{template.name}</h3>
              <p className="template-category">{template.category.toLowerCase()}</p>
            </div>
            <TemplateStatus status={template.status} />
          </div>
          
          <div className="template-meta">
            <div className="template-language">
              <span className="label">Language: </span>
              <span className="value">{template.language}</span>
            </div>
          </div>
          
          <div className="template-preview">
            {template.components.find(c => c.type === 'BODY')?.text?.substring(0, 100)}...
          </div>
          
          <div className="template-footer">
            <div className="template-date">
              Created: {new Date(template.createdAt).toLocaleDateString()}
            </div>
            <div className="template-actions">
              <button
                onClick={() => onPreview(template)}
                className="btn-sm btn-preview"
              >
                Preview
              </button>
              <button
                onClick={() => onEdit(template)}
                className="btn-sm btn-edit"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(template.id)}
                className="btn-sm btn-delete"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TemplateList;