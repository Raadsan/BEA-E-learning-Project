import { configureStore } from "@reduxjs/toolkit";
import { programApi } from "../redux/api/programApi.js";

export const store = configureStore({
  reducer: {
    [programApi.reducerPath]: programApi.reducer,
  },
  middleware: (getDefault) =>
    getDefault().concat(programApi.middleware),
});
