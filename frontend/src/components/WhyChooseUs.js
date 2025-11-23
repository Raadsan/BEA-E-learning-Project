import Image from "next/image";

export default function WhyChooseUs() {
  const reasons = [
    {
      id: 1,
      title: "Student-Centered Learning",
      description: "We believe every learner has a unique voice. Our modern teaching style ensures lessons are interactive, practical, and designed around you—not just the textbook.",
      image: "/images/Student—Centered Learning.jpg",
      alt: "Student-Centered Learning"
    },
    {
      id: 2,
      title: "World-Class Resources",
      description: "We teach Oxford University's English File 4th Edition—an internationally recognized English language learning series that builds real-world communication skills step by step.",
      image: "/images/book1.jpg",
      alt: "World-Class Resources"
    },
    {
      id: 3,
      title: "Prioritizing Speaking Confidence",
      description: "Understanding English is one thing, speaking it fluently is another. Our classes emphasize active speaking practice so you can unlock your voice and use English with ease in school, work, or daily life.",
      image: "/images/Prioritizing Speaking Confidence.jpg",
      alt: "Prioritizing Speaking Confidence"
    },
    {
      id: 4,
      title: "Experienced and Supportive Instructors",
      description: "Our team is passionate about helping students overcome fear and hesitation. We guide you patiently, encourage you to try, and celebrate your progress.",
      image: "/images/Experienced and Supportive Instructors.jpg",
      alt: "Experienced and Supportive Instructors"
    },
    {
      id: 5,
      title: "A Path to Global Opportunities",
      description: "English opens doors—to higher education, global careers, and meaningful connections. We prepare you not just to pass exams, but to succeed in the world beyond the classroom.",
      image: "/images/A Path to Global Opportunities.jpg",
      alt: "A Path to Global Opportunities"
    },
    {
      id: 6,
      title: "Innovative Learning Environment",
      description: "BEA provides a vibrant, technology-enhanced classroom experience that blends creativity with academic excellence. From digital media integration to interactive projects, students learn English in dynamic, real-life contexts that make lessons memorable and impactful.",
      image: "/images/Innovative Learning Environment.jpg",
      alt: "Innovative Learning Environment"
    },
  ];

  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16 max-w-5xl mx-auto">
          <h2 className="text-blue-900 text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Why Students Are Choosing Us?
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 lg:gap-12 max-w-5xl mx-auto">
          {reasons.map((reason) => (
            <div
              key={reason.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 h-[450px] flex flex-col"
            >
              {/* Image */}
              <div className="relative w-full h-60 flex-shrink-0">
                <Image
                  src={reason.image}
                  alt={reason.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              
              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-base font-bold text-blue-900 mb-3">
                  {reason.title}
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed flex-1">
                  {reason.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
