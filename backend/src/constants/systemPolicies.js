export const SYSTEM_POLICY_SLUGS = [
    'data-policy',
    'copyright-policy',
    'student-code-of-conduct',
    'payment-refund-policy',
    'student-engagement-policy',
    'terms-and-conditions',
];

export const isSystemPolicySlug = (slug) => SYSTEM_POLICY_SLUGS.includes(slug);

export const withPolicyMeta = (policy) => ({
    ...policy,
    is_system: isSystemPolicySlug(policy.slug),
});
