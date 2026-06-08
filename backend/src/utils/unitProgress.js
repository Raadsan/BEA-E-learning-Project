const INTEGRATED_PATTERN = /integrated|ielts|toefl|test prep|academic training/i;

export function parseCompletedEntries(value) {
    if (!value) return [];
    if (typeof value === "string") {
        return value.split(",").map((part) => part.trim().toLowerCase()).filter(Boolean);
    }
    if (Array.isArray(value)) {
        return value.map((part) => String(part).trim().toLowerCase()).filter(Boolean);
    }
    return [];
}

export function detectUnitFromClass(className) {
    if (!className) return "A";
    const upper = className.toUpperCase();
    if (/\bB\b|[-_\s]B$|CLASS\s*B|UNIT\s*B|PART\s*B/.test(upper)) return "B";
    if (/\bA\b|[-_\s]A$|CLASS\s*A|UNIT\s*A|PART\s*A/.test(upper)) return "A";
    return "A";
}

export function classMatchesUnit(className, unit) {
    if (!className) return unit === "A";
    const upper = className.toUpperCase();
    if (unit === "B") {
        return /\bB\b|[-_\s]B$|CLASS\s*B|UNIT\s*B|PART\s*B/.test(upper);
    }
    return /\bA\b|[-_\s]A$|CLASS\s*A|UNIT\s*A|PART\s*A/.test(upper);
}

export function hasABSplit(subprogramName) {
    return !INTEGRATED_PATTERN.test(subprogramName || "");
}

export function hasUnitCompletion(entries, subprogramId, unit) {
    const id = String(subprogramId).toLowerCase();
    const suffix = unit.toLowerCase();

    return entries.some((entry) => {
        if (entry === `${id}-${suffix}`) return true;
        return entry.endsWith(`-${suffix}`) && entry.slice(0, -(suffix.length + 1)) === id;
    });
}

export function isSubprogramFullyCompleted(entries, subprogramId) {
    const id = String(subprogramId).toLowerCase();

    if (entries.includes(id)) return true;

    const hasA = hasUnitCompletion(entries, subprogramId, "A");
    const hasB = hasUnitCompletion(entries, subprogramId, "B");
    return hasA && hasB;
}

export function appendCompletedEntry(existingValue, entry) {
    const entries = parseCompletedEntries(existingValue);
    const normalized = entry.toLowerCase();
    if (!entries.includes(normalized)) {
        entries.push(normalized);
    }
    return entries.join(", ");
}
