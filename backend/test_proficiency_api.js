// Test script to verify proficiency test API endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Get a token first (you'll need to login)
const testAPI = async () => {
    try {
        console.log('Testing Proficiency Test API...\n');

        // Test 1: Get all proficiency tests
        console.log('1. Testing GET /api/proficiency-tests');
        const response = await axios.get(`${BASE_URL}/proficiency-tests`, {
            headers: {
                'Authorization': `Bearer ${process.env.TEST_TOKEN || 'your-token-here'}`
            }
        });

        console.log('✅ GET request successful');
        console.log(`Found ${response.data.length} proficiency tests\n`);

        if (response.data.length === 0) {
            console.log('ℹ️  No proficiency tests found in database');
            console.log('   This is normal for a fresh installation');
            console.log('   Try creating a test from the admin panel\n');
        } else {
            console.log('Tests found:');
            response.data.forEach(test => {
                console.log(`  - ${test.title} (${test.status})`);
            });
        }

    } catch (error) {
        if (error.response) {
            console.log('❌ API Error:', error.response.status, error.response.statusText);
            console.log('   Response:', error.response.data);
        } else if (error.request) {
            console.log('❌ No response from server');
            console.log('   Make sure the backend is running on port 5000');
        } else {
            console.log('❌ Error:', error.message);
        }
    }
};

testAPI();
