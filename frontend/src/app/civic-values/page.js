import Header from "@/components/Header";
import CivicValues from "@/components/CivicValues";
import Footer from "@/components/Footer";

export default function CivicValuesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <CivicValues />
      </main>
      <Footer />
    </div>
  );
}

