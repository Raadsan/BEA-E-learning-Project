export const GLOBAL_CERTIFICATE_TARGET_ID = 0;

export const CERTIFICATE_FIELD_KEYS = [
    "student_name",
    "student_id",
    "program_name",
    "subprogram_name",
    "grade",
    "issue_date",
] as const;

export type CertificateFieldKey = (typeof CERTIFICATE_FIELD_KEYS)[number];

export const CERTIFICATE_FIELD_LABELS: Record<CertificateFieldKey, string> = {
    student_name: "Student Name",
    student_id: "Student ID",
    program_name: "Program Name",
    subprogram_name: "Subprogram / Level",
    grade: "Grade / Result",
    issue_date: "Issue Date",
};

export const CERTIFICATE_FIELD_SAMPLES: Record<CertificateFieldKey, string> = {
    student_name: "Ahmed Hassan",
    student_id: "STU-2026-001",
    program_name: "General English",
    subprogram_name: "Intermediate B1",
    grade: "85%",
    issue_date: "20 May 2026",
};

export const DEFAULT_FIELDS_CONFIG: Record<
    CertificateFieldKey,
    { x: number; y: number; font_size: number; font_color: string; enabled: boolean }
> = {
    student_name: { x: 500, y: 420, font_size: 40, font_color: "#000000", enabled: true },
    student_id: { x: 500, y: 500, font_size: 22, font_color: "#000000", enabled: true },
    program_name: { x: 500, y: 280, font_size: 28, font_color: "#000000", enabled: true },
    subprogram_name: { x: 500, y: 340, font_size: 28, font_color: "#000000", enabled: true },
    grade: { x: 500, y: 580, font_size: 24, font_color: "#000000", enabled: true },
    issue_date: { x: 500, y: 650, font_size: 20, font_color: "#000000", enabled: true },
};

export function isGlobalCertificate(cert: { target_id?: number; target_type?: string; is_global?: boolean }) {
    return Boolean(
        cert?.is_global ||
        (cert?.target_id === GLOBAL_CERTIFICATE_TARGET_ID && cert?.target_type === "program")
    );
}

export function parseCompletedSubprograms(value: unknown): string[] {
    if (!value) return [];
    if (typeof value === "string") {
        return value.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    }
    if (Array.isArray(value)) {
        return value.map((s) => String(s).trim().toLowerCase()).filter(Boolean);
    }
    return [];
}

export function isSubprogramCompleted(
    subprogram: { id: number | string; subprogram_name?: string; name?: string },
    completedSubprograms: string[],
    activeIndex: number,
    subIndex: number
) {
    const targetId = String(subprogram.id).toLowerCase();
    const targetName = String(subprogram.subprogram_name || subprogram.name || "").toLowerCase().trim();

    const isInCompletedList = completedSubprograms.some(
        (completed) => completed === targetId || completed === targetName
    );
    const hasMovedPast = subIndex !== -1 && (activeIndex === -1 || subIndex < activeIndex);

    return isInCompletedList || hasMovedPast;
}

export function buildAvailableCertificates({
    user,
    subprograms,
    globalTemplate,
    myHistory,
    studentProgramId,
}: {
    user: any;
    subprograms: any[];
    globalTemplate: any;
    myHistory: any[];
    studentProgramId: number | string | null;
}) {
    if (!user || !subprograms.length || !globalTemplate) return [];

    const currentSubId = String(user.chosen_subprogram || "").toLowerCase().trim();
    const completedSubprograms = parseCompletedSubprograms(user.completed_subprograms);

    const activeIndex = subprograms.findIndex((s) => {
        const sId = String(s.id);
        const sName = String(s.subprogram_name || s.name || "").toLowerCase().trim();
        return sId === currentSubId || (currentSubId && sName === currentSubId);
    });

    const subprogramCerts = subprograms
        .map((subprogram, subIndex) => {
            const isCompleted = isSubprogramCompleted(
                subprogram,
                completedSubprograms,
                activeIndex,
                subIndex
            );
            const alreadyClaimed = myHistory.some(
                (h) =>
                    h.target_type === "subprogram" &&
                    (String(h.target_id) === String(subprogram.id) ||
                        String(h.target_name || "").toLowerCase().trim() ===
                            String(subprogram.subprogram_name || subprogram.name || "").toLowerCase().trim())
            );

            if (!isCompleted || alreadyClaimed) return null;

            return {
                id: `subprogram-${subprogram.id}`,
                target_id: subprogram.id,
                target_type: "subprogram",
                target_name: subprogram.subprogram_name || subprogram.name,
                template_id: globalTemplate.id,
            };
        })
        .filter(Boolean);

    const allLevelsFinished = activeIndex === -1;
    const alreadyClaimedProgram = myHistory.some(
        (h) => h.target_type === "program" && String(h.target_id) === String(studentProgramId)
    );

    const programCert =
        studentProgramId && allLevelsFinished && !alreadyClaimedProgram
            ? [
                  {
                      id: `program-${studentProgramId}`,
                      target_id: studentProgramId,
                      target_type: "program",
                      target_name: user.chosen_program || "Program",
                      template_id: globalTemplate.id,
                  },
              ]
            : [];

    return [...subprogramCerts, ...programCert];
}

export function normalizeFieldsConfig(rawConfig?: Record<string, any>, legacyCert?: any) {
    const config = JSON.parse(JSON.stringify(DEFAULT_FIELDS_CONFIG));

    if (rawConfig && typeof rawConfig === "object") {
        for (const key of CERTIFICATE_FIELD_KEYS) {
            if (rawConfig[key]) {
                config[key] = { ...config[key], ...rawConfig[key] };
            }
        }
    }

    if (legacyCert) {
        config.student_name = {
            ...config.student_name,
            x: legacyCert.name_x ?? config.student_name.x,
            y: legacyCert.name_y ?? config.student_name.y,
            font_size: legacyCert.font_size ?? config.student_name.font_size,
            font_color: legacyCert.font_color ?? config.student_name.font_color,
            enabled: true,
        };
    }

    return config;
}
