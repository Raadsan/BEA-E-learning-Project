import Header from "@/components/Header";
import PedagogicalValues from "@/components/PedagogicalValues";
import Footer from "@/components/Footer";

export default function PedagogicalValuesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <PedagogicalValues />
      </main>
      <Footer />
    </div>
  );
}

