import Header from "@/components/Header";
import PolicyPageBody from "@/components/policies/PolicyPageBody";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export const metadata = {
  title: "Terms and Conditions | BEA - Blueprint English Academy",
  description: "BEA Terms and Conditions - Read our terms and conditions for using BEA services.",
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <PolicyPageBody slug="terms-and-conditions" systemOnly />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

