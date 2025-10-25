/**
 * Content Script for EnrollMate Course Extractor
 * Runs on the page and extracts course data from DOM
 */

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'SCRAPE_COURSES') {
    try {
      const result = scrapeCoursesFromPage();
      sendResponse({
        success: true,
        courses: result.courses,
        pageType: result.pageType,
        scrapedAt: result.scrapedAt,
        courseCount: result.courseCount
      });
    } catch (error) {
      sendResponse({
        success: false,
        error: error.message
      });
    }
  }
});

/**
 * Main function to scrape courses from the page
 */
function scrapeCoursesFromPage() {
  // Try to detect page type and use appropriate scraper
  const detectedType = detectPageType();

  let courses = [];

  if (detectedType === 'canvas') {
    courses = scrapeCanvasLayout();
  } else if (detectedType === 'banner') {
    courses = scrapeBannerLayout();
  } else if (detectedType === 'generic-table') {
    courses = scrapeGenericTableLayout();
  } else {
    courses = scrapeGenericLayout();
  }

  // Validate and clean courses
  courses = courses
    .map(course => validateCourse(course))
    .filter(course => course !== null);

  // Remove duplicates
  courses = removeDuplicates(courses);

  return {
    courses,
    pageType: detectedType,
    scrapedAt: new Date().toISOString(),
    courseCount: courses.length
  };
}

/**
 * Detect the type of page layout being used
 */
function detectPageType() {
  const url = window.location.href;
  const html = document.documentElement.innerHTML;

  // Check for Canvas
  if (url.includes('instructure.com') || html.includes('canvas')) {
    return 'canvas';
  }

  // Check for Banner
  if (url.includes('banner') || html.includes('banner-course')) {
    return 'banner';
  }

  // Check for generic table layout
  const tables = document.querySelectorAll('table');
  if (tables.length > 0) {
    return 'generic-table';
  }

  return 'generic';
}

/**
 * Scrape courses from Canvas layout
 */
function scrapeCanvasLayout() {
  const courses = [];
  const rows = document.querySelectorAll('.course-listing-table tbody tr, .course-row, [data-course-id]');

  rows.forEach(row => {
    const courseData = extractCourseFromRow(row, 'canvas');
    if (courseData) {
      courses.push(courseData);
    }
  });

  return courses;
}

/**
 * Scrape courses from Banner layout
 */
function scrapeBannerLayout() {
  const courses = [];
  const rows = document.querySelectorAll('.course-row, [class*="course"], [data-course]');

  rows.forEach(row => {
    const courseData = extractCourseFromRow(row, 'banner');
    if (courseData) {
      courses.push(courseData);
    }
  });

  return courses;
}

/**
 * Scrape courses from generic table layout
 */
function scrapeGenericTableLayout() {
  const courses = [];
  const tables = document.querySelectorAll('table');

  tables.forEach(table => {
    const rows = table.querySelectorAll('tbody tr, tr');
    rows.forEach(row => {
      const courseData = extractCourseFromTableRow(row);
      if (courseData) {
        courses.push(courseData);
      }
    });
  });

  return courses;
}

/**
 * Scrape courses from generic page layout
 */
function scrapeGenericLayout() {
  const courses = [];

  // Try common class names and selectors
  const selectors = [
    '.course, [class*="course-item"], [class*="course-section"]',
    '[data-course], [data-section], .section, .class',
    '.course-card, .course-box, .course-container'
  ];

  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      elements.forEach(element => {
        const courseData = extractCourseFromElement(element);
        if (courseData) {
          courses.push(courseData);
        }
      });
      if (courses.length > 0) break;
    }
  }

  return courses;
}

/**
 * Extract course data from a row element
 */
