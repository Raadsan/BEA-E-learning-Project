# Email Testing Guide

## Setup

1. **Configure your `.env` file** in the `backend` folder with:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Note:** For Gmail, you need to use an "App Password" instead of your regular password:
- Go to Google Account → Security → 2-Step Verification → App passwords
- Generate an app password for "Mail"
- Use that password in `EMAIL_PASS`

## Testing Methods

### Method 1: Using the Test Script
```bash
cd backend
node test-email.js
```

### Method 2: Using cURL
```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Abdulahi",
    "email": "test@gmail.com",
    "phone": "6123456",
    "message": "Hello! This is a test."
  }'
```

### Method 3: Using Postman or Thunder Client
- **URL:** `POST http://localhost:5000/api/contact`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "name": "Abdulahi",
  "email": "test@gmail.com",
  "phone": "6123456",
  "message": "Hello! This is a test."
}
```

### Method 4: Using Browser Console (if frontend is running)
```javascript
fetch('http://localhost:5000/api/contact', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: "Abdulahi",
    email: "test@gmail.com",
    phone: "6123456",
    message: "Hello! This is a test."
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
```

## Expected Response

**Success:**
```json
{
  "success": true,
  "message": "Message sent successfully!",
  "messageId": "..."
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message here"
}
```

## Troubleshooting

1. **"Email service not configured"** → Check your `.env` file has `EMAIL_USER` and `EMAIL_PASS`
2. **"Email authentication failed"** → Use App Password for Gmail, not regular password
3. **"Could not connect to email server"** → Check internet connection
4. **Server not running** → Run `npm start` in the backend folder

