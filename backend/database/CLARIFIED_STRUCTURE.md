# Clarified Database Structure - Programs & Sub-Programs

## ✅ **RECOMMENDED: Single Table Approach (Unified)**

### **One Table: `programs`**

All programs (main and sub-programs) are stored in **ONE table** with a self-referencing relationship.

#### Table Structure:
```sql
programs
├── id (Primary Key)
├── title
├── description
├── image
├── video
├── parent_program_id (Foreign Key → programs.id)  ← Self-reference
├── program_type ('main' or 'sub')
└── created_at
```

#### How It Works:

**Main Programs:**
- `parent_program_id` = `NULL`
- `program_type` = `'main'`
- Example: "General English Program For Adults" (id: 3)

**Sub-Programs:**
- `parent_program_id` = ID of the main program
- `program_type` = `'sub'`
- Example: "Level 1" (id: 10, parent_program_id: 3)

#### Example Data:

| id | title | parent_program_id | program_type |
|----|-------|-------------------|--------------|
| 3 | General English Program | NULL | main |
| 10 | Level 1 - Beginner | 3 | sub |
| 11 | Level 2 - Elementary | 3 | sub |
| 4 | ESP Program | NULL | main |
| 5 | IELTS & TOEFL | NULL | main |

#### Student Registration:

```sql
students
├── program_id → references programs.id (can be main OR sub)
└── (no separate sub_program_id needed!)
```

**If student selects:**
- **Main program only:** `program_id = 3` (General English)
- **Sub-program:** `program_id = 10` (Level 1, which has parent_program_id = 3)

---

## ❌ **OLD: Two Table Approach (Separate)**

### **Two Tables: `programs` + `sub_programs`**

This was the original design, but it's more complex.

#### Problems:
- Need to manage two separate tables
- More complex queries
- Harder to understand relationships

---

## ✅ **Benefits of Single Table:**

1. **Simpler:** One table instead of two
2. **Flexible:** Easy to add nested levels (sub-sub-programs)
3. **Cleaner Queries:** Join one table instead of two
4. **Easier Management:** All programs in one place

---

## 📊 **Database Relationships:**

```
programs (self-referencing)
├── Main Program (parent_program_id = NULL)
│   └── Sub-Program 1 (parent_program_id = main.id)
│   └── Sub-Program 2 (parent_program_id = main.id)
└── Another Main Program (parent_program_id = NULL)

students
└── program_id → programs.id (can point to main OR sub)
```

---

## 🔄 **Migration Path:**

If you already have data in separate tables, we can migrate it to the unified structure.

