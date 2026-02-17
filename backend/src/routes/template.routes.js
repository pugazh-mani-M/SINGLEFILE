const express = require('express');
const templateController = require('../controllers/template.controller');
const { templateValidationRules, validate } = require('../middleware/templateValidation.middleware');

const router = express.Router();

// GET /api/templates - Get all templates (no auth required for development)
router.get('/', templateController.getAllTemplates.bind(templateController));

// GET /api/templates/:id - Get template by ID
router.get('/:id', templateController.getTemplateById.bind(templateController));

// POST /api/templates - Create new template
router.post('/', 
  templateValidationRules(), 
  validate, 
  templateController.createTemplate.bind(templateController)
);

// DELETE /api/templates/:id - Delete template
router.delete('/:id', templateController.deleteTemplate.bind(templateController));

// POST /api/templates/sync - Sync templates with Meta
router.post('/sync', templateController.syncTemplates.bind(templateController));

module.exports = router;