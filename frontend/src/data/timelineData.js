// Shared timeline data for Course Timeline and Countdown Timer
export const timelineData = [
  { 
    termSerial: "BEA-01", 
    startDate: "31/01/2026", 
    endDate: "25/02/2026", 
    holidays: ""
  },
  { 
    termSerial: "BEA-02", 
    startDate: "07/03/2026", 
    endDate: "08/04/2026", 
    holidays: "19th to the 20th of March 2026—Eid-Alfitr Celebration",
    holidayRowspan: 1
  },
  { 
    termSerial: "BEA-03", 
    startDate: "18/04/2026", 
    endDate: "06/05/2026", 
    holidays: "26th of May 2026 Eid-Al-adha Celebration",
    holidayRowspan: 1
  },
  { 
    termSerial: "BEA-04", 
    startDate: "16/05/2026", 
    endDate: "10/06/2026", 
    holidays: ""
  },
  { 
    termSerial: "BEA-05", 
    startDate: "20/06/2026", 
    endDate: "18/07/2026", 
    holidays: "26th of June to the 1st of July 2026— Somali Independence Week",
    holidayRowspan: 1
  },
  { 
    termSerial: "BEA-06", 
    startDate: "25/07/2026", 
    endDate: "12/08/2026", 
    holidays: ""
  },
  { 
    termSerial: "BEA-07", 
    startDate: "22/08/2026", 
    endDate: "16/09/2026", 
    holidays: ""
  },
  { 
    termSerial: "BEA-08", 
    startDate: "23/09/2026", 
    endDate: "21/10/2026", 
    holidays: ""
  },
  { 
    termSerial: "BEA-09", 
    startDate: "31/10/2026", 
    endDate: "25/11/2026", 
    holidays: "21st of November 2026—Somali Teachers' Day",
    holidayRowspan: 1
  },
  { 
    termSerial: "BEA-10", 
    startDate: "5/12/2026", 
    endDate: "30/12/2026", 
    holidays: ""
  },
];

// Helper function to convert DD/MM/YYYY to Date object
export const parseDate = (dateString) => {
  const [day, month, year] = dateString.split('/').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed in JavaScript
};

// Helper function to check if we're currently in any term period
export const isCurrentlyInTerm = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
  
  return timelineData.some(term => {
    const startDate = parseDate(term.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = parseDate(term.endDate);
    endDate.setHours(23, 59, 59, 999); // Include the end date
    
    return now >= startDate && now <= endDate;
  });
};

// Helper function to get the current active term (the term we're currently in)
export const getCurrentTerm = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
  
  const currentTerm = timelineData.find(term => {
    const startDate = parseDate(term.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = parseDate(term.endDate);
    endDate.setHours(23, 59, 59, 999); // Include the end date
    
    return now >= startDate && now <= endDate;
  });
  
  return currentTerm || null;
};

// Helper function to get the next upcoming term
export const getNextTerm = () => {
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
  
  // Find all upcoming terms
  const upcomingTerms = timelineData
    .map(term => ({
      ...term,
      startDateObj: parseDate(term.startDate),
      endDateObj: parseDate(term.endDate)
    }))
    .filter(term => term.startDateObj > now) // Only terms that haven't started yet
    .sort((a, b) => a.startDateObj - b.startDateObj); // Sort by start date
  
  // Return the next upcoming term (first in sorted array)
  return upcomingTerms.length > 0 ? upcomingTerms[0] : null;
};

