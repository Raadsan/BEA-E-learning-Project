export default function RationalValues() {
  const values = [
    {
      id: 1,
      title: "Human Dignity",
      description: "We recognize the inherent worth and value of every individual. At BEA, we ensure that every learner, educator, and staff member is treated with compassion, fairness, and respect. We create an environment where everyone feels valued, heard, and empowered to reach their full potential."
    },
    {
      id: 2,
      title: "Cultural Integrity",
      description: "As a Somali institution, BEA is deeply committed to honoring and preserving our cultural heritage while embracing global perspectives. We celebrate cultural diversity, encourage cultural appreciation, and foster an environment where cultural identity is respected and valued. We believe that understanding and respecting different cultures strengthens our community and enriches the learning experience."
    },
    {
      id: 3,
      title: "Respectful",
      description: "Respect is at the heart of everything we do. We treat every individual with dignity, regardless of their background, beliefs, or circumstances. We foster an environment where ideas can be shared openly, differences are celebrated, and collaboration thrives. By modeling respect in all interactions, we build trust, enhance collaboration, and create a foundation for enhanced achievement and well-being."
    },
    {
      id: 4,
      title: "Transparency",
      description: "We believe that transparency is essential for building trust, accountability, and growth. We are open and honest in our communication, policies, and practices. Students, parents, and partners can trust that we operate with integrity and clarity. We ensure that expectations are clear, progress is visible, and feedback is welcomed and acted upon."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section 
        className="relative flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #1a237e 0%, #311b92 50%, #b71c1c 100%)',
          height: '170px'
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif italic text-white mb-4">
            Rational Values
          </h1>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Introductory Paragraph */}
            <div className="mb-10 sm:mb-12">
              <p className="text-gray-800 text-base sm:text-lg leading-relaxed">
                Our foundation is built upon values that guide every action, interaction, and educational decision. We believe that learning is not only about acquiring knowledge—it&apos;s about shaping character and nurturing a respectful, responsible, and inclusive community. Our Rational Values represent the guiding principles that uphold our mission and shape our learners into thoughtful, confident, and ethical individuals.
              </p>
            </div>

            {/* Value Cards */}
            <div className="space-y-6 sm:space-y-8">
              {values.map((value) => (
                <div
                  key={value.id}
                  className="bg-white rounded-xl shadow-md p-6 sm:p-8 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                        {value.title}
                      </h3>
                      <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

