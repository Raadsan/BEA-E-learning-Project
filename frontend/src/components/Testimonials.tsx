"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { API_URL, resolveMediaUrl } from "@/constants";

type Testimonial = {
  id: number;
  quote: string;
  student_name: string;
  student_role?: string;
  image_url?: string;
  rating?: number;
};

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <article className="relative flex w-full min-w-full flex-shrink-0 snap-center flex-col items-center overflow-hidden rounded-xl border border-gray-200 bg-white px-6 pb-8 pt-36 text-center sm:px-8">
      <span className="pointer-events-none absolute -left-2 -top-12 font-serif text-[210px] leading-none text-white/[0.07]">
        “
      </span>
      <div className="absolute right-5 top-5 flex gap-1.5" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-[#010080]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#010080]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#010080]" />
      </div>

      <div className="absolute left-1/2 top-6 h-24 w-24 -translate-x-1/2 overflow-hidden rounded-full border-4 border-[#010080] bg-[#010080]">
        {testimonial.image_url ? (
          <img
            src={resolveMediaUrl(testimonial.image_url) || ""}
            alt={testimonial.student_name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">
            {testimonial.student_name.substring(0, 2).toUpperCase()}
          </span>
        )}
      </div>

      <div className="mb-5 flex gap-1" aria-label={`${testimonial.rating || 5} out of 5 stars`}>
        {[...Array(testimonial.rating || 5)].map((_, index) => (
          <svg key={index} className="h-5 w-5 text-[#010080]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      <p className="relative z-10 mb-6 min-h-[7.5rem] text-sm leading-7 text-gray-700 sm:text-base">
        “{testimonial.quote}”
      </p>
      <div className="mt-auto">
        <p className="font-serif text-lg font-bold text-[#010080]">— {testimonial.student_name} —</p>
        {testimonial.student_role && <p className="mt-1 text-xs text-gray-500 sm:text-sm">{testimonial.student_role}</p>}
      </div>
    </article>
  );
}

export default function Testimonials() {
  const [isVisible, setIsVisible] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef<HTMLElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useTheme();

  const moveSlider = useCallback((direction: 1 | -1 = 1) => {
    const slider = sliderRef.current;
    if (!slider || slider.children.length < 2) return;

    const card = slider.children[0] as HTMLElement;
    const step = card.offsetWidth;
    const atEnd = slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - step / 2;
    const atStart = slider.scrollLeft <= step / 2;

    if (direction === 1 && atEnd) {
      slider.scrollTo({ left: 0, behavior: "smooth" });
    } else if (direction === -1 && atStart) {
      slider.scrollTo({ left: slider.scrollWidth, behavior: "smooth" });
    } else {
      slider.scrollBy({ left: step * direction, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setIsVisible(true), { threshold: 0.1 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [loading]);

  useEffect(() => {
    if (loading || testimonials.length < 2) return;
    const autoScroll = window.setInterval(() => moveSlider(1), 4000);
    return () => window.clearInterval(autoScroll);
  }, [loading, moveSlider, testimonials.length]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchTestimonials = async () => {
      try {
        const response = await fetch(`${API_URL}/testimonials`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          setTestimonials([]);
          return;
        }

        const data = await response.json();
        setTestimonials(Array.isArray(data) ? data : []);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          setTestimonials([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchTestimonials();

    return () => controller.abort();
  }, []);

  if (!loading && testimonials.length === 0) {
    return null;
  }

  return (
    <section ref={sectionRef} className={`overflow-hidden py-12 sm:py-16 lg:py-20 ${isDarkMode ? "bg-[#04003a]" : "bg-white"}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`mb-9 text-center transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}>
          <p className={`mb-2 text-xs font-bold uppercase tracking-[0.3em] ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}>
            Student success stories
          </p>
          <h2 className={`font-serif text-3xl font-bold sm:text-4xl lg:text-5xl ${isDarkMode ? "text-white" : "text-[#010080]"}`}>
            What Our Students Say
          </h2>
          <p className={`mx-auto mt-3 max-w-2xl text-sm sm:text-base ${isDarkMode ? "text-white/80" : "text-gray-600"}`}>
            Real stories from learners who are achieving their English language goals with BEA.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#010080]" /></div>
        ) : (
          <div className={`relative mx-auto max-w-[390px] transition-opacity duration-700 ${isVisible ? "opacity-100" : "opacity-0"}`}>
            <div
              ref={sliderRef}
              className="flex w-full snap-x snap-mandatory overflow-x-auto pb-5 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {testimonials.map((testimonial) => <TestimonialCard key={testimonial.id} testimonial={testimonial} />)}
            </div>

            {testimonials.length > 1 && (
              <div className="mt-3 flex justify-center gap-3">
                <button onClick={() => moveSlider(-1)} aria-label="Previous testimonial" className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#010080] text-xl text-[#010080] transition-colors hover:bg-[#010080] hover:text-white">←</button>
                <button onClick={() => moveSlider(1)} aria-label="Next testimonial" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#010080] text-xl text-white transition-colors hover:bg-blue-900">→</button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
