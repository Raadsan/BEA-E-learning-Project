"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditProficiencyTestPage() {
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      router.replace(`/portal/admin/assessments/proficiency-tests/create?id=${id}`);
    }
  }, [id, router]);

  return <div className="p-8 text-center text-gray-500">Opening proficiency test editor...</div>;
}
