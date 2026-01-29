import Header from "@/components/Header";
import CopyrightPolicy from "@/components/CopyrightPolicy";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export const metadata = {
  title: "Copyright Policy | BEA - Blueprint English Academy",
  description: "BEA Copyright Policy - Learn about our intellectual property rights, brand guidelines, and content usage policies.",
};

export default function CopyrightPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <CopyrightPolicy /> 
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

