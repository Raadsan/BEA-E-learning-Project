export type PaymentType = "Paid" | "Sponsorship";
export type DiscountType = "none" | "partial" | "full";

export function splitFundingStatus(
  funding_status?: string,
  scholarship_percentage?: number | string | null
): { paymentType: PaymentType; discountType: DiscountType } {
  const status = funding_status?.replace(/_/g, " ");
  if (status === "Sponsorship") {
    return { paymentType: "Sponsorship", discountType: "none" };
  }
  if (status === "Full Scholarship") {
    return { paymentType: "Paid", discountType: "full" };
  }
  if (status === "Partial Scholarship") {
    return { paymentType: "Paid", discountType: "partial" };
  }
  return { paymentType: "Paid", discountType: "none" };
}

export function mergeFundingStatus(
  paymentType: PaymentType,
  discountType: DiscountType,
  scholarship_percentage?: number | string | null
): { funding_status: string; scholarship_percentage: string | number | null } {
  if (paymentType === "Sponsorship") {
    return { funding_status: "Sponsorship", scholarship_percentage: null };
  }
  if (discountType === "full") {
    return { funding_status: "Full Scholarship", scholarship_percentage: null };
  }
  if (discountType === "partial") {
    return {
      funding_status: "Partial Scholarship",
      scholarship_percentage: scholarship_percentage || "",
    };
  }
  return { funding_status: "Paid", scholarship_percentage: null };
}

export function effectiveFundingStatus(
  paymentType: PaymentType,
  discountType: DiscountType
): string {
  return mergeFundingStatus(paymentType, discountType).funding_status;
}
