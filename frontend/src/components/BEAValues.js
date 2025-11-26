import Image from "next/image";

export default function BEAValues() {
  const valuesVideos = [
    {
      id: 1,
      title: "Rational Values",
      description: "Our Rational Values represent the guiding principles that uphold our mission and shape our learners into thoughtful, confident, and ethical individuals.",
      image: "/images/A Path to Global Opportunities.jpg",
      alt: "Rational Values"
    },
    {
      id: 2,
      title: "Pedagogical Values",
      description: "Our Pedagogical Values define the principles that shape how we teach, inspire, and support our learners. These values reflect our belief that education should be student-centered, purposeful, and transformative. We focus on creating a learning environment that promotes curiosity, critical thinking, creativity, and meaningful engagement.",
      image: "/images/Innovative Learning Environment.jpg",
      alt: "Pedagogical Values"
    },
    {
      id: 3,
      title: "Civic Values",
      description: "Our Civic Values emphasize the importance of responsibility, participation, and respect within the community. We believe that education extends beyond the classroom—it prepares individuals to become active, ethical, and compassionate members of society.",
      image: "/images/A Path to Global Opportunities.jpg",
      alt: "Civic Values"
    },
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
            Our BEA Values
          </h1>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-6 text-gray-800 leading-relaxed text-base sm:text-lg">
            <p>
              Our values form the foundation of everything we do — guiding our teaching philosophy, our community, and our vision for empowering learners through the English language. We believe that language is more than a skill; it is a bridge to opportunity, connection, and transformation.
            </p>
            
            <p>
              Our academy is built on <strong>Excellence</strong>, ensuring the highest academic and professional standards in every program we deliver. We champion <strong>Integrity</strong>, honesty, respect, and responsibility in both teaching and learning. These values drive our teaching methods, inspiring creativity in the classroom and encouraging learners to think globally and act confidently in a changing world.
            </p>
            
            <p>
              We welcome learners from all backgrounds and cultures, celebrating <strong>Diversity</strong> as a source of strength. Through <strong>Collaboration</strong>, we nurture teamwork among students, teachers, and partners to achieve shared success.
            </p>
            
            <p>
              Finally, we are guided by a spirit of <strong>Continuous Growth</strong>—helping each learner and educator to reach their full potential, personally and professionally. These values define who we are, what we teach, and how we inspire every learner to become a confident, capable communicator in English — ready to lead, contribute, and make a difference globally.
            </p>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="mb-10 sm:mb-12 text-center">
              <h2 className="text-gray-900 text-xl sm:text-2xl lg:text-3xl font-serif font-bold mb-3">
                Watch these 3 Videos to learn more about our BEA Values
              </h2>
              <p className="text-gray-700 text-base sm:text-lg">
                Choose from our expertly designed courses tailored to your level and goals.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {valuesVideos.map((video) => (
                <div
                  key={video.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Video Thumbnail */}
                  <div className="relative w-full h-48 overflow-hidden rounded-t-xl group">
                    <Image
                      src={video.image}
                      alt={video.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                      <div className="w-14 h-14 border-2 border-white rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      {video.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {video.description}
                    </p>
                    <a
                      href="#"
                      className="text-red-600 font-semibold inline-flex items-center gap-1 hover:text-red-700 transition-colors text-sm"
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
    </div>
  );
}

