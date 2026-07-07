"use client";

import DataPolicy from "@/components/DataPolicy";
import CopyrightPolicy from "@/components/CopyrightPolicy";
import StudentCodeOfConduct from "@/components/StudentCodeOfConduct";
import PaymentRefundPolicy from "@/components/PaymentRefundPolicy";
import StudentEngagementPolicy from "@/components/StudentEngagementPolicy";
import TermsAndConditions from "@/components/TermsAndConditions";
import type { PolicySlug } from "@/constants/policies";

export default function PolicyContent({ slug }: { slug: PolicySlug }) {
  switch (slug) {
    case "data-policy":
      return <DataPolicy />;
    case "copyright-policy":
      return <CopyrightPolicy />;
    case "student-code-of-conduct":
      return <StudentCodeOfConduct />;
    case "payment-refund-policy":
      return <PaymentRefundPolicy />;
    case "student-engagement-policy":
      return <StudentEngagementPolicy />;
    case "terms-and-conditions":
      return <TermsAndConditions />;
    default:
      return null;
  }
}
