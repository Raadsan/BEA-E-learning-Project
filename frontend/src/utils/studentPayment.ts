type ProgramLike = { title?: string; price?: number | string; discount?: number | string };
type StudentLike = {
  funding_status?: string;
  scholarship_percentage?: number | string | null;
  chosen_program?: string;
};

export function getEffectiveMonthlyPrice(program?: ProgramLike | null) {
  const price = Number(program?.price || 0);
  const discount = Number(program?.discount || 0);
  return Math.max(0, price - discount);
}

export function applyStudentDiscount(baseAmount: number, student?: StudentLike | null) {
  if (!student) return baseAmount;
  const status = student.funding_status?.replace(/_/g, " ");
  if (status === "Full Scholarship") return 0;
  if (status === "Partial Scholarship" && student.scholarship_percentage) {
    return baseAmount * (1 - Number(student.scholarship_percentage) / 100);
  }
  return baseAmount;
}

export function isFullScholarshipStatus(status?: string | null) {
  const normalized = status?.replace(/_/g, " ");
  return normalized === "Full Scholarship";
}

/** Approved student has active course access. */
export function isStudentSubscriptionActive(
  user?: {
    approval_status?: string;
    paid_until?: string | null;
    funding_status?: string;
  } | null
): boolean {
  if (!user || user.approval_status !== "approved") return true;

  const status = user.funding_status?.replace(/_/g, " ");

  if (status === "Full Scholarship" || status === "Sponsorship") return true;

  if (!user.paid_until) return false;

  const expiryDate = new Date(user.paid_until);
  const today = new Date();
  expiryDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return expiryDate >= today;
}

export function mapPackagePrograms(pkg: any) {
  if (!pkg) return pkg;
  if (Array.isArray(pkg.programs)) return pkg;
  return {
    ...pkg,
    programs: (pkg.program_payment_packages || [])
      .map((link: any) => link.programs)
      .filter(Boolean),
  };
}

export function findProgramInPackage(pkg: any, programTitle?: string | null, programId?: number | string | null) {
  const mapped = mapPackagePrograms(pkg);
  const chosen = (programTitle || "").trim().toLowerCase();
  const chosenId = programId != null ? String(programId) : "";

  if (!chosen && !chosenId) return null;

  return (
    mapped.programs?.find((p: ProgramLike & { id?: number }) => {
      if (chosenId && String(p.id) === chosenId) return true;
      const title = (p.title || "").trim().toLowerCase();
      return chosen && title === chosen;
    }) ||
    mapped.programs?.find((p: ProgramLike) => {
      const title = (p.title || "").trim().toLowerCase();
      return chosen && (title.includes(chosen) || chosen.includes(title));
    }) ||
    null
  );
}

export function getPackagePriceForStudent(
  pkg: any,
  programTitle?: string,
  student?: StudentLike | null,
  programId?: number | string | null
) {
  const mapped = mapPackagePrograms(pkg);
  const progMatch = findProgramInPackage(mapped, programTitle, programId);
  const monthly = getEffectiveMonthlyPrice(progMatch);
  const months = Number(pkg.duration_months || 1);
  const base = monthly * months;
  return applyStudentDiscount(base, student);
}

export function getStudentUpgradePackages(
  packages: any[],
  student?: (StudentLike & { chosen_program_id?: number | string | null }) | null
) {
  const chosen = student?.chosen_program;
  const programId = student?.chosen_program_id;

  return (packages || [])
    .filter((pkg) => pkg?.status !== "inactive")
    .map((pkg) => mapPackagePrograms(pkg))
    .map((pkg) => {
      const progMatch = findProgramInPackage(pkg, chosen, programId);
      if (!progMatch) return null;
      const studentPrice = getPackagePriceForStudent(pkg, chosen, student, programId);
      return {
        ...pkg,
        studentPrice,
        originalPrice: Number(progMatch.price || 0) * (pkg.duration_months || 1),
        matchedProgram: progMatch,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a.duration_months || 0) - (b.duration_months || 0));
}
