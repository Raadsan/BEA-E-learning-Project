type SubprogramLike = { id: number; subprogram_name?: string };
type ClassLike = { subprogram_id?: number | null };
type UserLike = {
  subprogram_id?: number | string | null;
  chosen_subprogram?: string | number | null;
};

/** Resolve numeric subprogram id from class assignment, then student profile fields. */
export function resolveStudentSubprogramId(
  user?: UserLike | null,
  studentClass?: ClassLike | null,
  allSubprograms: SubprogramLike[] = []
): number | null {
  const candidates = [
    studentClass?.subprogram_id,
    user?.subprogram_id,
    user?.chosen_subprogram,
  ].filter((value) => value !== undefined && value !== null && value !== "");

  for (const candidate of candidates) {
    const numeric = Number(candidate);
    if (!Number.isNaN(numeric) && allSubprograms.some((sp) => sp.id === numeric)) {
      return numeric;
    }

    const byName = allSubprograms.find(
      (sp) =>
        sp.subprogram_name === String(candidate) ||
        sp.subprogram_name?.toLowerCase() === String(candidate).toLowerCase()
    );
    if (byName) return byName.id;
  }

  return null;
}
