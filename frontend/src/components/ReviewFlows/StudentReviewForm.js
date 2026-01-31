"use client";

import { useState } from "react";
import ReviewModal from "../ReviewModal";
import { useSubmitTeacherReviewMutation, useGetQuestionsQuery } from "@/redux/api/reviewApi";
import toast from "react-hot-toast";

const StudentReviewForm = ({ teacher, classId, termSerial, onComplete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitReview, { isLoading }] = useSubmitTeacherReviewMutation();
    const { data: questions = [], isLoading: questionsLoading } = useGetQuestionsQuery("teacher");

    const handleOpen = () => setIsModalOpen(true);
    const handleClose = () => setIsModalOpen(false);

    const handleSubmit = async ({ rating, comment, answers }) => {
        try {
            await submitReview({
                teacher_id: teacher.id || teacher.teacher_id,
                class_id: classId,
                term_serial: termSerial,
                rating,
                comment,
                answers // New field for detailed question ratings
            }).unwrap();

            toast.success(`${teacher.full_name} qiimeyntiisa si guul leh ayaa loo gudbiyay!`);
            handleClose();
            if (onComplete) onComplete();
        } catch (err) {
            toast.error(err.data?.error || "Khalad ayaa dhacay markii la gudbinayay qiimeynta.");
        }
    };

    return (
        <>
            <button
                onClick={handleOpen}
                disabled={questionsLoading}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-xl transition-all active:scale-95 shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {questionsLoading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                    <>
                        <svg className="w-5 h-5 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Qiimeey {teacher.full_name?.split(' ')[0] || 'Baraha'}
                    </>
                )}
            </button>

            <ReviewModal
                isOpen={isModalOpen}
                onClose={handleClose}
                onSubmit={handleSubmit}
                title="Qiimeynta Baraha"
                subtitle="Fadlan qiimeyn dhab ah ka bixi barahaaga"
                revieweeName={teacher.full_name}
                questions={questions}
                isLoading={isLoading}
            />
        </>
    );
};

export default StudentReviewForm;
