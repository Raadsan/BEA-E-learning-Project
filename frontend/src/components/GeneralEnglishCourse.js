"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function GeneralEnglishCourse() {
  const [visibleSections, setVisibleSections] = useState({ levels: true });
  const [showModal, setShowModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("");
  
  const sectionRefs = {
    hero: useRef(null),
    intro: useRef(null),
    levels: useRef(null),
  };

  // Registration form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    country: "",
    city: "",
    courseLevel: "",
    bookingDate: "",
    bookingTime: "",
    termsAccepted: false,
  });

  const [cities, setCities] = useState([]);

  const countriesData = {
    somalia: { name: "Somalia", cities: ["Mogadishu", "Hargeisa", "Kismayo", "Baidoa", "Bosaso", "Beledweyne", "Galkayo", "Burao", "Merca", "Jowhar"] },
    kenya: { name: "Kenya", cities: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Malindi", "Kitale", "Garissa", "Nyeri"] },
    ethiopia: { name: "Ethiopia", cities: ["Addis Ababa", "Dire Dawa", "Mekelle", "Gondar", "Hawassa", "Bahir Dar", "Adama", "Jimma", "Dessie", "Jijiga"] },
    djibouti: { name: "Djibouti", cities: ["Djibouti City", "Ali Sabieh", "Tadjoura", "Obock", "Dikhil", "Arta"] },
    uganda: { name: "Uganda", cities: ["Kampala", "Entebbe", "Jinja", "Gulu", "Mbarara", "Mbale", "Mukono", "Masaka", "Lira", "Arua"] },
    tanzania: { name: "Tanzania", cities: ["Dar es Salaam", "Dodoma", "Mwanza", "Arusha", "Mbeya", "Zanzibar City", "Tanga", "Morogoro", "Kigoma", "Tabora"] },
  };

  const courseLevels = [
    { value: "a1", label: "A1 - Beginner" },
    { value: "a2", label: "A2 - Elementary" },
    { value: "a2plus", label: "A2+ - Pre-Intermediate" },
    { value: "b1", label: "B1 - Intermediate" },
    { value: "b1plus", label: "B1+ - Intermediate Plus" },
    { value: "b2", label: "B2 - Upper-Intermediate" },
    { value: "c1", label: "C1 - Advanced" },
    { value: "c2", label: "C2 - Advanced Plus" },
  ];

  useEffect(() => {
    if (formData.country && countriesData[formData.country]) {
      setCities(countriesData[formData.country].cities);
      setFormData(prev => ({ ...prev, city: "" }));
    } else {
      setCities([]);
    }
  }, [formData.country]);

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

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    if (showModal) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  const handleRegisterClick = (levelValue) => {
    setSelectedLevel(levelValue);
    setFormData(prev => ({ ...prev, courseLevel: levelValue }));
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Registration submitted:", { ...formData, program: "8-Level General English Course" });
    alert("Registration submitted successfully!");
    setShowModal(false);
    setFormData({
      firstName: "", lastName: "", email: "", phone: "", age: "", gender: "",
      country: "", city: "", courseLevel: "", bookingDate: "", bookingTime: "", termsAccepted: false,
    });
  };

  const levels = [
    { level: "A1", value: "a1", title: "A1 - Beginner", bookImage: "/images/book1.jpg", overview: "Introduces learners to the basics of English for everyday communication and familiar contexts.", learningObjectives: "Use simple phrases, greet people, introduce oneself, and respond to basic questions.", skillsDeveloped: "Basic grammar, present simple, vocabulary for everyday life, and listening for gist.", outcomes: "Can communicate in predictable, routine situations with simple sentences." },
    { level: "A2", value: "a2", title: "A2 - Elementary", bookImage: "/images/book2.jpg", overview: "Builds on basic knowledge to expand communication confidence and vocabulary range.", learningObjectives: "Handle short exchanges, talk about routines, and describe simple events.", skillsDeveloped: "Past simple, adjectives, comparative forms, pronunciation accuracy.", outcomes: "Can participate in brief social conversations with improved fluency." },
    { level: "A2+", value: "a2plus", title: "A2+ - Pre-Intermediate", bookImage: "/images/book3.jpg", overview: "Bridges learners to independent communication and understanding of common English patterns.", learningObjectives: "Describe experiences, express opinions, and engage in short conversations.", skillsDeveloped: "Present perfect, modals, daily activities, writing short paragraphs.", outcomes: "Can interact effectively in most everyday situations with some confidence." },
    { level: "B1", value: "b1", title: "B1 - Intermediate", bookImage: "/images/book4.jpg", overview: "Develops solid communication skills for education, work, and travel contexts.", learningObjectives: "Understand the main points of clear input and express feelings and experiences.", skillsDeveloped: "Reported speech, conditionals, narrative writing, expressing preferences.", outcomes: "Can communicate confidently on familiar and general topics." },
    { level: "B1+", value: "b1plus", title: "B1+ - Intermediate Plus", bookImage: "/images/book5.jpg", overview: "Strengthens existing abilities while enhancing fluency and natural expression.", learningObjectives: "Express viewpoints, summarize ideas, and engage in extended discussions.", skillsDeveloped: "Advanced grammar control, debate skills, essay writing, fluency improvement.", outcomes: "Can express ideas naturally with some flexibility and confidence." },
    { level: "B2", value: "b2", title: "B2 - Upper-Intermediate", bookImage: "/images/book6.jpg", overview: "Promotes advanced accuracy and fluency across academic and professional environments.", learningObjectives: "Understand complex ideas, debate, and write structured academic content.", skillsDeveloped: "Idiomatic language, complex structures, persuasive writing.", outcomes: "Can communicate effectively with native and fluent speakers in most contexts." },
    { level: "C1", value: "c1", title: "C1 - Advanced", bookImage: "/images/book7.jpg", overview: "Refines language use for academic and professional excellence.", learningObjectives: "Express complex ideas clearly, fluently, and precisely.", skillsDeveloped: "Collocations, register control, presentation skills, analytical writing.", outcomes: "Can communicate fluently and spontaneously with precision and style." },
    { level: "C2", value: "c2", title: "C2 - Advanced Plus", bookImage: "/images/book8.jpg", overview: "Achieves mastery and native-like command of the English language.", learningObjectives: "Understand virtually everything heard or read; express ideas effortlessly.", skillsDeveloped: "Critical thinking, academic discourse, cross-cultural communication.", outcomes: "Can perform effectively in global professional or academic environments." },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section ref={sectionRefs.hero} className="relative overflow-hidden h-[350px] sm:h-[420px] lg:h-[500px]">
        <div className="absolute inset-0">
          <img src="/images/8-Level general.jpg" alt="8-Level General English Course for Adults" className="w-full h-full object-cover scale-110" />
        </div>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(1, 0, 128, 0.95) 0%, rgba(1, 0, 128, 0.8) 20%, rgba(1, 0, 128, 0.4) 40%, rgba(1, 0, 128, 0.1) 55%, transparent 65%)' }} />
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`max-w-md ${visibleSections.hero ? 'animate-fade-in-left' : 'opacity-0'}`}>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white leading-tight">
                8-Level General English<br />Course for Adults
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Introductory Text Section */}
      <section ref={sectionRefs.intro} className="py-8 sm:py-12 bg-white overflow-hidden">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="space-y-6 text-gray-800 leading-relaxed text-base sm:text-lg">
            <p className={`${visibleSections.intro ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
              The BBC Learning English File 4th Edition is a highly successful General English course that combines proven methodology with fresh, motivating content. It provides a comprehensive approach to language learning, focusing on real-world communication skills and building confidence in using English effectively.
            </p>
            <p className={`${visibleSections.intro ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              The program is designed with students and teachers in mind, offering flexible learning paths that adapt to different learning styles and needs. Each level is carefully structured to build upon previous knowledge while introducing new concepts and skills, ensuring a smooth and progressive learning experience from beginner to advanced levels.
            </p>
          </div>
        </div>
      </section>

      {/* English File 4th Edition Language Series */}
      <section ref={sectionRefs.levels} id="levels" className="py-12 sm:py-16 lg:py-20 bg-white overflow-hidden">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div>
            <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-center text-gray-900 mb-3 ${visibleSections.levels ? 'animate-fade-in-up' : 'opacity-0'}`}>
              English File 4th Edition Language Series
            </h2>
            <p className={`text-center text-gray-600 text-lg sm:text-xl mb-12 ${visibleSections.levels ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
              8 LEVELS, 8 OPPORTUNITIES
            </p>

            <div className="space-y-12 max-w-2xl mx-auto">
              {levels.map((level, index) => (
                <div key={level.level} className={`bg-white rounded-xl shadow-md overflow-hidden relative hover:shadow-xl transition-shadow duration-300 ${visibleSections.levels ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                  <div className="relative w-full h-64 sm:h-80 lg:h-96">
                    <Image src={level.bookImage} alt={`${level.title} Book`} fill className="object-contain" />
                  </div>
                  <div className="p-6 sm:p-8">
                    <div className="space-y-4 text-left mb-6">
                      <div>
                        <h3 className="text-gray-900 font-bold text-base sm:text-lg mb-2">Overview:</h3>
                        <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{level.overview}</p>
                      </div>
                      <div>
                        <h3 className="text-gray-900 font-bold text-base sm:text-lg mb-2">Learning Objectives:</h3>
                        <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{level.learningObjectives}</p>
                      </div>
                      <div>
                        <h3 className="text-gray-900 font-bold text-base sm:text-lg mb-2">Skills Developed:</h3>
                        <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{level.skillsDeveloped}</p>
                      </div>
                      <div>
                        <h3 className="text-gray-900 font-bold text-base sm:text-lg mb-2">Outcomes:</h3>
                        <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{level.outcomes}</p>
                      </div>
                    </div>
                    <div className="mt-6">
                      <button 
                        onClick={() => handleRegisterClick(level.value)}
                        className="bg-blue-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-800 transition-colors text-sm sm:text-base"
                      >
                        Register now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Registration Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6 sm:p-8 lg:p-10">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h2 className="text-2xl font-serif font-bold" style={{ color: '#010080' }}>
                  Register for 8-Level General English
                </h2>
                <p className="text-gray-600 text-sm mt-1">Fill in your details to enroll</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First name" className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800 text-base" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last name" className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800 text-base" required />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@example.com" className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800 text-base" required />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+252 61-*******" className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800 text-base" required />
                </div>

                {/* Age & Gender */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Age</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Age" min="5" max="100" className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800 text-base" required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800 text-base bg-white" required>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>

                {/* Country & City */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Country</label>
                    <select name="country" value={formData.country} onChange={handleChange} className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800 text-base bg-white" required>
                      <option value="">Select country</option>
                      {Object.entries(countriesData).map(([key, data]) => (
                        <option key={key} value={key}>{data.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                    <select name="city" value={formData.city} onChange={handleChange} className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800 text-base bg-white" required disabled={!formData.country}>
                      <option value="">Select city</option>
                      {cities.map((city) => (
                        <option key={city} value={city.toLowerCase()}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Course Level */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Course Level</label>
                  <select name="courseLevel" value={formData.courseLevel} onChange={handleChange} className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800 text-base bg-white" required>
                    <option value="">Select level</option>
                    {courseLevels.map((level) => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>

                {/* Booking Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Booking Date
                      </span>
                    </label>
                    <div className="relative">
                      <input 
                        type="date" 
                        name="bookingDate" 
                        value={formData.bookingDate} 
                        onChange={handleChange} 
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800 text-base bg-white" 
                        required 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Booking Time
                      </span>
                    </label>
                    <select 
                      name="bookingTime" 
                      value={formData.bookingTime} 
                      onChange={handleChange} 
                      className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800 text-base bg-white" 
                      required
                    >
                      <option value="">Select time</option>
                      <option value="08:00">08:00 AM</option>
                      <option value="09:00">09:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="13:00">01:00 PM</option>
                      <option value="14:00">02:00 PM</option>
                      <option value="15:00">03:00 PM</option>
                      <option value="16:00">04:00 PM</option>
                      <option value="17:00">05:00 PM</option>
                      <option value="18:00">06:00 PM</option>
                    </select>
                  </div>
                </div>

                {/* Important Notes */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-blue-800 mb-1">Important Notes:</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Classes are held Monday to Saturday</li>
                        <li>• Each session is 2 hours long</li>
                        <li>• Payment is required before the first class</li>
                        <li>• Books and materials will be provided</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="termsAccepted" checked={formData.termsAccepted} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" required />
                  <span className="text-sm text-gray-600">
                    I accept the <Link href="/terms" className="text-blue-600 hover:underline">Terms</Link> and <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
                  </span>
                </div>

                {/* Submit Button */}
                <button type="submit" className="w-full py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 hover:opacity-90 hover:shadow-lg" style={{ backgroundColor: '#010080' }}>
                  Submit Registration
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
