export function getEffectiveMonthlyPrice(program) {
  const price = Number(program?.price || 0);
  const discount = Number(program?.discount || 0);
  return Math.max(0, price - discount);
}

const FUNDING_STATUS_TO_PRISMA = {
  Paid: "Paid",
  "Full Scholarship": "Full_Scholarship",
  Full_Scholarship: "Full_Scholarship",
  "Partial Scholarship": "Partial_Scholarship",
  Partial_Scholarship: "Partial_Scholarship",
  Sponsorship: "Sponsorship",
};

const FUNDING_STATUS_FROM_PRISMA = {
  Paid: "Paid",
  Full_Scholarship: "Full Scholarship",
  Partial_Scholarship: "Partial Scholarship",
  Sponsorship: "Sponsorship",
  "Full Scholarship": "Full Scholarship",
  "Partial Scholarship": "Partial Scholarship",
};

/** Prisma enum keys use underscores; API/UI uses spaced labels. */
export function normalizeFundingStatusForPrisma(status) {
  if (status == null || status === "") return status;
  return FUNDING_STATUS_TO_PRISMA[status] ?? status;
}

export function formatFundingStatusForApi(status) {
  if (status == null || status === "") return status;
  return FUNDING_STATUS_FROM_PRISMA[status] ?? status;
}

export function formatStudentFundingForApi(student) {
  if (!student) return student;
  if (Array.isArray(student)) {
    return student.map((s) => formatStudentFundingForApi(s));
  }
  return {
    ...student,
    funding_status: formatFundingStatusForApi(student.funding_status),
  };
}

export function isFullScholarshipStatus(status) {
  return status === "Full Scholarship" || status === "Full_Scholarship";
}

export function isPartialScholarshipStatus(status) {
  return status === "Partial Scholarship" || status === "Partial_Scholarship";
}

export function grantsAccessWithoutPayment(status) {
  return isFullScholarshipStatus(status) || status === "Sponsorship";
}

export async function getStudentPaymentRecords(prisma, studentId) {
  if (!studentId) return [];
  return prisma.payments.findMany({
    where: { student_id: studentId },
    orderBy: { created_at: "desc" },
    select: { amount: true, status: true, created_at: true, method: true },
  });
}

export function isConfirmedPayment(payment) {
  if (!payment) return false;
  const amount = Number(payment.amount);
  const status = String(payment.status || "").toLowerCase();
  if (status === "pending") return false;
  if (amount > 0 && ["paid", "completed", "partial"].includes(status)) return true;
  // Registration waafi / evc micro-payments
  if (amount > 0 && status === "paid") return true;
  return false;
}

export async function studentHasPaidTransaction(prisma, studentId) {
  const payments = await getStudentPaymentRecords(prisma, studentId);
  return payments.some(isConfirmedPayment);
}

function paidUntilFromPayment(payment, months = 1) {
  const base = payment?.created_at ? new Date(payment.created_at) : new Date();
  const paidUntil = addMonths(base, months);
  paidUntil.setHours(23, 59, 59, 999);
  return paidUntil;
}

/**
 * Resolve course access from DB state + payments.
 * - Partial discount ONLY: no payment → strip paid_until (expired).
 * - Paid / partial-with-payment: backfill paid_until from registration payment if missing.
 * - Full scholarship / sponsorship: unchanged.
 */
export async function resolveStudentAccessState(prisma, student, { persist = false } = {}) {
  if (!student?.student_id) return formatStudentFundingForApi(student);

  const formatted = formatStudentFundingForApi(student);
  const status = formatted.funding_status;
  const updates = {};

  if (grantsAccessWithoutPayment(status)) {
    return formatted;
  }

  if (isPartialScholarshipStatus(status)) {
    const payments = await getStudentPaymentRecords(prisma, student.student_id);
    const confirmed = payments.find(isConfirmedPayment);

    if (!confirmed) {
      if (formatted.paid_until != null) updates.paid_until = null;
      const result = { ...formatted, paid_until: updates.paid_until ?? null };
      if (persist && "paid_until" in updates) {
        await prisma.students.update({
          where: { student_id: student.student_id },
          data: { paid_until: null },
        });
      }
      return result;
    }

    if (!formatted.paid_until) {
      const paidUntil = paidUntilFromPayment(confirmed, 1);
      updates.paid_until = paidUntil;
      formatted.paid_until = paidUntil;
    }
  } else if (status === "Paid") {
    if (!formatted.paid_until) {
      const payments = await getStudentPaymentRecords(prisma, student.student_id);
      const confirmed = payments.find(isConfirmedPayment);
      if (confirmed) {
        const paidUntil = paidUntilFromPayment(confirmed, 1);
        updates.paid_until = paidUntil;
        formatted.paid_until = paidUntil;
      }
    }
  }

  if (persist && Object.keys(updates).length > 0) {
    await prisma.students.update({
      where: { student_id: student.student_id },
      data: updates,
    });
  }

  return formatted;
}

/** @deprecated use resolveStudentAccessState */
export async function enforcePartialDiscountAccessRules(prisma, student, options = {}) {
  return resolveStudentAccessState(prisma, student, options);
}

export function applyStudentDiscount(baseAmount, student) {
  const amount = Number(baseAmount || 0);
  if (!student) return amount;
  if (isFullScholarshipStatus(student.funding_status)) return 0;
  if (isPartialScholarshipStatus(student.funding_status) && student.scholarship_percentage) {
    return amount * (1 - Number(student.scholarship_percentage) / 100);
  }
  return amount;
}

export function addMonths(baseDate, months = 1) {
  const d = new Date(baseDate);
  d.setMonth(d.getMonth() + Number(months || 1));
  return d;
}

/** Extend paid_until from today (if expired) or from current paid_until (if still active). */
export function computeNewPaidUntil(currentPaidUntil, durationMonths = 1) {
  const now = new Date();
  const current = currentPaidUntil ? new Date(currentPaidUntil) : null;
  const baseDate = current && current > now ? current : now;
  const newPaidUntil = addMonths(baseDate, durationMonths);
  newPaidUntil.setHours(23, 59, 59, 999);
  return newPaidUntil;
}

export function calculateUpgradePrice(student, program, pkg) {
  const durationMonths = parseInt(pkg?.duration_months, 10) || 1;
  const monthly = getEffectiveMonthlyPrice(program);
  const baseTotal = monthly * durationMonths;
  const payableAmount = Number(applyStudentDiscount(baseTotal, student).toFixed(2));
  return {
    durationMonths,
    monthly,
    baseTotal: Number(baseTotal.toFixed(2)),
    payableAmount,
  };
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
  if (funding_status === "Full Scholarship" || funding_status === "Full_Scholarship") return 12;
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

  if (isFullScholarshipStatus(funding_status)) return 0;

  let total = monthly * months;
  if (isPartialScholarshipStatus(funding_status) && scholarship_percentage) {
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
