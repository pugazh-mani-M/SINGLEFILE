const TemplateService = require('../services/template.service');

class TemplateController {
  constructor() {
    this.templateService = new TemplateService();
  }

  async createTemplate(req, res) {
    try {
      const template = await this.templateService.createTemplate(req.body);
      res.status(201).json({
        success: true,
        data: template,
        message: 'Template created successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAllTemplates(req, res) {
    try {
      const templates = await this.templateService.getAllTemplates();
      res.json({
        success: true,
        data: templates || []
      });
    } catch (error) {
      console.error('Get templates error:', error.message);
      res.json({
        success: true,
        data: []
      });
    }
  }

  async getTemplateById(req, res) {
    try {
      const template = await this.templateService.getTemplateById(req.params.id);
      if (!template) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }
      res.json({
        success: true,
        data: template
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteTemplate(req, res) {
    try {
      await this.templateService.deleteTemplate(req.params.id);
      res.json({
        success: true,
        message: 'Template deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async syncTemplates(req, res) {
    try {
      const syncResults = await this.templateService.syncWithMeta();
      
      // Add success message based on environment
      let message;
      if (process.env.NODE_ENV === 'development') {
        message = syncResults.length > 0 
          ? `Development sync completed. Updated ${syncResults.length} templates.`
          : 'Development sync completed. Templates are up to date.';
      } else {
        message = syncResults.length > 0 
          ? `Templates synced successfully. Updated ${syncResults.length} templates.`
          : 'Templates are already up to date.';
      }
      
      res.json({
        success: true,
        data: syncResults,
        message
      });
    } catch (error) {
      console.error('Template sync error:', error.message);
      res.status(500).json({
        success: false,
        message: error.message.includes('credentials') 
          ? 'WhatsApp API not configured. Using development mode.'
          : 'Failed to sync templates. Please try again later.'
      });
    }
  }
}

module.exports = new TemplateController();