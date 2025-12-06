import Header from "@/components/Header";
import IELTSTOEFLRegistrationPage from "@/components/IELTSTOEFLRegistrationPage";
import Footer from "@/components/Footer";

export default function IELTSTOEFLRegistrationRoute() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <IELTSTOEFLRegistrationPage />
      </main>
      <Footer />
    </div>
  );
}

