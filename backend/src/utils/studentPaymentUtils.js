export function getEffectiveMonthlyPrice(program) {
  const price = Number(program?.price || 0);
  const discount = Number(program?.discount || 0);
  return Math.max(0, price - discount);
}

export function applyStudentDiscount(baseAmount, student) {
  const amount = Number(baseAmount || 0);
  if (!student) return amount;
  if (student.funding_status === "Full Scholarship") return 0;
  if (student.funding_status === "Partial Scholarship" && student.scholarship_percentage) {
    return amount * (1 - Number(student.scholarship_percentage) / 100);
  }
  return amount;
}

export function addMonths(baseDate, months = 1) {
  const d = new Date(baseDate);
  d.setMonth(d.getMonth() + Number(months || 1));
  return d;
}

export function mapMonthsToSponsorshipEnum(months) {
  const m = Number(months || 1);
  if (m >= 12) return "Year";
  if (m >= 6) return "Months_6";
  if (m >= 3) return "Months_3";
  return "Month";
}

export async function getProgramByTitle(prisma, title) {
  if (!title) return null;
  return prisma.programs.findFirst({ where: { title } });
}

export async function resolvePaymentPackage(prisma, packageName) {
  if (!packageName || packageName === "None") return null;
  return prisma.payment_packages.findFirst({ where: { package_name: packageName } });
}

export async function resolvePaidMonths(prisma, { funding_status, sponsorship_package, paid_months }) {
  if (paid_months) return parseInt(paid_months, 10) || 1;
  if (funding_status === "Sponsorship" && sponsorship_package) {
    const pkg = await resolvePaymentPackage(prisma, sponsorship_package);
    return pkg?.duration_months || 1;
  }
  if (funding_status === "Full Scholarship") return 12;
  return 1;
}

export async function computeFundingAmount(prisma, {
  funding_status,
  scholarship_percentage,
  sponsorship_package,
  chosen_program,
  paid_months,
}) {
  const program = await getProgramByTitle(prisma, chosen_program);
  const monthly = getEffectiveMonthlyPrice(program);
  const months = await resolvePaidMonths(prisma, { funding_status, sponsorship_package, paid_months });

  if (funding_status === "Full Scholarship") return 0;

  let total = monthly * months;
  if (funding_status === "Partial Scholarship" && scholarship_percentage) {
    total = total * (1 - Number(scholarship_percentage) / 100);
  }
  return Number(total.toFixed(2));
}

export async function computePaidUntil(prisma, {
  funding_status,
  sponsorship_package,
  paid_months,
  currentPaidUntil,
}) {
  const now = new Date();
  const base =
    currentPaidUntil && new Date(currentPaidUntil) > now
      ? new Date(currentPaidUntil)
      : now;
  const months = await resolvePaidMonths(prisma, { funding_status, sponsorship_package, paid_months });
  return addMonths(base, months);
}

export function mapPackagePrograms(pkg) {
  if (!pkg) return pkg;
  if (Array.isArray(pkg.programs)) return pkg;
  return {
    ...pkg,
    programs: (pkg.program_payment_packages || [])
      .map((link) => link.programs)
      .filter(Boolean),
  };
}
