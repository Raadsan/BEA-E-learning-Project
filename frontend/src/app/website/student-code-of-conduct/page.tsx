import Header from "@/components/Header";
import PolicyPageBody from "@/components/policies/PolicyPageBody";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export const metadata = {
  title: "Student Code of Conduct | BEA - Blueprint English Academy",
  description: "BEA Student Code of Conduct - Guidelines for a respectful, engaging, and productive learning environment.",
};

export default function StudentCodeOfConductPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <PolicyPageBody slug="student-code-of-conduct" systemOnly />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

