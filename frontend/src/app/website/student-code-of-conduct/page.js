import Header from "@/components/Header";
import StudentCodeOfConduct from "@/components/StudentCodeOfConduct";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Student Code of Conduct | BEA - Blueprint English Academy",
  description: "BEA Student Code of Conduct - Guidelines for a respectful, engaging, and productive learning environment.",
};

export default function StudentCodeOfConductPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <StudentCodeOfConduct />
      </main>
      <Footer />
    </div>
  );
}

