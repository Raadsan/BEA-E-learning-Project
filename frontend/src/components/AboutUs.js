import WhyChooseUs from "./WhyChooseUs";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header Section with Gradient */}
      <section 
        className="relative flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #1a237e 0%, #311b92 50%, #b71c1c 100%)',
          height: '170px'
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-4 relative inline-block">
            About Us
          </h1>
        </div>
      </section>

      {/* Slogan Box */}
      <section className="pt-8 sm:pt-12 pb-4 sm:pb-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
          <div className="rounded-xl p-6 sm:p-8 mb-8 sm:mb-12" style={{ backgroundColor: 'rgba(209, 213, 220, 0.3)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Side */}
            <div className="space-y-1">
              <p className="text-base sm:text-lg md:text-xl font-bold italic">
                <span className="text-red-600">The world speaks English.</span>
                <br />
                <span className="text-blue-800">Be a part of the conversation.</span>
              </p>
            </div>
            
            {/* Right Side */}
            <div className="space-y-1">
              <p className="text-base sm:text-lg md:text-xl font-bold italic">
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
          <div className="space-y-6 text-gray-800 leading-relaxed text-base sm:text-lg max-w-5xl mx-auto">
            <p>
              The Blueprint English Academy (BEA) stands as Somalia&apos;s premier institution for English language education, 
              setting the standard for excellence and innovation. BEA is more than a language school—it is a gateway to 
              opportunities in education, business, and professional development.
            </p>
            
            <p>
              Our <strong>General English Program</strong> is built on the{" "}
              <strong>Common European Framework of Reference (CEFR)</strong>—the world&apos;s benchmark for language 
              proficiency assessments from beginner (A1) to advanced plus (C2). This helps us place every learner precisely 
              where they belong for optimal engagement.
            </p>
            
            <p>
              We also integrate the <strong>Global Scale of English (GSE)</strong>, 
              a numerical scale from 10-90 that tracks student progress with precision. This dual framework ensures accuracy 
              and transparency, so every milestone you achieve is globally recognized and academically sound.
            </p>
            
            <p>
              Our programs portfolio is designed for diverse learners—from young adults seeking fluency to professionals advancing their 
              careers, and aspiring students preparing for global exams. Every BEA student finds a clear pathway to succeed in 
              their desired program.
            </p>
          </div>
        </div>
      </section>

      {/* Vision and Mission Sections */}
      <section className="py-8 sm:py-12 pb-16 sm:pb-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Our Vision */}
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" fill="none" />
                      <circle cx="10" cy="10" r="3" stroke="currentColor" fill="none" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l3-3" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 transition-colors duration-300 hover:text-red-600">Our Vision</h2>
                  <p className="text-gray-800 leading-relaxed">
                    To be Somalia&apos;s leading English language academy, equipping learners with the confidence, skills, 
                    and global mindset to thrive in education, careers, and future leadership roles.
                  </p>
                </div>
              </div>
            </div>

            {/* Our Mission */}
            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                    <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 transition-colors duration-300 hover:text-blue-600">Our Mission</h2>
                  <p className="text-gray-800 leading-relaxed">
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

