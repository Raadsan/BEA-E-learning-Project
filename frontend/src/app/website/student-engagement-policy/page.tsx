import Header from "@/components/Header";
import PolicyPageBody from "@/components/policies/PolicyPageBody";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export const metadata = {
  title: "Student Engagement Policy | BEA - Blueprint English Academy",
  description: "BEA Student Engagement Policy - Learn about our expectations, responsibilities, and standards for meaningful engagement in all BEA programs.",
};

export default function StudentEngagementPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <PolicyPageBody slug="student-engagement-policy" systemOnly />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

