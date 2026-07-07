import Header from "@/components/Header";
import PolicyPageBody from "@/components/policies/PolicyPageBody";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export const metadata = {
  title: "Data Policy | BEA - Blueprint English Academy",
  description: "BEA Data Policy - Learn how we collect, manage, protect, and dispose of your personal data.",
};

export default function DataPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <PolicyPageBody slug="data-policy" systemOnly />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

