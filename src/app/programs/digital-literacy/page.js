import Header from "@/components/Header";
import DigitalLiteracyProgram from "@/components/DigitalLiteracyProgram";
import Footer from "@/components/Footer";

export default function DigitalLiteracyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <DigitalLiteracyProgram />
      </main>
      <Footer />
    </div>
  );
}

