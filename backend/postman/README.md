# Postman Collection for BEA Authentication API

## Import Instructions

1. Open Postman
2. Click **Import** button (top left)
3. Select the file: `Authentication_API.postman_collection.json`
4. The collection will be imported with all endpoints

## Environment Setup

### Option 1: Use Collection Variables (Default)
The collection includes default variables:
- `base_url`: `http://localhost:5000`
- `auth_token`: (auto-set after login)
- `user_role`: (auto-set after login)
- `user_id`: (auto-set after login)

### Option 2: Create Postman Environment
1. Click **Environments** → **Create Environment**
2. Add variables:
   - `base_url`: `http://localhost:5000`
   - `auth_token`: (leave empty, will be set automatically)
   - `user_role`: (leave empty, will be set automatically)
   - `user_id`: (leave empty, will be set automatically)
3. Select the environment from the dropdown

## Endpoints

### 1. Login (Auto-detect Role)
**POST** `{{base_url}}/api/auth/login`

**Request Body:**
```json
{
    "email": "admin@bea.com",
    "password": "admin123"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 1,
        "full_name": "System Admin",
        "email": "admin@bea.com",
        "role": "admin"
    }
}
```

**Note:** The token is automatically saved to `auth_token` variable after successful login.

### 2. Get Current User
**GET** `{{base_url}}/api/auth/me`

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

**Response:**
```json
{
    "success": true,
    "user": {
        "id": 1,
        "full_name": "System Admin",
        "email": "admin@bea.com",
        "role": "admin"
    }
}
```

## Example Requests

The collection includes example requests for:
- **Login as Admin** - Uses default admin credentials
- **Login as Student** - Example student login
- **Login as Teacher** - Example teacher login

## Testing Flow

1. **Start your backend server:**
   ```bash
   cd backend
   npm start
   ```

2. **Login:**
   - Use "Login (Auto-detect Role)" request
   - Token will be automatically saved
   - Check the console for confirmation

3. **Get Current User:**
   - Use "Get Current User" request
   - It will use the saved token automatically

## Default Credentials

### Admin
- Email: `admin@bea.com`
- Password: `admin123`

**⚠️ Change this password after first login!**

### Student/Teacher
- Use credentials from your database
- Email must exist in `students` or `teachers` table

## Troubleshooting

### "Invalid email or password"
- Check if the email exists in the correct table (admins, students, or teachers)
- Verify the password is correct
- Ensure the user account exists in the database

### "No token provided"
- Make sure you've logged in first
- Check that `auth_token` variable is set
- Verify the Authorization header format: `Bearer {{auth_token}}`

### "Table doesn't exist"
- Run the database setup script:
  ```bash
  cd backend
  node database/create_admins_table.js
  ```

## Role Detection Priority

The system checks tables in this order:
1. **Admins** table (first)
2. **Teachers** table (second)
3. **Students** table (third)

If an email exists in multiple tables, the admin role takes priority.

## Response Codes

- `200` - Success
- `400` - Bad Request (missing fields)
- `401` - Unauthorized (invalid credentials)
- `500` - Server Error

