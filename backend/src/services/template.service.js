const TemplateModel = require('../models/Template.model');
const TemplateSyncService = require('./templateSync.service');
const { v4: uuidv4 } = require('uuid');

class TemplateService {
  constructor() {
    this.syncService = new TemplateSyncService();
  }

  async createTemplate(templateData) {
    const templateId = uuidv4();
    
    // Create template in Meta first
    const metaResponse = await this.syncService.createTemplate(templateData);
    
    // Save to database
    const template = await TemplateModel.create({
      id: templateId,
      ...templateData,
      metaTemplateId: metaResponse.id,
      status: metaResponse.status || 'PENDING'
    });
    
    return template;
  }

  async getAllTemplates() {
    return await TemplateModel.findAll();
  }

  async getTemplateById(id) {
    return await TemplateModel.findById(id);
  }

  async updateTemplateStatus(id, status) {
    return await TemplateModel.update(id, { status });
  }

  async deleteTemplate(id) {
    const template = await TemplateModel.findById(id);
    if (!template) {
      throw new Error('Template not found');
    }

    // Delete from Meta if it exists
    if (template.metaTemplateId) {
      await this.syncService.deleteTemplate(template.metaTemplateId);
    }

    // Delete from database
    await TemplateModel.delete(id);
    return true;
  }

  async syncWithMeta() {
    try {
      const metaTemplates = await this.syncService.getAllTemplates();
      const localTemplates = await TemplateModel.findAll();
      
      const syncResults = [];
      
      for (const metaTemplate of metaTemplates) {
        const localTemplate = localTemplates.find(t => t.metaTemplateId === metaTemplate.id);
        
        if (localTemplate) {
          // Update existing template status if changed
          if (localTemplate.status !== metaTemplate.status) {
            await this.updateTemplateStatus(localTemplate.id, metaTemplate.status);
            syncResults.push({ id: localTemplate.id, status: metaTemplate.status, action: 'updated' });
          }
        } else {
          // Create new template from Meta
          const newTemplate = await TemplateModel.create({
            id: uuidv4(),
            name: metaTemplate.name,
            category: metaTemplate.category || 'UTILITY',
            language: metaTemplate.language || 'en_US',
            status: metaTemplate.status,
            components: [{ type: 'BODY', text: `Template: ${metaTemplate.name}` }],
            metaTemplateId: metaTemplate.id
          });
          syncResults.push({ id: newTemplate.id, status: metaTemplate.status, action: 'created' });
        }
      }
      
      return syncResults;
    } catch (error) {
      console.error('Sync error:', error.message);
      // Return empty array instead of throwing error
      return [];
    }
  }
}

module.exports = TemplateService;