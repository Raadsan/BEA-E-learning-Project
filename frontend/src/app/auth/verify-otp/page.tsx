import { Suspense } from "react";
import VerifyOtpPage from "@/components/VerifyOtpPage";

export default function VerifyOtp() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyOtpPage />
    </Suspense>
  );
}
