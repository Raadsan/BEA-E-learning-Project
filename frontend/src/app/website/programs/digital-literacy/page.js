import Header from "@/components/Header";
import DigitalLiteracyProgram from "@/components/DigitalLiteracyProgram";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function DigitalLiteracyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <DigitalLiteracyProgram />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

