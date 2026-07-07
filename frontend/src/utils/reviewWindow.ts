export type ReviewWindowType = "teacher" | "student";

export type ReviewWindowState = {
    id?: number;
    review_type: ReviewWindowType;
    status: "active" | "inactive";
    start_date?: string | null;
    end_date?: string | null;
    is_open?: boolean;
    effective_status?: "active" | "inactive" | "upcoming" | "closed";
    reason?: string;
};

export function getReviewClosedMessage(window?: ReviewWindowState | null): string {
    if (!window) return "Reviews are not available at this time. Please contact the administrator.";

    switch (window.reason) {
        case "admin_inactive":
            return "The review period is currently inactive. Please check back later.";
        case "before_start":
            return "The review period has not started yet.";
        case "after_end":
            return "The review period has ended. Submissions are no longer accepted.";
        default:
            return "Reviews are not available at this time. Please contact the administrator.";
    }
}
