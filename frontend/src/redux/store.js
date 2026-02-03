import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./api/authApi";
import { userApi } from "./api/userApi";
import { courseTimelineApi } from "./api/courseTimelineApi";
import { announcementApi } from "./api/announcementApi";
import { eventApi } from "./api/eventApi";
import { courseApi } from "./api/courseApi";
import { classApi } from "./api/classApi";
import { studentApi } from "./api/studentApi";
import { teacherApi } from "./api/teacherApi";
import { programApi } from "./api/programApi";
import { subprogramApi } from "./api/subprogramApi";
import { academicCalendarApi } from "./api/academicCalendarApi";
import { timetableApi } from "./api/timetableApi";
import { assignmentApi } from "./api/assignmentApi";
import { notificationApi } from "./api/notificationApi";
import { paymentApi } from "./api/paymentApi";
import { paymentPackageApi } from "./api/paymentPackageApi";
// import { fileApi } from "./api/fileApi"; 
import { uploadApi } from "./api/uploadApi";
import { freezingApi } from "./api/freezingApi";
import { newsApi } from "./api/newsApi";
// import { contactApi } from "./api/contactApi"; 
import { attendanceApi } from "./api/attendanceApi";
import { ieltsToeflApi } from "./api/ieltsToeflApi";
import { materialApi } from "./api/materialApi";
import { sessionRequestApi } from "./api/sessionRequestApi";
import { adminApi } from "./api/adminApi";
import { proficiencyTestApi } from "./api/proficiencyTestApi";
import { proficiencyTestStudentsApi } from "./api/proficiencyTestStudentsApi";
import { placementTestApi } from "./api/placementTestApi";
import { learningHoursApi } from "./api/learningHoursApi";
import { shiftApi } from "./api/shiftApi";
import { reviewApi } from "./api/reviewApi";
import { reportApi } from "./api/reportApi";
import { levelUpApi } from "./api/levelUpApi";
import { certificateApi } from "./api/certificateApi";

export const store = configureStore({
    reducer: {
        [authApi.reducerPath]: authApi.reducer,
        [userApi.reducerPath]: userApi.reducer,
        [courseTimelineApi.reducerPath]: courseTimelineApi.reducer,
        [announcementApi.reducerPath]: announcementApi.reducer,
        [eventApi.reducerPath]: eventApi.reducer,
        [courseApi.reducerPath]: courseApi.reducer,
        [classApi.reducerPath]: classApi.reducer,
        [studentApi.reducerPath]: studentApi.reducer,
        [teacherApi.reducerPath]: teacherApi.reducer,
        [programApi.reducerPath]: programApi.reducer,
        [subprogramApi.reducerPath]: subprogramApi.reducer,
        [academicCalendarApi.reducerPath]: academicCalendarApi.reducer,
        [timetableApi.reducerPath]: timetableApi.reducer,
        [assignmentApi.reducerPath]: assignmentApi.reducer,
        [notificationApi.reducerPath]: notificationApi.reducer,
        [paymentApi.reducerPath]: paymentApi.reducer,
        [paymentPackageApi.reducerPath]: paymentPackageApi.reducer,
        // [fileApi.reducerPath]: fileApi.reducer,
        [uploadApi.reducerPath]: uploadApi.reducer,
        [freezingApi.reducerPath]: freezingApi.reducer,
        [newsApi.reducerPath]: newsApi.reducer,
        // [contactApi.reducerPath]: contactApi.reducer,
        [attendanceApi.reducerPath]: attendanceApi.reducer,
        [ieltsToeflApi.reducerPath]: ieltsToeflApi.reducer,
        [materialApi.reducerPath]: materialApi.reducer,
        [sessionRequestApi.reducerPath]: sessionRequestApi.reducer,
        [adminApi.reducerPath]: adminApi.reducer,
        [proficiencyTestApi.reducerPath]: proficiencyTestApi.reducer,
        [proficiencyTestStudentsApi.reducerPath]: proficiencyTestStudentsApi.reducer,
        [placementTestApi.reducerPath]: placementTestApi.reducer,
        [learningHoursApi.reducerPath]: learningHoursApi.reducer,
        [shiftApi.reducerPath]: shiftApi.reducer,
        [reviewApi.reducerPath]: reviewApi.reducer,
        [reportApi.reducerPath]: reportApi.reducer,
        [levelUpApi.reducerPath]: levelUpApi.reducer,
        [certificateApi.reducerPath]: certificateApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            authApi.middleware,
            userApi.middleware,
            courseTimelineApi.middleware,
            announcementApi.middleware,
            eventApi.middleware,
            courseApi.middleware,
            classApi.middleware,
            studentApi.middleware,
            teacherApi.middleware,
            programApi.middleware,
            subprogramApi.middleware,
            academicCalendarApi.middleware,
            timetableApi.middleware,
            assignmentApi.middleware,
            notificationApi.middleware,
            paymentApi.middleware,
            paymentPackageApi.middleware,
            // fileApi.middleware,
            uploadApi.middleware,
            freezingApi.middleware,
            newsApi.middleware,
            // contactApi.middleware,
            attendanceApi.middleware,
            ieltsToeflApi.middleware,
            materialApi.middleware,
            sessionRequestApi.middleware,
            adminApi.middleware,
            proficiencyTestApi.middleware,
            proficiencyTestStudentsApi.middleware,
            placementTestApi.middleware,
            learningHoursApi.middleware,
            shiftApi.middleware,
            reviewApi.middleware,
            reportApi.middleware,
            levelUpApi.middleware,
            certificateApi.middleware
        ),
});
