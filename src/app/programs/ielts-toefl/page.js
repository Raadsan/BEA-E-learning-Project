import Header from "@/components/Header";
import IELTSTOEFLProgram from "@/components/IELTSTOEFLProgram";
import Footer from "@/components/Footer";

export default function IELTSTOEFLPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <IELTSTOEFLProgram />
      </main>
      <Footer />
    </div>
  );
}

