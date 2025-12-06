import Header from "@/components/Header";
import StudentSupportCentre from "@/components/StudentSupportCentre";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Student Support Centre | BEA - Blueprint English Academy",
  description: "BEA Student Support Centre - Contact our admission, finance, virtual campus, and student affairs offices for assistance.",
};

export default function StudentSupportCentrePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <StudentSupportCentre />
      </main>
      <Footer />
    </div>
  );
}

