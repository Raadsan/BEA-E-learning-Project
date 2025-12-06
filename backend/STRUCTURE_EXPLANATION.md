# 📊 Database Structure - CLEAR EXPLANATION

## ✅ **SINGLE TABLE APPROACH (Unified)**

### **ONE Table: `programs`**

Both main programs AND sub-programs are stored in the **SAME table** called `programs`.

---

## 🗂️ **How It Works:**

### **Main Programs:**
```sql
id: 3
title: "General English Program For Adults"
parent_program_id: NULL  ← No parent (it's a main program)
program_type: 'main'
```

### **Sub-Programs:**
```sql
id: 10
title: "Level 1 - Beginner"
parent_program_id: 3  ← Points to main program (id: 3)
program_type: 'sub'
```

---

## 📋 **Example Data:**

| id | title | parent_program_id | program_type |
|----|-------|-------------------|--------------|
| 3 | General English Program | **NULL** | **main** |
| 10 | Level 1 - Beginner | **3** | **sub** |
| 11 | Level 2 - Elementary | **3** | **sub** |
| 4 | ESP Program | **NULL** | **main** |
| 5 | IELTS & TOEFL | **NULL** | **main** |

---

## 👤 **Student Registration:**

### **Students Table:**
```sql
students
├── program_id → references programs.id
└── (That's it! No separate sub_program_id needed)
```

### **If Student Selects:**

**Option 1: Main Program Only**
```json
{
  "program_id": 3  // General English Program
}
```

**Option 2: Sub-Program**
```json
{
  "program_id": 10  // Level 1 (which has parent_program_id = 3)
}
```

**Both work!** The `program_id` can point to either a main program OR a sub-program.

---

## 🔍 **How to Get Sub-Programs:**

**API Endpoint:**
```
GET /api/students/sub-programs/:program_id
```

**Example:**
```
GET /api/students/sub-programs/3
```

**Returns:**
```json
{
  "success": true,
  "sub_programs": [
    {
      "id": 10,
      "title": "Level 1 - Beginner",
      "parent_program_id": 3,
      "program_type": "sub"
    },
    {
      "id": 11,
      "title": "Level 2 - Elementary",
      "parent_program_id": 3,
      "program_type": "sub"
    }
  ]
}
```

---

## ✅ **Benefits:**

1. **Simple:** One table instead of two
2. **Flexible:** Easy to add more levels
3. **Clean:** All programs in one place
4. **Easy Queries:** Join one table

---

## 📝 **Summary:**

- ✅ **ONE table:** `programs` (contains both main and sub-programs)
- ✅ **Main programs:** `parent_program_id = NULL`, `program_type = 'main'`
- ✅ **Sub-programs:** `parent_program_id = main_program_id`, `program_type = 'sub'`
- ✅ **Students:** `program_id` can reference ANY program (main or sub)

**That's it! Simple and clear!** 🎯

