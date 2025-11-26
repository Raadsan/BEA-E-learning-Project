export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      quote: "EnglishMaster transformed my career! I went from struggling with presentations to confidently leading international meetings. The business English course was exactly what I needed.",
      name: "Mohamed",
      role: "Marketing Manager",
      initials: "MO"
    },
    {
      id: 2,
      quote: "EnglishMaster transformed my career! I went from struggling with presentations to confidently leading international meetings. The business English course was exactly what I needed.",
      name: "MOhamed",
      role: "Marketing Manager",
      initials: "MO"
    },
    {
      id: 3,
      quote: "EnglishMaster transformed my career! I went from struggling with presentations to confidently leading international meetings. The business English course was exactly what I needed.",
      name: "Ruweyda",
      role: "Marketing Manager",
      initials: "RU"
    },
  ];

  return (
    <section className="bg-gray-100 py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-gray-900 text-3xl sm:text-4xl lg:text-5xl font-serif font-bold mb-3">
              What Our Students Say
            </h2>
            <p className="text-gray-700 text-base sm:text-lg">
              Join thousands of successful learners who achieved their English goals with us.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-lg p-6 shadow-md"
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                
                {/* Quote */}
                <p className="text-gray-700 text-sm leading-relaxed mb-6">
                  &quot;{testimonial.quote}&quot;
                </p>
                
                {/* Student Info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">
                      {testimonial.initials}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-900 font-bold text-sm">
                      {testimonial.name}
                    </p>
                    <p className="text-gray-600 text-xs">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

