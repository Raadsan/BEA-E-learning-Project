import { configureStore } from "@reduxjs/toolkit";
import { programApi } from "../redux/api/programApi.js";
import { studentApi } from "../redux/api/studentApi.js";
import { teacherApi } from "../redux/api/teacherApi.js";
import { subprogramApi } from "../redux/api/subprogramApi.js";

import { classApi } from "../redux/api/classApi.js";
import { authApi } from "../redux/api/authApi.js";
import { adminApi } from "../redux/api/adminApi.js";
import { userApi } from "../redux/api/userApi.js";
import { attendanceApi } from "../redux/api/attendanceApi.js";

export const store = configureStore({
  reducer: {
    [programApi.reducerPath]: programApi.reducer,
    [studentApi.reducerPath]: studentApi.reducer,
    [teacherApi.reducerPath]: teacherApi.reducer,
    [subprogramApi.reducerPath]: subprogramApi.reducer,

    [classApi.reducerPath]: classApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [attendanceApi.reducerPath]: attendanceApi.reducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(
      programApi.middleware,
      studentApi.middleware,
      teacherApi.middleware,
      subprogramApi.middleware,

      classApi.middleware,
      authApi.middleware,
      adminApi.middleware,
      userApi.middleware,
      attendanceApi.middleware
    ),
});

