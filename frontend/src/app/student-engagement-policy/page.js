import Header from "@/components/Header";
import StudentEngagementPolicy from "@/components/StudentEngagementPolicy";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Student Engagement Policy | BEA - Blueprint English Academy",
  description: "BEA Student Engagement Policy - Learn about our expectations, responsibilities, and standards for meaningful engagement in all BEA programs.",
};

export default function StudentEngagementPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <StudentEngagementPolicy />
      </main>
      <Footer />
    </div>
  );
}

