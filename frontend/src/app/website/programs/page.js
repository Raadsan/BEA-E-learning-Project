import Header from "@/components/Header";
import ProgramsPage from "@/components/ProgramsPage";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Programs() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <ProgramsPage />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

