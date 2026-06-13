"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

function TestimonialCard({
  testimonial,
  isDarkMode,
}: {
  testimonial: Testimonial;
  isDarkMode: boolean;
}) {
  return (
    <article
      className={`flex-shrink-0 w-[300px] sm:w-[340px] md:w-[380px] rounded-xl p-5 sm:p-6 shadow-md ${
        isDarkMode ? "bg-[#050040]" : "bg-white"
      }`}
    >
      <div className="flex gap-1 mb-4">
        {[...Array(testimonial.rating || 5)].map((_, i) => (
          <svg
            key={i}
            className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      <p
        className={`text-sm leading-relaxed mb-6 line-clamp-5 min-h-[6.5rem] ${
          isDarkMode ? "text-white" : "text-gray-700"
        }`}
      >
        &quot;{testimonial.quote}&quot;
      </p>

      <div className="flex items-center gap-3 mt-auto">
        <div className="w-11 h-11 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border border-blue-500/20">
          {testimonial.image_url ? (
            <img
              src={resolveMediaUrl(testimonial.image_url) || ""}
              alt={testimonial.student_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-semibold text-sm">
              {testimonial.student_name.substring(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p
            className="font-bold text-sm truncate"
            style={{ color: isDarkMode ? "#ffffff" : "#010080" }}
          >
            {testimonial.student_name}
          </p>
          <p
            className={`text-xs truncate ${
              isDarkMode ? "text-white/80" : "text-gray-600"
            }`}
          >
            {testimonial.student_role}
          </p>
        </div>
      </div>
    </article>
  );
}

function buildMarqueeItems(items: Testimonial[], offset = 0) {
  if (items.length === 0) return [];
  const rotated = [...items.slice(offset), ...items.slice(0, offset)];
  const minItems = Math.max(rotated.length, 4);
  const repeated: Testimonial[] = [];
  while (repeated.length < minItems * 2) {
    repeated.push(...rotated);
  }
  return [...repeated, ...repeated];
}

function TestimonialsMarqueeRow({
  items,
  isDarkMode,
  direction = "left",
}: {
  items: Testimonial[];
  isDarkMode: boolean;
  direction?: "left" | "right";
}) {
  return (
    <div className="overflow-hidden testimonials-marquee-wrap">
      <div
        className={`flex gap-5 sm:gap-6 px-4 sm:px-6 ${
          direction === "right"
            ? "testimonials-marquee-track-reverse"
            : "testimonials-marquee-track"
        }`}
      >
        {items.map((testimonial, index) => (
          <TestimonialCard
            key={`${direction}-${testimonial.id}-${index}`}
            testimonial={testimonial}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>
    </div>
  );
}

export default function Testimonials() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const { isDarkMode } = useTheme();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const { topRowItems, bottomRowItems } = useMemo(() => {
    if (testimonials.length === 0) {
      return { topRowItems: [], bottomRowItems: [] };
    }
    const midpoint = Math.ceil(testimonials.length / 2);
    return {
      topRowItems: buildMarqueeItems(testimonials, 0),
      bottomRowItems: buildMarqueeItems(testimonials, midpoint),
    };
  }, [testimonials]);

  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [loading]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch(`${API_URL}/testimonials`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setTestimonials(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching testimonials:", err);
        setTestimonials([
          {
            id: 1,
            quote:
              "EnglishMaster transformed my career! I went from struggling with presentations to confidently leading international meetings.",
            student_name: "Mohamed",
            student_role: "IELTS Exam preparation student",
            rating: 5,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`py-12 sm:py-16 lg:py-20 overflow-hidden min-h-[300px] ${
        isDarkMode ? "bg-[#04003a]" : "bg-gray-100"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12">
        <div
          className={`text-center ${
            isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}
        >
          <h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-2 sm:mb-3"
            style={{ color: isDarkMode ? "#ffffff" : "#010080" }}
          >
            What Our Students Say
          </h2>
          <p
            className={`text-sm sm:text-base lg:text-lg px-4 sm:px-0 ${
              isDarkMode ? "text-white" : "text-gray-700"
            }`}
          >
            Join thousands of successful learners who achieved their English
            goals with us.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div
          className={`relative ${isVisible ? "opacity-100" : "opacity-0"} transition-opacity duration-700`}
        >
          <div
            className={`pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-24 z-10 ${
              isDarkMode
                ? "bg-gradient-to-r from-[#04003a] to-transparent"
                : "bg-gradient-to-r from-gray-100 to-transparent"
            }`}
          />
          <div
            className={`pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-24 z-10 ${
              isDarkMode
                ? "bg-gradient-to-l from-[#04003a] to-transparent"
                : "bg-gradient-to-l from-gray-100 to-transparent"
            }`}
          />

          <div className="space-y-5 sm:space-y-6">
            <TestimonialsMarqueeRow
              items={topRowItems}
              isDarkMode={isDarkMode}
              direction="left"
            />
            <TestimonialsMarqueeRow
              items={bottomRowItems}
              isDarkMode={isDarkMode}
              direction="right"
            />
          </div>
        </div>
      )}
    </section>
  );
}
