"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import Image from "next/image";

export default function Blogs() {
  const { isDarkMode } = useTheme();
  const [visibleSections, setVisibleSections] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");
  const sectionRefs = {
    hero: useRef(null),
    content: useRef(null),
  };

  useEffect(() => {
    const observers = [];
    Object.entries(sectionRefs).forEach(([key, ref]) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => ({ ...prev, [key]: true }));
          }
        },
        { threshold: 0.1 }
      );
      if (ref.current) observer.observe(ref.current);
      observers.push(observer);
    });
    return () => observers.forEach(obs => obs.disconnect());
  }, []);

  const categories = ["All", "Learning Tips", "Student Success", "Language Skills", "Career Development"];

  const blogs = [
    {
      id: 1,
      title: "10 Effective Tips to Improve Your English Speaking Skills",
      excerpt: "Discover practical strategies to boost your confidence and fluency in English conversation. From daily practice routines to immersive techniques...",
      category: "Learning Tips",
      author: "BEA Team",
      date: "November 28, 2025",
      readTime: "5 min read",
      image: "/images/blog1.jpg",
      featured: true
    },
    {
      id: 2,
      title: "How to Prepare for IELTS in 30 Days",
      excerpt: "A comprehensive guide to maximizing your IELTS preparation in just one month. Learn the key strategies for each section...",
      category: "Learning Tips",
      author: "BEA Team",
      date: "November 25, 2025",
      readTime: "8 min read",
      image: "/images/blog2.jpg",
      featured: true
    },
    {
      id: 3,
      title: "Success Story: From Beginner to Advanced in 12 Months",
      excerpt: "Meet Ahmed, a BEA student who transformed his English proficiency from A1 to C1 level in just one year...",
      category: "Student Success",
      author: "BEA Team",
      date: "November 22, 2025",
      readTime: "4 min read",
      image: "/images/blog3.jpg",
      featured: false
    },
    {
      id: 4,
      title: "The Importance of English in Today's Global Job Market",
      excerpt: "Explore how English proficiency opens doors to international career opportunities and higher earning potential...",
      category: "Career Development",
      author: "BEA Team",
      date: "November 18, 2025",
      readTime: "6 min read",
      image: "/images/blog4.jpg",
      featured: false
    },
    {
      id: 5,
      title: "Mastering Business English: Essential Vocabulary and Phrases",
      excerpt: "Learn the key business English expressions that will help you communicate professionally in the workplace...",
      category: "Language Skills",
      author: "BEA Team",
      date: "November 15, 2025",
      readTime: "7 min read",
      image: "/images/blog5.jpg",
      featured: false
    },
    {
      id: 6,
      title: "Common Grammar Mistakes and How to Avoid Them",
      excerpt: "Identify and correct the most frequent grammar errors made by English learners at all levels...",
      category: "Language Skills",
      author: "BEA Team",
      date: "November 10, 2025",
      readTime: "5 min read",
      image: "/images/blog6.jpg",
      featured: false
    }
  ];

  const filteredBlogs = selectedCategory === "All" 
    ? blogs 
    : blogs.filter(blog => blog.category === selectedCategory);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#03002e]' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <section 
        ref={sectionRefs.hero}
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, #03002e 0%, #050040 50%, #03002e 100%)'
            : 'linear-gradient(135deg, #1a237e 0%, #311b92 50%, #b71c1c 100%)',
          minHeight: '200px',
          paddingTop: '40px',
          paddingBottom: '40px'
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`inline-block mb-4 ${visibleSections.hero ? 'animate-fade-in-down' : 'opacity-0'}`}>
            <svg className="w-16 h-16 sm:w-20 sm:h-20 text-white mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 ${visibleSections.hero ? 'animate-fade-in-down' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
            BEA Blog
          </h1>
          <p className={`text-base sm:text-lg text-white/90 max-w-2xl mx-auto ${visibleSections.hero ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
            Insights, tips, and stories to help you on your English learning journey
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section ref={sectionRefs.content} className={`py-10 sm:py-14 ${isDarkMode ? 'bg-[#03002e]' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter */}
          <div className={`flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12 ${visibleSections.content ? 'animate-fade-in-up' : 'opacity-0'}`}>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? isDarkMode 
                      ? 'bg-white text-[#010080]' 
                      : 'bg-[#010080] text-white'
                    : isDarkMode
                      ? 'bg-[#050040] text-gray-300 hover:bg-[#060050]'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredBlogs.map((blog, index) => (
              <article 
                key={blog.id}
                className={`rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isDarkMode ? 'bg-[#050040]' : 'bg-white'} ${visibleSections.content ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Blog Image */}
                <div className="relative h-48 sm:h-52 overflow-hidden bg-gradient-to-br from-blue-600 to-purple-600">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-16 h-16 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                  </div>
                  {blog.featured && (
                    <span className="absolute top-3 left-3 px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full">
                      Featured
                    </span>
                  )}
                  <span className={`absolute top-3 right-3 px-3 py-1 text-xs font-medium rounded-full ${isDarkMode ? 'bg-white/20 text-white' : 'bg-black/20 text-white'}`}>
                    {blog.category}
                  </span>
                </div>

                {/* Blog Content */}
                <div className="p-5 sm:p-6">
                  <h2 className={`text-lg sm:text-xl font-bold mb-2 line-clamp-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {blog.title}
                  </h2>
                  <p className={`text-sm mb-4 line-clamp-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {blog.excerpt}
                  </p>
                  
                  {/* Meta Info */}
                  <div className={`flex items-center justify-between text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    <div className="flex items-center gap-2">
                      <span>{blog.author}</span>
                      <span>•</span>
                      <span>{blog.date}</span>
                    </div>
                    <span>{blog.readTime}</span>
                  </div>

                  {/* Read More Button */}
                  <button className={`mt-4 w-full py-2.5 rounded-lg font-semibold text-sm transition-colors ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    Read More
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Load More */}
          <div className={`mt-10 sm:mt-12 text-center ${visibleSections.content ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.5s' }}>
            <button className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 ${isDarkMode ? 'bg-white text-[#010080] hover:bg-gray-100' : 'bg-[#010080] text-white hover:bg-[#010060]'}`}>
              Load More Articles
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

