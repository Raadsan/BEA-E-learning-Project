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
  if (student.funding_status === "Full Scholarship") return 0;
  if (student.funding_status === "Partial Scholarship" && student.scholarship_percentage) {
    return baseAmount * (1 - Number(student.scholarship_percentage) / 100);
  }
  return baseAmount;
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

export function getPackagePriceForStudent(
  pkg: any,
  programTitle?: string,
  student?: StudentLike | null
) {
  const mapped = mapPackagePrograms(pkg);
  const progMatch = mapped.programs?.find((p: ProgramLike) => p.title === programTitle);
  const monthly = getEffectiveMonthlyPrice(progMatch);
  const months = Number(pkg.duration_months || 1);
  const base = monthly * months;
  return applyStudentDiscount(base, student);
}
