import Header from "@/components/Header";
import RationalValues from "@/components/RationalValues";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function RationalValuesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <RationalValues />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

