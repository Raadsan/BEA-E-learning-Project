import { configureStore } from "@reduxjs/toolkit";
import { programApi } from "../redux/api/programApi.js";
import { studentApi } from "../redux/api/studentApi.js";
import { teacherApi } from "../redux/api/teacherApi.js";
import { subprogramApi } from "../redux/api/subprogramApi.js";
import { courseApi } from "../redux/api/courseApi.js";
import { classApi } from "../redux/api/classApi.js";
import { authApi } from "../redux/api/authApi.js";
import { placementTestApi } from "../redux/api/placementTestApi.js";
import { proficiencyTestApi } from "../redux/api/proficiencyTestApi.js";
import { adminApi } from "../redux/api/adminApi.js";
import { ieltsToeflApi } from "../redux/api/ieltsToeflApi.js";

export const store = configureStore({
  reducer: {
    [programApi.reducerPath]: programApi.reducer,
    [studentApi.reducerPath]: studentApi.reducer,
    [teacherApi.reducerPath]: teacherApi.reducer,
    [subprogramApi.reducerPath]: subprogramApi.reducer,
    [courseApi.reducerPath]: courseApi.reducer,
    [classApi.reducerPath]: classApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [placementTestApi.reducerPath]: placementTestApi.reducer,
    [proficiencyTestApi.reducerPath]: proficiencyTestApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [ieltsToeflApi.reducerPath]: ieltsToeflApi.reducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(
      programApi.middleware,
      studentApi.middleware,
      teacherApi.middleware,
      subprogramApi.middleware,
      courseApi.middleware,
      classApi.middleware,
      authApi.middleware,
      placementTestApi.middleware,
      proficiencyTestApi.middleware,
      adminApi.middleware,
      ieltsToeflApi.middleware
    ),
});
