"use client";

import { useState } from "react";
import ReviewModal from "../ReviewModal";
import { useSubmitStudentReviewMutation, useGetQuestionsQuery, useGetStudentReviewsByTeacherQuery } from "@/redux/api/reviewApi";
import { useToast } from "@/components/Toast";

const TeacherReviewForm = ({ student, classId, termSerial, onComplete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [locallyReviewed, setLocallyReviewed] = useState(false);
    const { showToast } = useToast();
    const [submitReview, { isLoading }] = useSubmitStudentReviewMutation();
    const { data: questions = [], isLoading: questionsLoading } = useGetQuestionsQuery("student");
    const { data: existingReviews = [] } = useGetStudentReviewsByTeacherQuery();

    const handleOpen = () => setIsModalOpen(true);
    const handleClose = () => setIsModalOpen(false);

    const handleSubmit = async ({ rating, comment, answers }) => {
        if (!termSerial) {
            showToast("Please wait while data is loading.", "error");
            return;
        }

        try {
            await submitReview({
                student_id: student.student_id,
                teacher_id: null, // Backend infers from token
                class_id: classId,
                term_serial: termSerial, // Current term (need to fetch?)
                rating,
                comment,
                answers // JSON
            }).unwrap();

            showToast(`Review for ${student.full_name} submitted successfully!`, "success");
            setLocallyReviewed(true);
            handleClose();
            if (onComplete) onComplete();
        } catch (err) {
            console.error(err);
            showToast(err.data?.error || "Failed to submit review.", "error");
        }
    };

    // Check if student has been reviewed
    const isReviewed = locallyReviewed || existingReviews.some(
        review => review.student_id === student.student_id && review.class_id === classId && review.term_serial === termSerial
    );

    if (isReviewed) {
        return (
            <button
                disabled
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-xs font-semibold rounded-lg shadow-sm cursor-default"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                Reviewed
            </button>
        );
    }

    return (
        <>
            <button
                onClick={handleOpen}
                disabled={questionsLoading}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {questionsLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Review
                    </>
                )}
            </button>

            <ReviewModal
                isOpen={isModalOpen}
                onClose={handleClose}
                onSubmit={handleSubmit}
                title={`Review Student: ${student.full_name}`}
                subtitle="Please provide an honest assessment of the student's performance."
                revieweeName={student.full_name}
                questions={questions}
                isLoading={isLoading}
            />
        </>
    );
};

export default TeacherReviewForm;
