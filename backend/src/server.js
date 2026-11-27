require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('🚀 ============================================');
    console.log(`🚀  EventNest Backend running on port ${PORT}`);
    console.log(`🌍  API: http://localhost:${PORT}/api`);
    console.log(`💊  Health: http://localhost:${PORT}/api/health`);
    console.log(`💳  Payment Mode: ${process.env.MOCK_PAYMENT === 'true' ? '🎭 MOCK (Demo)' : '💰 Razorpay Live'}`);
    console.log(`🔐  Google Auth: ${process.env.GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE' ? '✅ Configured' : '⚠️  Not configured (email/password works)'}`);
    console.log('🚀 ============================================');
    console.log('');
  });
});
