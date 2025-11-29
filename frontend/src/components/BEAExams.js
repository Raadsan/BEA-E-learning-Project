export default function BEAExams() {
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
            BEA Exams
          </h1>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Introduction */}
            <p className="text-gray-800 leading-relaxed text-base sm:text-lg">
              As an Educational Institution, we believe every learner&apos;s journey begins with understanding their true level of English proficiency. To ensure every student receives the most effective and personalized learning experience, BEA employs two key assessments — the BEA Placement Test and the BEA Proficiency Test.
            </p>
            
            {/* Call to Action */}
            <p className="text-blue-900 font-serif text-base sm:text-lg font-semibold">
              To learn more about BEA Exams, check the two tables below
            </p>
            
            {/* Test Listings */}
            <div className="space-y-8 mt-12">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                  1. BEA PLACEMENT TEST
                </h2>
                
                {/* Placement Test Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md">
                    <thead>
                      <tr className="bg-red-600">
                        <th className="px-6 py-4 text-left text-white font-semibold text-sm sm:text-base">Category</th>
                        <th className="px-6 py-4 text-left text-white font-semibold text-sm sm:text-base">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white border-b border-gray-200">
                        <td className="px-6 py-4 font-semibold text-gray-900 text-sm sm:text-base">Purpose</td>
                        <td className="px-6 py-4 text-gray-800 text-sm sm:text-base leading-relaxed">
                          This course prepares candidates for both Academic and General Training modules. Students develop listening accuracy, analytical reading skills, structured academic writing, and fluent speaking ability. BEA integrates practice tests, examiner-style feedback, and vocabulary enhancement to ensure familiarity with all question types and scoring criteria.
                        </td>
                      </tr>
                      <tr className="bg-white border-b border-gray-200">
                        <td className="px-6 py-4 font-semibold text-gray-900 text-sm sm:text-base">Mandatory for All New Students</td>
                        <td className="px-6 py-4 text-gray-800 text-sm sm:text-base leading-relaxed">
                          The BEA Placement Test is a core component of our admissions process and is designed to place every new student in the class that best matches their language ability. Every incoming student is required to complete the BEA Placement Test before joining any class. This ensures accurate placement and a smooth learning experience.
                        </td>
                      </tr>
                      <tr className="bg-white border-b border-gray-200">
                        <td className="px-6 py-4 font-semibold text-gray-900 text-sm sm:text-base">Flexible Testing Options</td>
                        <td className="px-6 py-4 text-gray-800 text-sm sm:text-base leading-relaxed">
                          Students can take the placement test either in-class at our campus or online through our E-learning portal.
                        </td>
                      </tr>
                      <tr className="bg-white border-b border-gray-200">
                        <td className="px-6 py-4 font-semibold text-gray-900 text-sm sm:text-base">Comprehensive Assessment Format</td>
                        <td className="px-6 py-4 text-gray-800 text-sm sm:text-base leading-relaxed">
                          The test includes both written and oral components, measuring grammar, vocabulary, reading comprehension, listening, and speaking skills.
                        </td>
                      </tr>
                      <tr className="bg-white border-b border-gray-200">
                        <td className="px-6 py-4 font-semibold text-gray-900 text-sm sm:text-base">Personal Interview Session</td>
                        <td className="px-6 py-4 text-gray-800 text-sm sm:text-base leading-relaxed">
                          After receiving the written test results, every student attends a one-on-one interview with our English Teacher Panel, regardless of their written score.
                        </td>
                      </tr>
                      <tr className="bg-white border-b border-gray-200">
                        <td className="px-6 py-4 font-semibold text-gray-900 text-sm sm:text-base">Expert Level Placement</td>
                        <td className="px-6 py-4 text-gray-800 text-sm sm:text-base leading-relaxed">
                          Final placement decisions are made by BEA&apos;s teacher panel, ensuring each learner is assigned to the most suitable level for their current ability and growth potential.
                        </td>
                      </tr>
                      <tr className="bg-white border-b border-gray-200">
                        <td className="px-6 py-4 font-semibold text-gray-900 text-sm sm:text-base">Fast and Transparent Feedback</td>
                        <td className="px-6 py-4 text-gray-800 text-sm sm:text-base leading-relaxed">
                          Results and placement recommendations are provided within 24 hours, allowing students to begin their course without delay.
                        </td>
                      </tr>
                      <tr className="bg-white">
                        <td className="px-6 py-4 font-semibold text-gray-900 text-sm sm:text-base">Progressive Learning Pathway</td>
                        <td className="px-6 py-4 text-gray-800 text-sm sm:text-base leading-relaxed">
                          The test results also help BEA design a personalized learning plan to support students&apos; progress across our 8-Level General English Program.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                  2. BEA PROFICIENCY TEST
                </h2>
                
                {/* Proficiency Test Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse rounded-lg overflow-hidden shadow-md">
                    <thead>
                      <tr className="bg-gray-700">
                        <th className="px-6 py-4 text-left text-white font-semibold text-sm sm:text-base">Category</th>
                        <th className="px-6 py-4 text-left text-white font-semibold text-sm sm:text-base">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white border-b border-gray-200">
                        <td className="px-6 py-4 font-semibold text-gray-900 text-sm sm:text-base">Purpose</td>
                        <td className="px-6 py-4 text-gray-800 text-sm sm:text-base leading-relaxed">
                          The BEA Proficiency Test is an advanced-level assessment designed for experienced English learners seeking formal recognition of their language mastery.
                        </td>
                      </tr>
                      <tr className="bg-white border-b border-gray-200">
                        <td className="px-6 py-4 font-semibold text-gray-900 text-sm sm:text-base">Optional but Highly Recognized</td>
                        <td className="px-6 py-4 text-gray-800 text-sm sm:text-base leading-relaxed">
                          Unlike the placement test, participation is voluntary, but it serves as a benchmark of achievement for advanced learners.
                        </td>
                      </tr>
                      <tr className="bg-white border-b border-gray-200">
                        <td className="px-6 py-4 font-semibold text-gray-900 text-sm sm:text-base">Flexible Testing Options</td>
                        <td className="px-6 py-4 text-gray-800 text-sm sm:text-base leading-relaxed">
                          Available both in-class and online, making it accessible to local and international candidates.
                        </td>
                      </tr>
                      <tr className="bg-white border-b border-gray-200">
                        <td className="px-6 py-4 font-semibold text-gray-900 text-sm sm:text-base">Dual-Test Format</td>
                        <td className="px-6 py-4 text-gray-800 text-sm sm:text-base leading-relaxed">
                          The test includes written and oral components, assessing academic writing, listening, reading, and spoken fluency.
                        </td>
                      </tr>
                      <tr className="bg-white border-b border-gray-200">
                        <td className="px-6 py-4 font-semibold text-gray-900 text-sm sm:text-base">Certification and Academic Credit</td>
                        <td className="px-6 py-4 text-gray-800 text-sm sm:text-base leading-relaxed">
                          Students who pass with distinction may receive the BEA English Proficiency Certificate, often recognized for academic or professional advancement.
                        </td>
                      </tr>
                      <tr className="bg-white border-b border-gray-200">
                        <td className="px-6 py-4 font-semibold text-gray-900 text-sm sm:text-base">For Advanced and Proficient Learners Only</td>
                        <td className="px-6 py-4 text-gray-800 text-sm sm:text-base leading-relaxed">
                          This test is exclusively designed for Advanced Plus students or those demonstrating near-native fluency seeking university admission or professional validation.
                        </td>
                      </tr>
                      <tr className="bg-white border-b border-gray-200">
                        <td className="px-6 py-4 font-semibold text-gray-900 text-sm sm:text-base">Aligned with Global Standards</td>
                        <td className="px-6 py-4 text-gray-800 text-sm sm:text-base leading-relaxed">
                          The test structure reflects international benchmarks such as CEFR, IELTS, and TOEFL scales, ensuring its credibility and relevance.
                        </td>
                      </tr>
                      <tr className="bg-white">
                        <td className="px-6 py-4 font-semibold text-gray-900 text-sm sm:text-base">Career and Academic Utility</td>
                        <td className="px-6 py-4 text-gray-800 text-sm sm:text-base leading-relaxed">
                          Many graduates use the BEA Proficiency Test results to strengthen their university applications or career profiles, both locally and abroad.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

