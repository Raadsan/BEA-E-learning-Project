import api from "./axios";

// 🔐 Auth
export const loginUserAxios = (credentials: any) => api.post("/auth/login", credentials);
export const getMeAxios = () => api.get("/auth/me");
export const forgotPasswordAxios = (email: string) => api.post("/auth/forgot-password", { email });
export const resetPasswordAxios = (token: string, data: any) => api.post(`/auth/reset-password/${token}`, data);
export const updatePasswordAxios = (data: any) => api.put("/auth/update-password", data);

// 📝 Student & Teacher Reviews (Axios)
export const submitStudentReviewAxios = (data: any) => api.post("/student-reviews", data);
export const getStudentReviewsAxios = (studentId?: string) => api.get(studentId ? `/student-reviews/my/${studentId}` : "/student-reviews");
export const submitTeacherReviewAxios = (data: any) => api.post("/teacher-reviews/submit", data);
export const getTeacherReviewsAxios = (teacherId: string) => api.get(`/teacher-reviews/teacher/${teacherId}`);
export const getTeachersToReviewAxios = () => api.get("/teacher-reviews/teachers-to-review");
export const getStudentTeacherReviewBoxesAxios = (params?: any) => api.get("/teacher-reviews/student/boxes", { params });

// 👨‍🎓 Students (Axios)
export const getAllStudentsAxios = (params?: any) => api.get("/students", { params });
export const getStudentByIdAxios = (id: string | number) => api.get(`/students/${id}`);
export const createStudentAxios = (data: any) => api.post("/students", data);
export const updateStudentAxios = (id: string | number, data: any) => api.put(`/students/${id}`, data);
export const deleteStudentAxios = (id: string | number) => api.delete(`/students/${id}`);

// 👨‍🏫 Teachers (Axios)
export const getAllTeachersAxios = (params?: any) => api.get("/teachers", { params });
export const getTeacherByIdAxios = (id: string | number) => api.get(`/teachers/${id}`);
export const createTeacherAxios = (data: any) => api.post("/teachers", data);
export const updateTeacherAxios = (id: string | number, data: any) => api.put(`/teachers/${id}`, data);
export const deleteTeacherAxios = (id: string | number) => api.delete(`/teachers/${id}`);

// 📚 Courses (Axios)
export const getAllCoursesAxios = (params?: any) => api.get("/courses", { params });
export const getCourseByIdAxios = (id: string | number) => api.get(`/courses/${id}`);
export const createCourseAxios = (data: any) => api.post("/courses", data);
export const updateCourseAxios = (id: string | number, data: any) => api.put(`/courses/${id}`, data);
export const deleteCourseAxios = (id: string | number) => api.delete(`/courses/${id}`);

// 📝 Assignments (Axios)
export const getAssignmentsAxios = (params?: any) => api.get("/assignments", { params });
export const getAssignmentByIdAxios = (id: string | number) => api.get(`/assignments/${id}`);
export const createAssignmentAxios = (data: any) => api.post("/assignments", data);
export const updateAssignmentAxios = (id: string | number, data: any) => api.put(`/assignments/${id}`, data);
export const deleteAssignmentAxios = (id: string | number) => api.delete(`/assignments/${id}`);
export const submitAssignmentAxios = (data: FormData) => api.post("/assignments/submit", data, {
  headers: { "Content-Type": "multipart/form-data" }
});

// 🏫 Classes (Axios)
export const getClassesAxios = (params?: any) => api.get("/classes", { params });
export const getClassByIdAxios = (id: string | number) => api.get(`/classes/${id}`);
export const createClassAxios = (data: any) => api.post("/classes", data);
export const updateClassAxios = (id: string | number, data: any) => api.put(`/classes/${id}`, data);
export const deleteClassAxios = (id: string | number) => api.delete(`/classes/${id}`);

// 👤 Users (Axios)
export const getUsersAxios = (params?: any) => api.get("/users", { params });
export const getUserByIdAxios = (id: string | number) => api.get(`/users/${id}`);
export const createUserAxios = (data: any) => api.post("/users", data);
export const updateUserAxios = (id: string | number, data: any) => api.put(`/users/${id}`, data);
export const deleteUserAxios = (id: string | number) => api.delete(`/users/${id}`);
