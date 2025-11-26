import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Introduction from "@/components/Introduction";
import WhatMakesUsSpecial from "@/components/WhatMakesUsSpecial";
import CountdownTimer from "@/components/CountdownTimer";
import PopularCourses from "@/components/PopularCourses";
import CourseTimeline from "@/components/CourseTimeline";
import FeaturedVideo from "@/components/FeaturedVideo";
import ProgramCards from "@/components/ProgramCards";
import FAQ from "@/components/FAQ";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Introduction />
      <WhatMakesUsSpecial />
      <CountdownTimer />
      <PopularCourses />
      <CourseTimeline />
      <FeaturedVideo />
      <ProgramCards />
      <FAQ />
      <Testimonials />
      <Newsletter />
      <Footer />
    </div>
  );
}
