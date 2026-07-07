export type PolicySlug =
  | "data-policy"
  | "copyright-policy"
  | "student-code-of-conduct"
  | "payment-refund-policy"
  | "student-engagement-policy"
  | "terms-and-conditions";

export const SYSTEM_POLICY_SLUGS: PolicySlug[] = [
  "data-policy",
  "copyright-policy",
  "student-code-of-conduct",
  "payment-refund-policy",
  "student-engagement-policy",
  "terms-and-conditions",
];

/** @deprecated use SYSTEM_POLICY_SLUGS */
export const LEGACY_POLICY_SLUGS = SYSTEM_POLICY_SLUGS;

export function isSystemPolicy(slug: string) {
  return SYSTEM_POLICY_SLUGS.includes(slug as PolicySlug);
}

export function policyWebsitePath(slug: string) {
  if (SYSTEM_POLICY_SLUGS.includes(slug as PolicySlug)) {
    return `/website/${slug}`;
  }
  return `/website/policies/${slug}`;
}

export function slugifyPolicyTitle(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
