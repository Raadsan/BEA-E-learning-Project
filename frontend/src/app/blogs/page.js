import Header from "@/components/Header";
import Blogs from "@/components/Blogs";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Blog | BEA - Blueprint English Academy",
  description: "BEA Blog - Insights, tips, and stories to help you on your English learning journey.",
};

export default function BlogsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Blogs />
      </main>
      <Footer />
    </div>
  );
}

