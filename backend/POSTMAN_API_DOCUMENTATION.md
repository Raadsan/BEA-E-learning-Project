# API Documentation - Create Classes for Subprogram

## Endpoint: Create Morning and Night Classes for Subprogram

### Overview
This endpoint creates two classes (morning and night) for a specified subprogram. The class names are automatically generated based on the subprogram name.

---

## Request Details

### Method
`POST`

### URL
```
http://localhost:5000/api/classes/create-for-subprogram
```

### Headers
```
Content-Type: application/json
```

### Request Body (JSON)
```json
{
    "subprogram_id": 1,
    "teacher_id": null,
    "description": "Optional description for the classes"
}
```

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `subprogram_id` | integer | Yes | The ID of the subprogram for which to create classes |
| `teacher_id` | integer | No | The ID of the teacher to assign to the classes (can be null) |
| `description` | string | No | Optional description for the classes |

---

## Response Examples

### Success Response (201 Created)
```json
{
    "message": "Successfully created 2 class(es) for subprogram",
    "subprogram": {
        "id": 1,
        "name": "Level 1 - Beginner"
    },
    "classes": [
        {
            "id": 1,
            "class_name": "Level 1 - Beginner - Morning",
            "description": "Morning class for Level 1 - Beginner",
            "subprogram_id": 1,
            "teacher_id": null,
            "type": "morning",
            "created_at": "2024-01-01T00:00:00.000Z",
            "updated_at": "2024-01-01T00:00:00.000Z"
        },
        {
            "id": 2,
            "class_name": "Level 1 - Beginner - Night",
            "description": "Night class for Level 1 - Beginner",
            "subprogram_id": 1,
            "teacher_id": null,
            "type": "night",
            "created_at": "2024-01-01T00:00:00.000Z",
            "updated_at": "2024-01-01T00:00:00.000Z"
        }
    ]
}
```

### Error Response - Missing subprogram_id (400 Bad Request)
```json
{
    "error": "subprogram_id is required"
}
```

### Error Response - Subprogram Not Found (404 Not Found)
```json
{
    "error": "Subprogram not found"
}
```

### Error Response - Classes Already Exist (400 Bad Request)
```json
{
    "message": "No classes were created",
    "errors": [
        {
            "type": "morning",
            "error": "Morning class already exists for this subprogram"
        },
        {
            "type": "night",
            "error": "Night class already exists for this subprogram"
        }
    ]
}
```

### Error Response - Server Error (500 Internal Server Error)
```json
{
    "error": "Server error: [error message]"
}
```

---

## Postman Setup Instructions

### Step 1: Import Collection
1. Open Postman
2. Click "Import" button
3. Select the file: `backend/postman/Create_Classes_For_Subprogram.postman_collection.json`
4. Click "Import"

### Step 2: Configure Request
1. Select the request: "Create Morning and Night Classes for Subprogram"
2. Ensure the method is set to `POST`
3. Set the URL to: `http://localhost:5000/api/classes/create-for-subprogram`

### Step 3: Set Headers
- Add header: `Content-Type: application/json`

### Step 4: Set Body
1. Go to the "Body" tab
2. Select "raw" and "JSON"
3. Enter the request body:
```json
{
    "subprogram_id": 1,
    "teacher_id": null,
    "description": "Optional description for the classes"
}
```

### Step 5: Send Request
Click "Send" button

---

## Example Test Cases

### Test Case 1: Create Classes for Subprogram ID 1
**Request:**
```json
{
    "subprogram_id": 1
}
```

**Expected:** Creates two classes (morning and night) for subprogram ID 1

---

### Test Case 2: Create Classes with Teacher Assignment
**Request:**
```json
{
    "subprogram_id": 1,
    "teacher_id": 5,
    "description": "Advanced level classes"
}
```

**Expected:** Creates two classes assigned to teacher ID 5

---

### Test Case 3: Missing subprogram_id
**Request:**
```json
{}
```

**Expected:** Returns 400 error with message "subprogram_id is required"

---

### Test Case 4: Invalid Subprogram ID
**Request:**
```json
{
    "subprogram_id": 999
}
```

**Expected:** Returns 404 error with message "Subprogram not found"

---

## Notes

1. **Automatic Class Naming**: Class names are automatically generated as:
   - `{Subprogram Name} - Morning`
   - `{Subprogram Name} - Night`

2. **Duplicate Prevention**: The endpoint checks if classes already exist for the subprogram. If they do, it will return an error instead of creating duplicates.

3. **Partial Success**: If one class already exists, the endpoint will still create the other class and return both the created classes and any errors.

4. **Teacher Assignment**: The `teacher_id` is optional. If not provided, classes will be created without a teacher assignment (can be assigned later).

---

## Integration with Frontend

This endpoint can be integrated into the admin panel to allow administrators to quickly create morning and night classes for any subprogram with a single API call.

