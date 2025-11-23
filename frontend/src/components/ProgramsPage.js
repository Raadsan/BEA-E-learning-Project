import Image from "next/image";

export default function ProgramsPage() {
  const programs = [
    {
      id: 1,
      title: "8- Level General English Course for Adults",
      description: "We teach the internationally acclaimed English File 4th Edition published by the Oxford University Press—one of the world's most trusted and research-driven English language programs.",
      image: "/images/book1.jpg",
      alt: "8- Level General English Course for Adults"
    },
    {
      id: 2,
      title: "English for Specific Purposes (ESP)",
      description: "Our English for Specific Purposes (ESP) program is designed to equip learners with the precise language skills they need to excel in their chosen professions. Whether communicating in the boardroom, writing for publication, or engaging with global clients, our ESP courses merge linguistic accuracy with real-world professional relevance.",
      image: "/images/English for Specific Purposes (ESP).webp",
      alt: "English for Specific Purposes (ESP)"
    },
    {
      id: 3,
      title: "IELTS & TOEFL Preparation Course",
      description: "Our IELTS and TOEFL Preparation Programs are strategically developed to help learners succeed in the world's most recognized English proficiency exams. Both programs focus on building test-specific skills, academic communication strategies, and confidence through comprehensive lessons and simulated testing experiences.",
      image: "/images/IELTS & TOEFL Preparation Courses1.jpg",
      alt: "IELTS & TOEFL Preparation Course"
    },
    {
      id: 4,
      title: "Professional Skills and Training Programs",
      description: "As an institution we go beyond language learning to empower individuals with the professional and 21st-century skills essential for success in today's global workplace. Our Professional Skills & Training Programs are carefully designed to develop the communication, critical thinking, leadership, and digital capabilities demanded by modern employers and international industries.",
      image: "/images/Professional Skills and Training Programs.jpg",
      alt: "Professional Skills and Training Programs"
    },
    {
      id: 5,
      title: "Advanced Academic Writing Program",
      description: "The Advanced Academic Writing Program at The Blueprint English Academy (BEA) is designed for students, researchers, and professionals who wish to refine their written communication for academic success.",
      image: "/images/Advanced Academic Writing Program.jpg",
      alt: "Advanced Academic Writing Program"
    },
    {
      id: 6,
      title: "Digital Literacy and Virtual",
      description: "In today's fast-changing, technology-driven world, the ability to use digital tools and communicate effectively online has become essential. Our Digital Literacy and Virtual Communication Skills Program equips learners with the technical and communication skills needed to thrive in academic, professional, and global digital environments.",
      image: "/images/Digital Literacy & Virtual Communication Skills Program1.jpg",
      alt: "Digital Literacy and Virtual"
    },
  ];

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
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif italic text-white mb-4 relative inline-block">
            Programs
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" style={{ left: '-10%', right: '-10%' }}></span>
          </h1>
        </div>
      </section>

      {/* Introductory Text Section */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-6 text-gray-800 leading-relaxed text-base sm:text-lg">
            <p>
              We offer a unique portfolio of programs designed to redefine English learning through purpose, innovation, and global relevance.
            </p>
            
            <p>
              From our 8-Level General English Course for Adults to ESP (English For Specific Purposes), IELTS & TOEFL preparation, and Advanced Academic Writing, every program builds confidence, fluency, and real-world communication skills.
            </p>
            
            <p>
              What truly sets BEA apart is our focus on connecting language with life skills. Through our Professional Skills and Training Programs and Digital Literacy & Virtual Skills Program, students gain the tools to thrive in today&apos;s workplace and digital world—making BEA a true blueprint for personal and professional growth.
            </p>
          </div>
        </div>
      </section>

      {/* BEA Programs Portfolio Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-blue-900 text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
                BEA Programs Portfolio
              </h2>
              <p className="text-gray-600 text-base sm:text-lg">
                Learn more about BEA&apos;s unique program portfolio.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {programs.map((program) => (
                <div
                  key={program.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
                >
                  {/* Image */}
                  <div className="relative w-full h-48 sm:h-56 overflow-hidden">
                    <Image
                      src={program.image}
                      alt={program.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3">
                      {program.title}
                    </h3>
                    
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-4 flex-1">
                      {program.description}
                    </p>
                    
                    {/* Register Now Button */}
                    <button className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm sm:text-base w-full">
                      Register Now
                    </button>
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

