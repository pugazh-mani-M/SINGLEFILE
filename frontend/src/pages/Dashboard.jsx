import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from '../services/AuthContext';
import { useSocket } from '../services/SocketContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { brandConfig } from '../config/brand';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
import ConversationDetails from '../components/ConversationDetails';
import axios from 'axios';
import '../styles/admin.css';
import '../styles/intercom-layout.css';
import '../styles/settings.css';
import '../styles/ai-automation.css';

// Lazy load admin components
const Analytics = lazy(() => import('./Analytics'));
const Team = lazy(() => import('./Team'));
const Settings = lazy(() => import('./Settings'));
const SystemStatus = lazy(() => import('../components/SystemStatus'));
const AIAutomation = lazy(() => import('./AIAutomation'));
const Broadcast = lazy(() => import('./Broadcast'));
const Leads = lazy(() => import('./Leads'));
const MobileIntegration = lazy(() => import('./MobileIntegration'));
const Templates = lazy(() => import('./Templates'));
const WebhookSetup = lazy(() => import('./WebhookSetup'));

const Dashboard = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentView, setCurrentView] = useState('chats');
  const [inboxFilter, setInboxFilter] = useState('your-inbox');
  const [loading, setLoading] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [metaVerified, setMetaVerified] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState({
    meta_verification_status: 'pending',
    webhook_verified: false,
    last_message_received_at: null,
    blocking_issues: [],
    non_blocking_issues: ['Meta verification pending']
  });
  const profileMenuRef = React.useRef(null);
  const { socket, connected, connectionError } = useSocket();
  const { isDark, themeMode, setTheme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const toast = useToast();

  useEffect(() => {
    // Lock body scroll when sidebar is open on mobile
    if (mobileMenuOpen && window.innerWidth <= 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    loadConversations();
    checkMetaVerification();
    
    // Scoped click handler using ref
    if (typeof document !== 'undefined') {
      const handleClickOutside = (event) => {
        if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
          setShowProfileMenu(false);
        }
      };
      
      document.addEventListener('click', handleClickOutside);
      
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('message:new', handleNewMessage);
      socket.on('message:sent', handleMessageSent);
      socket.on('conversation:assigned', handleConversationAssigned);
      socket.on('conversation:status_updated', handleStatusUpdated);

      return () => {
        socket.off('message:new');
        socket.off('message:sent');
        socket.off('conversation:assigned');
        socket.off('conversation:status_updated');
      };
    }
  }, [socket, conversations]);

  const loadConversations = async () => {
    try {
      const response = await axios.get('/api/conversations');
      setConversations(response.data.conversations);
    } catch (error) {
      // Silent fail - conversations will show empty state
    } finally {
      setLoading(false);
    }
  };

  const checkMetaVerification = async () => {
    try {
      const response = await axios.get('/api/whatsapp/verification-status');
      const status = response.data;
      setMetaVerified(status.meta_verification_status === 'verified');
      setVerificationStatus(status);
    } catch (error) {
      // Silent fail - will show default status
      setMetaVerified(false);
      setVerificationStatus({
        meta_verification_status: 'pending',
        webhook_verified: false,
        last_message_received_at: null,
        blocking_issues: [],
        non_blocking_issues: ['Unable to check verification status']
      });
    }
  };

  const loadConversationMessages = async (conversationId) => {
    try {
      const response = await axios.get(`/api/conversations/${conversationId}`);
      setMessages(response.data.messages);
      setSelectedConversation(response.data.conversation);
      setShowMobileChat(true);
    } catch (error) {
      // Silent fail - messages won't load
    }
  };

  const handleNewMessage = (data) => {
    const { conversation, message, contact } = data;
    
    setConversations(prev => {
      const existing = prev.find(c => c.conversationId === conversation.conversationId);
      if (existing) {
        return prev.map(c => 
          c.conversationId === conversation.conversationId 
            ? { ...c, ...conversation }
            : c
        );
      } else {
        return [conversation, ...prev];
      }
    });

    if (selectedConversation?.conversationId === conversation.conversationId) {
      setMessages(prev => [...prev, message]);
    }
  };

  const handleMessageSent = (data) => {
    const { message, conversationId } = data;
    
    if (selectedConversation?.conversationId === conversationId) {
      setMessages(prev => [...prev, message]);
    }
  };

  const handleConversationAssigned = (data) => {
    const { conversationId, agentId } = data;
    
    setConversations(prev => 
      prev.map(c => 
        c.conversationId === conversationId 
          ? { ...c, assignedAgentId: agentId }
          : c
      )
    );
  };

  const handleStatusUpdated = (data) => {
    const { conversationId, status } = data;
    
    setConversations(prev => 
      prev.map(c => 
        c.conversationId === conversationId 
          ? { ...c, status }
          : c
      )
    );
  };

  const getEmptyStateTitle = () => {
    if (!metaVerified) {
      return 'Waiting for Meta verification';
    }
    if (!verificationStatus.webhook_verified) {
      return 'Webhook setup required';
    }
    if (conversations.length === 0) {
      return 'No conversations yet';
    }
    return 'Select a conversation to get started';
  };

  const getEmptyStateDescription = () => {
    if (!metaVerified) {
      return 'Your WhatsApp Business account is under Meta review. Messages will appear here once verification is complete.';
    }
    if (!verificationStatus.webhook_verified) {
      return 'Configure your webhook to start receiving WhatsApp messages in real-time.';
    }
    if (conversations.length === 0) {
      return 'Webhook connected and ready. Waiting for your first WhatsApp message.';
    }
    return 'Choose a conversation from your inbox to view the full message history and start engaging with your customers through WhatsApp.';
  };

  const getConversationCount = (filter) => {
    const filtered = conversations.filter(c => {
      switch (filter) {
        case 'your-inbox': return c.assignedAgentId === user?.agentId;
        case 'mentions': return c.mentions && c.mentions.includes(user?.agentId);
        case 'created-by-you': return c.createdBy === user?.agentId;
        case 'unassigned': return !c.assignedAgentId;
        default: return true;
      }
    });
    return filtered.length;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="empty-icon">
          <div className="spinner"></div>
        </div>
        <h3 className="empty-title">Loading your workspace</h3>
        <p className="empty-description">
          Setting up your WhatsApp CRM dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="crm-app-layout">
      {/* Mobile Hamburger Button */}
      <button 
        className="mobile-menu-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {mobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Overlay */}
      <div 
        className={`mobile-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Left Dark Sidebar */}
      <div className={`crm-sidebar-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
            </svg>
          </div>
        </div>
        
        <nav className="sidebar-menu">
          <button 
            className={`menu-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setCurrentView('dashboard'); setMobileMenuOpen(false); }}
            title="Dashboard"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0a2 2 0 01-2 2H10a2 2 0 01-2-2v0z" />
            </svg>
          </button>
          
          <button 
            className={`menu-item ${currentView === 'chats' ? 'active' : ''}`}
            onClick={() => { setCurrentView('chats'); setMobileMenuOpen(false); }}
            title="Chats"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
          
          <button 
            className={`menu-item ${currentView === 'broadcasts' ? 'active' : ''}`}
            onClick={() => { setCurrentView('broadcasts'); setMobileMenuOpen(false); }}
            title="Broadcasts"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </button>
          
          <button 
            className={`menu-item ${currentView === 'reports' ? 'active' : ''}`}
            onClick={() => { setCurrentView('reports'); setMobileMenuOpen(false); }}
            title="Reports"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
          
          <button 
            className={`menu-item ${currentView === 'leads' ? 'active' : ''}`}
            onClick={() => { setCurrentView('leads'); setMobileMenuOpen(false); }}
            title="Leads"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
          
          <button 
            className={`menu-item ${currentView === 'templates' ? 'active' : ''}`}
            onClick={() => { setCurrentView('templates'); setMobileMenuOpen(false); }}
            title="Templates"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3-6v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h6l3 3v3z" />
            </svg>
          </button>
          
          <button 
            className={`menu-item ${currentView === 'mobile-integration' ? 'active' : ''}`}
            onClick={() => { setCurrentView('mobile-integration'); setMobileMenuOpen(false); }}
            title="Mobile Integration"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </button>
          
          <button 
            className={`menu-item ${currentView === 'ai-automation' ? 'active' : ''}`}
            onClick={() => { setCurrentView('ai-automation'); setMobileMenuOpen(false); }}
            title="AI Automation"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </button>
          
          <button 
            className={`menu-item ${currentView === 'webhook-setup' ? 'active' : ''}`}
            onClick={() => { setCurrentView('webhook-setup'); setMobileMenuOpen(false); }}
            title="Webhook Setup"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </button>
          
          <button 
            className={`menu-item ${currentView === 'settings' ? 'active' : ''}`}
            onClick={() => { setCurrentView('settings'); setMobileMenuOpen(false); }}
            title="Settings"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </nav>
        
        <div className="sidebar-bottom">
          <div className="connection-indicator">
            <div className={`status-dot ${connected ? 'connected' : 'disconnected'}`}></div>
          </div>
          
          <div className="user-profile" ref={profileMenuRef}>
            <button 
              className="user-avatar-btn" 
              title={user?.name}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              {user?.name?.charAt(0)?.toUpperCase()}
            </button>
            
            {showProfileMenu && (
              <div className="profile-menu">
                <div className="profile-info">
                  <div className="profile-name">{user?.name}</div>
                  <div className="profile-email">{user?.email}</div>
                </div>
                <div className="profile-actions">
                  <button onClick={() => { setCurrentView('settings'); setShowProfileMenu(false); }}>Settings</button>
                  <button onClick={logout}>Logout</button>
                </div>
              </div>
            )}
          </div>
          
          {brandConfig.features.darkMode && (
            <div className="theme-toggle">
              <button 
                className="theme-toggle-btn"
                onClick={toggleTheme}
                title={`Current: ${themeMode} mode`}
              >
                {themeMode === 'light' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                  </svg>
                ) : themeMode === 'dark' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path fillRule="evenodd" d="M1.5 5.25a3 3 0 013-3h15a3 3 0 013 3v6.75a3 3 0 01-3 3H19.5l-2.25 2.25a.75.75 0 01-1.06 0L14.5 15H4.5a3 3 0 01-3-3V5.25zm3-1.5a1.5 1.5 0 00-1.5 1.5v6.75a1.5 1.5 0 001.5 1.5h10.5a.75.75 0 01.53.22L16.5 15.44l1.97-1.97a.75.75 0 01.53-.22h.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5h-15z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="crm-main-content">
        {currentView === 'chats' ? (
          <>
            {/* Inbox Panel */}
            <div className="inbox-panel">
              <div className="inbox-header">
                <h1 className="inbox-title">Inbox</h1>
                <div className="inbox-actions">
                  {!metaVerified && (
                    <button 
                      className="meta-verification-btn"
                      onClick={() => setShowVerificationModal(true)}
                      title="Meta Verification Status"
                    >
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                      </svg>
                    </button>
                  )}
                  <button className="inbox-action-btn" title="New conversation" onClick={() => setCurrentView('leads')}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <button className="inbox-action-btn" title="Search" onClick={() => toast.info('Search functionality coming soon')}>
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="inbox-categories">
                <div 
                  className={`category-item ${inboxFilter === 'your-inbox' ? 'active' : ''}`}
                  onClick={() => setInboxFilter('your-inbox')}
                >
                  <span className="category-name">Your Inbox</span>
                  <span className="category-count">{getConversationCount('your-inbox')}</span>
                </div>
                <div 
                  className={`category-item ${inboxFilter === 'mentions' ? 'active' : ''}`}
                  onClick={() => setInboxFilter('mentions')}
                >
                  <span className="category-name">Mentions</span>
                  <span className="category-count">{getConversationCount('mentions')}</span>
                </div>
                <div 
                  className={`category-item ${inboxFilter === 'created-by-you' ? 'active' : ''}`}
                  onClick={() => setInboxFilter('created-by-you')}
                >
                  <span className="category-name">Created by you</span>
                  <span className="category-count">{getConversationCount('created-by-you')}</span>
                </div>
                <div 
                  className={`category-item ${inboxFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setInboxFilter('all')}
                >
                  <span className="category-name">All</span>
                  <span className="category-count">{getConversationCount('all')}</span>
                </div>
                <div 
                  className={`category-item ${inboxFilter === 'unassigned' ? 'active' : ''}`}
                  onClick={() => setInboxFilter('unassigned')}
                >
                  <span className="category-name">Unassigned</span>
                  <span className="category-count">{getConversationCount('unassigned')}</span>
                </div>
              </div>
            </div>

            {/* Conversation List */}
            <div className={`conversation-panel ${showMobileChat ? 'mobile-hidden' : ''}`}>
              {/* Mobile Inbox Header */}
              <div className="mobile-inbox-header">
                <h2 className="mobile-inbox-title">Inbox</h2>
                <div className="mobile-inbox-actions">
                  {!metaVerified && (
                    <button 
                      className="mobile-action-btn meta-btn"
                      onClick={() => { setCurrentView('ai-automation'); setMobileMenuOpen(false); }}
                      title="WhatsApp not configured"
                    >
                      <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                      </svg>
                    </button>
                  )}
                  <button 
                    className="mobile-action-btn"
                    onClick={() => setCurrentView('leads')}
                    title="New conversation"
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <button 
                    className="mobile-action-btn"
                    onClick={() => toast.info('Search functionality coming soon')}
                    title="Search"
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Meta Verification Notice - Mobile */}
              {!metaVerified && (
                <div 
                  className="warning-banner"
                  onClick={() => { setCurrentView('ai-automation'); setMobileMenuOpen(false); }}
                >
                  <span className="warning-icon">⚠️</span>
                  <span>WhatsApp not configured</span>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
              
              {/* Inbox Categories - Mobile */}
              <div className="inbox-categories">
                <div 
                  className={`category-item ${inboxFilter === 'your-inbox' ? 'active' : ''}`}
                  onClick={() => setInboxFilter('your-inbox')}
                >
                  <span className="category-name">Your Inbox</span>
                  <span className="category-count">{getConversationCount('your-inbox')}</span>
                </div>
                <div 
                  className={`category-item ${inboxFilter === 'mentions' ? 'active' : ''}`}
                  onClick={() => setInboxFilter('mentions')}
                >
                  <span className="category-name">Mentions</span>
                  <span className="category-count">{getConversationCount('mentions')}</span>
                </div>
                <div 
                  className={`category-item ${inboxFilter === 'created-by-you' ? 'active' : ''}`}
                  onClick={() => setInboxFilter('created-by-you')}
                >
                  <span className="category-name">Created by you</span>
                  <span className="category-count">{getConversationCount('created-by-you')}</span>
                </div>
                <div 
                  className={`category-item ${inboxFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setInboxFilter('all')}
                >
                  <span className="category-name">All</span>
                  <span className="category-count">{getConversationCount('all')}</span>
                </div>
                <div 
                  className={`category-item ${inboxFilter === 'unassigned' ? 'active' : ''}`}
                  onClick={() => setInboxFilter('unassigned')}
                >
                  <span className="category-name">Unassigned</span>
                  <span className="category-count">{getConversationCount('unassigned')}</span>
                </div>
              </div>
              
              <ConversationList
                conversations={conversations}
                selectedConversation={selectedConversation}
                onSelectConversation={loadConversationMessages}
                userRole={user?.role}
                inboxFilter={inboxFilter}
                currentUser={user}
              />
            </div>

            {/* Chat Panel */}
            <div className={`chat-panel ${showMobileChat ? 'mobile-visible' : ''}`}>
              {/* Mobile Back Button */}
              {showMobileChat && (
                <button 
                  className="mobile-back-btn"
                  onClick={() => {
                    setShowMobileChat(false);
                    setSelectedConversation(null);
                  }}
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Back</span>
                </button>
              )}
              {!metaVerified && verificationStatus.blocking_issues.length > 0 && (
                <div className="warning-banner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="warning-icon">⚠️</span>
                    <span>WhatsApp not configured. Messages disabled.</span>
                  </div>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => setCurrentView('ai-automation')}
                    style={{ padding: '4px 12px', fontSize: '13px' }}
                  >
                    Configure Now
                  </button>
                </div>
              )}
              {selectedConversation ? (
                <ChatWindow
                  conversation={selectedConversation}
                  messages={messages}
                  onMessageSent={handleMessageSent}
                  disabled={!metaVerified && verificationStatus.blocking_issues.length > 0}
                />
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="empty-title">{getEmptyStateTitle()}</h3>
                  <p className="empty-description">
                    {getEmptyStateDescription()}
                  </p>
                </div>
              )}
            </div>

            {/* CRM Context Panel */}
            {selectedConversation && (
              <div className="crm-context-panel">
                <ConversationDetails
                  conversation={selectedConversation}
                  onStatusUpdate={(status) => {
                    setSelectedConversation(prev => ({ ...prev, status }));
                  }}
                  userRole={user?.role}
                />
              </div>
            )}
          </>
        ) : (
          <div className="single-view-layout">
            <div className="view-content">
              <Suspense fallback={
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading...</p>
                </div>
              }>
                {currentView === 'dashboard' && <SystemStatus />}
                {currentView === 'broadcasts' && <Broadcast />}
                {currentView === 'reports' && <Analytics />}
                {currentView === 'leads' && <Leads />}
                {currentView === 'templates' && <Templates />}
                {currentView === 'mobile-integration' && <MobileIntegration />}
                {currentView === 'ai-automation' && <AIAutomation />}
                {currentView === 'webhook-setup' && <WebhookSetup />}
                {currentView === 'settings' && <Settings />}
              </Suspense>
            </div>
          </div>
        )}
        
        {showVerificationModal && (
          <div className="modal-overlay" onClick={() => setShowVerificationModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Meta Verification Status</h2>
                <button onClick={() => setShowVerificationModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="status-item">
                  <strong>Status:</strong> {verificationStatus.meta_verification_status}
                </div>
                {verificationStatus.blocking_issues.length > 0 && (
                  <div className="issues-section">
                    <h4>Blocking Issues:</h4>
                    <ul>
                      {verificationStatus.blocking_issues.map((issue, i) => (
                        <li key={i} className="blocking-issue">{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {verificationStatus.non_blocking_issues.length > 0 && (
                  <div className="issues-section">
                    <h4>Warnings:</h4>
                    <ul>
                      {verificationStatus.non_blocking_issues.map((issue, i) => (
                        <li key={i} className="warning-issue">{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="status-item">
                  <strong>Webhook:</strong> {verificationStatus.webhook_verified ? 'Connected' : 'Not Connected'}
                </div>
                <div className="status-item">
                  <strong>Last Message:</strong> {verificationStatus.last_message_received_at || 'Never'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;