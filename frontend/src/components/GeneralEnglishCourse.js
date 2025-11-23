import Image from "next/image";

export default function GeneralEnglishCourse() {
  const levels = [
    {
      level: "A1",
      title: "A1 - Beginner",
      color: "purple",
      bookImage: "/images/book1.jpg",
      description: "Start your English learning journey with fundamental vocabulary, basic grammar, and essential communication skills. Perfect for absolute beginners who want to build a solid foundation."
    },
    {
      level: "A2",
      title: "A2 - Elementary",
      color: "red",
      bookImage: "/images/book2.jpg",
      description: "Expand your vocabulary and grammar knowledge. Learn to handle simple, routine tasks and express yourself in familiar situations with confidence."
    },
    {
      level: "A2+",
      title: "A2+ - Pre-Intermediate",
      color: "blue",
      bookImage: "/images/book3.jpg",
      description: "Develop your ability to communicate in everyday situations. Build on your foundation with more complex sentence structures and expanded vocabulary."
    },
    {
      level: "B1",
      title: "B1 - Intermediate",
      color: "green",
      bookImage: "/images/book4.jpg",
      description: "Master intermediate-level English for work, travel, and daily life. Handle most situations you encounter while traveling in English-speaking areas."
    },
    {
      level: "B1+",
      title: "B1+ - Intermediate Plus",
      color: "pink",
      bookImage: "/images/book5.jpg",
      description: "Refine your intermediate skills and prepare for advanced levels. Enhance fluency and accuracy in both spoken and written English."
    },
    {
      level: "B2",
      title: "B2 - Upper-Intermediate",
      color: "orange",
      bookImage: "/images/book6.jpg",
      description: "Achieve upper-intermediate proficiency with complex grammar and vocabulary. Express ideas clearly and understand the main points of complex texts."
    },
    {
      level: "C1",
      title: "C1 - Advanced",
      color: "teal",
      bookImage: "/images/book7.jpg",
      description: "Reach advanced English proficiency. Use the language fluently and spontaneously for social, academic, and professional purposes."
    },
    {
      level: "C2",
      title: "C2 - Advanced Plus",
      color: "yellow",
      bookImage: "/images/book8.jpg",
      description: "Attain near-native English proficiency. Understand virtually everything heard or read and express yourself spontaneously with precision."
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      purple: {
        book: "from-purple-500 to-purple-600",
        circle: "from-purple-400 via-pink-400 to-purple-500",
        button: "bg-purple-600 hover:bg-purple-700"
      },
      red: {
        book: "from-red-500 to-red-600",
        circle: "from-red-400 via-orange-400 to-red-500",
        button: "bg-red-600 hover:bg-red-700"
      },
      blue: {
        book: "from-blue-500 to-blue-600",
        circle: "from-blue-400 via-blue-300 to-blue-500",
        button: "bg-blue-600 hover:bg-blue-700"
      },
      green: {
        book: "from-green-500 to-green-600",
        circle: "from-green-400 via-green-300 to-green-500",
        button: "bg-green-600 hover:bg-green-700"
      },
      pink: {
        book: "from-pink-500 to-red-500",
        circle: "from-pink-400 via-red-400 to-pink-500",
        button: "bg-pink-600 hover:bg-pink-700"
      },
      orange: {
        book: "from-orange-500 to-yellow-500",
        circle: "from-orange-400 via-yellow-400 to-orange-500",
        button: "bg-orange-600 hover:bg-orange-700"
      },
      teal: {
        book: "from-teal-500 to-green-500",
        circle: "from-teal-400 via-green-400 to-teal-500",
        button: "bg-teal-600 hover:bg-teal-700"
      },
      yellow: {
        book: "from-yellow-500 to-green-500",
        circle: "from-yellow-400 via-green-400 to-yellow-500",
        button: "bg-yellow-600 hover:bg-yellow-700"
      }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section 
        className="relative flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #010080 0%, #4a148c 50%, #6a1b9a 100%)',
          height: '170px'
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif italic text-white mb-4 relative inline-block">
            Introducing Our 8-Level General English Course
          </h1>
          <p className="text-white text-sm sm:text-base max-w-4xl mx-auto mb-4">
            Our General English Program is built on the Common European Framework of Reference (CEFR)—the world&apos;s benchmark for language proficiency assessments from beginner (A1) to advanced plus (C2). This helps us place every learner precisely where they belong for optimal engagement.
          </p>
          <a href="#read-more" className="text-white underline hover:text-gray-200 transition-colors">
            Read more!
          </a>
        </div>
      </section>

      {/* Introductory Text Section */}
      <section id="read-more" className="py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-6 text-gray-800 leading-relaxed text-base sm:text-lg">
            <p>
              The Blueprint English Academy (BEA) stands as Somalia&apos;s premier institution for English language education, 
              setting the standard for excellence and innovation. BEA is more than a language school—it is a gateway to 
              opportunities in education, business, and professional development.
            </p>
            
            <p>
              Our <strong>General English Program</strong> is built on the{" "}
              <strong>Common European Framework of Reference (CEFR)</strong>—the world&apos;s benchmark for language 
              proficiency assessments from beginner (A1) to advanced plus (C2). This helps us place every learner precisely 
              where they belong for optimal engagement. We also integrate the <strong>Global Scale of English (GSE)</strong>, 
              a numerical scale from 10-90 that tracks student progress with precision. This dual framework ensures accuracy 
              and transparency, so every milestone you achieve is globally recognized and academically sound.
            </p>
            
            <p>
              Our programs portfolio is designed for diverse learners—from young adults seeking fluency to professionals advancing their 
              careers, and aspiring students preparing for global exams. Every BEA student finds a clear pathway to succeed in 
              their desired program.
            </p>
            
            <a href="#levels" className="text-blue-600 underline hover:text-blue-800 transition-colors inline-block">
              Read more!
            </a>
          </div>
        </div>
      </section>

      {/* English File 4th Edition Language Series */}
      <section id="levels" className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-blue-900 mb-12">
              English File 4th Edition Language Series
            </h2>
            
            <div className="space-y-6">
              {levels.map((level, index) => {
                const colors = getColorClasses(level.color);
                return (
                  <div
                    key={level.level}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                  >
                    {/* Card Header */}
                    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                      <div className="text-xs font-semibold text-gray-600">
                        BEA | BLUEPRINT ENGLISH ACADEMY
                      </div>
                      <div className="flex gap-1">
                        <div className="w-1 h-6 bg-blue-600"></div>
                        <div className="w-1 h-6 bg-blue-500"></div>
                        <div className="w-1 h-6 bg-blue-400"></div>
                      </div>
                    </div>

                    {/* Main Visual Area */}
                    <div className="relative px-6 py-8 bg-white">
                      <div className="flex items-center justify-between gap-8">
                        {/* Books and CD */}
                        <div className="flex items-center gap-4 relative">
                          {/* Background Book (Workbook) */}
                          <div className="relative w-32 h-40 sm:w-40 sm:h-52 shadow-xl">
                            <Image
                              src={level.bookImage}
                              alt={`${level.title} Workbook`}
                              fill
                              className="object-cover rounded"
                              sizes="(max-width: 640px) 128px, 160px"
                            />
                            {/* OXFORD Logo overlay */}
                            <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-[8px] sm:text-xs font-bold text-gray-800">
                              OXFORD
                            </div>
                          </div>
                          
                          {/* Foreground Book (Student's Book) and CD */}
                          <div className="relative -ml-8">
                            {/* Student's Book */}
                            <div className="relative w-32 h-40 sm:w-40 sm:h-52 shadow-xl z-10">
                              <Image
                                src={level.bookImage}
                                alt={`${level.title} Student's Book`}
                                fill
                                className="object-cover rounded"
                                sizes="(max-width: 640px) 128px, 160px"
                              />
                              {/* OXFORD Logo overlay */}
                              <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-[8px] sm:text-xs font-bold text-gray-800">
                                OXFORD
                              </div>
                            </div>
                            
                            {/* CD in front */}
                            <div className="absolute -bottom-4 -left-4 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full border-4 border-white shadow-lg z-20 flex items-center justify-center">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full border-2 border-white"></div>
                            </div>
                          </div>
                        </div>

                        {/* Level Badge Circle */}
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-red-600 rounded-full shadow-lg flex items-center justify-center">
                            <span className="text-white font-bold text-2xl sm:text-3xl">{level.level}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Red Line Separator */}
                      <div className="mt-8 h-1 bg-red-600 relative">
                        <div className="absolute left-0 top-0 bottom-0 flex gap-1">
                          <div className="w-1 bg-red-700"></div>
                          <div className="w-1 bg-red-700"></div>
                          <div className="w-1 bg-red-700"></div>
                        </div>
                        <div className="absolute right-0 top-0 bottom-0 flex gap-1">
                          <div className="w-1 bg-blue-600"></div>
                          <div className="w-1 bg-blue-500"></div>
                          <div className="w-1 bg-blue-400"></div>
                        </div>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="px-6 py-6 bg-white">
                      <div className="flex items-start gap-4 mb-6">
                        {/* Decorative stripes on left */}
                        <div className="flex-shrink-0 flex flex-col gap-1 mt-2">
                          <div className="w-8 h-1 bg-red-600 transform rotate-12"></div>
                          <div className="w-8 h-1 bg-red-500 transform rotate-12"></div>
                          <div className="w-8 h-1 bg-blue-600 transform rotate-12"></div>
                        </div>
                        
                        {/* Course Information */}
                        <div className="flex-1 space-y-4">
                          <div>
                            <h4 className="font-bold text-gray-900 mb-2">Overview:</h4>
                            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                              Introduces learners to the basics of English for everyday communication and familiar contexts.
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="font-bold text-gray-900 mb-2">Learning Objectives:</h4>
                            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                              Use simple phrases, greet people, introduce oneself, and respond to basic questions.
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="font-bold text-gray-900 mb-2">Skills Developed:</h4>
                            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                              Basic grammar, present simple, vocabulary for everyday life, and listening for gist.
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="font-bold text-gray-900 mb-2">Outcomes:</h4>
                            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                              Can communicate in predictable, routine situations with simple sentences.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bottom Bar */}
                      <div className={`${colors.button} text-white px-6 py-3 rounded-lg font-semibold text-center transition-colors`}>
                        {level.level} - Beginner
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Pedagogical Approach */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h2 className="text-3xl sm:text-4xl font-bold text-blue-900">Pedagogical Approach</h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed text-base sm:text-lg">
              <p>
                Our teaching methodology is student-centered and communicative, focusing on real-world language use. We integrate 
                the latest pedagogical research with practical classroom activities that engage learners and promote active participation.
              </p>
              <p>
                Each lesson is designed to balance the four key language skills: speaking, listening, reading, and writing. We use 
                interactive methods, multimedia resources, and collaborative learning to create an immersive English learning experience.
              </p>
              <p>
                Our instructors are trained to adapt their teaching style to meet diverse learning needs, ensuring that every 
                student receives personalized attention and support throughout their learning journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Progression and Assessment */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <h2 className="text-3xl sm:text-4xl font-bold text-blue-900">Progression and Assessment</h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed text-base sm:text-lg">
              <p>
                Student progress is continuously monitored through a combination of formative and summative assessments. Regular 
                quizzes, assignments, and speaking activities provide ongoing feedback to both students and instructors.
              </p>
              <p>
                At the end of each level, students complete a comprehensive assessment that evaluates all four language skills. 
                Successful completion allows progression to the next level, ensuring a structured and measurable learning path.
              </p>
              <p>
                We use the Global Scale of English (GSE) to provide precise, numerical tracking of progress, giving students 
                clear visibility into their advancement and areas for improvement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Outcomes */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-6">Learning Outcomes</h2>
            <ul className="space-y-4 text-gray-700 leading-relaxed text-base sm:text-lg">
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span>Gain a solid foundation in English grammar, vocabulary, and pronunciation from beginner to advanced levels.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span>Acquire essential grammar structures and vocabulary needed for effective communication in daily life, work, and academic contexts.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span>Develop practical communication skills for real-world situations, including conversations, presentations, and written correspondence.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span>Enhance vocabulary knowledge across diverse topics and contexts, enabling confident expression of ideas and opinions.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 font-bold mt-1">•</span>
                <span>Build confidence in using English through interactive practice, peer collaboration, and supportive instructor guidance.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

