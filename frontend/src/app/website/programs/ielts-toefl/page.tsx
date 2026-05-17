import Header from "@/components/Header";
import IELTSTOEFLProgram from "@/components/IELTSTOEFLProgram";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function IELTSTOEFLPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <IELTSTOEFLProgram />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

