import Header from "@/components/Header";
import BEAValues from "@/components/BEAValues";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function BEAValuesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <BEAValues />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

