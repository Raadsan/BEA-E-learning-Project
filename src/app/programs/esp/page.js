import Header from "@/components/Header";
import ESPProgram from "@/components/ESPProgram";
import Footer from "@/components/Footer";

export default function ESPProgramPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <ESPProgram />
      </main>
      <Footer />
    </div>
  );
}

