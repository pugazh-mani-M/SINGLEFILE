import React, { useState } from 'react';
import { format } from 'date-fns';
import { brandConfig } from '../config/brand';
import { useToast } from '../contexts/ToastContext';
import axios from 'axios';

const ConversationDetails = ({ conversation, onStatusUpdate, userRole }) => {
  const toast = useToast();
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState([
    {
      id: 1,
      author: 'Agent Smith',
      content: 'Customer seems interested in premium features.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    }
  ]);
  const [newNote, setNewNote] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      await axios.put(`/api/conversations/${conversation.conversationId}/status`, {
        status: newStatus
      });
      onStatusUpdate(newStatus);
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignConversation = async (agentId) => {
    if (userRole !== 'admin') return;
    
    setUpdating(true);
    try {
      await axios.put(`/api/conversations/${conversation.conversationId}/assign`, {
        agentId
      });
      toast.success('Conversation assigned successfully');
    } catch (error) {
      toast.error('Failed to assign conversation');
    } finally {
      setUpdating(false);
    }
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    
    const note = {
      id: Date.now(),
      author: 'Current User',
      content: newNote.trim(),
      timestamp: new Date()
    };
    
    setNotes(prev => [note, ...prev]);
    setNewNote('');
    setShowAddNote(false);
  };

  const getCustomerTags = () => {
    const tags = ['Customer'];
    if (conversation.phoneNumber.includes('555')) tags.push('VIP');
    if (!conversation.assignedAgentId) tags.push('Lead');
    return tags;
  };

  const statusOptions = [
    { value: 'open', label: 'Open', icon: '🟢' },
    { value: 'pending', label: 'Pending', icon: '🟡' },
    { value: 'closed', label: 'Closed', icon: '⚫' }
  ];

  return (
    <>
      {/* Header */}
      <div className="right-panel-header">
        <h3 className="right-panel-title">Customer Details</h3>
        <p className="right-panel-subtitle">Conversation information and controls</p>
      </div>

      <div className="right-panel-content">
        {/* Customer Section */}
        <div className="panel-section">
          <h4 className="section-title">
            <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Customer
          </h4>
          
          <div className="customer-card">
            <div className="customer-header">
              <div className="customer-avatar">
                {conversation.phoneNumber.slice(-2).toUpperCase()}
              </div>
              <div className="customer-info">
                <h4>{conversation.phoneNumber}</h4>
                <div className="customer-phone">{conversation.phoneNumber}</div>
              </div>
            </div>
            
            {brandConfig.features.customerTags && (
              <div className="customer-tags">
                {getCustomerTags().map(tag => (
                  <span key={tag} className={`customer-tag ${tag.toLowerCase()}`}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Conversation Section */}
        <div className="panel-section">
          <h4 className="section-title">
            <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Conversation
          </h4>
          
          <div className="info-grid">
            <div className="info-item">
              <div className="info-label">Status</div>
              <div className="info-value">
                <span className={`status-badge ${conversation.status}`}>
                  {conversation.status}
                </span>
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-label">Assigned Agent</div>
              <div className="info-value">
                {conversation.assignedAgentId || 'Unassigned'}
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-label">Created</div>
              <div className="info-value">
                {format(new Date(conversation.createdAt), 'MMM dd, HH:mm')}
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-label">Last Message</div>
              <div className="info-value">
                {conversation.lastCustomerMessageAt ? 
                  format(new Date(conversation.lastCustomerMessageAt), 'MMM dd, HH:mm') : 
                  'Never'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Status Controls */}
        <div className="panel-section">
          <h4 className="section-title">
            <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Status
          </h4>
          
          <div className="status-controls">
            {statusOptions.map(status => (
              <button
                key={status.value}
                onClick={() => handleStatusUpdate(status.value)}
                disabled={updating || conversation.status === status.value}
                className={`status-option ${
                  conversation.status === status.value ? 'active' : ''
                }`}
              >
                <div className="status-option-content">
                  <span className="status-icon">{status.icon}</span>
                  <span className="status-text">{status.label}</span>
                </div>
                {conversation.status === status.value && (
                  <svg className="status-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Admin Controls */}
        {userRole === 'admin' && (
          <div className="panel-section">
            <h4 className="section-title">
              <svg className="section-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Admin Controls
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button
                onClick={() => handleAssignConversation('agent-123')}
                disabled={updating}
                className="btn btn-secondary"
              >
                {conversation.assignedAgentId ? 'Reassign Agent' : 'Assign Agent'}
              </button>
              
              <button
                onClick={() => handleStatusUpdate('closed')}
                disabled={updating || conversation.status === 'closed'}
                className="btn btn-danger"
              >
                Close Conversation
              </button>
            </div>
          </div>
        )}

        {/* Internal Notes */}
        {brandConfig.features.internalNotes && (
          <div className="panel-section">
            <div className="notes-section">
              <div className="notes-header">
                <h4 className="notes-title">Internal Notes</h4>
                <button
                  onClick={() => setShowAddNote(!showAddNote)}
                  className="add-note-btn"
                >
                  {showAddNote ? 'Cancel' : 'Add Note'}
                </button>
              </div>
              
              {showAddNote && (
                <div style={{ marginBottom: '1rem' }}>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add an internal note..."
                    className="chat-input"
                    rows={3}
                    style={{ marginBottom: '0.5rem' }}
                  />
                  <button
                    onClick={addNote}
                    disabled={!newNote.trim()}
                    className="btn btn-primary btn-sm"
                  >
                    Save Note
                  </button>
                </div>
              )}
              
              <div className="notes-list">
                {notes.map(note => (
                  <div key={note.id} className="note-item">
                    <div className="note-header">
                      <span className="note-author">{note.author}</span>
                      <span className="note-time">
                        {format(note.timestamp, 'MMM dd, HH:mm')}
                      </span>
                    </div>
                    <div className="note-content">{note.content}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ConversationDetails;