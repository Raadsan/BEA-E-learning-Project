# Postman Test Guide - Student Registration API

## Base URL
```
http://localhost:5000/api/students
```

---

## 1. Get All Programs (to find program_id)

**Method:** `GET`  
**URL:** `http://localhost:5000/api/programs/`

**Response Example:**
```json
[
  {
    "id": 3,
    "title": "General English Program For Adults",
    "description": "...",
    "image": "/uploads/...",
    "video": "/uploads/..."
  },
  {
    "id": 4,
    "title": "English for Specific Purposes (ESP) Program",
    ...
  }
]
```

**Note:** Use the `id` field as `program_id` in registration.

---

## 2. Get Sub-Programs for a Program (optional)

**Method:** `GET`  
**URL:** `http://localhost:5000/api/students/sub-programs/3`

Replace `3` with your program_id.

**Response Example:**
```json
{
  "success": true,
  "sub_programs": [
    {
      "id": 1,
      "program_id": 3,
      "title": "Level 1",
      "description": "Beginner level"
    }
  ]
}
```

---

## 3. Register Adult Student (18+ years old)

**Method:** `POST`  
**URL:** `http://localhost:5000/api/students/register`  
**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
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
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Student registered successfully",
  "student": {
    "id": 1,
    "first_name": "Ahmed",
    "last_name": "Hassan",
    "email": "ahmed@example.com",
    "age": 20,
    "program_id": 3,
    "sub_program_id": null,
    "is_minor": false
  },
  "parent": null
}
```

---

## 4. Register Adult Student with Sub-Program

**Method:** `POST`  
**URL:** `http://localhost:5000/api/students/register`  
**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "first_name": "Fatima",
  "last_name": "Ali",
  "email": "fatima@example.com",
  "phone": "+252 61 999-8888",
  "age": 25,
  "gender": "Female",
  "country": "Somalia",
  "city": "Hargeisa",
  "program_id": 3,
  "sub_program_id": 1,
  "password": "SecurePassword123",
  "terms_accepted": true
}
```

---

## 5. Register Minor Student (< 18 years old) - Parent Info REQUIRED

**Method:** `POST`  
**URL:** `http://localhost:5000/api/students/register`  
**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "first_name": "Amina",
  "last_name": "Mohamed",
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
  "parent_first_name": "Mohamed",
  "parent_last_name": "Mohamed",
  "parent_email": "parent@example.com",
  "parent_phone": "+252 61 777-6666",
  "relationship": "Father"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Student registered successfully",
  "student": {
    "id": 2,
    "first_name": "Amina",
    "last_name": "Mohamed",
    "email": "amina@example.com",
    "age": 16,
    "program_id": 3,
    "sub_program_id": 1,
    "is_minor": true
  },
  "parent": {
    "id": 1,
    "parent_first_name": "Mohamed",
    "parent_last_name": "Mohamed",
    "relationship": "Father"
  }
}
```

**Error Response (400) - Missing Parent Info:**
```json
{
  "success": false,
  "message": "Parent/Guardian information is required for students under 18"
}
```

---

## 6. Get All Students

**Method:** `GET`  
**URL:** `http://localhost:5000/api/students/`

**Response:**
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
      "age": 20,
      "gender": "Male",
      "country": "Somalia",
      "city": "Mogadishu",
      "program_id": 3,
      "sub_program_id": null,
      "program_title": "General English Program For Adults",
      "sub_program_title": null,
      "is_minor": false,
      "parent_first_name": null,
      "parent_last_name": null,
      "created_at": "2025-12-06T12:00:00.000Z"
    }
  ]
}
```

---

## 7. Get Single Student by ID

**Method:** `GET`  
**URL:** `http://localhost:5000/api/students/1`

Replace `1` with the student ID.

---

## Important Notes for Testing

### ✅ Required Fields (All Students):
- `first_name`
- `last_name`
- `email` (must be unique)
- `phone`
- `age` (1-120)
- `gender` ("Male", "Female", or "Other")
- `country`
- `city`
- `program_id` (must exist in programs table)
- `password`
- `terms_accepted` (true/false)

### ✅ Required if age < 18:
- `parent_first_name`
- `parent_last_name`
- `parent_email`
- `parent_phone`
- `relationship` ("Father", "Mother", "Guardian", or "Other")

### ✅ Optional Fields:
- `sub_program_id` (only if program has sub-programs)

### ⚠️ Common Errors:

1. **Email already exists:**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

2. **Invalid program:**
```json
{
  "success": false,
  "message": "Invalid program selected"
}
```

3. **Missing parent info for minor:**
```json
{
  "success": false,
  "message": "Parent/Guardian information is required for students under 18"
}
```

4. **Invalid email format:**
```json
{
  "success": false,
  "message": "Invalid email format"
}
```

---

## Quick Test Checklist

- [ ] Backend server is running on `http://localhost:5000`
- [ ] Database tables are created (run `node database/setup_student_tables.js`)
- [ ] Get programs list to find `program_id`
- [ ] Test adult registration (age >= 18)
- [ ] Test minor registration (age < 18) with parent info
- [ ] Test error cases (duplicate email, missing fields, etc.)

---

## Example Test Sequence

1. **Get Programs:**
   ```
   GET http://localhost:5000/api/programs/
   ```
   Note the `id` of the program you want (e.g., `3`)

2. **Get Sub-Programs (if needed):**
   ```
   GET http://localhost:5000/api/students/sub-programs/3
   ```
   Note the `id` of the sub-program (e.g., `1`)

3. **Register Student:**
   ```
   POST http://localhost:5000/api/students/register
   ```
   Use the JSON body examples above

4. **Verify Registration:**
   ```
   GET http://localhost:5000/api/students/
   ```
   Check that your student appears in the list

