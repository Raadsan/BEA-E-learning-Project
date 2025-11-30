import Header from "@/components/Header";
import AcademicWritingProgram from "@/components/AcademicWritingProgram";
import Footer from "@/components/Footer";

export default function AcademicWritingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <AcademicWritingProgram />
      </main>
      <Footer />
    </div>
  );
}

