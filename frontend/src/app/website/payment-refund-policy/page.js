import Header from "@/components/Header";
import PaymentRefundPolicy from "@/components/PaymentRefundPolicy";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Payment & Refund Policy | BEA - Blueprint English Academy",
  description: "BEA Payment & Refund Policy - Learn about tuition fees, payment instructions, and refund policies.",
};

export default function PaymentRefundPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <PaymentRefundPolicy />
      </main>
      <Footer />
    </div>
  );
}

