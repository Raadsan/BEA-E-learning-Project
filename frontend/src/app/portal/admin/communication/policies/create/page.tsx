import { redirect } from "next/navigation";

export default function CreatePolicyPage() {
    redirect("/portal/admin/communication/policies?openCreate=1");
}
