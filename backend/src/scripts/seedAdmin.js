require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
async function main() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eventnest');
  const User = require('../models/User');
  const email = process.env.DEMO_ADMIN_EMAIL || 'admin004@gmail.com';
  const password = process.env.DEMO_ADMIN_PASSWORD || 'admin@2004';
  const existing = await User.findOne({ email });
  if (existing) { console.log('ℹ️  Admin already exists:', email); await mongoose.disconnect(); process.exit(0); }
  await User.create({ fullName: 'EventNest Admin', email, password, role: 'ADMIN', isEmailVerified: true });
  console.log('✅ Admin created:', email, '| Password:', password);
  await mongoose.disconnect(); process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
