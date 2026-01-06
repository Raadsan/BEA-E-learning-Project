
const testApi = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/students/gender-distribution');
        const data = await response.json();
        console.log('API Status:', response.status);
        console.log('API RESPONSE STRUCTURE:');
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
};

testApi();
