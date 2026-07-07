"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import PolicyContent from "@/components/policies/PolicyContent";
import PolicyHtmlContent from "@/components/policies/PolicyHtmlContent";
import PolicyStructuredContent from "@/components/policies/PolicyStructuredContent";
import { isSystemPolicy, type PolicySlug } from "@/constants/policies";
import { useGetPolicyBySlugQuery } from "@/lib/api/policyApi";
import { parseStructuredPolicyContent } from "@/utils/policyContent";

export default function PolicyPageBody({
  slug,
  systemOnly = false,
}: {
  slug: string;
  systemOnly?: boolean;
}) {
  const { data: policy, isLoading, isError } = useGetPolicyBySlugQuery(slug);

  if (systemOnly && !isSystemPolicy(slug)) {
    return (
      <div className="p-10 text-center text-gray-500">
        Policy not found.
      </div>
    );
  }

  if (policy?.status === "inactive") {
    return (
      <div className="p-10 text-center text-gray-500">
        This policy is not currently available.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  const structuredContent = parseStructuredPolicyContent(policy?.content);

  if (structuredContent) {
    return (
      <PolicyStructuredContent
        title={policy?.title}
        description={policy?.description}
        content={structuredContent}
      />
    );
  }

  if (policy?.content?.trim()) {
    return <PolicyHtmlContent content={policy.content} title={policy.title} />;
  }

  if (policy) {
    return <PolicyHtmlContent content="<p>This policy has no content yet.</p>" title={policy.title} />;
  }

  if (isSystemPolicy(slug)) {
    return <PolicyContent slug={slug as PolicySlug} />;
  }

  if (isError) {
    return (
      <div className="p-10 text-center text-gray-500">
        Policy not found.
      </div>
    );
  }

  return (
    <div className="p-10 text-center text-gray-500">
      Policy not found.
    </div>
  );
}
