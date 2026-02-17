import React from 'react';

const TemplatePreview = ({ template, onClose }) => {
  if (!template) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Template Preview</h2>
          <button onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="template-preview-details">
            <h3>{template.name}</h3>
            <p><strong>Category:</strong> {template.category}</p>
            <p><strong>Language:</strong> {template.language}</p>
            <p><strong>Status:</strong> {template.status}</p>
            <p><strong>Created:</strong> {new Date(template.createdAt).toLocaleDateString()}</p>
            {template.metaTemplateId && (
              <p><strong>Meta ID:</strong> {template.metaTemplateId}</p>
            )}
            <div className="template-content">
              <strong>Content:</strong>
              <div className="template-body">
                {template.components.find(c => c.type === 'BODY')?.text || 'No content'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;