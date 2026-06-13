"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useGetNewsQuery } from "@/lib/api/newsApi";
import { resolveMediaUrl } from "@/constants";

type NewsEventRecord = {
  id: number;
  title: string;
  description?: string | null;
  event_date: string;
  image_url?: string | null;
  location?: string | null;
  type?: string | null;
  status?: string | null;
};

const EVENT_TYPES = new Set(["exam", "event", "deadline", "training"]);

const formatCardDate = (dateStr?: string | null) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const formatCategoryLabel = (type?: string | null) => {
  if (!type) return "NEWS";
  return type.replace(/_/g, " ").toUpperCase();
};

const DEFAULT_LOCATION = "BEA Campus, Mogadishu";

function NewsEventCard({
  item,
  isDarkMode,
  index,
  animate,
}: {
  item: NewsEventRecord;
  isDarkMode: boolean;
  index: number;
  animate: boolean;
}) {
  const imageSrc = item.image_url
    ? resolveMediaUrl(item.image_url) || item.image_url
    : null;

  return (
    <article
      className={`group flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        isDarkMode
          ? "bg-[#050040] border border-[#1a1a4e] shadow-lg shadow-black/20"
          : "bg-white border border-gray-200 shadow-md shadow-gray-200/60"
      } ${animate ? "animate-fade-in-up" : "opacity-0"}`}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <div
          className={`relative overflow-hidden rounded-xl aspect-[4/3] mb-4 ${
            isDarkMode ? "bg-[#0a0a4a]" : "bg-gray-100"
          }`}
        >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className={`w-full h-full flex items-center justify-center ${
              isDarkMode
                ? "bg-gradient-to-br from-[#1a1a6e] to-[#050040]"
                : "bg-gradient-to-br from-[#e8eaf6] to-[#c5cae9]"
            }`}
          >
            <svg
              className={`w-16 h-16 ${isDarkMode ? "text-white/30" : "text-[#010080]/30"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
              />
            </svg>
          </div>
        )}
        </div>

        <div className="flex items-center justify-between gap-3 mb-3">
        <span className="inline-flex items-center px-3 py-1 rounded-md text-[11px] font-bold tracking-wide text-white bg-[#7c3aed] uppercase">
          {formatCategoryLabel(item.type)}
        </span>
        <time
          dateTime={item.event_date}
          className={`text-sm whitespace-nowrap ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
        >
          {formatCardDate(item.event_date)}
        </time>
      </div>

      <h3
        className={`text-lg sm:text-xl font-bold leading-snug mb-3 line-clamp-2 ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
      >
        {item.title}
      </h3>

      {item.description && (
        <p
          className={`text-sm leading-relaxed mb-4 line-clamp-2 ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {item.description}
        </p>
      )}

      <div className="mt-auto flex items-start gap-1.5">
        <svg
          className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#e57373]"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
        </svg>
        <span className="text-sm font-medium text-[#e57373] uppercase tracking-wide leading-snug">
          {item.location || DEFAULT_LOCATION}
        </span>
      </div>
      </div>
    </article>
  );
}

