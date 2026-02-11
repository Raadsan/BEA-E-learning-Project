const currentYear = new Date().getFullYear();

// Shared timeline data for Course Timeline and Countdown Timer
export const timelineData = [
  { termSerial: "BEA-01 (Jan)", startDate: `01/01/${currentYear}`, endDate: `25/01/${currentYear}`, holidays: "" },
  { termSerial: "BEA-02 (Feb)", startDate: `01/02/${currentYear}`, endDate: `25/02/${currentYear}`, holidays: "" },
  { termSerial: "BEA-03 (Mar)", startDate: `01/03/${currentYear}`, endDate: `25/03/${currentYear}`, holidays: "Eid-Alfitr Celebration" },
  { termSerial: "BEA-04 (Apr)", startDate: `01/04/${currentYear}`, endDate: `25/04/${currentYear}`, holidays: "" },
  { termSerial: "BEA-05 (May)", startDate: `01/05/${currentYear}`, endDate: `25/05/${currentYear}`, holidays: "Eid-Al-adha Celebration" },
  { termSerial: "BEA-06 (Jun)", startDate: `01/06/${currentYear}`, endDate: `25/06/${currentYear}`, holidays: "Somali Independence Week" },
  { termSerial: "BEA-07 (Jul)", startDate: `01/07/${currentYear}`, endDate: `25/07/${currentYear}`, holidays: "" },
  { termSerial: "BEA-08 (Aug)", startDate: `01/08/${currentYear}`, endDate: `25/08/${currentYear}`, holidays: "" },
  { termSerial: "BEA-09 (Sep)", startDate: `01/09/${currentYear}`, endDate: `25/09/${currentYear}`, holidays: "" },
  { termSerial: "BEA-10 (Oct)", startDate: `01/10/${currentYear}`, endDate: `25/10/${currentYear}`, holidays: "" },
  { termSerial: "BEA-11 (Nov)", startDate: `01/11/${currentYear}`, endDate: `25/11/${currentYear}`, holidays: "Somali Teachers' Day" },
  { termSerial: "BEA-12 (Dec)", startDate: `01/12/${currentYear}`, endDate: `25/12/${currentYear}`, holidays: "" },
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

