import Image from "next/image";

export default function PopularCourses() {
  const courses = [
    {
      id: 1,
      title: "Advanced Conversation",
      description: "Perfect your fluency with advanced vocabulary, idioms, and natural expressions.",
      image: "/images/A Path to Global Opportunities.jpg",
      duration: "12 weeks",
      lessons: "72 lessons",
      level: "Advanced"
    },
    {
      id: 2,
      title: "Business Communication",
      description: "Enhance your professional dialogue with tailored vocabulary and formal expressions.",
      image: "/images/A Path to Global Opportunities.jpg",
      duration: "8 weeks",
      lessons: "40 lessons",
      level: "Advanced"
    },
    {
      id: 3,
      title: "Conversational Fluency",
      description: "Engage in everyday discussions with ease using practical language skills.",
      image: "/images/A Path to Global Opportunities.jpg",
      duration: "6 weeks",
      lessons: "30 lessons",
      level: "Advanced"
    },
  ];

  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-10 sm:mb-12">
            <div>
              <h2 className="text-gray-800 text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-2">
                Popular Courses
              </h2>
              <p className="text-gray-600 text-base">
                Choose from our expertly designed courses tailored to your level and goals.
              </p>
            </div>
            <a href="/programs" className="text-gray-800 font-semibold hover:underline text-sm sm:text-base border border-purple-300 rounded-lg px-4 py-2 whitespace-nowrap ml-4">
              → View all courses
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Course Image */}
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                  {/* Heart Icon */}
                  <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
                
                {/* Course Content */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {course.title}
                    </h3>
                    <button className="text-gray-400 hover:text-red-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {course.description}
                  </p>
                  
                  {/* Course Info */}
                  <div className="flex flex-wrap gap-4 mb-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>{course.lessons}</span>
                    </div>
                  </div>
                  
                  {/* Enroll Button */}
                  <button className="w-full bg-blue-800 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-900 transition-colors text-sm flex items-center justify-center gap-2">
                    <span>→</span>
                    <span>Enroll now</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

