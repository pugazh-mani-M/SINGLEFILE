class TemplateHelpers {
  static validateTemplateStructure(components) {
    const requiredTypes = ['BODY'];
    const allowedTypes = ['HEADER', 'BODY', 'FOOTER', 'BUTTONS'];
    
    // Check if BODY component exists
    const hasBody = components.some(comp => comp.type === 'BODY');
    if (!hasBody) {
      throw new Error('Template must have a BODY component');
    }
    
    // Validate component types
    for (const component of components) {
      if (!allowedTypes.includes(component.type)) {
        throw new Error(`Invalid component type: ${component.type}`);
      }
    }
    
    return true;
  }

  static formatTemplateForMeta(templateData) {
    return {
      name: templateData.name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      category: templateData.category,
      language: templateData.language,
      components: templateData.components.map(comp => ({
        type: comp.type,
        text: comp.text,
        ...(comp.buttons && { buttons: comp.buttons }),
        ...(comp.format && { format: comp.format })
      }))
    };
  }

  static getTemplateStatusColor(status) {
    const statusColors = {
      'APPROVED': 'green',
      'PENDING': 'yellow',
      'REJECTED': 'red',
      'DISABLED': 'gray'
    };
    return statusColors[status] || 'gray';
  }

  static extractVariables(text) {
    const variableRegex = /\{\{(\d+)\}\}/g;
    const variables = [];
    let match;
    
    while ((match = variableRegex.exec(text)) !== null) {
      variables.push({
        index: parseInt(match[1]),
        placeholder: match[0]
      });
    }
    
    return variables;
  }

  static replaceVariables(text, values) {
    let result = text;
    values.forEach((value, index) => {
      result = result.replace(new RegExp(`\\{\\{${index + 1}\\}\\}`, 'g'), value);
    });
    return result;
  }
}

module.exports = TemplateHelpers;