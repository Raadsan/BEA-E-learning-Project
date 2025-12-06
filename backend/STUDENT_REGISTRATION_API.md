# Student Registration API Documentation

## Overview
Complete student registration system with parent/guardian support for minors (< 18 years old), program selection with foreign keys, and sub-program support.

---

## Database Tables

### 1. **sub_programs** Table
Stores sub-programs that belong to main programs.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary Key, Auto Increment |
| program_id | INT | Foreign Key → programs(id) |
| title | VARCHAR(255) | Sub-program name |
| description | TEXT | Sub-program description |
| created_at | TIMESTAMP | Creation timestamp |

### 2. **students** Table
Main table for student registrations.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary Key, Auto Increment |
| first_name | VARCHAR(100) | Student's first name |
| last_name | VARCHAR(100) | Student's last name |
| email | VARCHAR(255) | Unique email address |
| phone | VARCHAR(50) | Phone number |
| age | INT | Student's age |
| gender | ENUM | 'Male', 'Female', 'Other' |
| country | VARCHAR(100) | Country of residence |
| city | VARCHAR(100) | City of residence |
| program_id | INT | **Foreign Key → programs(id)** |
| sub_program_id | INT | **Foreign Key → sub_programs(id)** (nullable) |
| password | VARCHAR(255) | Hashed password (bcrypt) |
| is_minor | BOOLEAN | Auto-set: true if age < 18 |
| terms_accepted | BOOLEAN | Terms acceptance status |
| created_at | TIMESTAMP | Registration timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### 3. **parents** Table
Stores parent/guardian information for students under 18.

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary Key, Auto Increment |
| student_id | INT | **Foreign Key → students(id)** (unique) |
| parent_first_name | VARCHAR(100) | Parent's first name |
| parent_last_name | VARCHAR(100) | Parent's last name |
| parent_email | VARCHAR(255) | Parent's email |
| parent_phone | VARCHAR(50) | Parent's phone |
| relationship | ENUM | 'Father', 'Mother', 'Guardian', 'Other' |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

---

## API Endpoints

### Base URL: `http://localhost:5000/api/students`

---

### 1. **Register Student**
**POST** `/register`

Register a new student. If student is under 18, parent information is **required**.

#### Request Body:
```json
{
  "first_name": "Ahmed",
  "last_name": "Hassan",
  "email": "ahmed@example.com",
  "phone": "+252 61 123-4567",
  "age": 16,
  "gender": "Male",
  "country": "Somalia",
  "city": "Mogadishu",
  "program_id": 3,
  "sub_program_id": 1,  // Optional - only if program has sub-programs
  "password": "SecurePassword123",
  "terms_accepted": true,
  
  // REQUIRED if age < 18:
  "parent_first_name": "Mohamed",
  "parent_last_name": "Hassan",
  "parent_email": "parent@example.com",
  "parent_phone": "+252 61 987-6543",
  "relationship": "Father"  // "Father", "Mother", "Guardian", "Other"
}
```

#### Success Response (201):
```json
{
  "success": true,
  "message": "Student registered successfully",
  "student": {
    "id": 1,
    "first_name": "Ahmed",
    "last_name": "Hassan",
    "email": "ahmed@example.com",
    "age": 16,
    "program_id": 3,
    "sub_program_id": 1,
    "is_minor": true
  },
  "parent": {
    "id": 1,
    "parent_first_name": "Mohamed",
    "parent_last_name": "Hassan",
    "relationship": "Father"
  }
}
```

#### Error Responses:
- **400**: Missing required fields, invalid email, age < 18 without parent info, email already exists
- **500**: Server error

---

### 2. **Get All Students**
**GET** `/`

Get all registered students with their program and parent information.

#### Success Response (200):
```json
{
  "success": true,
  "students": [
    {
      "id": 1,
      "first_name": "Ahmed",
      "last_name": "Hassan",
      "email": "ahmed@example.com",
      "phone": "+252 61 123-4567",
      "age": 16,
      "gender": "Male",
      "country": "Somalia",
      "city": "Mogadishu",
      "program_id": 3,
      "sub_program_id": 1,
      "program_title": "General English Program For Adults",
      "sub_program_title": "Level 1",
      "is_minor": true,
      "parent_first_name": "Mohamed",
      "parent_last_name": "Hassan",
      "parent_email": "parent@example.com",
      "parent_phone": "+252 61 987-6543",
      "relationship": "Father",
      "created_at": "2025-12-06T12:00:00.000Z"
    }
  ]
}
```

---

### 3. **Get Single Student**
**GET** `/:id`

Get a specific student by ID.

#### Success Response (200):
```json
{
  "success": true,
  "student": {
    "id": 1,
    "first_name": "Ahmed",
    "last_name": "Hassan",
    "email": "ahmed@example.com",
    "phone": "+252 61 123-4567",
    "age": 16,
    "gender": "Male",
    "country": "Somalia",
    "city": "Mogadishu",
    "program_id": 3,
    "sub_program_id": 1,
    "program_title": "General English Program For Adults",
    "sub_program_title": "Level 1",
    "is_minor": true,
    "parent_first_name": "Mohamed",
    "parent_last_name": "Hassan",
    "parent_email": "parent@example.com",
    "parent_phone": "+252 61 987-6543",
    "relationship": "Father",
    "created_at": "2025-12-06T12:00:00.000Z"
  }
}
```

