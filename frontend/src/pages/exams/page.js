import Header from "@/components/Header";
import BEAExams from "@/components/BEAExams";
import Footer from "@/components/Footer";

export default function ExamsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <BEAExams />
      </main>
      <Footer />
    </div>
  );
}

