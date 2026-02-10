"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { API_URL, API_BASE_URL } from "@/constants";

export default function Testimonials() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const { isDarkMode } = useTheme();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [loading]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        console.log("[Testimonials] Fetching data...");
        const response = await fetch(`${API_URL}/testimonials`);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        console.log(`[Testimonials] Received ${data.length} items`);
        setTestimonials(data);
      } catch (err) {
        console.error("Error fetching testimonials:", err);
        // Fallback or empty state
        setTestimonials([
          {
            id: 1,
            quote: "EnglishMaster transformed my career! I went from struggling with presentations to confidently leading international meetings.",
            student_name: "Mohamed",
            student_role: "IELTS Exam preparation student",
            initials: "MO",
            rating: 5
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  return (
    <section ref={sectionRef} className={`py-12 sm:py-16 lg:py-20 overflow-hidden min-h-[300px] ${isDarkMode ? 'bg-[#04003a]' : 'bg-gray-100'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            <div className={`text-center mb-8 sm:mb-12 lg:mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-2 sm:mb-3" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
                What Our Students Say
              </h2>
              <p className={`text-sm sm:text-base lg:text-lg px-4 sm:px-0 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                Join thousands of successful learners who achieved their English goals with us.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  className={`rounded-lg p-4 sm:p-5 md:p-6 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'
                    } ${isDarkMode ? 'bg-[#050040]' : 'bg-white'}`}
                  style={{ animationDelay: `${0.2 + index * 0.15}s` }}
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-3 sm:mb-4">
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

                  {/* Quote */}
                  <p className={`text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
                    &quot;{testimonial.quote}&quot;
                  </p>

                  {/* Student Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden border border-blue-500/20">
                      {testimonial.image_url ? (
                        <img
                          src={resolveMediaUrl(testimonial.image_url)}
                          alt={testimonial.student_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<span class="text-white font-semibold text-sm">${testimonial.student_name.substring(0, 2).toUpperCase()}</span>`;
                          }}
                        />
                      ) : (
                        <span className="text-white font-semibold text-sm">
                          {testimonial.student_name.substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: isDarkMode ? '#ffffff' : '#010080' }}>
                        {testimonial.student_name}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-white/80' : 'text-gray-600'}`}>
                        {testimonial.student_role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}


