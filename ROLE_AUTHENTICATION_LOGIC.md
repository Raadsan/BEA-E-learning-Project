# Role-Based Authentication Logic - Complete Explanation

## 🎯 Overview

The system automatically detects user roles by checking three separate database tables. Users don't need to select their role - the system finds it automatically based on their email.

---

## 📊 Database Structure

We have **3 separate tables** for different user types:

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   admins    │    │   teachers   │    │  students   │
├─────────────┤    ├──────────────┤    ├─────────────┤
│ id          │    │ id            │    │ id           │
│ full_name   │    │ full_name     │    │ full_name   │
│ email       │    │ email         │    │ email       │
│ password    │    │ password      │    │ password    │
│ role        │    │ (no role col) │    │ (no role col)│
└─────────────┘    └──────────────┘    └─────────────┘
```

**Key Point:** Each user type has its own table. The role is determined by **which table** the email exists in.

---

## 🔄 Complete Login Flow

### Step 1: User Submits Login Form
```
User enters:
- Email: "admin@bea.com"
- Password: "admin123"
```

**Frontend Code:**
```javascript
// frontend/src/components/LoginPage.js
const result = await login({
  email: formData.email,
  password: formData.password,
  // NO ROLE SENT - System will detect it!
}).unwrap();
```

### Step 2: Backend Receives Request
```
POST /api/auth/login
Body: { email: "admin@bea.com", password: "admin123" }
```

### Step 3: Role Detection Logic (Backend)

**Location:** `backend/controllers/authController.js`

```javascript
// Step 3.1: Check Admin Table FIRST
user = await Admin.getAdminByEmail(email);
if (user) {
  // ✅ Found in admins table → Role = "admin"
  detectedRole = 'admin';
  userData = { id, full_name, email, role: 'admin' };
}

// Step 3.2: If NOT admin, check Teacher Table
else {
  user = await Teacher.getTeacherByEmail(email);
  if (user) {
    // ✅ Found in teachers table → Role = "teacher"
    detectedRole = 'teacher';
    userData = { id, full_name, email, role: 'teacher' };
  }
  
  // Step 3.3: If NOT teacher, check Student Table
  else {
    user = await Student.getStudentByEmail(email);
    if (user) {
      // ✅ Found in students table → Role = "student"
      detectedRole = 'student';
      userData = { id, full_name, email, role: 'student' };
    }
  }
}
```

**Priority Order:**
1. **Admin** (checked first)
2. **Teacher** (checked second)
3. **Student** (checked third)

**Why this order?** If an email accidentally exists in multiple tables, admin takes priority (highest security level).

### Step 4: Password Verification

```javascript
// Verify the password matches the hashed password in database
const isPasswordValid = await bcrypt.compare(password, user.password);

if (!isPasswordValid) {
  return "Invalid email or password";
}
```

**Security:** Passwords are hashed with bcrypt, so we compare the hash, not plain text.

### Step 5: Generate JWT Token

```javascript
// Create a token containing user info
const token = generateToken(
  userData.id,      // User ID
  userData.role,    // Detected role: "admin", "teacher", or "student"
  userData.email    // User email
);
```

**JWT Token Contains:**
```json
{
  "userId": 1,
  "role": "admin",
  "email": "admin@bea.com",
  "exp": 1234567890  // Expiration time
}
```

### Step 6: Return Response

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "full_name": "System Admin",
    "email": "admin@bea.com",
    "role": "admin"  // ← Detected automatically!
  }
}
```

### Step 7: Frontend Stores Token & Redirects

**Location:** `frontend/src/components/LoginPage.js`

```javascript
if (result.success) {
  // Token is automatically saved to localStorage by Redux
  // Now redirect based on detected role
  const role = result.user.role;
  
  if (role === "admin") {
    router.push("/portal/admin");      // → Admin Dashboard
  } else if (role === "teacher") {
    router.push("/portal/teacher");    // → Teacher Portal
  } else if (role === "student") {
    router.push("/portal/student");   // → Student Portal
  }
}
```

---

## 🔒 Protected Routes Logic

### How Routes Are Protected

**Location:** `frontend/src/components/ProtectedRoute.js`

```javascript
<ProtectedRoute allowedRoles={['admin']}>
  <AdminDashboard />
</ProtectedRoute>
```

### Protection Flow:

```
1. Check if token exists in localStorage
   ↓ NO → Redirect to /auth/login
   ↓ YES
   
2. Send token to backend: GET /api/auth/me
   ↓ Invalid → Clear token, redirect to login
   ↓ Valid
   
3. Check if user.role is in allowedRoles array
   ↓ NO → Redirect to their portal
   ↓ YES
   
4. Show protected content ✅
```

### Example Scenarios:

**Scenario 1: Admin accessing admin page**
```
User role: "admin"
Allowed roles: ["admin"]
✅ Match! → Show page
```

