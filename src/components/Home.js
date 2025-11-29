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

export default function Home() {
  return (
    <>
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
    </>
  );
}

