import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import axios from 'axios';

const Team = () => {
  const toast = useToast();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: '', email: '', password: '', role: 'agent' });

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const response = await axios.get('/api/auth/agents');
      setAgents(response.data.agents || []);
    } catch (error) {
      toast.error('Unable to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAgent = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/agents', newAgent);
      setNewAgent({ name: '', email: '', password: '', role: 'agent' });
      setShowAddForm(false);
      loadAgents();
      toast.success('Agent added successfully!');
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to add agent';
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading team...</p>
      </div>
    );
  }

  return (
    <div className="admin-team">
      <div className="admin-header">
        <h2>Team Management</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary"
        >
          Add Agent
        </button>
      </div>

      {showAddForm && (
        <div className="add-agent-form">
          <h3>Add New Agent</h3>
          <form onSubmit={handleAddAgent}>
            <div className="form-row">
              <input
                type="text"
                placeholder="Full Name"
                value={newAgent.name}
                onChange={(e) => setNewAgent({...newAgent, name: e.target.value})}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newAgent.email}
                onChange={(e) => setNewAgent({...newAgent, email: e.target.value})}
                required
              />
            </div>
            <div className="form-row">
              <input
                type="password"
                placeholder="Password"
                value={newAgent.password}
                onChange={(e) => setNewAgent({...newAgent, password: e.target.value})}
                required
              />
              <select
                value={newAgent.role}
                onChange={(e) => setNewAgent({...newAgent, role: e.target.value})}
              >
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Add Agent</button>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="team-list">
        {agents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>Team Management</h3>
            <p>Agent management features are available here. Add new agents using the button above.</p>
          </div>
        ) : (
          <div className="agents-grid">
            {agents.map(agent => (
              <div key={agent.agentId} className="agent-card">
                <div className="agent-avatar">
                  {agent.name.charAt(0).toUpperCase()}
                </div>
                <div className="agent-info">
                  <div className="agent-name">{agent.name}</div>
                  <div className="agent-email">{agent.email}</div>
                  <div className="agent-role">{agent.role}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Team;