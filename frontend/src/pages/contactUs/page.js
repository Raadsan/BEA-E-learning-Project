import Header from "@/components/Header";
import ContactUs from "@/components/ContactUs";
import Footer from "@/components/Footer";

export default function ContactUsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <ContactUs />
      </main>
      <Footer />
    </div>
  );
}

