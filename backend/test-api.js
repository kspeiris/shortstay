const axios = require('axios');

const testAPI = async () => {
  try {
    console.log('🧪 Testing ShortStay API...\n');
    
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    try {
      const health = await axios.get('http://localhost:5000/api/health');
      console.log('✅ Health check passed:', health.data);
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
      return;
    }
    
    // Test 2: Test endpoint
    console.log('\n2. Testing API endpoint...');
    try {
      const test = await axios.get('http://localhost:5000/api/test');
      console.log('✅ Test endpoint passed:', test.data);
    } catch (error) {
      console.log('❌ Test endpoint failed:', error.message);
    }
    
    // Test 3: Get properties
    console.log('\n3. Testing properties endpoint...');
    try {
      const properties = await axios.get('http://localhost:5000/api/properties', {
        params: { limit: 2 }
      });
      console.log('✅ Properties endpoint passed');
      console.log(`   Found ${properties.data.properties?.length || 0} properties`);
      console.log('   Response structure:', Object.keys(properties.data));
    } catch (error) {
      console.log('❌ Properties endpoint failed:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Data:', error.response.data);
      }
    }
    
    console.log('\n🎉 API Test Complete!');
  } catch (error) {
    console.error('❌ Test script error:', error);
  }
};

testAPI();