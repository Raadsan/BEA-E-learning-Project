"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDarkMode } from "@/context/ThemeContext";
import { useGetCurrentUserQuery } from "@/redux/api/authApi";
import { useGetClassQuery, useGetClassesQuery } from "@/redux/api/classApi"; // Added useGetClassesQuery
import { useGetCoursesQuery } from "@/redux/api/courseApi";
import { useGetProgramsQuery } from "@/redux/api/programApi";
import { useGetSubprogramsQuery, useGetSubprogramsByProgramIdQuery } from "@/redux/api/subprogramApi";
import { useGetStudentAttendanceQuery } from "@/redux/api/attendanceApi";
import { useCheckLevelUpEligibilityQuery, useCreateLevelUpRequestMutation } from "@/redux/api/levelUpApi";
import { useGetCertificatesQuery } from "@/redux/api/certificateApi";
import { useToast } from "@/components/Toast";
import Modal from "@/components/Modal";
import Image from "next/image";

export default function MyCoursesPage() {
    const { isDark } = useDarkMode();
    const router = useRouter();
    const { data: user, isLoading: userLoading } = useGetCurrentUserQuery();
    const [studentClass, setStudentClass] = useState(null);
    const [studentProgram, setStudentProgram] = useState(null);
    const [studentSubprogram, setStudentSubprogram] = useState(null);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [assignedClasses, setAssignedClasses] = useState([]); // Added assignedClasses state
    const [selectedSubprogramId, setSelectedSubprogramId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState(false);
    const [levelUpDescription, setLevelUpDescription] = useState("");

    const { data: eligibility } = useCheckLevelUpEligibilityQuery();
    const { data: certificates = [] } = useGetCertificatesQuery();
    const [createRequest] = useCreateLevelUpRequestMutation();
    const { showToast } = useToast();


    // Fetch student's class
    const { data: classData, isLoading: classLoading } = useGetClassQuery(
        user?.class_id,
        { skip: !user?.class_id }
    );

    // Fetch all classes (for detail lookup)
    const { data: allClasses = [] } = useGetClassesQuery(); // Added useGetClassesQuery

    // Fetch programs
    const { data: programs = [] } = useGetProgramsQuery();

    // Fetch all subprograms
    const { data: allSubprograms = [] } = useGetSubprogramsQuery();

    // Fetch subprograms for the student's program
    const { data: subprogramsData = [], isLoading: subprogramsLoading } = useGetSubprogramsByProgramIdQuery(
        studentProgram?.id,
        { skip: !studentProgram?.id }
    );

    // Fetch ALL courses to filter manually (since we want "every level's" classes assigned)
    const { data: allCourses = [], isLoading: allCoursesLoading } = useGetCoursesQuery();

    // Fetch student attendance to find past classes
    const { data: attendanceData, isLoading: attendanceLoading } = useGetStudentAttendanceQuery( // Added useGetStudentAttendanceQuery
        user?.id,
        { skip: !user?.id }
    );

    // Helper to identify if it's a general/multi-level program layout
    const isGeneralProgram = studentProgram?.program_name?.toLowerCase().includes("general") ||
        studentProgram?.title?.toLowerCase().includes("general") ||
        subprogramsData.length >= 8;

    useEffect(() => {
        if (classData) {
            setStudentClass(classData);
            if (!selectedSubprogramId) {
                setSelectedSubprogramId(classData.subprogram_id);
            }
        }
    }, [classData]);

    // Find student's program and subprogram
    useEffect(() => {
        if (allSubprograms.length > 0 && programs.length > 0 && user) {
            // Priority: 1. Current assigned class, 2. Chosen subprogram from signup
            const subId = studentClass?.subprogram_id || user.chosen_subprogram;
            const subprogram = allSubprograms.find(sp =>
                Number(sp.id) == Number(subId) ||
                sp.subprogram_name?.toLowerCase() === subId?.toString().toLowerCase()
            );

            if (subprogram) {
                setStudentSubprogram(subprogram);
                const pId = subprogram.program_id || user.chosen_program;
                const program = programs.find(p =>
                    Number(p.id) == Number(pId) ||
                    p.program_name?.toLowerCase() === pId?.toString().toLowerCase()
                );
                if (program) setStudentProgram(program);
            } else if (user.chosen_program) {
                // Fallback to chosen program if no subprogram yet
                const program = programs.find(p =>
                    Number(p.id) == Number(user.chosen_program) ||
                    p.program_name?.toLowerCase() === user.chosen_program?.toString().toLowerCase()
                );
                if (program) setStudentProgram(program);
            }
        }
    }, [studentClass, programs, allSubprograms, user]);

    // 1. COURSES LOGIC (Read ALL for the program) - Filtered separately
    useEffect(() => {
        if (allCourses.length > 0 && subprogramsData.length > 0) {
            const allProgramSubprogramIds = subprogramsData.map(s => Number(s.id));
            let myCourses = allCourses.filter(c => allProgramSubprogramIds.includes(Number(c.subprogram_id)));

            // Sort: current level first, then others
            myCourses = [...myCourses].sort((a, b) => {
                const subId = Number(studentClass?.subprogram_id || user?.chosen_subprogram);
                if (Number(a.subprogram_id) == subId && Number(b.subprogram_id) != subId) return -1;
                if (Number(a.subprogram_id) != subId && Number(b.subprogram_id) == subId) return 1;

                const idxA = subprogramsData.findIndex(s => Number(s.id) == Number(a.subprogram_id));
                const idxB = subprogramsData.findIndex(s => Number(s.id) == Number(b.subprogram_id));
                return idxB - idxA;
            });
            setFilteredCourses(myCourses);
        }
    }, [allCourses, subprogramsData, studentClass, user]);

    // 2. CLASSES LOGIC (Finding every group for every level of this program)
    // Decoupled to ensure boxes show up even if specific program query is empty
    useEffect(() => {
        if (allClasses.length > 0 && allSubprograms.length > 0) {
            const levelsOfInterest = studentProgram
                ? allSubprograms.filter(sp => Number(sp.program_id) == Number(studentProgram.id))
                : allSubprograms;

            const interestIds = levelsOfInterest.map(s => Number(s.id));
            const myClasses = allClasses.filter(c => interestIds.includes(Number(c.subprogram_id)));
            setAssignedClasses(myClasses);
        }
    }, [allClasses, allSubprograms, studentProgram]);

    useEffect(() => {
        if (!userLoading && !classLoading && !subprogramsLoading && !allCoursesLoading && !attendanceLoading) {
            setLoading(false);
        }
    }, [userLoading, classLoading, subprogramsLoading, allCoursesLoading, attendanceLoading]);

    const handleDownloadCertificate = async (type, id, name) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/certificates/download/${type}/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to download certificate");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Certificate_${name.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            showToast("Certificate downloaded successfully!", "success");
        } catch (error) {
            showToast(error.message || "Certificate not available yet.", "error");
        }
    };

    // Handle subprogram click - Scrolls to the main classes section
    const handleSubprogramClick = (subprogram, isLocked) => {
        if (isLocked) return;

        setSelectedSubprogramId(subprogram.id);
        const section = document.getElementById('my-classes-section');
        if (section) {
            section.scrollIntoView({ behavior: "smooth" });
        }
    };

    // Define some nice gradients for cards
    const gradients = [
        "from-blue-600 to-indigo-700",
        "from-emerald-500 to-teal-700",
        "from-amber-400 to-orange-600",
        "from-purple-500 to-indigo-600",
        "from-rose-500 to-pink-600",
        "from-cyan-500 to-blue-600"
    ];

    // Calculate progress for each subprogram (placeholder)
    const calculateProgress = (subprogramId) => {
        // If it's the active subprogram, calculate based on courses
        if (Number(subprogramId) === Number(studentClass?.subprogram_id || user?.chosen_subprogram)) {
            return 72; // Mock progress
        }
        // Past subprograms
        const subIdx = subprogramsData.findIndex(s => Number(s.id) === Number(subprogramId));
        const currentSubIdx = subprogramsData.findIndex(s => Number(s.id) === Number(studentClass?.subprogram_id || user?.chosen_subprogram));
        if (currentSubIdx !== -1 && subIdx < currentSubIdx) return 100;

        return 0; // Locked subprograms have 0% progress
    };

    const bg = isDark ? "bg-gray-900" : "bg-gray-50";
    const card = isDark ? "bg-gray-800 text-white border-gray-700" : "bg-white text-gray-900 border-gray-100";

    // Get program image from database
    const getProgramImage = () => {
        if (!studentProgram?.image) return '/images/My courses.jpg';

        // If image path starts with /, use it directly with backend URL
        if (studentProgram.image.startsWith('/')) {
            return `http://localhost:5000${studentProgram.image}`;
        }
        // If image path doesn't start with /, add it
        if (studentProgram.image.startsWith('http')) {
            return studentProgram.image;
        }
        return `http://localhost:5000/${studentProgram.image}`;
    };

    const programImage = getProgramImage();

    if (loading) {
        return (
            <div className={`min-h-screen transition-colors ${bg} flex items-center justify-center`}>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className={`text-sm font-normal ${isDark ? "text-gray-400" : "text-gray-600"}`}>Loading your curriculum...</p>
                </div>
            </div>
        );
    }

    if (!studentProgram) {
        return (
            <div className={`min-h-screen transition-colors ${bg}`}>
                <div className="py-6 w-full px-6 sm:px-10">
                    <div className={`p-6 rounded-xl shadow-sm border ${card}`}>
                        <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                            Program information not found. Please contact support if you have enrolled.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-colors pt-8 w-full px-6 sm:px-10 pb-20 ${bg}`}>
            <div className="w-full">
                {/* Header */}
                <div className="mb-12 flex flex-col md:flex-row justify-between items-start gap-6">
                    <div>
                        <h1 className={`text-4xl font-normal tracking-tight mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                            My Courses
                        </h1>
                        <p className={`text-lg font-normal opacity-40 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            Available Courses
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {eligibility?.isEligible ? (
                            <button
                                onClick={() => setIsLevelUpModalOpen(true)}
                                className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#010080] text-white text-sm font-bold rounded-2xl transition-all whitespace-nowrap shadow-xl"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                                Level Up Request
                            </button>
                        ) : eligibility?.hasPending ? (
                            <button
                                disabled
                                className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-green-600 text-white text-sm font-bold rounded-2xl transition-all whitespace-nowrap shadow-xl cursor-default"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                                Requested
                            </button>
                        ) : null}

                        {studentProgram?.curriculum_file && (
                            <a
                                href={`http://localhost:5000${studentProgram.curriculum_file}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#010080] text-white text-sm font-bold rounded-2xl transition-all whitespace-nowrap shadow-xl"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download Program Curriculum
                            </a>
                        )}

                        {certificates.some(c => c.target_id === studentProgram?.id && c.target_type === 'program') && (
                            <button
                                onClick={() => handleDownloadCertificate('program', studentProgram.id, studentProgram.title || studentProgram.program_name)}
                                className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-green-600 text-white text-sm font-bold rounded-2xl transition-all shadow-xl hover:bg-green-700 active:scale-95"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download Program Certificate
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-10">
                    {isGeneralProgram ? (
                        <>
                            {/* === GENERAL PROGRAM LAYOUT (PILLARS) === */}

                            {/* Top Section: Levels (Left) & Image (Right) - 50/50 split */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start w-full transition-all">

                                {/* Left Column - Subprograms (Graduating Pillars) */}
                                <div className="flex flex-col w-full h-[400px]">
                                    <div className="flex justify-between items-center mb-1">
                                        <h2 className={`text-xl font-normal ${isDark ? "text-white" : "text-gray-900"}`}>
                                            Program Levels
                                        </h2>
                                        <span className={`text-[10px] font-normal px-2 py-0.5 rounded-full ${isDark ? "bg-gray-700 text-gray-400" : "bg-gray-100 text-gray-500"}`}>
                                            {subprogramsData.length} Levels
                                        </span>
                                    </div>

                                    {subprogramsLoading ? (
                                        <p className="text-gray-500">Loading levels...</p>
                                    ) : (
                                        <div className="flex flex-row gap-2 items-end px-0 w-full h-[360px] overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar">
                                            {(() => {
                                                const activeIndex = subprogramsData.findIndex(s =>
                                                    (studentClass && Number(s.id) == Number(studentClass.subprogram_id)) ||
                                                    (!studentClass && user && Number(s.id) == Number(user.chosen_subprogram))
                                                );

                                                const shortCodes = ["A1", "A2", "A2+", "B1", "B1+", "B2", "C1", "C2"];

                                                return subprogramsData.map((subprogram, index) => {
                                                    const isActive = Number(subprogram.id) == Number(selectedSubprogramId);
                                                    const isEnrolled = studentClass
                                                        ? Number(subprogram.id) == Number(studentClass.subprogram_id)
                                                        : user && Number(subprogram.id) == Number(user.chosen_subprogram);
                                                    const isPast = index < activeIndex;
                                                    const isLocked = !isEnrolled && !isPast;

                                                    return (
                                                        <div
                                                            key={subprogram.id}
                                                            onClick={() => handleSubprogramClick(subprogram, isLocked)}
                                                            className={`group flex flex-col items-center flex-shrink-0 w-16 h-full justify-end ${isLocked ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
                                                        >
                                                            <div className={`mb-2 text-[10px] font-bold ${isActive ? "text-green-600" : "text-gray-400"}`}>
                                                                {shortCodes[index] || `L${index + 1}`}
                                                            </div>

                                                            {/* Uniform Height Pillar */}
                                                            <div
                                                                className={`
                              w-[85%] rounded-xl transition-all duration-300 relative h-full
                              flex flex-col justify-between items-center py-4
                              ${isActive
                                                                        ? "bg-green-600 shadow-lg shadow-green-600/20 z-10 scale-[1.03]"
                                                                        : isDark ? "bg-gray-800 border border-gray-700 opacity-60 hover:opacity-100 hover:scale-[1.01]" : "bg-gray-200 border border-gray-300 opacity-60 hover:opacity-100 hover:scale-[1.01]"
                                                                    }
                            `}
                                                            >
                                                                <div className="flex justify-center w-full">
                                                                    {isEnrolled ? (
                                                                        <div className="w-6 h-6 rounded-full bg-white text-green-600 flex items-center justify-center shadow-md">
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                        </div>
                                                                    ) : isPast ? (
                                                                        <div className="w-5 h-5 rounded-full bg-green-600/20 text-green-600 flex items-center justify-center">
                                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                        </div>
                                                                    ) : (
                                                                        <div className={`w-5 h-5 flex items-center justify-center ${isDark ? "text-gray-600" : "text-gray-400"}`}>
                                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                                            </svg>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="flex-1 flex items-center justify-center overflow-hidden text-center px-1">
                                                                    <span className={`text-[9px] font-normal uppercase tracking-widest -rotate-90 whitespace-nowrap ${isActive ? "text-white" : "text-gray-500 opacity-40"}`}>
                                                                        {subprogram.subprogram_name}
                                                                    </span>
                                                                </div>

                                                                <div className={`w-8 h-1 rounded-full ${isActive ? "bg-white/40" : "bg-gray-400/20"}`}></div>

                                                                {/* Download Button for Completed Pillar */}
                                                                {isPast && certificates.some(c => c.target_id === subprogram.id && c.target_type === 'subprogram') && (
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDownloadCertificate('subprogram', subprogram.id, subprogram.subprogram_name);
                                                                        }}
                                                                        className="absolute -bottom-10 left-1/2 -translate-x-1/2 p-2 bg-green-500 text-white rounded-full shadow-lg hover:scale-110 transition-all z-20"
                                                                        title="Download Certificate"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                        </svg>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </div>
                                    )}
                                </div>

                                {/* Right Column - Image (50% Width, 400px Height) */}
                                <div className="flex flex-col w-full h-[400px]">
                                    <div className={`relative w-full h-full rounded-3xl overflow-hidden border-2 ${isDark ? "border-gray-800" : "border-gray-100 shadow-sm"}`}>
                                        <Image
                                            src="/images/My courses.jpg"
                                            alt="My Courses"
                                            fill
                                            className="object-cover opacity-90"
                                            priority
                                            unoptimized
                                        />
                                    </div>
                                </div>

                            </div>

                        </>
                    ) : (
                        /* === OTHER PROGRAMS LAYOUT (PREMIUM CARD DESIGN) === */
                        <div className="flex flex-col gap-8">
                            {/* Main Program Card */}
                            <div className={`mb-8 rounded-xl shadow-lg overflow-hidden ${isDark ? "bg-gray-800" : "bg-gray-50"} border ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                                    {/* Left Section - Program Card with Image */}
                                    <div className={`lg:col-span-1 ${isDark ? "bg-gray-700" : "bg-gray-100"} p-6 relative overflow-hidden`}>
                                        <div className="relative h-full min-h-[300px] flex flex-col items-center justify-center">
                                            <Image
                                                src={programImage}
                                                alt={studentProgram.program_name}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                    </div>

                                    {/* Right Section - Course Details */}
                                    <div className={`lg:col-span-2 ${isDark ? "bg-gray-800" : "bg-white"} p-8`}>
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className={`text-3xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-900"}`}>
                                                    {studentProgram.title || studentProgram.program_name}
                                                </h3>
                                                <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                                    {studentProgram.title || studentProgram.program_name}
                                                </p>
                                            </div>
                                            <div className="bg-[#010080] text-white px-4 py-2 rounded-lg flex items-center gap-2">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                                                </svg>
                                                <span className="font-semibold">In Progress</span>
                                            </div>
                                        </div>

                                        {/* Activity Info */}
                                        <div className="flex items-center gap-6 text-sm">
                                            <div className="flex items-center gap-2">
                                                <svg className={`w-5 h-5 ${isDark ? "text-gray-400" : "text-gray-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                                                    Last activity: 4 days ago
                                                </span>
                                            </div>
                                            <div>
                                                <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                                                    {subprogramsData.length} courses available
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Subprograms as Course Cards */}
                            {subprogramsLoading ? (
                                <div className={`p-6 rounded-xl shadow ${card} text-center`}>
                                    <p className={isDark ? "text-gray-400" : "text-gray-600"}>Loading courses...</p>
                                </div>
                            ) : subprogramsData.length === 0 ? (
                                <div className={`p-6 rounded-xl shadow ${card} text-center`}>
                                    <p className={isDark ? "text-gray-400" : "text-gray-600"}>No courses available.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {subprogramsData.map((subprogram, index) => {
                                        const currentSubId = studentClass?.subprogram_id || user?.chosen_subprogram;
                                        const isActive = Number(subprogram.id) === Number(currentSubId);
                                        const isLocked = !isActive;
                                        const progress = calculateProgress(subprogram.id);
                                        const coursesInSub = filteredCourses.filter(c => Number(c.subprogram_id) === Number(subprogram.id));
                                        const totalLessons = coursesInSub.length;
                                        const completedLessons = Math.floor((progress / 100) * totalLessons);

                                        const gradient = gradients[index % gradients.length];

                                        return (
                                            <div
                                                key={subprogram.id}
                                                onClick={() => {
                                                    if (!isLocked) {
                                                        router.push(`/portal/student/my-courses/${subprogram.id}`);
                                                    }
                                                }}
                                                className={`group relative rounded-2xl overflow-hidden transition-all duration-500 border-2 ${isLocked
                                                    ? `${isDark ? "bg-gray-800/40 border-gray-700/50" : "bg-gray-100 border-gray-200"} grayscale opacity-80 cursor-not-allowed`
                                                    : `${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} cursor-pointer hover:shadow-2xl hover:border-[#010080]/30 hover:-translate-y-2`
                                                    }`}
                                            >
                                                {/* Top Decorative Section with Icon */}
                                                <div className={`relative h-32 flex items-center justify-center overflow-hidden bg-gradient-to-br ${gradient}`}>
                                                    <div className="absolute inset-0 opacity-20">
                                                        <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/30 blur-2xl"></div>
                                                        <div className="absolute -left-4 -bottom-4 w-20 h-20 rounded-full bg-black/20 blur-xl"></div>
                                                    </div>

                                                    <div className={`relative z-10 transition-transform duration-500 ${!isLocked && "group-hover:scale-110"}`}>
                                                        <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-xl">
                                                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                            </svg>
                                                        </div>
                                                    </div>

                                                    {/* Status Badges */}
                                                    <div className="absolute top-4 right-4">
                                                        {isActive && (
                                                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg flex items-center gap-1.5 ${progress === 100
                                                                ? "bg-green-500 text-white"
                                                                : "bg-white text-[#010080]"
                                                                }`}>
                                                                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${progress === 100 ? "bg-white" : "bg-[#010080]"}`}></div>
                                                                {progress === 100 ? "Completed" : "Active"}
                                                            </div>
                                                        )}
                                                        {isLocked && (
                                                            <div className="p-1.5 bg-black/20 backdrop-blur-sm rounded-full border border-white/10 text-white/80">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Content Section */}
                                                <div className="p-6">
                                                    <div className="mb-4">
                                                        <h3 className={`text-xl font-bold mb-2 line-clamp-1 transition-colors ${isLocked
                                                            ? (isDark ? "text-gray-500" : "text-gray-400")
                                                            : (isDark ? "text-white group-hover:text-[#4F46E5]" : "text-gray-900 group-hover:text-[#010080]")
                                                            }`}>
                                                            {subprogram.subprogram_name}
                                                        </h3>
                                                        <p className={`text-sm line-clamp-2 leading-relaxed ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                                            {subprogram.description || "Master the concepts and build practical skills with this comprehensive course module."}
                                                        </p>
                                                    </div>

                                                    {/* Progress & Lessons Info */}
                                                    {!isLocked && (
                                                        <div className="space-y-3 mb-6">
                                                            <div className="flex justify-between items-end text-xs font-semibold">
                                                                <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                                                                    {totalLessons > 0 ? `${completedLessons}/${totalLessons} Lessons` : "0 Lessons"}
                                                                </span>
                                                                <span className="text-[#010080] dark:text-indigo-400">{progress}%</span>
                                                            </div>
                                                            <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? "bg-gray-700" : "bg-gray-100"}`}>
                                                                <div
                                                                    className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-1000 ease-out`}
                                                                    style={{ width: `${progress}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Action Button */}
                                                    {isActive ? (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                router.push(`/portal/student/my-courses/${subprogram.id}`);
                                                            }}
                                                            className={`w-full group/btn relative flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all duration-300 overflow-hidden ${isDark
                                                                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                                                                : "bg-[#010080] text-white hover:bg-[#010080]/90 shadow-[0_4px_14px_0_rgba(1,0,128,0.39)]"
                                                                }`}
                                                        >
                                                            <span className="relative z-10 transition-transform duration-300 group-hover/btn:-translate-x-1">View Course</span>
                                                            <svg className="w-5 h-5 relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                            </svg>
                                                        </button>
                                                    ) : (
                                                        <div className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-dashed font-medium text-sm transition-colors ${isDark ? "border-gray-700 text-gray-500" : "border-gray-200 text-gray-400"
                                                            }`}>
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                            </svg>
                                                            <span>Course Locked</span>
                                                        </div>
                                                    )}

                                                    {/* Certificate Download Button for Subprogram */}
                                                    {!isLocked && progress === 100 && certificates.some(c => c.target_id === subprogram.id && c.target_type === 'subprogram') && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDownloadCertificate('subprogram', subprogram.id, subprogram.subprogram_name);
                                                            }}
                                                            className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold transition-all border-2 border-green-500 text-green-600 hover:bg-green-500 hover:text-white`}
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            Get Certificate
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* My Enrolled Classes - Only visible for 8-level General program */}
                {isGeneralProgram && (
                    <div id="my-classes-section" className="mt-10 pb-20">
                        <div className="mb-6">
                            <h2 className={`text-3xl font-normal ${isDark ? "text-white" : "text-gray-900"}`}>
                                My Classes
                            </h2>
                            <p className={`text-sm mt-1 opacity-40 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                Access your active and completed class groups.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {(() => {
                                // Filter to show ONLY the student's own classes (Active or Past)
                                const myOwnClasses = allClasses.filter(cls => {
                                    const isActive = studentClass && Number(cls.id) == Number(studentClass.id);
                                    const isPast = !isActive && attendanceData?.records?.some(rec => Number(rec.class_id) == Number(cls.id));
                                    return isActive || isPast;
                                }).sort((a, b) => {
                                    // Active first
                                    const aIsActive = studentClass && Number(a.id) == Number(studentClass.id);
                                    const bIsActive = studentClass && Number(b.id) == Number(studentClass.id);
                                    if (aIsActive && !bIsActive) return -1;
                                    if (!aIsActive && bIsActive) return 1;
                                    return 0;
                                });

                                if (myOwnClasses.length === 0) {
                                    return (
                                        <div className={`col-span-full p-12 rounded-3xl border-2 border-dashed text-center ${isDark ? "bg-gray-800/20 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                                            <div className="text-4xl mb-4">🏫</div>
                                            <p className={`text-lg font-normal mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                                                No class assignments found.
                                            </p>
                                            <p className="text-gray-400 text-sm italic">
                                                Please wait for the administrator to assign you to a specific learning group.
                                            </p>
                                        </div>
                                    );
                                }

                                return myOwnClasses.map((cls) => {
                                    const isActive = studentClass && Number(cls.id) == Number(studentClass.id);
                                    const isMorning = cls.type === 'morning';
                                    const isNight = cls.type === 'night';

                                    return (
                                        <div
                                            key={cls.id}
                                            onClick={() => isActive && router.push("/portal/student/online-sessions")}
                                            className={`relative rounded-2xl overflow-hidden shadow-xl transition-all duration-300 border-2 ${isActive
                                                ? `border-[#010080] ${isDark ? 'bg-gray-800' : 'bg-blue-50'} hover:shadow-2xl hover:scale-[1.02] cursor-pointer`
                                                : `${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'} opacity-90 cursor-pointer hover:scale-[1.01]`
                                                }`}
                                        >
                                            <div className="relative p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        <h3 className={`text-xl font-normal mb-3 ${isDark ? "text-white" : "text-gray-900"}`}>
                                                            {cls.class_name}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <span className={`px-3 py-1.5 rounded-full text-xs font-normal ${isMorning
                                                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300'
                                                                : isNight
                                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                                }`}>
                                                                {cls.type ? (
                                                                    <>
                                                                        {isMorning && '🌅 '}
                                                                        {isNight && '🌙 '}
                                                                        {cls.type.charAt(0).toUpperCase() + cls.type.slice(1)} Class
                                                                    </>
                                                                ) : 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {isActive ? (
                                                        <span className="px-3 py-1.5 bg-[#010080] text-white rounded-full text-xs font-normal shadow-md flex items-center gap-1.5 whitespace-nowrap">
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className={`px-3 py-1.5 rounded-full text-xs font-normal shadow-sm flex items-center gap-1.5 whitespace-nowrap ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                            Completed
                                                        </span>
                                                    )}
                                                </div>

                                                {cls.description && (
                                                    <p className={`text-sm mb-4 leading-relaxed ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                                                        {cls.description}
                                                    </p>
                                                )}

                                                <div className="mt-4 flex items-center justify-between">
                                                    {cls.teacher_name && (
                                                        <div>
                                                            <p className={`text-xs font-normal mb-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                                                                👨‍🏫 Teacher
                                                            </p>
                                                            <p className={`text-lg font-normal whitespace-nowrap ${isDark ? "text-white" : "text-gray-900"}`}>
                                                                {cls.teacher_name}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {isActive && (
                                                        <div className="text-blue-600 dark:text-blue-400 font-normal text-sm">
                                                            Join Session →
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                )}

                {/* Level Up Request Modal */}
                <Modal
                    isOpen={isLevelUpModalOpen}
                    onClose={() => setIsLevelUpModalOpen(false)}
                    title="Level Up Request"
                >
                    <div className="space-y-6 py-2">
                        <div>
                            <label className={`block text-sm font-semibold mb-2.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Description (Qor sababta aad u codsanayso)
                            </label>
                            <textarea
                                value={levelUpDescription}
                                onChange={(e) => setLevelUpDescription(e.target.value)}
                                placeholder="Enter your reason here..."
                                className={`w-full p-4 rounded-xl border-2 min-h-[120px] transition-all outline-none text-sm
                                    ${isDark
                                        ? 'bg-[#151b2b] border-gray-700 text-white focus:border-[#010080]'
                                        : 'bg-gray-50 border-gray-100 focus:border-[#010080]'}`}
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setIsLevelUpModalOpen(false)}
                                className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all
                                    ${isDark
                                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        // Find next subprogram ID
                                        const currentIndex = subprogramsData.findIndex(s => Number(s.id) === Number(studentSubprogram?.id));
                                        const nextSubprogram = subprogramsData[currentIndex + 1];

                                        if (!nextSubprogram) {
                                            showToast("You are already at the highest level!", "info");
                                            return;
                                        }

                                        await createRequest({
                                            requested_subprogram_id: nextSubprogram.id,
                                            description: levelUpDescription
                                        }).unwrap();

                                        showToast("Level-up request sent successfully!", "success");
                                        setIsLevelUpModalOpen(false);
                                        setLevelUpDescription("");
                                    } catch (err) {
                                        showToast(err.data?.error || "Failed to send request", "error");
                                    }
                                }}
                                className="flex-1 py-3.5 bg-[#010080] text-white rounded-xl font-bold text-sm transition-all shadow-lg active:scale-[0.98]"
                            >
                                Submit Request
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
}
