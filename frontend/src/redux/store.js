import { configureStore } from "@reduxjs/toolkit";
import { programApi } from "../redux/api/programApi.js";
import { studentApi } from "../redux/api/studentApi.js";

export const store = configureStore({
  reducer: {
    [programApi.reducerPath]: programApi.reducer,
    [studentApi.reducerPath]: studentApi.reducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(programApi.middleware, studentApi.middleware),
});
