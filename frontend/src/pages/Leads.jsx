import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import axios from 'axios';
import '../styles/templates.css';

const Leads = () => {
  const { isDark } = useTheme();
  const toast = useToast();
  const [showPreview, setShowPreview] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [newLead, setNewLead] = useState({ name: '', phone: '', status: 'new', source: 'Manual', value: '$0' });
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      const response = await axios.get('/api/conversations');
      const conversations = response.data.conversations || [];
      
      const convertedLeads = conversations.map(conv => ({
        id: conv.conversationId,
        name: conv.phoneNumber,
        phone: conv.phoneNumber,
        status: conv.status === 'open' ? 'new' : conv.status === 'pending' ? 'contacted' : 'qualified',
        source: 'WhatsApp',
        lastContact: new Date(conv.lastMessageAt || conv.createdAt).toLocaleDateString(),
        value: '$0'
      }));
      
      setLeads(convertedLeads);
    } catch (error) {
      toast.error('Unable to load leads');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLead = (e) => {
    e.preventDefault();
    if (!newLead.name.trim() || !newLead.phone.trim()) {
      toast.warning('Please fill in name and phone');
      return;
    }

    const leadData = {
      ...newLead,
      id: Date.now(),
      lastContact: new Date().toLocaleDateString()
    };
    setLeads(prev => [leadData, ...prev]);
    setNewLead({ name: '', phone: '', status: 'new', source: 'Manual', value: '$0' });
    setShowAddForm(false);
    toast.success('Lead added successfully!');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return '#3b82f6';
      case 'contacted': return '#f59e0b';
      case 'qualified': return '#10b981';
      case 'closed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const filteredLeads = filter === 'all' ? leads : leads.filter(lead => lead.status === filter);

  if (loading) {
    return (
      <div className="templates-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="templates-container">
      <div className="templates-header">
        <div>
          <h1 className="templates-title">Leads Management</h1>
          <p className="templates-subtitle">Track and manage your sales leads</p>
        </div>
        <div className="templates-actions">
          <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
            Add New Lead
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number blue">{leads.length}</div>
          <div className="stat-label">Total Leads</div>
        </div>
        <div className="stat-card">
          <div className="stat-number green">{leads.filter(l => l.status === 'new').length}</div>
          <div className="stat-label">New Leads</div>
        </div>
        <div className="stat-card">
          <div className="stat-number yellow">{leads.filter(l => l.status === 'qualified').length}</div>
          <div className="stat-label">Qualified</div>
        </div>
        <div className="stat-card">
          <div className="stat-number red">${leads.reduce((sum, lead) => sum + parseInt(lead.value.replace('$', '').replace(',', '') || '0'), 0).toLocaleString()}</div>
          <div className="stat-label">Total Value</div>
        </div>
      </div>

      <div className="leads-filters">
        {[
          { value: 'all', label: 'All', count: leads.length },
          { value: 'new', label: 'New', count: leads.filter(l => l.status === 'new').length },
          { value: 'contacted', label: 'Contacted', count: leads.filter(l => l.status === 'contacted').length },
          { value: 'qualified', label: 'Qualified', count: leads.filter(l => l.status === 'qualified').length }
        ].map(item => (
          <button 
            key={item.value}
            className={`filter-btn ${filter === item.value ? 'active' : ''}`}
            onClick={() => setFilter(item.value)}
          >
            {item.label} ({item.count})
          </button>
        ))}
      </div>

      <div className="templates-list">
        {filteredLeads.map(lead => (
          <div key={lead.id} className="template-card">
            <div className="template-header">
              <div className="template-info">
                <h3>{lead.name}</h3>
                <p className="template-category">{lead.source}</p>
              </div>
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(lead.status) }}
              >
                {lead.status}
              </span>
            </div>
            
            <div className="template-meta">
              <div className="template-language">
                <span className="label">Phone: </span>
                <span className="value">{lead.phone}</span>
              </div>
            </div>
            
            <div className="template-preview">
              Value: {lead.value} • Last Contact: {lead.lastContact}
            </div>
            
            <div className="template-footer">
              <div className="template-date">
                Status: {lead.status}
              </div>
              <div className="template-actions">
                <button 
                  className="btn-sm btn-preview" 
                  onClick={() => { setSelectedLead(lead); setShowPreview(true); }}
                >
                  Preview
                </button>
                <button 
                  className="btn-sm btn-edit" 
                  onClick={() => { setSelectedLead(lead); setShowEdit(true); }}
                >
                  Edit
                </button>
                <button 
                  className="btn-sm btn-delete" 
                  onClick={() => toast.success(`Contacting ${lead.name}...`)}
                >
                  Contact
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {showPreview && selectedLead && (
        <div className="modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Lead Preview</h2>
              <button onClick={() => setShowPreview(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="lead-preview-details">
                <h3>{selectedLead.name}</h3>
                <p><strong>Phone:</strong> {selectedLead.phone}</p>
                <p><strong>Status:</strong> {selectedLead.status}</p>
                <p><strong>Source:</strong> {selectedLead.source}</p>
                <p><strong>Value:</strong> {selectedLead.value}</p>
                <p><strong>Last Contact:</strong> {selectedLead.lastContact}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showEdit && selectedLead && (
        <div className="modal-overlay" onClick={() => setShowEdit(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Edit Lead</h2>
              <button onClick={() => setShowEdit(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name</label>
                <input type="text" defaultValue={selectedLead.name} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" defaultValue={selectedLead.phone} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select defaultValue={selectedLead.status}>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Value</label>
                <input type="text" defaultValue={selectedLead.value} />
              </div>
              <div className="form-actions">
                <button className="btn btn-cancel" onClick={() => setShowEdit(false)}>Cancel</button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => { 
                    toast.success('Lead updated successfully!'); 
                    setShowEdit(false); 
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add New Lead</h2>
              <button onClick={() => setShowAddForm(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleAddLead}>
                <div className="form-group">
                  <label>Name *</label>
                  <input type="text" value={newLead.name} onChange={(e) => setNewLead({...newLead, name: e.target.value})} placeholder="Contact name" required />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input type="tel" value={newLead.phone} onChange={(e) => setNewLead({...newLead, phone: e.target.value})} placeholder="+1234567890" required />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={newLead.status} onChange={(e) => setNewLead({...newLead, status: e.target.value})}>
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Source</label>
                  <input type="text" value={newLead.source} onChange={(e) => setNewLead({...newLead, source: e.target.value})} placeholder="Manual, Website, etc." />
                </div>
                <div className="form-group">
                  <label>Value</label>
                  <input type="text" value={newLead.value} onChange={(e) => setNewLead({...newLead, value: e.target.value})} placeholder="$0" />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-cancel" onClick={() => setShowAddForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Add Lead</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;