export default function CourseTimeline() {
  const timelineData = [
    { 
      term: "BEA-01", 
      startDate: "31-01-2026", 
      endDate: "25-02-2026", 
      holidays: "-"
    },
    { 
      term: "BEA-02", 
      startDate: "31-01-2026", 
      endDate: "25-02-2026", 
      holidays: "19th to the 20th of March 2026 - Eid Al-Fitr Celebration"
    },
    { 
      term: "BEA-03", 
      startDate: "18-04-2026", 
      endDate: "06-05-2026", 
      holidays: "19th to the 20th of March 2026, 26th of May 2026 - Eid Al-Adha Celebration"
    },
    { 
      term: "BEA-04", 
      startDate: "16-05-2026", 
      endDate: "10-06-2026", 
      holidays: "-"
    },
    { 
      term: "BEA-05", 
      startDate: "20-06-2026", 
      endDate: "18-07-2026", 
      holidays: "26th of June to the 1st of July 2026 - Independence Week"
    },
    { 
      term: "BEA-06", 
      startDate: "25-07-2026", 
      endDate: "12-08-2026", 
      holidays: "-"
    },
    { 
      term: "BEA-07", 
      startDate: "22-08-2026", 
      endDate: "16-09-2026", 
      holidays: "-"
    },
    { 
      term: "BEA-08", 
      startDate: "23-09-2026", 
      endDate: "21-10-2026", 
      holidays: "-"
    },
  ];

  return (
    <section className="bg-gray-50 py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-blue-600 text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
              Course Timeline
            </h2>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-700">
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                    Term Index number
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                    Holidays
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {timelineData.map((item, index) => (
                  <tr 
                    key={index} 
                    className={`transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-bold text-sm">{item.term.slice(-2)}</span>
                        </div>
                        <span className="text-gray-900 font-semibold">{item.term}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900 font-medium">{item.startDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900 font-medium">{item.endDate}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm ${
                        item.holidays === "-" 
                          ? "text-gray-400 italic" 
                          : "text-gray-700"
                      }`}>
                        {item.holidays === "-" ? "No holidays" : item.holidays}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Total Terms</p>
                <p className="text-2xl font-bold text-gray-900">{timelineData.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Duration</p>
                <p className="text-2xl font-bold text-gray-900">1 Month</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Holidays</p>
                <p className="text-2xl font-bold text-gray-900">
                  {timelineData.filter(item => item.holidays !== "-").length}
                </p>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}