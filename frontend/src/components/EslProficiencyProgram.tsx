"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { useGetProgramsQuery } from "@/lib/api/programApi";
import { findProficiencyCertificationProgram } from "@/utils/programCatalog";

export default function EslProficiencyProgram() {
  const { isDarkMode } = useTheme();
  const { data: programs = [] } = useGetProgramsQuery();
  const program = findProficiencyCertificationProgram(programs);
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({});
  const sectionRefs = {
    hero: useRef<HTMLElement>(null),
    intro: useRef<HTMLElement>(null),
    register: useRef<HTMLElement>(null),
  };

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    Object.entries(sectionRefs).forEach(([key, ref]) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => ({ ...prev, [key]: true }));
          }
        },
        { threshold: 0.1 }
      );
      if (ref.current) observer.observe(ref.current);
      observers.push(observer);
    });
    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  const title = program?.title || "ESL Proficiency Certification Program";
  const description =
    program?.description ||
    "The ESL Proficiency Certification Program is a structured, competency-based English language program designed to equip learners with practical, academic, and professional English skills.";

  const objectives = [
    "Develop listening, speaking, reading, and writing proficiency",
    "Strengthen grammar accuracy, vocabulary range, and pronunciation",
    "Build confidence in academic, workplace, and social communication",
    "Prepare students for further studies, standardized tests, and professional environments",
    "Provide a recognized certification that reflects demonstrated language competence",
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-[#03002e]" : "bg-white"}`}>
      <section
        ref={sectionRefs.hero}
        className="relative overflow-hidden h-[350px] sm:h-[420px] lg:h-[500px]"
        style={{
          background: isDarkMode
            ? "linear-gradient(135deg, #03002e 0%, #050040 50%, #010080 100%)"
            : "linear-gradient(135deg, #010080 0%, #311b92 50%, #6766B3 100%)",
        }}
      >
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`max-w-2xl ${visibleSections.hero ? "animate-fade-in-left" : "opacity-0"}`}>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white leading-tight">
                {title}
              </h1>
              <p className="mt-4 text-sm sm:text-base text-white/90">
                Earn formal recognition of your English language mastery through BEA&apos;s competency-based certification pathway.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section ref={sectionRefs.intro} className={`py-8 sm:py-12 overflow-hidden ${isDarkMode ? "bg-[#03002e]" : "bg-white"}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <p
              className={`text-base sm:text-lg leading-relaxed whitespace-pre-line ${visibleSections.intro ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ color: isDarkMode ? "#ffffff" : "#010080" }}
            >
              {description}
            </p>

            <div className={`${visibleSections.intro ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "0.1s" }}>
              <h2 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: isDarkMode ? "#ffffff" : "#010080" }}>
                Program Objectives
              </h2>
              <ul className={`space-y-3 text-sm sm:text-base ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                {objectives.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="text-red-500 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section ref={sectionRefs.register} className={`py-10 sm:py-14 lg:py-16 overflow-hidden ${isDarkMode ? "bg-[#04003a]" : "bg-gray-50"}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <p
              className={`text-sm sm:text-base leading-relaxed mb-8 ${visibleSections.register ? "animate-fade-in-up" : "opacity-0"}`}
              style={{ color: isDarkMode ? "#ffffff" : "#010080" }}
            >
              Ready to certify your English proficiency? Register for the BEA Proficiency Certification program and complete your assessment to earn your certificate.
            </p>
            <div className={`${visibleSections.register ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "0.1s" }}>
              <Link
                href="/auth/proficiency-test-registration"
                className={`px-8 py-3 rounded-full font-semibold text-sm sm:text-base transition-all duration-300 hover:scale-105 inline-block header-keep-white ${
                  isDarkMode ? "bg-white hover:bg-gray-100" : "bg-blue-800 text-white hover:bg-blue-900"
                }`}
                style={isDarkMode ? { color: "#010080" } : {}}
              >
                Register Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
