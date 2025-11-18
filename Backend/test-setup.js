require('dotenv').config();
const { testConnection } = require('./config/database');

async function testSetup() {
    console.log('🧪 Testing CarbonIQ Setup...\n');
    
    // Test database
    console.log('1. Testing database connection...');
    const dbConnected = await testConnection();
    
    // Test environment
    console.log('2. Testing environment variables...');
    console.log(`   - PORT: ${process.env.PORT}`);
    console.log(`   - DB_NAME: ${process.env.DB_NAME}`);
    console.log(`   - NODE_ENV: ${process.env.NODE_ENV}`);
    
    if (dbConnected) {
        console.log('\n✅ Setup test passed! You can start the server with:');
        console.log('   npm run dev');
    } else {
        console.log('\n❌ Setup test failed. Check your database configuration.');
    }
}

testSetup();