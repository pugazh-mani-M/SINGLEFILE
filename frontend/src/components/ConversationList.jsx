import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

const ConversationList = ({ conversations, selectedConversation, onSelectConversation, userRole, inboxFilter, currentUser }) => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv => {
    // Apply inbox filter first
    if (inboxFilter === 'your-inbox' && conv.assignedAgentId !== currentUser?.agentId) return false;
    if (inboxFilter === 'mentions' && (!conv.mentions || !conv.mentions.includes(currentUser?.agentId))) return false;
    if (inboxFilter === 'created-by-you' && conv.createdBy !== currentUser?.agentId) return false;
    if (inboxFilter === 'unassigned' && conv.assignedAgentId) return false;
    
    // Apply search filter
    if (searchQuery && !conv.phoneNumber?.includes(searchQuery)) {
      return false;
    }
    
    // Apply status filter
    if (filter === 'open') return conv.status === 'open';
    if (filter === 'pending') return conv.status === 'pending';
    if (filter === 'closed') return conv.status === 'closed';
    if (filter === 'unassigned') return !conv.assignedAgentId;
    return true;
  });

  return (
    <div className="conversation-list-container">
      {/* Search Bar */}
      <div className="conversation-search">
        <div className="search-input-wrapper">
          <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="conversation-filters">
        {['all', 'open', 'pending', 'closed'].map(filterType => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`filter-tab ${filter === filterType ? 'active' : ''}`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      {/* Conversations */}
      <div className="conversations-scroll">
        {filteredConversations.length === 0 ? (
          <div className="empty-conversations">
            <div className="empty-icon">
              <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="empty-title">
              {searchQuery ? 'No matching conversations' : 'No conversations yet'}
            </h3>
            <p className="empty-description">
              {searchQuery 
                ? 'Try adjusting your search terms.' 
                : 'New customer conversations will appear here.'
              }
            </p>
          </div>
        ) : (
          filteredConversations.map(conversation => (
            <div
              key={conversation.conversationId}
              onClick={() => onSelectConversation(conversation.conversationId)}
              className={`conversation-card ${
                selectedConversation?.conversationId === conversation.conversationId ? 'active' : ''
              }`}
            >
              <div className="conversation-avatar">
                {conversation.phoneNumber?.slice(-2).toUpperCase() || 'N/A'}
              </div>

              <div className="conversation-content">
                <div className="conversation-header">
                  <div className="conversation-name">
                    {conversation.phoneNumber || 'Unknown'}
                  </div>
                  <div className="conversation-time">
                    {formatDistanceToNow(new Date(conversation.lastCustomerMessageAt || conversation.createdAt), { addSuffix: true })}
                  </div>
                </div>
                
                <div className="conversation-preview">
                  {conversation.lastMessage ? 
                    conversation.lastMessage.substring(0, 60) + (conversation.lastMessage.length > 60 ? '...' : '') :
                    `Last activity: ${formatDistanceToNow(new Date(conversation.updatedAt || conversation.createdAt))} ago`
                  }
                </div>
                
                <div className="conversation-meta">
                  <span className={`status-badge ${conversation.status}`}>
                    {conversation.status}
                  </span>
                  
                  {conversation.unreadCount > 0 && (
                    <span className="unread-badge">
                      {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                    </span>
                  )}
                  
                  {!conversation.assignedAgentId && userRole === 'admin' && (
                    <span className="status-badge unassigned">
                      Unassigned
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;