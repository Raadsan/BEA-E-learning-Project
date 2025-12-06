import Header from "@/components/Header";
import ProfessionalSkillsProgram from "@/components/ProfessionalSkillsProgram";
import Footer from "@/components/Footer";

export default function ProfessionalSkillsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <ProfessionalSkillsProgram />
      </main>
      <Footer />
    </div>
  );
}

