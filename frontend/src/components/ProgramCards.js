import Image from "next/image";

export default function ProgramCards() {
  const programs = [
    {
      id: 1,
      title: "8- Level General English Course for Adults",
      description: "Our 8-Level General English Course is a comprehensive program designed to take learners from beginner to advanced proficiency.",
      color: "blue",
      image: "/images/A Path to Global Opportunities.jpg",
    },
    {
      id: 2,
      title: "English for Specific Purposes (ESP)",
      description: "English for Specific Purposes (ESP) Program is tailored to meet the unique communication needs of professionals and learners across various fields.",
      color: "red",
      image: "/images/English for Specific Purposes (ESP).webp",
    },
    {
      id: 3,
      title: "IELTS & TOFEL Preparation Course",
      description: "Our IELTS and TOEFL Preparation Course is designed to enrich our students with the strategies, skills, and confidence needed to excel in international English proficiency exams.",
      color: "blue",
      image: "/images/IELTS & TOEFL Preparation Courses1.jpg",
    },
    {
      id: 4,
      title: "Advanced Conversation",
      description: "Perfect your fluency with advanced vocabulary, idioms, and expressions.",
      color: "red",
      image: "/images/A Path to Global Opportunities.jpg",
    },
    {
      id: 5,
      title: "Business Communication",
      description: "Enhance your professional dialogue.",
      color: "blue",
      image: "/images/A Path to Global Opportunities.jpg",
    },
    {
      id: 6,
      title: "Conversational Fluency",
      description: "Engage in everyday discussions.",
      color: "red",
      image: "/images/A Path to Global Opportunities.jpg",
    },
  ];

  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-10 sm:mb-12">
            <div>
              <h2 className="text-gray-800 text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
                BEA Programs Portfolio
              </h2>
              <p className="text-gray-600 text-base sm:text-lg">
                Choose from our expertly designed courses tailored to your level and goals.
              </p>
            </div>
            <a href="/programs" className="text-gray-800 font-semibold hover:underline text-sm sm:text-base whitespace-nowrap ml-4 border border-purple-300 rounded-lg px-4 py-2">
              → View all programs
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {programs.map((program) => (
              <div
                key={program.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg"
              >
                {/* Image with Play Icon */}
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  <Image
                    src={program.image}
                    alt={program.title}
                    fill
                    className="object-cover"
                  />
                  {/* Play Icon Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-gray-700 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Title with Heart Icon */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 flex-1">
                      {program.title}
                    </h3>
                    <button className="text-gray-400 hover:text-red-500 transition-colors ml-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {program.description}
                  </p>
                  
                  {/* Explore more */}
                  <a
                    href={program.id === 1 ? "/programs/8-level-general-english" : "#"}
                    className={`text-sm font-semibold inline-flex items-center gap-1 ${
                      program.color === "red" 
                        ? "text-red-600 hover:text-red-700" 
                        : "text-blue-600 hover:text-blue-700"
                    }`}
                  >
                    <span>Explore more</span>
                    <svg 
                      className="w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}