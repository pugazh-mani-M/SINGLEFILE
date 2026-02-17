const Conversation = require('../models/Conversation.model');
const Template = require('../models/Template.model');
const logger = require('../utils/logger');

class SessionService {
  /**
   * Check if conversation session is open (within 24 hours)
   */
  isSessionOpen(conversation) {
    if (!conversation.session.lastCustomerMessageAt) {
      return false;
    }

    const now = new Date();
    const sessionExpiry = new Date(
      conversation.session.lastCustomerMessageAt.getTime() + 24 * 60 * 60 * 1000
    );

    return now < sessionExpiry;
  }

  /**
   * Get session expiry time
   */
  getSessionExpiry(conversation) {
    if (!conversation.session.lastCustomerMessageAt) {
      return null;
    }

    return new Date(
      conversation.session.lastCustomerMessageAt.getTime() + 24 * 60 * 60 * 1000
    );
  }

  /**
   * Get time remaining in session (in minutes)
   */
  getSessionTimeRemaining(conversation) {
    const expiry = this.getSessionExpiry(conversation);
    if (!expiry) return 0;

    const now = new Date();
    const remaining = expiry.getTime() - now.getTime();
    
    return Math.max(0, Math.floor(remaining / (1000 * 60)));
  }

  /**
   * Update session when customer sends message
   */
  async updateSessionFromCustomerMessage(conversationId, messageTimestamp) {
    try {
      const sessionExpiry = new Date(messageTimestamp.getTime() + 24 * 60 * 60 * 1000);

      await Conversation.findByIdAndUpdate(conversationId, {
        'session.lastCustomerMessageAt': messageTimestamp,
        'session.isOpen': true,
        'session.canSendFreeform': true,
        'session.expiresAt': sessionExpiry
      });

      logger.info('Session updated from customer message', {
        conversationId,
        expiresAt: sessionExpiry
      });

      return sessionExpiry;
    } catch (error) {
      logger.error('Failed to update session', {
        conversationId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Validate if message can be sent
   */
  async validateMessageSend(conversationId, messageType = 'text') {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      const isSessionOpen = this.isSessionOpen(conversation);
      const timeRemaining = this.getSessionTimeRemaining(conversation);

      // Template messages can always be sent
      if (messageType === 'template') {
        return {
          canSend: true,
          requiresTemplate: false,
          sessionOpen: isSessionOpen,
          timeRemaining
        };
      }

      // Free-form messages only within session
      if (isSessionOpen) {
        return {
          canSend: true,
          requiresTemplate: false,
          sessionOpen: true,
          timeRemaining
        };
      }

      // Session closed - must use template
      return {
        canSend: false,
        requiresTemplate: true,
        sessionOpen: false,
        timeRemaining: 0,
        reason: 'Session expired - template message required'
      };
    } catch (error) {
      logger.error('Failed to validate message send', {
        conversationId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get available templates for closed session
   */
  async getAvailableTemplates(businessId, whatsappNumberId, category = null) {
    try {
      const query = {
        businessId,
        whatsappNumberId,
        'meta.status': 'approved',
        'settings.isActive': true
      };

      if (category) {
        query['meta.category'] = category;
      }

      const templates = await Template.find(query)
        .select('name displayName meta.category components')
        .sort({ 'usage.totalSent': -1 }); // Most used first

      return templates;
    } catch (error) {
      logger.error('Failed to get available templates', {
        businessId,
        whatsappNumberId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Auto-select best template for situation
   */
  async suggestTemplate(conversationId, context = {}) {
    try {
      const conversation = await Conversation.findById(conversationId)
        .populate('businessId whatsappNumberId');

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Get utility templates first (most flexible)
      const templates = await this.getAvailableTemplates(
        conversation.businessId._id,
        conversation.whatsappNumberId._id,
        'utility'
      );

      if (templates.length === 0) {
        return null;
      }

      // Simple logic: return most used utility template
      // In production, this could be more sophisticated based on:
      // - Conversation context
      // - Customer history
      // - Time of day
      // - AI analysis
      
      return templates[0];
    } catch (error) {
      logger.error('Failed to suggest template', {
        conversationId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Schedule session expiry notifications
   */
  async scheduleSessionExpiryNotification(conversationId) {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation || !conversation.session.lastCustomerMessageAt) {
        return;
      }

      const expiryTime = this.getSessionExpiry(conversation);
      const warningTime = new Date(expiryTime.getTime() - 30 * 60 * 1000); // 30 min before

      // In production, use a job queue like Bull or Agenda
      // For now, we'll just log the schedule
      logger.info('Session expiry notification scheduled', {
        conversationId,
        warningTime,
        expiryTime
      });

      // TODO: Implement actual job scheduling
      // queue.add('session-expiry-warning', {
      //   conversationId,
      //   type: 'warning'
      // }, { delay: warningTime.getTime() - Date.now() });

      // queue.add('session-expired', {
      //   conversationId,
      //   type: 'expired'
      // }, { delay: expiryTime.getTime() - Date.now() });

    } catch (error) {
      logger.error('Failed to schedule session expiry notification', {
        conversationId,
        error: error.message
      });
    }
  }

  /**
   * Handle session expiry
   */
  async handleSessionExpiry(conversationId) {
    try {
      await Conversation.findByIdAndUpdate(conversationId, {
        'session.isOpen': false,
        'session.canSendFreeform': false
      });

      logger.info('Session expired', { conversationId });

      // Emit socket event to notify agents
      // socketService.emitToConversation(conversationId, 'session:expired', {
      //   conversationId,
      //   message: 'Session expired - template messages only'
      // });

    } catch (error) {
      logger.error('Failed to handle session expiry', {
        conversationId,
        error: error.message
      });
    }
  }

  /**
   * Get session status for UI
   */
  getSessionStatus(conversation) {
    const isOpen = this.isSessionOpen(conversation);
    const timeRemaining = this.getSessionTimeRemaining(conversation);
    const expiry = this.getSessionExpiry(conversation);

    let status = 'closed';
    let message = 'Session closed - use templates only';
    let color = 'red';

    if (isOpen) {
      if (timeRemaining > 60) {
        status = 'open';
        message = `Session open - ${Math.floor(timeRemaining / 60)}h ${timeRemaining % 60}m remaining`;
        color = 'green';
      } else if (timeRemaining > 0) {
        status = 'expiring';
        message = `Session expiring - ${timeRemaining}m remaining`;
        color = 'orange';
      }
    }

    return {
      isOpen,
      status,
      message,
      color,
      timeRemaining,
      expiresAt: expiry,
      canSendFreeform: isOpen
    };
  }

  /**
   * Bulk update expired sessions (run as cron job)
   */
  async updateExpiredSessions() {
    try {
      const now = new Date();
      
      const result = await Conversation.updateMany(
        {
          'session.isOpen': true,
          'session.expiresAt': { $lt: now }
        },
        {
          'session.isOpen': false,
          'session.canSendFreeform': false
        }
      );

      logger.info('Updated expired sessions', {
        count: result.modifiedCount
      });

      return result.modifiedCount;
    } catch (error) {
      logger.error('Failed to update expired sessions', {
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = new SessionService();