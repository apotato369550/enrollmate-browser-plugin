/**
 * Data Parser for EnrollMate Browser Extension
 * Handles time parsing, enrollment parsing, and data validation
 */

/**
 * Parse schedule time string into structured format
 * Examples:
 * "MWF 10:00 AM - 11:30 AM" -> { days: ['M','W','F'], startTime: "10:00", endTime: "11:30", format: "12h" }
 * "TBA" -> { days: [], startTime: null, endTime: null, format: null }
 */
export function parseScheduleTime(scheduleStr) {
  if (!scheduleStr || scheduleStr.toUpperCase() === 'TBA' || scheduleStr === 'N/A') {
    return { days: [], startTime: null, endTime: null, format: null, isTBA: true };
  }

  const result = {
    days: [],
    startTime: null,
    endTime: null,
    format: null,
    isTBA: false
  };

  // Extract days (M, T, W, Th, F, S, Su)
  const daysRegex = /(M|T|W|Th|F|S|Su)/gi;
  const daysMatches = scheduleStr.match(daysRegex);
  if (daysMatches) {
    result.days = daysMatches.map(d => d.charAt(0).toUpperCase());
  }

  // Extract times (handles "10:00 AM - 11:30 AM" or "10:00 - 11:30" or "10:00AM-11:30AM")
  const timeRegex = /(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?\s*[-–]\s*(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)?/;
  const timeMatch = scheduleStr.match(timeRegex);

  if (timeMatch) {
    const startHour = timeMatch[1];
    const startMin = timeMatch[2];
    const startPeriod = timeMatch[3];
    const endHour = timeMatch[4];
    const endMin = timeMatch[5];
    const endPeriod = timeMatch[6];

    // Determine format (12-hour or 24-hour)
    if (startPeriod || endPeriod) {
      result.format = '12h';
      result.startTime = `${startHour}:${startMin} ${startPeriod || 'AM'}`;
      result.endTime = `${endHour}:${endMin} ${endPeriod || 'PM'}`;
    } else {
      result.format = '24h';
      result.startTime = `${startHour}:${startMin}`;
      result.endTime = `${endHour}:${endMin}`;
    }
  }

  return result;
}

/**
 * Normalize enrollment string
 * Examples:
 * "25/30" -> { enrolled: 25, total: 30 }
 * "25 / 30" -> { enrolled: 25, total: 30 }
 */
export function normalizeEnrollment(enrollStr) {
  if (!enrollStr) {
    return { enrolled: 0, total: 0 };
  }

  const match = enrollStr.match(/(\d+)\s*\/\s*(\d+)/);
  if (match) {
    return {
      enrolled: parseInt(match[1]),
      total: parseInt(match[2])
    };
  }

  return { enrolled: 0, total: 0 };
}

/**
 * Extract and validate course code
 * Examples:
 * "CIS 2103" -> "CIS 2103"
 * "CIS2103" -> "CIS 2103"
 * "CIS 2103 - 001" -> "CIS 2103"
 */
export function extractCourseCode(text) {
  if (!text) return null;

  // Match pattern: 2-4 letters, optional space, 4 digits
  const match = text.match(/([A-Z]{2,4})\s*(\d{4})/);
  if (match) {
    return `${match[1]} ${match[2]}`;
  }

  return null;
}

/**
 * Extract section group number from course code or section info
 * Examples:
 * "CIS 2103 - Group 1" -> 1
 * "CIS 2103-001" -> 1
 * "001" -> 1
 */
export function extractSectionGroup(text) {
  if (!text) return 1;

  // Try to extract number from "Group X" or "Grp X"
  const groupMatch = text.match(/group\s*(\d+)/i);
  if (groupMatch) {
    return parseInt(groupMatch[1]);
  }

  // Try to extract from section number like "-001" or "001"
  const sectionMatch = text.match(/(?:-|Group\s*)(\d+)/);
  if (sectionMatch) {
    const num = parseInt(sectionMatch[1]);
    return num || 1;
  }

  return 1;
}

/**
 * Determine course status based on enrollment
 */
export function determineCourseStatus(enrolledCurrent, enrolledTotal) {
  if (!Number.isInteger(enrolledCurrent) || !Number.isInteger(enrolledTotal)) {
    return 'UNKNOWN';
  }

  if (enrolledTotal === 0) {
    return 'UNKNOWN';
  }

  if (enrolledCurrent >= enrolledTotal) {
    return 'FULL';
  }

  if (enrolledCurrent === 0) {
    return 'AVAILABLE';
  }

  // Calculate if at risk (less than 25% available)
  const percentageFull = (enrolledCurrent / enrolledTotal) * 100;
  if (percentageFull >= 85) {
    return 'AT-RISK';
  }

  return 'OK';
}

/**
 * Clean and normalize text
 */
export function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
    .trim();
}

/**
 * Validate course object
 */
export function validateCourse(course) {
  // Check required fields
  if (!course.courseCode || !course.courseName) {
    return null;
  }

  // Clean strings
  course.courseCode = cleanText(course.courseCode);
  course.courseName = cleanText(course.courseName);
  course.schedule = cleanText(course.schedule || 'TBA');
  course.instructor = cleanText(course.instructor || '');
  course.room = cleanText(course.room || '');

  // Ensure numeric fields are valid integers
  course.sectionGroup = parseInt(course.sectionGroup) || 1;
  course.enrolledCurrent = parseInt(course.enrolledCurrent) || 0;
  course.enrolledTotal = parseInt(course.enrolledTotal) || 0;

  // Ensure status is set
  course.status = determineCourseStatus(course.enrolledCurrent, course.enrolledTotal);

  // Add additional metadata
  course.extractedAt = new Date().toISOString();

  return course;
}

/**
 * Remove duplicate courses
 * Two courses are considered duplicates if they have the same:
 * courseCode + sectionGroup + schedule
 */
export function removeDuplicates(courses) {
  const seen = new Set();
  return courses.filter(course => {
    const key = `${course.courseCode}_${course.sectionGroup}_${course.schedule}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Sort courses by code, then by section group
 */
export function sortCourses(courses) {
  return courses.sort((a, b) => {
    if (a.courseCode !== b.courseCode) {
      return a.courseCode.localeCompare(b.courseCode);
    }
    return a.sectionGroup - b.sectionGroup;
  });
}

/**
 * Format a course object for display
 */
export function formatCourseForDisplay(course) {
  return {
    courseCode: course.courseCode,
    courseName: course.courseName,
    section: `Group ${course.sectionGroup}`,
    schedule: course.schedule,
    enrollment: course.enrolledTotal > 0 ? `${course.enrolledCurrent}/${course.enrolledTotal}` : 'N/A',
    instructor: course.instructor || 'N/A',
    room: course.room || 'N/A',
    status: course.status
  };
}
