import { redirect } from "next/navigation";

export default async function EditPolicyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    redirect(`/portal/admin/communication/policies?edit=${id}`);
}
