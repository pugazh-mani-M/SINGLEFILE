import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const TemplateBuilder = ({ template, onChange, onPreview }) => {
  const [components, setComponents] = useState(template?.components || [
    { type: 'body', text: '', id: 'body-1' }
  ]);
  const [selectedComponent, setSelectedComponent] = useState(null);

  const componentTypes = [
    { type: 'header', label: 'Header', icon: '📋', description: 'Title or media' },
    { type: 'body', label: 'Body', icon: '📝', description: 'Main message text' },
    { type: 'footer', label: 'Footer', icon: '📄', description: 'Additional info' },
    { type: 'buttons', label: 'Buttons', icon: '🔘', description: 'Action buttons' }
  ];

  const buttonTypes = [
    { type: 'quick_reply', label: 'Quick Reply', icon: '💬' },
    { type: 'url', label: 'Website', icon: '🌐' },
    { type: 'phone_number', label: 'Call', icon: '📞' }
  ];

  const handleDragEnd = useCallback((result) => {
    if (!result.destination) return;

    const items = Array.from(components);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setComponents(items);
    onChange?.(items);
  }, [components, onChange]);

  const addComponent = (type) => {
    const newComponent = {
      type,
      text: '',
      id: `${type}-${Date.now()}`
    };

    if (type === 'buttons') {
      newComponent.buttons = [{ type: 'quick_reply', text: '', id: `btn-${Date.now()}` }];
    }

    const newComponents = [...components, newComponent];
    setComponents(newComponents);
    onChange?.(newComponents);
  };

  const updateComponent = (id, updates) => {
    const newComponents = components.map(comp =>
      comp.id === id ? { ...comp, ...updates } : comp
    );
    setComponents(newComponents);
    onChange?.(newComponents);
  };

  const removeComponent = (id) => {
    const newComponents = components.filter(comp => comp.id !== id);
    setComponents(newComponents);
    onChange?.(newComponents);
  };

  const addButton = (componentId) => {
    const newComponents = components.map(comp => {
      if (comp.id === componentId) {
        const newButton = { type: 'quick_reply', text: '', id: `btn-${Date.now()}` };
        return {
          ...comp,
          buttons: [...(comp.buttons || []), newButton]
        };
      }
      return comp;
    });
    setComponents(newComponents);
    onChange?.(newComponents);
  };

  const updateButton = (componentId, buttonId, updates) => {
    const newComponents = components.map(comp => {
      if (comp.id === componentId) {
        return {
          ...comp,
          buttons: comp.buttons.map(btn =>
            btn.id === buttonId ? { ...btn, ...updates } : btn
          )
        };
      }
      return comp;
    });
    setComponents(newComponents);
    onChange?.(newComponents);
  };

  const removeButton = (componentId, buttonId) => {
    const newComponents = components.map(comp => {
      if (comp.id === componentId) {
        return {
          ...comp,
          buttons: comp.buttons.filter(btn => btn.id !== buttonId)
        };
      }
      return comp;
    });
    setComponents(newComponents);
    onChange?.(newComponents);
  };

  const renderComponentEditor = (component) => {
    switch (component.type) {
      case 'header':
      case 'body':
      case 'footer':
        return (
          <div className="component-text-editor">
            <textarea
              value={component.text || ''}
              onChange={(e) => updateComponent(component.id, { text: e.target.value })}
              placeholder={`Enter ${component.type} text...`}
              maxLength={component.type === 'body' ? 1024 : 60}
              rows={component.type === 'body' ? 4 : 2}
            />
            <div className="char-count">
              {(component.text || '').length}/{component.type === 'body' ? 1024 : 60}
            </div>
          </div>
        );

      case 'buttons':
        return (
          <div className="buttons-editor">
            {component.buttons?.map((button) => (
              <div key={button.id} className="button-editor">
                <div className="button-controls">
                  <select
                    value={button.type}
                    onChange={(e) => updateButton(component.id, button.id, { type: e.target.value })}
                  >
                    {buttonTypes.map(type => (
                      <option key={type.type} value={type.type}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={button.text}
                    onChange={(e) => updateButton(component.id, button.id, { text: e.target.value })}
                    placeholder="Button text"
                    maxLength="25"
                  />
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeButton(component.id, button.id)}
                  >
                    ×
                  </button>
                </div>

                {button.type === 'url' && (
                  <input
                    type="url"
                    value={button.url || ''}
                    onChange={(e) => updateButton(component.id, button.id, { url: e.target.value })}
                    placeholder="https://example.com"
                  />
                )}

                {button.type === 'phone_number' && (
                  <input
                    type="tel"
                    value={button.phone_number || ''}
                    onChange={(e) => updateButton(component.id, button.id, { phone_number: e.target.value })}
                    placeholder="+1234567890"
                  />
                )}
              </div>
            ))}

            {(!component.buttons || component.buttons.length < 3) && (
              <button
                type="button"
                className="add-button-btn"
                onClick={() => addButton(component.id)}
              >
                + Add Button
              </button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderPreview = (component) => {
    switch (component.type) {
      case 'header':
        return (
          <div className="preview-header">
            <strong>{component.text || 'Header text'}</strong>
          </div>
        );
      case 'body':
        return (
          <div className="preview-body">
            {component.text || 'Body text goes here...'}
          </div>
        );
      case 'footer':
        return (
          <div className="preview-footer">
            <small>{component.text || 'Footer text'}</small>
          </div>
        );
      case 'buttons':
        return (
          <div className="preview-buttons">
            {component.buttons?.map((button) => (
              <div key={button.id} className={`preview-button ${button.type}`}>
                {button.text || 'Button'}
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="template-builder">
      <div className="builder-sidebar">
        <h3>Components</h3>
        <div className="component-palette">
          {componentTypes.map((type) => {
            const exists = components.some(c => c.type === type.type);
            const canAdd = type.type === 'body' ? false : !exists;
            
            return (
              <div
                key={type.type}
                className={`component-item ${!canAdd ? 'disabled' : ''}`}
                onClick={() => canAdd && addComponent(type.type)}
              >
                <span className="component-icon">{type.icon}</span>
                <div className="component-info">
                  <div className="component-label">{type.label}</div>
                  <div className="component-desc">{type.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="builder-main">
        <div className="builder-editor">
          <h3>Template Structure</h3>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="components">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="components-list"
                >
                  {components.map((component, index) => (
                    <Draggable
                      key={component.id}
                      draggableId={component.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`component-card ${
                            selectedComponent === component.id ? 'selected' : ''
                          } ${snapshot.isDragging ? 'dragging' : ''}`}
                          onClick={() => setSelectedComponent(component.id)}
                        >
                          <div className="component-header" {...provided.dragHandleProps}>
                            <span className="component-type">
                              {componentTypes.find(t => t.type === component.type)?.icon} 
                              {component.type.toUpperCase()}
                            </span>
                            {component.type !== 'body' && (
                              <button
                                className="remove-component"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeComponent(component.id);
                                }}
                              >
                                ×
                              </button>
                            )}
                          </div>
                          
                          {selectedComponent === component.id && (
                            <div className="component-editor">
                              {renderComponentEditor(component)}
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <div className="builder-preview">
          <h3>Preview</h3>
          <div className="whatsapp-preview">
            <div className="message-bubble">
              {components.map((component) => (
                <div key={component.id}>
                  {renderPreview(component)}
                </div>
              ))}
            </div>
          </div>
          
          <button
            className="preview-btn"
            onClick={() => onPreview?.(components)}
          >
            Full Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateBuilder;