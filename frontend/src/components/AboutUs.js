import WhyChooseUs from "./WhyChooseUs";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section with Gradient */}
      <section 
        className="relative flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #010080 0%, #4a148c 50%, #6a1b9a 100%)',
          height: '170px'
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif italic text-white mb-4 relative inline-block">
            About Us
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white -mx-8"></span>
          </h1>
        </div>
      </section>

      {/* Slogan Box */}
      <section className="pt-8 sm:pt-12 pb-4 sm:pb-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white border border-pink-200 rounded-lg p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Left Side */}
                <div className="space-y-1">
                  <p className="text-base sm:text-lg md:text-xl font-bold italic font-serif">
                    <span className="text-red-600">The world speaks English.</span>
                    <br />
                    <span className="text-gray-800">Be a part of the conversation.</span>
                  </p>
                </div>
                
                {/* Right Side */}
                <div className="space-y-1">
                  <p className="text-base sm:text-lg md:text-xl font-bold italic font-serif">
                    <span className="text-blue-800">From here to anywhere.</span>
                    <br />
                    <span className="text-red-600">And your future becomes global.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Body Text */}
      <section className="pt-4 sm:pt-6 pb-8 sm:pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 text-blue-900 leading-relaxed text-base sm:text-lg max-w-5xl mx-auto">
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
              and transparency, so every milestone you achieve is globally recognized and academically sound. Our programs 
              portfolio is designed for diverse learners—from young adults seeking fluency to professionals advancing their 
              careers, and aspiring students preparing for global exams. Every BEA student finds a clear pathway to succeed in 
              their desired program.
            </p>
          </div>
        </div>
      </section>

      {/* Vision and Mission Sections */}
      <section className="py-8 sm:py-12 pb-16 sm:pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Our Vision */}
            <div className="bg-blue-50 rounded-lg p-6 sm:p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:bg-gray-100 cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-gray-300 group-hover:scale-110">
                    <svg className="w-6 h-6 text-white transition-colors duration-300 group-hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-blue-900 mb-3 transition-colors duration-300 group-hover:text-gray-800">Our Vision</h2>
                  <p className="text-gray-800 leading-relaxed transition-colors duration-300 group-hover:text-gray-700">
                    To be Somalia&apos;s leading English language academy, equipping learners with the confidence, skills, 
                    and global mindset to thrive in education, careers, and future leadership roles.
                  </p>
                </div>
              </div>
            </div>

            {/* Our Mission */}
            <div className="bg-blue-50 rounded-lg p-6 sm:p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:bg-gray-100 cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-gray-300 group-hover:scale-110">
                    <svg className="w-6 h-6 text-white transition-colors duration-300 group-hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-blue-900 mb-3 transition-colors duration-300 group-hover:text-gray-800">Our Mission</h2>
                  <p className="text-gray-800 leading-relaxed transition-colors duration-300 group-hover:text-gray-700">
                    The Blueprint English Academy exists to empower learners with English language skills, confidence, 
                    and global competence by providing innovative, high-quality, and student-centered education that 
                    transforms learning into real-world opportunities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Students Are Choosing Us Section */}
      <WhyChooseUs />
    </div>
  );
}

