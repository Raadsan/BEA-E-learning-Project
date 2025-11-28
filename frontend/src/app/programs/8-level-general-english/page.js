import Header from "@/components/Header";
import GeneralEnglishCourse from "@/components/GeneralEnglishCourse";
import Footer from "@/components/Footer";

export default function GeneralEnglishCoursePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <GeneralEnglishCourse />
      </main>
      <Footer />
    </div>
  );
}

