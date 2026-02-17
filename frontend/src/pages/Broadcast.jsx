import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import axios from 'axios';
import '../styles/broadcast.css';

const Broadcast = () => {
  const [message, setMessage] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [showContactSelector, setShowContactSelector] = useState(false);
  const [availableContacts, setAvailableContacts] = useState([]);
  const [sending, setSending] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const response = await axios.get('/api/conversations');
      const contacts = response.data.conversations.map(c => ({
        id: c.conversationId,
        name: c.phoneNumber,
        phone: c.phoneNumber
      }));
      setAvailableContacts(contacts);
    } catch (error) {
      setAvailableContacts([]);
    }
  };

  const toggleContact = (contactId) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSendBroadcast = async () => {
    if (!message.trim() || selectedContacts.length === 0) return;
    
    setSending(true);
    try {
      await axios.post('/api/messages/broadcast', {
        message: message.trim(),
        recipients: selectedContacts
      });
      toast.success(`Broadcast sent to ${selectedContacts.length} contacts`);
      setMessage('');
      setSelectedContacts([]);
    } catch (error) {
      toast.error('Failed to send broadcast');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="broadcast-container">
      <div className="broadcast-header">
        <h1>Broadcast Messages</h1>
        <p>Send messages to multiple contacts at once</p>
      </div>

      <div className="broadcast-content">
        <div className="broadcast-section">
          <h3>Create New Broadcast</h3>
          
          <div className="form-group">
            <label>Message</label>
            <textarea
              placeholder="Type your broadcast message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>

          <div className="form-group">
            <label>Recipients</label>
            <div className="recipients-info">
              <p>Select contacts to send this broadcast to</p>
              <button 
                className="btn btn-secondary"
                onClick={() => setShowContactSelector(true)}
              >
                Select Contacts ({selectedContacts.length})
              </button>
            </div>
          </div>

          <div className="broadcast-actions">
            <button 
              className="btn btn-primary"
              disabled={!message.trim() || selectedContacts.length === 0 || sending}
              onClick={handleSendBroadcast}
            >
              {sending ? 'Sending...' : 'Send Broadcast'}
            </button>
          </div>
        </div>

        <div className="broadcast-section">
          <h3>Recent Broadcasts</h3>
          <div className="empty-state">
            <p>No broadcasts sent yet</p>
          </div>
        </div>
      </div>

      {showContactSelector && (
        <div className="modal-overlay" onClick={() => setShowContactSelector(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Select Recipients</h2>
              <button onClick={() => setShowContactSelector(false)}>×</button>
            </div>
            <div className="modal-body">
              {availableContacts.length === 0 ? (
                <p>No contacts available. Start a conversation first.</p>
              ) : (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {availableContacts.map(contact => (
                    <div key={contact.id} style={{ padding: '10px', borderBottom: '1px solid #eee', cursor: 'pointer' }} onClick={() => toggleContact(contact.id)}>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={selectedContacts.includes(contact.id)}
                          onChange={() => toggleContact(contact.id)}
                          style={{ marginRight: '10px' }}
                        />
                        <div>
                          <div style={{ fontWeight: '500' }}>{contact.name}</div>
                          <div style={{ fontSize: '12px', color: '#666' }}>{contact.phone}</div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setShowContactSelector(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={() => setShowContactSelector(false)}>Done ({selectedContacts.length})</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Broadcast;