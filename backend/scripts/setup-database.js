const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { CreateTableCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });

const tables = [
  {
    TableName: 'whatsapp-crm-conversations',
    KeySchema: [
      { AttributeName: 'conversationId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'conversationId', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },
  {
    TableName: 'whatsapp-crm-messages',
    KeySchema: [
      { AttributeName: 'messageId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'messageId', AttributeType: 'S' },
      { AttributeName: 'conversationId', AttributeType: 'S' },
      { AttributeName: 'timestamp', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'conversationId-timestamp-index',
        KeySchema: [
          { AttributeName: 'conversationId', KeyType: 'HASH' },
          { AttributeName: 'timestamp', KeyType: 'RANGE' }
        ],
        Projection: { ProjectionType: 'ALL' }
      }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },
  {
    TableName: 'whatsapp-crm-contacts',
    KeySchema: [
      { AttributeName: 'contactId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'contactId', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  },
  {
    TableName: 'whatsapp-crm-agents',
    KeySchema: [
      { AttributeName: 'agentId', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'agentId', AttributeType: 'S' }
    ],
    BillingMode: 'PAY_PER_REQUEST'
  }
];

async function createTables() {
  for (const table of tables) {
    try {
      console.log(`Creating table: ${table.TableName}`);
      await client.send(new CreateTableCommand(table));
      console.log(`✅ Table ${table.TableName} created successfully`);
    } catch (error) {
      if (error.name === 'ResourceInUseException') {
        console.log(`⚠️  Table ${table.TableName} already exists`);
      } else {
        console.error(`❌ Error creating table ${table.TableName}:`, error);
      }
    }
  }
}

createTables().then(() => {
  console.log('Database setup complete!');
}).catch(console.error);