**Scenario 2: Student trying to access admin page**
```
User role: "student"
Allowed roles: ["admin"]
❌ No match! → Redirect to /portal/student
```

**Scenario 3: No token**
```
Token: null
❌ No token! → Redirect to /auth/login
```

---

## 🗄️ Backend Token Verification

### Middleware: `verifyToken`

**Location:** `backend/controllers/authController.js`

```javascript
export const verifyToken = (req, res, next) => {
  // 1. Extract token from header
  const token = req.headers.authorization?.split(' ')[1];
  // Format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  
  // 2. Verify token signature and expiration
  const decoded = jwt.verify(token, JWT_SECRET);
  // Returns: { userId: 1, role: "admin", email: "admin@bea.com" }
  
  // 3. Attach user info to request
  req.user = decoded;
  
  // 4. Continue to next middleware/controller
  next();
};
```

**Usage in routes:**
```javascript
router.get("/protected", verifyToken, (req, res) => {
  // req.user contains: { userId, role, email }
  if (req.user.role === "admin") {
    // Admin-only logic
  }
});
```

---

## 📋 Complete Example Flow

### Example 1: Admin Login

```
1. User enters: admin@bea.com / admin123
   ↓
2. Frontend sends: { email, password } (NO ROLE)
   ↓
3. Backend checks:
   - admins table? ✅ FOUND!
   - Role detected: "admin"
   ↓
4. Password verified ✅
   ↓
5. Token generated with role: "admin"
   ↓
6. Response: { token, user: { role: "admin" } }
   ↓
7. Frontend redirects to: /portal/admin
   ↓
8. ProtectedRoute checks: allowedRoles=["admin"]
   ✅ User role matches → Show admin dashboard
```

### Example 2: Student Login

```
1. User enters: student@example.com / student123
   ↓
2. Frontend sends: { email, password }
   ↓
3. Backend checks:
   - admins table? ❌ NOT FOUND
   - teachers table? ❌ NOT FOUND
   - students table? ✅ FOUND!
   - Role detected: "student"
   ↓
4. Password verified ✅
   ↓
5. Token generated with role: "student"
   ↓
6. Response: { token, user: { role: "student" } }
   ↓
7. Frontend redirects to: /portal/student
   ↓
8. ProtectedRoute checks: allowedRoles=["student"]
   ✅ User role matches → Show student portal
```

---

## 🔑 Key Concepts

### 1. **Automatic Role Detection**
- System checks tables in priority order
- No user input needed for role
- Role is determined by which table contains the email

### 2. **JWT Token Storage**
- Token stored in `localStorage` (browser)
- Contains: userId, role, email
- Expires after 7 days

### 3. **Role-Based Access Control (RBAC)**
- Each route can specify allowed roles
- Unauthorized users are redirected
- Token is verified on every protected request

### 4. **Security Features**
- Passwords hashed with bcrypt
- JWT tokens signed with secret key
- Token expiration (7 days)
- Automatic token validation

---

## 🎨 Visual Flow Diagram

```
┌─────────────────┐
│  Login Form     │
│  Email + Pass   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend API    │
│  /api/auth/login│
└────────┬────────┘
         │
         ▼
    ┌────────┐
    │ Check  │──→ admins table? ──→ YES → Role: "admin"
    │ Tables │──→ teachers table? ──→ YES → Role: "teacher"
    │        │──→ students table? ──→ YES → Role: "student"
    └────────┘
         │
         ▼
┌─────────────────┐
│ Verify Password │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Generate Token  │
│ (with role)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Return Token +  │
│ User Data       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Store Token     │
│ Redirect by Role│
└─────────────────┘
```

---

## 💡 Why This Design?

### Advantages:
1. **User-Friendly**: No need to select role
2. **Secure**: Role determined server-side
3. **Flexible**: Easy to add new roles
4. **Scalable**: Separate tables for each role
5. **Clear Separation**: Each role has its own data structure

### Trade-offs:
- If email exists in multiple tables, admin takes priority
- Requires checking multiple tables (but fast with indexes)

---

## 🛠️ How to Add a New Role

1. **Create new table** (e.g., `managers`)
2. **Create model** (`backend/models/managerModel.js`)
3. **Add to login logic:**
   ```javascript
   // After checking students
   user = await Manager.getManagerByEmail(email);
   if (user) {
     detectedRole = 'manager';
     // ...
   }
   ```
4. **Update frontend redirect:**
   ```javascript
   if (role === "manager") {
     router.push("/portal/manager");
   }
   ```

---

## 📝 Summary

**The system works like this:**

1. **User logs in** with email + password (no role selection)
2. **Backend checks** all three tables to find the email
3. **Role is detected** based on which table contains the email
4. **JWT token** is created with the detected role
5. **Frontend redirects** user to their appropriate portal
6. **Protected routes** verify token and check role permissions

**The role is never sent by the user - it's always determined by the backend!**