function extractCourseFromRow(row, pageType = 'generic') {
  const cells = row.querySelectorAll('td, div[class*="cell"], [class*="column"]');
  if (cells.length < 3) return null;

  const courseCode = extractText(cells[0]);
  const courseName = extractText(cells[1]);

  if (!courseCode || !courseName) return null;

  const schedule = cells.length > 3 ? extractText(cells[3]) : 'TBA';
  const enrollmentText = cells.length > 4 ? extractText(cells[4]) : '';
  const instructor = cells.length > 5 ? extractText(cells[5]) : '';
  const room = cells.length > 6 ? extractText(cells[6]) : '';

  const enrollment = parseEnrollment(enrollmentText);
  const sectionMatch = courseCode.match(/\d+$/);
  const sectionGroup = sectionMatch ? parseInt(sectionMatch[0]) : 1;

  return {
    courseCode: extractCourseCode(courseCode),
    courseName: cleanText(courseName),
    sectionGroup,
    schedule: cleanText(schedule),
    enrolledCurrent: enrollment.enrolled,
    enrolledTotal: enrollment.total,
    instructor: cleanText(instructor),
    room: cleanText(room),
    status: 'OK'
  };
}

/**
 * Extract course data from a table row
 */
function extractCourseFromTableRow(row) {
  return extractCourseFromRow(row, 'generic-table');
}

/**
 * Extract course data from any element
 */
function extractCourseFromElement(element) {
  const text = element.innerText || element.textContent || '';
  const html = element.innerHTML || '';

  // Look for course code pattern (e.g., "CIS 2103")
  const codeMatch = text.match(/([A-Z]{2,4}\s?\d{4})/);
  if (!codeMatch) return null;

  const courseCode = codeMatch[1];

  // Try to extract course name
  let courseName = '';
  const lines = text.split('\n').filter(l => l.trim());
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(courseCode)) {
      courseName = lines[i + 1] || '';
      break;
    }
  }

  if (!courseName) return null;

  // Extract schedule if present
  const scheduleMatch = text.match(/(M|T|W|Th|F)+\s*\d{1,2}:\d{2}\s*(AM|PM|am|pm)?/i);
  const schedule = scheduleMatch ? scheduleMatch[0] : 'TBA';

  // Extract enrollment if present
  const enrollmentMatch = text.match(/(\d+)\s*\/\s*(\d+)/);
  const enrollment = enrollmentMatch
    ? { enrolled: parseInt(enrollmentMatch[1]), total: parseInt(enrollmentMatch[2]) }
    : { enrolled: 0, total: 0 };

  const sectionMatch = courseCode.match(/\d+$/);
  const sectionGroup = sectionMatch ? parseInt(sectionMatch[0]) : 1;

  return {
    courseCode: extractCourseCode(courseCode),
    courseName: cleanText(courseName),
    sectionGroup,
    schedule: cleanText(schedule),
    enrolledCurrent: enrollment.enrolled,
    enrolledTotal: enrollment.total,
    instructor: '',
    room: '',
    status: 'OK'
  };
}

/**
 * Extract and clean course code
 */
function extractCourseCode(text) {
  const match = text.match(/([A-Z]{2,4})\s*(\d{4})/);
  if (match) {
    return `${match[1]} ${match[2]}`;
  }
  return text.trim();
}

/**
 * Parse enrollment string (e.g., "25/30" -> { enrolled: 25, total: 30 })
 */
function parseEnrollment(text) {
  const match = text.match(/(\d+)\s*\/\s*(\d+)/);
  if (match) {
    return {
      enrolled: parseInt(match[1]),
      total: parseInt(match[2])
    };
  }
  return { enrolled: 0, total: 0 };
}

/**
 * Extract text from an element
 */
function extractText(element) {
  if (!element) return '';
  return (element.innerText || element.textContent || '').trim();
}

/**
 * Clean text by removing extra whitespace
 */
function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Validate course object
 */
function validateCourse(course) {
  // Check required fields
  if (!course.courseCode || !course.courseName) {
    return null;
  }

  // Ensure numeric fields are valid
  if (typeof course.sectionGroup !== 'number') {
    course.sectionGroup = 1;
  }

  if (!Number.isInteger(course.enrolledCurrent)) {
    course.enrolledCurrent = 0;
  }

  if (!Number.isInteger(course.enrolledTotal)) {
    course.enrolledTotal = 0;
  }

  // Set status based on enrollment
  if (course.enrolledCurrent >= course.enrolledTotal && course.enrolledTotal > 0) {
    course.status = 'FULL';
  } else if (course.enrolledCurrent === 0) {
    course.status = 'AT-RISK';
  } else {
    course.status = 'OK';
  }

  return course;
}

/**
 * Remove duplicate courses
 */
function removeDuplicates(courses) {
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

console.log('EnrollMate content script loaded and ready to scrape courses');
