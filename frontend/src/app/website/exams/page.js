import Header from "@/components/Header";
import BEAExams from "@/components/BEAExams";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function ExamsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <BEAExams />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

