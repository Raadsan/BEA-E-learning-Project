import axios from 'axios';

const API_URL = 'http://localhost:5000/api/news';

const runTests = async () => {
    try {
        console.log('Testing Create News...');
        const createRes = await axios.post(API_URL, {
            title: 'Test Event',
            description: 'This is a test event',
            event_date: '2025-12-30',
            type: 'event',
            status: 'active'
        });
        console.log('Create Result:', createRes.data);
        const newId = createRes.data.id;

        console.log('Testing Get All News...');
        const getRes = await axios.get(API_URL);
        console.log('Get Result Count:', getRes.data.length);

        console.log('Testing Update News...');
        const updateRes = await axios.post(`${API_URL}/update/${newId}`, {
            title: 'Updated Test Event'
        });
        console.log('Update Result:', updateRes.data);

        console.log('Testing Delete News...');
        const deleteRes = await axios.delete(`${API_URL}/${newId}`);
        console.log('Delete Result:', deleteRes.data);

    } catch (error) {
        console.error('Test Failed:', error.response ? error.response.data : error.message);
    }
};

runTests();
