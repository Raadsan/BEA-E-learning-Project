export default function Introduction() {
  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
        {/* Promotional Box */}
        <div className="border border-pink-200 rounded-lg p-6 sm:p-8 mb-8 sm:mb-12">
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

        {/* Content Paragraphs */}
        <div className="space-y-6 text-blue-900 leading-relaxed">
          <p className="text-base sm:text-lg">
            The Blueprint English Academy (BEA) stands as Somalia&apos;s premier institution for English language education, 
            setting the standard for excellence and innovation. BEA is more than a language school—it is a gateway to 
            opportunities in education, business, and professional development.
          </p>
          
          <p className="text-base sm:text-lg">
            Our <strong>General English Program</strong> is built on the{" "}
            <strong>Common European Framework of Reference (CEFR)</strong>—the world&apos;s benchmark for language 
            proficiency assessments from beginner (A1) to advanced plus (C2). This helps us place every learner precisely 
            where they belong for optimal engagement.{" "}
            <a href="/about-us" className="text-red-600 font-bold hover:underline inline-block">
              Read more!
            </a>
          </p>
        </div>
        </div>
      </div>
    </section>
  );
}
