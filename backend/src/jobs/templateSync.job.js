const cron = require('node-cron');
const TemplateService = require('../services/template.service');

class TemplateSyncJob {
  constructor() {
    this.templateService = new TemplateService();
    this.isRunning = false;
  }

  start() {
    // Run every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
      if (this.isRunning) {
        console.log('Template sync job already running, skipping...');
        return;
      }

      this.isRunning = true;
      console.log('Starting template sync job...');

      try {
        const syncResults = await this.templateService.syncWithMeta();
        console.log(`Template sync completed. Updated ${syncResults.length} templates.`);
      } catch (error) {
        console.error('Template sync job failed:', error.message);
      } finally {
        this.isRunning = false;
      }
    });

    console.log('✅ Template sync job scheduled to run every 30 minutes');
  }

  async runOnce() {
    if (this.isRunning) {
      throw new Error('Sync job is already running');
    }

    this.isRunning = true;
    try {
      const syncResults = await this.templateService.syncWithMeta();
      return syncResults;
    } finally {
      this.isRunning = false;
    }
  }
}

module.exports = TemplateSyncJob;