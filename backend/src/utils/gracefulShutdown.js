const mongoose = require('mongoose');

class GracefulShutdown {
  constructor(server, io) {
    this.server = server;
    this.io = io;
    this.isShuttingDown = false;
  }

  async shutdown(signal) {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;

    console.log(`\n⚠️  ${signal} received. Starting graceful shutdown...`);

    // Stop accepting new connections
    this.server.close(() => {
      console.log('✅ HTTP server closed');
    });

    // Close Socket.IO connections
    if (this.io) {
      this.io.close(() => {
        console.log('✅ Socket.IO closed');
      });
    }

    // Close database connection
    try {
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
    } catch (error) {
      console.error('❌ Error closing MongoDB:', error.message);
    }

    // Give ongoing requests 10 seconds to complete
    setTimeout(() => {
      console.log('⏱️  Forcing shutdown after timeout');
      process.exit(0);
    }, 10000);
  }

  register() {
    process.on('SIGTERM', () => this.shutdown('SIGTERM'));
    process.on('SIGINT', () => this.shutdown('SIGINT'));
  }
}

module.exports = GracefulShutdown;
