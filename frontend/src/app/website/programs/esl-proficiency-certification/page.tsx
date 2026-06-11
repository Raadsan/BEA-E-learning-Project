import Header from "@/components/Header";
import EslProficiencyProgram from "@/components/EslProficiencyProgram";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function EslProficiencyCertificationPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <EslProficiencyProgram />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