#### Error Response (404):
```json
{
  "success": false,
  "error": "Student not found"
}
```

---

### 4. **Update Student**
**PUT** `/:id`

Update student information.

#### Request Body (all fields optional):
```json
{
  "first_name": "Ahmed",
  "last_name": "Hassan",
  "email": "newemail@example.com",
  "phone": "+252 61 999-9999",
  "age": 17,
  "gender": "Male",
  "country": "Somalia",
  "city": "Hargeisa",
  "program_id": 4,
  "sub_program_id": 2
}
```

#### Success Response (200):
```json
{
  "success": true,
  "message": "Student updated successfully"
}
```

---

### 5. **Delete Student**
**DELETE** `/:id`

Delete a student (also deletes associated parent record if exists).

#### Success Response (200):
```json
{
  "success": true,
  "message": "Student deleted successfully"
}
```

---

### 6. **Get Sub-Programs by Program ID**
**GET** `/sub-programs/:program_id`

Get all sub-programs for a specific program.

#### Success Response (200):
```json
{
  "success": true,
  "sub_programs": [
    {
      "id": 1,
      "program_id": 3,
      "title": "Level 1",
      "description": "Beginner level",
      "created_at": "2025-12-06T12:00:00.000Z"
    },
    {
      "id": 2,
      "program_id": 3,
      "title": "Level 2",
      "description": "Elementary level",
      "created_at": "2025-12-06T12:00:00.000Z"
    }
  ]
}
```

---

### 7. **Get All Sub-Programs**
**GET** `/sub-programs/all`

Get all sub-programs with their parent program information.

#### Success Response (200):
```json
{
  "success": true,
  "sub_programs": [
    {
      "id": 1,
      "program_id": 3,
      "title": "Level 1",
      "description": "Beginner level",
      "program_title": "General English Program For Adults",
      "created_at": "2025-12-06T12:00:00.000Z"
    }
  ]
}
```

---

## Important Features

### ✅ **Age-Based Parent Requirement**
- If `age < 18`, parent/guardian information is **mandatory**
- System automatically sets `is_minor = true` for students under 18
- Parent record is created automatically when student is registered

### ✅ **Program Foreign Key**
- `program_id` is a **required foreign key** to `programs` table
- System validates that the program exists before registration
- Cannot register with invalid program ID

### ✅ **Sub-Program Support**
- `sub_program_id` is optional (nullable)
- If provided, system validates it belongs to the selected program
- Use endpoint `/sub-programs/:program_id` to get available sub-programs

### ✅ **Password Security**
- Passwords are hashed using bcryptjs (10 rounds)
- Never stored in plain text

### ✅ **Email Uniqueness**
- Email addresses must be unique
- System checks for duplicates before registration

---

## Example Usage

### Register Adult Student (18+):
```bash
curl -X POST http://localhost:5000/api/students/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Ahmed",
    "last_name": "Hassan",
    "email": "ahmed@example.com",
    "phone": "+252 61 123-4567",
    "age": 20,
    "gender": "Male",
    "country": "Somalia",
    "city": "Mogadishu",
    "program_id": 3,
    "password": "SecurePassword123",
    "terms_accepted": true
  }'
```

### Register Minor Student (< 18):
```bash
curl -X POST http://localhost:5000/api/students/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Amina",
    "last_name": "Ali",
    "email": "amina@example.com",
    "phone": "+252 61 111-2222",
    "age": 16,
    "gender": "Female",
    "country": "Somalia",
    "city": "Mogadishu",
    "program_id": 3,
    "sub_program_id": 1,
    "password": "SecurePassword123",
    "terms_accepted": true,
    "parent_first_name": "Hassan",
    "parent_last_name": "Ali",
    "parent_email": "parent@example.com",
    "parent_phone": "+252 61 999-8888",
    "relationship": "Father"
  }'
```

### Get Sub-Programs for a Program:
```bash
curl http://localhost:5000/api/students/sub-programs/3
```

---

## Database Relationships

```
programs (1) ──→ (many) sub_programs
programs (1) ──→ (many) students
students (1) ──→ (1) parents (if age < 18)
sub_programs (1) ──→ (many) students
```

---

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Create Database Tables:**
   ```bash
   node database/setup_student_tables.js
   ```

3. **Start Server:**
   ```bash
   npm start
   ```

4. **Test Registration:**
   Use Postman or curl to test the `/api/students/register` endpoint.

---

## Notes

- All timestamps are in UTC
- Foreign key constraints ensure data integrity
- Parent records are automatically deleted when student is deleted (CASCADE)
- Sub-program is optional - students can register for main program only
- Email validation ensures proper format
- Age validation ensures reasonable values (1-120)

