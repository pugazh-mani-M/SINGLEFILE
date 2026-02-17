const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = 'whatsapp_templates';

class TemplateModel {
  static async create(templateData) {
    try {
      const params = {
        TableName: TABLE_NAME,
        Item: {
          id: templateData.id,
          name: templateData.name,
          category: templateData.category,
          language: templateData.language,
          status: templateData.status || 'PENDING',
          components: templateData.components,
          metaTemplateId: templateData.metaTemplateId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
      
      await docClient.send(new PutCommand(params));
      return params.Item;
    } catch (error) {
      console.error('DynamoDB create error:', error.message);
      // Return the template data even if DynamoDB fails
      return {
        id: templateData.id,
        name: templateData.name,
        category: templateData.category,
        language: templateData.language,
        status: templateData.status || 'PENDING',
        components: templateData.components,
        metaTemplateId: templateData.metaTemplateId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
  }

  static async findById(id) {
    const params = {
      TableName: TABLE_NAME,
      Key: { id }
    };
    
    const result = await docClient.send(new GetCommand(params));
    return result.Item;
  }

  static async findAll() {
    try {
      const params = {
        TableName: TABLE_NAME
      };
      
      const result = await docClient.send(new ScanCommand(params));
      return result.Items || [];
    } catch (error) {
      console.error('DynamoDB findAll error:', error.message);
      // Return empty array if DynamoDB is not available
      return [];
    }
  }

  static async update(id, updateData) {
    const params = {
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': updateData.status,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };
    
    const result = await docClient.send(new UpdateCommand(params));
    return result.Attributes;
  }

  static async delete(id) {
    const params = {
      TableName: TABLE_NAME,
      Key: { id }
    };
    
    await docClient.send(new DeleteCommand(params));
    return true;
  }
}

module.exports = TemplateModel;