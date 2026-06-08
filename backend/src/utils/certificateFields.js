export const GLOBAL_CERTIFICATE_TARGET_ID = 0;
export const GLOBAL_CERTIFICATE_TARGET_TYPE = 'program';

export const CERTIFICATE_FIELD_KEYS = [
    'student_name',
    'student_id',
    'program_name',
    'subprogram_name',
    'grade',
    'issue_date',
];

export const CERTIFICATE_FIELD_LABELS = {
    student_name: 'Student Name',
    student_id: 'Student ID',
    program_name: 'Program Name',
    subprogram_name: 'Subprogram / Level Name',
    grade: 'Grade / Result',
    issue_date: 'Issue Date',
};

export const DEFAULT_FIELDS_CONFIG = {
    student_name: { x: 500, y: 420, font_size: 40, font_color: '#000000', enabled: true },
    student_id: { x: 500, y: 500, font_size: 22, font_color: '#000000', enabled: true },
    program_name: { x: 500, y: 280, font_size: 28, font_color: '#000000', enabled: true },
    subprogram_name: { x: 500, y: 340, font_size: 28, font_color: '#000000', enabled: true },
    grade: { x: 500, y: 580, font_size: 24, font_color: '#000000', enabled: true },
    issue_date: { x: 500, y: 650, font_size: 20, font_color: '#000000', enabled: true },
};

export function normalizeFieldsConfig(rawConfig, legacyCert = null) {
    const config = { ...DEFAULT_FIELDS_CONFIG };

    if (rawConfig && typeof rawConfig === 'object') {
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

export function hexToRgb(hexColor) {
    const hex = (hexColor || '#000000').replace('#', '');
    return {
        r: parseInt(hex.substring(0, 2), 16) / 255,
        g: parseInt(hex.substring(2, 4), 16) / 255,
        b: parseInt(hex.substring(4, 6), 16) / 255,
    };
}