export default function EventsNews() {
  const { isDarkMode } = useTheme();
  const { data: newsList, isLoading, isError } = useGetNewsQuery();
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<"upcoming" | "news">("upcoming");
  const sectionRefs = {
    hero: useRef<HTMLElement>(null),
    content: useRef<HTMLElement>(null),
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

  const { upcomingEvents, newsItems } = useMemo(() => {
    const items = (Array.isArray(newsList) ? newsList : []) as NewsEventRecord[];
    const active = items.filter((item) => item.status === "active");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const events = active
      .filter((item) => item.type && EVENT_TYPES.has(item.type))
      .filter((item) => new Date(item.event_date) >= today)
      .sort(
        (a, b) =>
          new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
      );

    const news = active
      .filter((item) => item.type === "news")
      .sort(
        (a, b) =>
          new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
      );

    return {
      upcomingEvents: events.slice(0, 5),
      newsItems: news.slice(0, 5),
    };
  }, [newsList]);

  const activeItems = activeTab === "upcoming" ? upcomingEvents : newsItems;
  const emptyMessage =
    activeTab === "upcoming"
      ? "No upcoming events at the moment. Check back soon."
      : "No news articles published yet.";

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-[#03002e]" : "bg-[#f5f5f7]"}`}>
      <section
        ref={sectionRefs.hero}
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          background: isDarkMode
            ? "linear-gradient(135deg, #03002e 0%, #050040 50%, #03002e 100%)"
            : "linear-gradient(135deg, #1a237e 0%, #311b92 50%, #b71c1c 100%)",
          minHeight: "200px",
          paddingTop: "40px",
          paddingBottom: "40px",
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            className={`text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 ${
              visibleSections.hero ? "animate-fade-in-down" : "opacity-0"
            }`}
          >
            Events & News
          </h1>
          <p
            className={`text-base sm:text-lg text-white/90 max-w-2xl mx-auto ${
              visibleSections.hero ? "animate-fade-in-up" : "opacity-0"
            }`}
          >
            Stay updated with the latest happenings at Blueprint English Academy
          </p>
        </div>
      </section>

      <section
        ref={sectionRefs.content}
        className={`py-12 sm:py-16 ${isDarkMode ? "bg-[#03002e]" : "bg-[#f5f5f7]"}`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div
            className={`flex justify-center gap-3 sm:gap-4 mb-10 sm:mb-14 ${
              visibleSections.content ? "animate-fade-in-up" : "opacity-0"
            }`}
          >
            <button
              type="button"
              onClick={() => setActiveTab("upcoming")}
              className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 ${
                activeTab === "upcoming"
                  ? isDarkMode
                    ? "bg-white text-[#010080]"
                    : "bg-[#010080] text-white shadow-md"
                  : isDarkMode
                    ? "bg-[#050040] text-gray-300 hover:bg-[#060050]"
                    : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm"
              }`}
            >
              Upcoming Events
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("news")}
              className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 ${
                activeTab === "news"
                  ? isDarkMode
                    ? "bg-white text-[#010080]"
                    : "bg-[#010080] text-white shadow-md"
                  : isDarkMode
                    ? "bg-[#050040] text-gray-300 hover:bg-[#060050]"
                    : "bg-white text-gray-600 hover:bg-gray-100 shadow-sm"
              }`}
            >
              Latest News
            </button>
          </div>

          {isLoading && (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#010080]" />
            </div>
          )}

          {isError && !isLoading && (
            <div
              className={`text-center py-16 rounded-2xl ${
                isDarkMode ? "bg-[#050040] text-red-400" : "bg-white text-red-600 shadow-sm"
              }`}
            >
              Unable to load events and news. Please try again later.
            </div>
          )}

          {!isLoading && !isError && activeItems.length === 0 && (
            <div
              className={`text-center py-16 rounded-2xl ${
                isDarkMode ? "bg-[#050040] text-gray-400" : "bg-white text-gray-500 shadow-sm"
              }`}
            >
              {emptyMessage}
            </div>
          )}

          {!isLoading && !isError && activeItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {activeItems.map((item, index) => (
                <NewsEventCard
                  key={item.id}
                  item={item}
                  isDarkMode={isDarkMode}
                  index={index}
                  animate={!!visibleSections.content}
                />
              ))}
            </div>
          )}

          <div
            className={`mt-16 sm:mt-20 max-w-2xl mx-auto text-center p-6 sm:p-8 rounded-2xl ${
              isDarkMode ? "bg-[#050040]" : "bg-white shadow-sm"
            } ${visibleSections.content ? "animate-fade-in-up" : "opacity-0"}`}
            style={{ animationDelay: "0.4s" }}
          >
            <h3
              className={`text-xl sm:text-2xl font-bold mb-3 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Stay Updated
            </h3>
            <p
              className={`text-sm sm:text-base mb-6 ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Subscribe to our newsletter to receive the latest news and event updates.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className={`flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode
                    ? "bg-white text-gray-800 placeholder-gray-500"
                    : "bg-gray-100 text-gray-800 placeholder-gray-400"
                }`}
              />
              <button
                type="button"
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  isDarkMode
                    ? "bg-white text-[#010080] hover:bg-gray-100"
                    : "bg-[#010080] text-white hover:bg-[#010060]"
                }`}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
