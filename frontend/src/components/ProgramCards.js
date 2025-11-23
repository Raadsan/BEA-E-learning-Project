export default function ProgramCards() {
  const programs = [
    {
      id: 1,
      title: "8- Level General English Course for Adults",
      description: "Our 8 Level General English Course is a comprehensive program designed to take learners from beginner to advanced proficiency. Each level builds essential language skills—speaking, learning, reading, and writing—through practical, real-life communication and interactive learning.",
      color: "blue",
    },
    {
      id: 2,
      title: "English for Specific Purposes (ESP)",
      description: "English for Specific Purposes (ESP) Program is tailored to meet the unique communication needs of professionals and learners across various fields. Whether in business, healthcare, aviation, or education, our ESP courses focus on the language, vocabulary, and real-world scenarios relevant to each discipline.",
      color: "red",
    },
    {
      id: 3,
      title: "IELTS & TOFEL Preparation Course",
      description: "Our IELTS and TOFEL Preparation Course is designed to enrich our students with the strategies, skills, and confidence needed to excel in international English proficiency exams. Our research focuses on all key components—listening, reading, writing, and speaking—through guided practice, mock tests, and personalized feedback.",
      color: "blue",
    },
    {
      id: 4,
      title: "Professional Skills and Training Programs",
      description: "Develop essential professional competencies through our comprehensive training programs. Enhance your communication, teamwork, leadership, and problem-solving skills for career advancement.",
      color: "red",
    },
    {
      id: 5,
      title: "Advanced Academic Writing Program",
      description: "Master academic and professional writing with our advanced program. Focus on essay composition, research writing, report editing, and proper citation techniques for academic success.",
      color: "blue",
    },
    {
      id: 6,
      title: "Digital Literacy and Virtual Communication",
      description: "Build essential digital skills for modern communication and professional development. Learn virtual collaboration tools and digital communication strategies for technology-driven environments.",
      color: "red",
    },
  ];

  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12 max-w-5xl mx-auto">
          {programs.map((program) => (
            <div
              key={program.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden group cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 hover:scale-105 h-[400px] flex flex-col"
            >
              {/* Video Placeholder */}
              <div className="relative h-40 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden flex-shrink-0">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl">
                    <svg className="w-6 h-6 text-gray-700 transition-colors duration-500 group-hover:text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-blue-500/0 transition-all duration-500 group-hover:bg-blue-500/10" />
                
                {/* Color Accent Top */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  program.color === "red" ? "bg-red-500" : "bg-blue-500"
                }`} />
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-3 transition-colors duration-500 group-hover:text-blue-700">
                  {program.title}
                </h3>
                
                {/* Description */}
                <p className="text-gray-500 text-xs leading-relaxed mb-4 flex-1">
                  {program.description}
                </p>
                
                {/* Explore more */}
                <div className="pt-2 border-t border-gray-100">
                  <a
                    href="#"
                    className={`text-xs font-semibold inline-flex items-center gap-1 relative group/link transition-all duration-500 ${
                      program.color === "red" 
                        ? "text-red-600 hover:text-red-700" 
                        : "text-blue-600 hover:text-blue-700"
                    }`}
                  >
                    <span className="relative">
                      Explore more
                      <span 
                        className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-500 group-hover/link:w-full ${
                          program.color === "red" ? "bg-red-600" : "bg-blue-600"
                        }`}
                      />
                    </span>
                    <svg 
                      className="w-3 h-3 transition-transform duration-500 group-hover/link:translate-x-1" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Bottom Color Bar */}
              <div className={`h-1 bg-gradient-to-r ${
                program.color === "red" 
                  ? "from-red-500 to-red-600" 
                  : "from-blue-500 to-blue-600"
              } transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left flex-shrink-0`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}