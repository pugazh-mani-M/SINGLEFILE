import React, { useState, useEffect, useRef } from 'react';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { useToast } from '../contexts/ToastContext';
import axios from 'axios';

const ChatWindow = ({ conversation, messages, onMessageSent, disabled = false }) => {
  const [newMessage, setNewMessage] = useState('');
  const [canSendText, setCanSendText] = useState(false);
  const [sending, setSending] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const messagesEndRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    checkCanSendText();
  }, [conversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkCanSendText = async () => {
    try {
      const response = await axios.get(`/api/messages/can-send-text/${conversation.conversationId}`);
      setCanSendText(response.data.canSendText);
    } catch (error) {
      // Silent fail
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || disabled) return;

    setSending(true);
    try {
      const response = await axios.post('/api/messages/send', {
        to: conversation.phoneNumber,
        message: newMessage.trim()
      });
      
      if (response.data.success) {
        const newMsg = {
          messageId: response.data.messageId,
          content: newMessage.trim(),
          direction: 'outgoing',
          timestamp: new Date().toISOString(),
          status: 'sent'
        };
        
        if (onMessageSent) onMessageSent(newMsg);
        setNewMessage('');
        
        if (response.data.demo) {
          toast.info('Demo mode: Message queued for ' + conversation.phoneNumber);
        } else {
          toast.success('Message sent successfully');
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to send message';
      toast.error(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const handleSendTemplate = async (templateName) => {
    setSending(true);
    try {
      await axios.post('/api/messages/send-template', {
        conversationId: conversation.conversationId,
        templateName,
        languageCode: 'en'
      });
      
      setShowTemplateSelector(false);
      toast.success('Template message sent successfully');
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to send template';
      toast.error(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const templates = [
    { name: 'hello_world', display: 'Hello World' },
    { name: 'customer_support', display: 'Customer Support' }
  ];

  const formatMessageDate = (date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM dd, yyyy');
  };

  const groupMessagesByDate = (messages) => {
    const groups = [];
    let currentGroup = null;

    messages.forEach(message => {
      const messageDate = new Date(message.timestamp);
      
      if (!currentGroup || !isSameDay(currentGroup.date, messageDate)) {
        currentGroup = {
          date: messageDate,
          messages: [message]
        };
        groups.push(currentGroup);
      } else {
        currentGroup.messages.push(message);
      }
    });

    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="chat-window">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-content">
          <div className="chat-customer-info">
            <div className="chat-customer-avatar">
              {conversation.phoneNumber.slice(-2).toUpperCase()}
            </div>
            <div className="chat-customer-details">
              <h3>{conversation.phoneNumber}</h3>
              <div className="chat-status-row">
                <span className={`status-badge ${conversation.status}`}>
                  {conversation.status}
                </span>
                <span className={`chat-capability-status ${
                  canSendText ? 'can-send' : 'template-only'
                }`}>
                  {canSendText ? '• Can send messages' : '• Template messages only'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="chat-actions">
            <button className="chat-action-btn" title="Conversation options">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
            <div className="chat-status-indicator">
              <div className={`status-dot ${canSendText ? 'active' : 'inactive'}`}></div>
              <span className="status-text">
                {canSendText ? 'Live' : 'Template only'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="chat-messages">
        {messageGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="message-group">
            {/* Date Separator */}
            <div className="date-separator">
              <span className="date-label">
                {formatMessageDate(group.date)}
              </span>
            </div>
            
            {/* Messages in this date group */}
            <div className="message-list">
              {group.messages.map(message => (
                <div
                  key={message.messageId}
                  className={`message ${message.direction}`}
                >
                  <div className="message-bubble">
                    <div className="message-content">{message.content}</div>
                    <div className="message-meta">
                      <span className="message-time">
                        {format(new Date(message.timestamp), 'HH:mm')}
                      </span>
                      {message.direction === 'outgoing' && (
                        <svg className="message-status" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Area */}
      <div className="chat-input-area">
        {!canSendText && (
          <div className="chat-warning">
            <div className="warning-content">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="warning-text">
                <div className="warning-title">24-hour messaging window expired</div>
                <div className="warning-subtitle">You can only send approved template messages to this customer until they reply.</div>
              </div>
            </div>
          </div>
        )}

        {canSendText ? (
          <form onSubmit={handleSendMessage} className="chat-input-form">
            <div className="chat-input-wrapper">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={disabled ? "Messaging disabled" : "Type a message..."}
                rows={1}
                className="chat-input"
                disabled={sending || disabled}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
            </div>
            <button
              type="submit"
              disabled={sending || !newMessage.trim() || disabled}
              className="chat-send-btn"
              title={disabled ? "Messaging disabled" : "Send message"}
            >
              {sending ? (
                <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid currentColor', borderTop: '2px solid transparent' }}></div>
              ) : (
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              )}
            </button>
          </form>
        ) : (
          <div className="template-selector">
            {showTemplateSelector ? (
              <div className="template-options">
                <div className="template-header">
                  <h4>Choose a template message</h4>
                  <p>Select an approved template to send to this customer</p>
                </div>
                <div className="template-grid">
                  {templates.map(template => (
                    <button
                      key={template.name}
                      onClick={() => handleSendTemplate(template.name)}
                      disabled={sending}
                      className="template-option-btn"
                    >
                      <div className="template-icon">
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                      </div>
                      <span>{template.display}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowTemplateSelector(false)}
                  className="btn btn-secondary btn-sm template-cancel"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowTemplateSelector(true)}
                className="btn btn-primary template-btn"
                style={{ width: '100%' }}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Send Template Message
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;