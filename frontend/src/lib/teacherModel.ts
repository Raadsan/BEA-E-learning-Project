/**
 * Teacher Model
 * Defines the structure and default values for teacher data
 */

export const defaultTeacher = {
  id: null,
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  subject: "",
  specialization: "",
  status: "Active",
  joinDate: "",
  portfolio: "",
  bio: "",
  qualifications: "",
  experience_years: 0,
  assignedCourses: [],
  created_at: null,
  updated_at: null,
};

/**
 * Create a new teacher object with default values
 * @param {Object} data - Teacher data to merge with defaults
 * @returns {Object} New teacher object
 */
export const createTeacher = (data = {}) => {
  return {
    ...defaultTeacher,
    ...data,
    id: data.id || null,
    assignedCourses: data.assignedCourses || [],
  };
};

/**
 * Validate teacher data
 * @param {Object} teacher - Teacher object to validate
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export const validateTeacher = (teacher) => {
  const errors = [];

  if (!teacher.first_name || teacher.first_name.trim() === "") {
    errors.push("First name is required");
  }

  if (!teacher.last_name || teacher.last_name.trim() === "") {
    errors.push("Last name is required");
  }

  if (!teacher.email || teacher.email.trim() === "") {
    errors.push("Email is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(teacher.email)) {
    errors.push("Invalid email format");
  }

  if (!teacher.phone || teacher.phone.trim() === "") {
    errors.push("Phone is required");
  }

  if (!teacher.subject || teacher.subject.trim() === "") {
    errors.push("Subject is required");
  }

  if (!teacher.status) {
    errors.push("Status is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Format teacher name (first_name + last_name)
 * @param {Object} teacher - Teacher object
 * @returns {string} Full name
 */
export const getTeacherFullName = (teacher) => {
  if (teacher.name) {
    return teacher.name; // Backward compatibility
  }
  return `${teacher.first_name || ""} ${teacher.last_name || ""}`.trim();
};

/**
 * Get teacher display name
 * @param {Object} teacher - Teacher object
 * @returns {string} Display name
 */
export const getTeacherDisplayName = (teacher) => {
  return getTeacherFullName(teacher) || teacher.email || "Unknown Teacher";
};

/**
 * Check if teacher is assigned to a course
 * @param {Object} teacher - Teacher object
 * @param {number} courseId - Course ID to check
 * @returns {boolean} True if assigned
 */
export const isTeacherAssignedToCourse = (teacher, courseId) => {
  const assigned = teacher.assignedCourses || [];
  return assigned.includes(courseId);
};

/**
 * Get assigned courses count
 * @param {Object} teacher - Teacher object
 * @returns {number} Number of assigned courses
 */
export const getAssignedCoursesCount = (teacher) => {
  return (teacher.assignedCourses || []).length;
};

