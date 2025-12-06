// Function to map program titles to their routes
export const getProgramRoute = (title) => {
  const routeMap = {
    "General English Program For Adults": "/website/programs/8-level-general-english",
    "English for Specific Purposes (ESP) Program": "/website/programs/esp",
    "IELTS and TOEFL Exam Preparation Courses": "/website/programs/ielts-toefl",
    "Soft Skills and Workplace Training Programs": "/website/programs/professional-skills",
    "BEA Academic Writing Program": "/website/programs/academic-writing",
    "Digital Literacy and Virtual Communication Skills Program": "/website/programs/digital-literacy",
  };

  // Try exact match first
  if (routeMap[title]) {
    return routeMap[title];
  }

  // Try partial matching for flexibility
  const titleLower = title.toLowerCase();
  if (titleLower.includes("general english") || titleLower.includes("8-level")) {
    return "/website/programs/8-level-general-english";
  }
  if (titleLower.includes("esp") || titleLower.includes("specific purposes")) {
    return "/website/programs/esp";
  }
  if (titleLower.includes("ielts") || titleLower.includes("toefl")) {
    return "/website/programs/ielts-toefl";
  }
  if (titleLower.includes("soft skills") || titleLower.includes("workplace training") || titleLower.includes("professional skills")) {
    return "/website/programs/professional-skills";
  }
  if (titleLower.includes("academic writing")) {
    return "/website/programs/academic-writing";
  }
  if (titleLower.includes("digital literacy") || titleLower.includes("virtual communication")) {
    return "/website/programs/digital-literacy";
  }

  // Default fallback
  return `/website/programs/${title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`;
};

