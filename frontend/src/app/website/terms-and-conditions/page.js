import Header from "@/components/Header";
import TermsAndConditions from "@/components/TermsAndConditions";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Terms and Conditions | BEA - Blueprint English Academy",
  description: "BEA Terms and Conditions - Read our terms and conditions for using BEA services.",
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <TermsAndConditions />
      </main>
      <Footer />
    </div>
  );
}

