import Image from "next/image";

export default function GeneralEnglishCourse() {
  const levels = [
    {
      level: "A1",
      title: "A1 - Beginner",
      bookImage: "/images/book1.jpg",
      description: "Start your English learning journey with fundamental vocabulary, basic grammar, and essential communication skills. Perfect for absolute beginners who want to build a solid foundation."
    },
    {
      level: "A2",
      title: "A2 - Elementary",
      bookImage: "/images/book2.jpg",
      description: "Expand your vocabulary and grammar knowledge. Learn to handle simple, routine tasks and express yourself in familiar situations with confidence."
    },
    {
      level: "A2+",
      title: "A2+ - Pre-Intermediate",
      bookImage: "/images/book3.jpg",
      description: "Develop your ability to communicate in everyday situations. Build on your foundation with more complex sentence structures and expanded vocabulary."
    },
    {
      level: "B1",
      title: "B1 - Intermediate",
      bookImage: "/images/book4.jpg",
      description: "Master intermediate-level English for work, travel, and daily life. Handle most situations you encounter while traveling in English-speaking areas."
    },
    {
      level: "B1+",
      title: "B1+ - Intermediate Plus",
      bookImage: "/images/book5.jpg",
      description: "Refine your intermediate skills and prepare for advanced levels. Enhance fluency and accuracy in both spoken and written English."
    },
    {
      level: "B2",
      title: "B2 - Upper-Intermediate",
      bookImage: "/images/book6.jpg",
      description: "Achieve upper-intermediate proficiency with complex grammar and vocabulary. Express ideas clearly and understand the main points of complex texts."
    },
    {
      level: "C1",
      title: "C1 - Advanced",
      bookImage: "/images/book7.jpg",
      description: "Reach advanced English proficiency. Use the language fluently and spontaneously for social, academic, and professional purposes."
    },
    {
      level: "C2",
      title: "C2 - Advanced Plus",
      bookImage: "/images/book8.jpg",
      description: "Attain near-native English proficiency. Understand virtually everything heard or read and express yourself spontaneously with precision."
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a237e 0%, #311b92 50%, #b71c1c 100%)',
          minHeight: '300px'
        }}
      >
        {/* Background Overlay Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
          <div className="absolute top-[-50%] left-[-10%] w-[50%] h-[150%] bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-50%] right-[-10%] w-[50%] h-[150%] bg-red-500 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 py-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-wide">
            Introducing Our 8-Level<br />
            General English Course
          </h1>
          <div className="w-24 h-1 bg-white mx-auto mb-8 opacity-50"></div>
          <p className="text-white text-sm sm:text-base max-w-3xl mx-auto leading-relaxed opacity-90">
            Our General English Program is built on the Common European Framework of Reference (CEFR)—the world&apos;s benchmark for language proficiency assessments from beginner (A1) to advanced plus (C2).
          </p>
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

            <div className="space-y-16">
              {levels.map((level, index) => {
                return (
                  <div
                    key={level.level}
                    className="bg-white rounded-[2rem] border-2 border-blue-900 overflow-hidden relative shadow-lg"
                  >
                    {/* Card Header */}
                    <div className="px-8 py-6 flex items-center justify-between">
                      {/* Logo Section */}
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-900 text-white font-bold text-xl px-2 py-1">
                          BEA
                        </div>
                        <div className="flex flex-col leading-tight">
                          <span className="text-blue-900 font-bold text-sm tracking-wider">THE BLUEPRINT</span>
                          <span className="text-red-600 font-bold text-sm tracking-wider">ENGLISH ACADEMY</span>
                        </div>
                      </div>

                      {/* Right Stripes */}
                      <div className="flex gap-2">
                        <div className="w-3 h-12 bg-red-600 transform -skew-x-[30deg]"></div>
                        <div className="w-3 h-12 bg-blue-900 transform -skew-x-[30deg]"></div>
                        <div className="w-3 h-12 bg-blue-900 transform -skew-x-[30deg]"></div>
                      </div>
                    </div>

                    <div className="px-8 pb-12 relative">
                      {/* Main Visual Area */}
                      <div className="flex flex-col md:flex-row items-center justify-center relative mb-12">

                        {/* Book Image Composition */}
                        <div className="relative w-64 h-80 md:w-80 md:h-96 z-10">
                          <Image
                            src={level.bookImage}
                            alt={`${level.title} Book`}
                            fill
                            className="object-contain drop-shadow-2xl"
                          />

                          {/* CD Image - Simulated */}
                          <div className="absolute -bottom-6 -left-10 w-24 h-24 rounded-full border-4 border-white shadow-xl z-20 overflow-hidden bg-gray-100">
                            <div className="w-full h-full bg-gradient-to-tr from-gray-300 via-white to-gray-200 relative">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-4 h-4 bg-white rounded-full border border-gray-300"></div>
                              </div>
                              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-[0.6rem] font-bold text-blue-900">English File</div>
                            </div>
                          </div>
                        </div>

                        {/* Level Badge - Floating Right */}
                        <div className="absolute right-0 md:right-10 top-1/2 transform -translate-y-1/2 z-20">
                          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg border-4 border-white">
                            {level.level}
                          </div>
                        </div>
                      </div>

                      {/* Decorative Left Stripes (Red Block + Stripes) */}
                      <div className="flex items-end gap-2 mb-8">
                        <div className="w-24 h-16 bg-red-600 transform -skew-x-[30deg] rounded-sm"></div>
                        <div className="w-4 h-16 bg-red-600 transform -skew-x-[30deg] rounded-sm"></div>
                        <div className="w-4 h-16 bg-blue-900 transform -skew-x-[30deg] rounded-sm"></div>
                        <div className="w-4 h-16 bg-blue-900 transform -skew-x-[30deg] rounded-sm"></div>
                      </div>

                      {/* Content Section */}
                      <div className="space-y-4 text-left">
                        <div>
                          <h3 className="text-blue-900 font-bold text-lg">Overview:</h3>
                          <p className="text-blue-900 text-sm leading-relaxed">
                            {level.description.split('.')[0]}.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-blue-900 font-bold text-lg">Learning Objectives:</h3>
                          <p className="text-blue-900 text-sm leading-relaxed">
                            {level.description.split('.')[1] || "Develop core skills."}.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-blue-900 font-bold text-lg">Skills Developed:</h3>
                          <p className="text-blue-900 text-sm leading-relaxed">
                            Basic grammar, present simple, vocabulary for everyday life, and listening for gist.
                          </p>
                        </div>

                        <div>
                          <h3 className="text-blue-900 font-bold text-lg">Outcomes:</h3>
                          <p className="text-blue-900 text-sm leading-relaxed">
                            Can communicate in predictable, routine situations with simple sentences.
                          </p>
                        </div>
                      </div>

                      {/* Bottom Button - Centered and overlapping bottom */}
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                        <button className="bg-blue-900 text-white px-16 py-3 rounded-xl font-bold text-xl shadow-lg hover:bg-blue-800 transition-colors border-4 border-white">
                          {level.title}
                        </button>
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
              <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h2 className="text-3xl sm:text-4xl font-bold text-blue-900">Pedagogical Approach</h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed text-base sm:text-lg pl-11 border-l-4 border-blue-100">
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
              <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h2 className="text-3xl sm:text-4xl font-bold text-blue-900">Progression and Assessment</h2>
            </div>
            <div className="space-y-4 text-gray-700 leading-relaxed text-base sm:text-lg pl-11 border-l-4 border-blue-100">
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
            <div className="flex items-center gap-3 mb-6">
              <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-3xl sm:text-4xl font-bold text-blue-900">Learning Outcomes</h2>
            </div>

            <ul className="space-y-4 text-gray-700 leading-relaxed text-base sm:text-lg pl-11">
              <li className="flex items-start gap-3">
                <span className="text-red-600 font-bold mt-1 text-xl">•</span>
                <span>Gain a solid foundation in English grammar, vocabulary, and pronunciation from beginner to advanced levels.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-600 font-bold mt-1 text-xl">•</span>
                <span>Acquire essential grammar structures and vocabulary needed for effective communication in daily life, work, and academic contexts.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-600 font-bold mt-1 text-xl">•</span>
                <span>Develop practical communication skills for real-world situations, including conversations, presentations, and written correspondence.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-600 font-bold mt-1 text-xl">•</span>
                <span>Enhance vocabulary knowledge across diverse topics and contexts, enabling confident expression of ideas and opinions.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-600 font-bold mt-1 text-xl">•</span>
                <span>Build confidence in using English through interactive practice, peer collaboration, and supportive instructor guidance.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}