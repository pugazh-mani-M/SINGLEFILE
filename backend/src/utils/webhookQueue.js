// Simple in-memory queue (use Bull/BullMQ with Redis in production)
class WebhookQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.maxRetries = 3;
  }

  async add(webhookData) {
    this.queue.push({
      data: webhookData,
      retries: 0,
      addedAt: Date.now()
    });
    
    if (!this.processing) {
      this.process();
    }
  }

  async process() {
    if (this.queue.length === 0) {
      this.processing = false;
      return;
    }

    this.processing = true;
    const job = this.queue.shift();

    try {
      await this.handleWebhook(job.data);
      console.log('✅ Webhook processed successfully');
    } catch (error) {
      console.error('❌ Webhook processing failed:', error.message);
      
      // Retry logic
      if (job.retries < this.maxRetries) {
        job.retries++;
        this.queue.push(job);
        console.log(`🔄 Retrying webhook (attempt ${job.retries}/${this.maxRetries})`);
      } else {
        console.error('❌ Webhook failed after max retries, logging to dead letter queue');
        // In production: save to database or dead letter queue
      }
    }

    // Process next item
    setImmediate(() => this.process());
  }

  async handleWebhook(data) {
    // Your webhook processing logic here
    // This should be imported from your webhook controller
    return new Promise((resolve) => {
      setTimeout(resolve, 100); // Simulate processing
    });
  }

  getQueueSize() {
    return this.queue.length;
  }
}

module.exports = new WebhookQueue();
