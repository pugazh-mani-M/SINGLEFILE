const mongoose = require('mongoose');
const axios = require('axios');

class HealthCheck {
  async checkMongoDB() {
    try {
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.db.admin().ping();
        return { status: 'healthy', latency: 0 };
      }
      return { status: 'unhealthy', error: 'Not connected' };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  async checkWhatsAppAPI() {
    try {
      if (!process.env.WHATSAPP_ACCESS_TOKEN) {
        return { status: 'not_configured' };
      }
      
      const start = Date.now();
      await axios.get('https://graph.facebook.com/v18.0/me', {
        params: { access_token: process.env.WHATSAPP_ACCESS_TOKEN },
        timeout: 5000
      });
      
      return { status: 'healthy', latency: Date.now() - start };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  async getFullHealth() {
    const [mongodb, whatsapp] = await Promise.all([
      this.checkMongoDB(),
      this.checkWhatsAppAPI()
    ]);

    const isHealthy = mongodb.status === 'healthy';

    return {
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      },
      dependencies: {
        mongodb,
        whatsapp
      }
    };
  }
}

module.exports = new HealthCheck();
