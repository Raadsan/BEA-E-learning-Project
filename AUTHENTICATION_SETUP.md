# Role-Based Authentication System

This document explains the role-based authentication system implemented for the BEA E-learning Project.

## Overview

The system supports three user roles:
- **Admin**: Full system access
- **Teacher**: Teaching and course management
- **Student**: Learning portal access

## Backend Implementation

### 1. Database Setup

#### Admin Table
Run the following to create the admins table:
```bash
cd backend
node database/create_admins_table.js
```

This will:
- Create the `admins` table
- Create a default admin account (email: `admin@bea.com`, password: `admin123`)
- **Important**: Change the default password after first login!

#### Environment Variables
Add to your `.env` file:
```env
JWT_SECRET=your-secret-key-change-this-in-production
DEFAULT_ADMIN_EMAIL=admin@bea.com
DEFAULT_ADMIN_PASSWORD=admin123
```

### 2. Authentication Endpoints

#### Login
**POST** `/api/auth/login`

Request body:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "admin" // or "student" or "teacher"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "full_name": "John Doe",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

#### Get Current User
**GET** `/api/auth/me`

Headers:
```
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "full_name": "John Doe",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

### 3. Backend Files Created

- `backend/models/adminModel.js` - Admin model with CRUD operations
- `backend/controllers/authController.js` - Authentication logic
- `backend/routes/authRoutes.js` - Authentication routes
- `backend/database/create_admins_table.js` - Database setup script

### 4. Middleware

The `verifyToken` middleware can be used to protect routes:

```javascript
import { verifyToken } from "../controllers/authController.js";

router.get("/protected-route", verifyToken, yourController);
```

The middleware adds `req.user` with decoded token data:
```javascript
{
  userId: 1,
  role: "admin",
  email: "user@example.com"
}
```

## Frontend Implementation

### 1. Redux Setup

The authentication state is managed through Redux RTK Query:

- `frontend/src/redux/api/authApi.js` - Auth API slice
- Token is automatically stored in `localStorage`
- User data is stored in `localStorage` as JSON

### 2. Login Page

The login page (`frontend/src/components/LoginPage.js`) includes:
- Role selection dropdown (Admin, Teacher, Student)
- Email and password fields
- Error handling
- Automatic redirect based on role after successful login

### 3. Protected Routes

Use the `ProtectedRoute` component to protect pages:

```javascript
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div>Admin Content</div>
    </ProtectedRoute>
  );
}
```

**Available props:**
- `allowedRoles`: Array of allowed roles (e.g., `['admin']`, `['student', 'teacher']`)

### 4. Logout

Logout functionality is available through the `useLogoutMutation` hook:

```javascript
import { useLogoutMutation } from "@/redux/api/authApi";

const [logout] = useLogoutMutation();

const handleLogout = async () => {
  await logout();
  router.push("/auth/login");
};
```

## Usage Examples

### Creating a New Admin

```javascript
// Backend - Create admin manually via SQL or API
const admin = await Admin.createAdmin({
  full_name: "Admin Name",
  email: "admin@example.com",
  password: "securepassword",
  role: "admin"
});
```

### Protecting a Route

```javascript
// frontend/src/app/portal/admin/layout.js
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      {children}
    </ProtectedRoute>
  );
}
```

### Using Auth in Components

```javascript
import { useGetCurrentUserQuery } from "@/redux/api/authApi";

function MyComponent() {
  const { data: user, isLoading } = useGetCurrentUserQuery();
  
  if (isLoading) return <div>Loading...</div>;
  
  return <div>Welcome, {user?.full_name}!</div>;
}
```

## Role-Based Redirects

After login, users are automatically redirected:
- **Admin** → `/portal/admin`
- **Teacher** → `/portal/teacher`
- **Student** → `/portal/student`

## Security Notes

1. **JWT Secret**: Change the default JWT secret in production
2. **Password Hashing**: All passwords are hashed using bcrypt (10 rounds)
3. **Token Expiration**: Tokens expire after 7 days
4. **Token Storage**: Tokens are stored in `localStorage` (consider httpOnly cookies for production)
5. **CORS**: Ensure CORS is properly configured for your frontend domain

## Testing

### Test Admin Login
1. Run `node backend/database/create_admins_table.js`
2. Use default credentials:
   - Email: `admin@bea.com`
   - Password: `admin123`
   - Role: `admin`

### Test Student Login
1. Register a student through the registration page
2. Use student credentials:
   - Email: (student email)
   - Password: (student password)
   - Role: `student`

### Test Teacher Login
1. Create a teacher through admin panel or API
2. Use teacher credentials:
   - Email: (teacher email)
   - Password: (teacher password)
   - Role: `teacher`

## Troubleshooting

### "Invalid email or password"
- Check if the user exists in the correct table (admins, students, or teachers)
- Verify the password is correct
- Ensure the role matches the user's table

### "No token provided"
- Check if token is stored in localStorage
- Verify Authorization header format: `Bearer <token>`

### Redirect Loop
- Check if ProtectedRoute is correctly configured
- Verify user role matches allowedRoles
- Check browser console for errors

## Next Steps

1. **Add Password Reset**: Implement forgot password functionality
2. **Add Email Verification**: Verify emails during registration
3. **Add Session Management**: Implement refresh tokens
4. **Add Role Permissions**: Fine-grained permission system
5. **Add Audit Logging**: Log authentication events

