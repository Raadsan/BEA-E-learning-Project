"use client";

export type PolicySection = {
  id: string;
  numberLabel?: string;
  title: string;
  body: string;
  note?: string;
};

export type StructuredPolicyContent = {
  policyName: string;
  sections: PolicySection[];
};

export function createEmptyPolicySection(index = 0): PolicySection {
  return {
    id: `section-${Date.now()}-${index}`,
    numberLabel: "",
    title: "",
    body: "",
    note: "",
  };
}

export function createDefaultStructuredPolicyContent(): StructuredPolicyContent {
  return {
    policyName: "",
    sections: [createEmptyPolicySection()],
  };
}

export function parseStructuredPolicyContent(rawContent?: string | null): StructuredPolicyContent | null {
  if (!rawContent?.trim()) return null;

  try {
    const parsed = JSON.parse(rawContent);
    if (!parsed || typeof parsed !== "object") return null;

    const policyName = typeof parsed.policyName === "string" ? parsed.policyName : "";
    const sections = Array.isArray(parsed.sections)
      ? parsed.sections.map((section: any, index: number) => ({
          id: typeof section?.id === "string" ? section.id : `section-${index}`,
          numberLabel: typeof section?.numberLabel === "string" ? section.numberLabel : "",
          title: typeof section?.title === "string" ? section.title : "",
          body: typeof section?.body === "string" ? section.body : "",
          note: typeof section?.note === "string" ? section.note : "",
        }))
      : [];

    return {
      policyName,
      sections: sections.length > 0 ? sections : [createEmptyPolicySection()],
    };
  } catch {
    return null;
  }
}

export function stringifyStructuredPolicyContent(content: StructuredPolicyContent): string {
  return JSON.stringify({
    policyName: content.policyName,
    sections: content.sections.map((section) => ({
      id: section.id,
      numberLabel: section.numberLabel || "",
      title: section.title,
      body: section.body,
      note: section.note || "",
    })),
  });
}
