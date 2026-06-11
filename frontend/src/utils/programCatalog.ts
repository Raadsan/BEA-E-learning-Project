/** Shared program identity helpers for website, registration, and student portal. */

export type ProgramRecord = {
  id?: number | string | null;
  title?: string | null;
  description?: string | null;
  status?: string | null;
  show_on_website?: boolean | string | number | null;
  image?: string | null;
  video?: string | null;
  price?: number | string | null;
  discount?: number | string | null;
};

export function normalizeProgramTitle(title?: string | null) {
  return (title || "").toLowerCase().trim();
}

export function isEslProficiencyCertificationProgram(title?: string | null) {
  const t = normalizeProgramTitle(title);
  return (
    (t.includes("esl") && (t.includes("proficien") || t.includes("certification"))) ||
    t.includes("esl proficiency certification")
  );
}

export function isLegacyProficiencyTestProgram(title?: string | null) {
  return normalizeProgramTitle(title) === "proficiency test";
}

export function isProficiencyCertificationProgram(title?: string | null) {
  return isLegacyProficiencyTestProgram(title) || isEslProficiencyCertificationProgram(title);
}

export function isIeltsToeflProgram(title?: string | null) {
  const t = normalizeProgramTitle(title);
  return t.includes("ielts") || t.includes("toefl");
}

export function isActiveProgram<T extends { status?: string | null }>(program: T) {
  const status = normalizeProgramTitle(program?.status);
  // Treat missing/unknown status as active so mapped cards are not dropped accidentally
  if (!status) return true;
  return status === "active";
}

export function isShownOnWebsite(program?: ProgramRecord | null) {
  const value = program?.show_on_website;
  if (value === undefined || value === null) return true;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  return ["true", "1", "yes", "on"].includes(String(value).toLowerCase());
}

export function formatProgramDescription(description?: string | null, maxLength = 140) {
  if (!description) return "";
  const clean = description.replace(/\r\n/g, " ").replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength).trim()}...`;
}

export function findProficiencyCertificationProgram<T extends { title?: string | null }>(
  programs?: T[] | null
): T | undefined {
  if (!programs?.length) return undefined;
  return (
    programs.find((p) => isEslProficiencyCertificationProgram(p.title)) ||
    programs.find((p) => isLegacyProficiencyTestProgram(p.title))
  );
}

/** Programs shown on the public website (home + programs page). */
export function getWebsitePrograms(programs?: ProgramRecord[] | null): ProgramRecord[] {
  return (programs || []).filter(
    (program) => isActiveProgram(program) && isShownOnWebsite(program)
  );
}

/** Programs selectable on the general registration form. */
export function getGeneralRegistrationPrograms(programs?: ProgramRecord[] | null): ProgramRecord[] {
  return getWebsitePrograms(programs).filter(
    (p) =>
      !isLegacyProficiencyTestProgram(p.title) &&
      !isIeltsToeflProgram(p.title)
  );
}

export function isProficiencyOnlyStudent(user?: {
  role?: string | null;
  chosen_program?: string | null;
  program?: string | null;
}) {
  if (user?.role === "proficiency_student") return true;
  const prog = normalizeProgramTitle(user?.chosen_program || user?.program);
  return isProficiencyCertificationProgram(prog);
}

/** Preferred display order for public program cards. */
export function sortProgramsForDisplay<
  T extends { id?: number | null; title?: string | null }
>(programs: T[]) {
  const priority = (program: T) => {
    const title = normalizeProgramTitle(program.title);
    if (title.includes("general english") || title.includes("gep")) return 0;
    if (isEslProficiencyCertificationProgram(program.title)) return 1;
    if (title.includes("esp") || title.includes("specific purposes")) return 2;
    if (isIeltsToeflProgram(program.title)) return 3;
    if (title.includes("academic writing")) return 4;
    if (title.includes("soft skills") || title.includes("workplace")) return 5;
    if (title.includes("digital literacy")) return 6;
    return 10;
  };

  return [...programs].sort((a, b) => {
    const diff = priority(a) - priority(b);
    if (diff !== 0) return diff;
    return (a.id || 0) - (b.id || 0);
  });
}
