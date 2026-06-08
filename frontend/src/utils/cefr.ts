const CEFR_DESCRIPTIONS: Record<string, string> = {
  A1: "Beginner",
  A2: "Elementary",
  "A2+": "Pre-Intermediate",
  B1: "Intermediate",
  "B1+": "Intermediate Plus",
  B2: "Upper-Intermediate",
  C1: "Advanced",
  C2: "Advanced Plus",
};

const CEFR_PATTERN = /^(A2\+|A2|B1\+|B1|A1|B2|C1|C2)/i;

export function parseCefrFromSubprogram(subprogramName?: string | null) {
  if (!subprogramName || subprogramName === "N/A") {
    return { level: "N/A", desc: "Not Assigned" };
  }

  const trimmed = subprogramName.trim();
  const match = trimmed.match(CEFR_PATTERN);
  if (match) {
    const level = match[1].toUpperCase();
    const desc =
      CEFR_DESCRIPTIONS[level] ||
      trimmed.split(/[-–]/).slice(1).join(" - ").trim() ||
      "Proficiency";
    return { level, desc };
  }

  const firstToken = trimmed.split(/[\s-–]+/)[0]?.toUpperCase();
  return {
    level: firstToken || "N/A",
    desc: CEFR_DESCRIPTIONS[firstToken] || trimmed,
  };
}

export function getCefrCodeFromSubprogram(subprogramName?: string | null) {
  return parseCefrFromSubprogram(subprogramName).level;
}
