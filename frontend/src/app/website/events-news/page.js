import Header from "@/components/Header";
import EventsNews from "@/components/EventsNews";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export const metadata = {
  title: "Events & News | BEA - Blueprint English Academy",
  description: "BEA Events & News - Stay updated with the latest happenings at Blueprint English Academy.",
};

export default function EventsNewsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <EventsNews />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

