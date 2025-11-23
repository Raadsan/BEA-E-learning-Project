import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Introduction from "@/components/Introduction";
import CountdownTimer from "@/components/CountdownTimer";
import CourseTimeline from "@/components/CourseTimeline";
import FeaturedVideo from "@/components/FeaturedVideo";
import ProgramCards from "@/components/ProgramCards";
import FAQ from "@/components/FAQ";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Introduction />
      <CountdownTimer />
      <CourseTimeline />
      <FeaturedVideo />
      <ProgramCards />
      <FAQ />
      <Newsletter />
      <Footer />
    </div>
  );
}
