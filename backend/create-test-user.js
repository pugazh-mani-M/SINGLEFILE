const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  agentId: String,
  name: String,
  email: String,
  passwordHash: String,
  role: String,
  createdAt: Date
});

const User = mongoose.model('User', userSchema);

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const email = 'test@test.com';
    const password = 'test123';
    
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('✅ Test user already exists');
      console.log('📧 Email:', email);
      console.log('🔑 Password:', password);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({
      agentId: 'test-' + Date.now(),
      name: 'Test User',
      email,
      passwordHash,
      role: 'admin',
      createdAt: new Date()
    });

    console.log('✅ Test user created successfully!');
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestUser();
