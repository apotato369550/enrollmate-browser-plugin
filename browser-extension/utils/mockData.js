/**
 * Mock Data for EnrollMate Browser Extension
 * Used when TEST_MODE is enabled
 */

export const MOCK_COURSES = [
  {
    courseCode: "CIS 1101",
    courseName: "Introduction to Computing Concepts",
    sectionGroup: 1,
    schedule: "MWF 01:30 PM - 03:30 PM",
    enrolledCurrent: 25,
    enrolledTotal: 30,
    instructor: "Dr. Smith",
    room: "LB201",
    status: "OK",
    extractedAt: new Date().toISOString()
  },
  {
    courseCode: "CIS 1101",
    courseName: "Introduction to Computing Concepts",
    sectionGroup: 2,
    schedule: "TuTh 09:00 AM - 10:30 AM",
    enrolledCurrent: 30,
    enrolledTotal: 30,
    instructor: "Dr. Johnson",
    room: "LB202",
    status: "FULL",
    extractedAt: new Date().toISOString()
  },
  {
    courseCode: "CIS 1102",
    courseName: "Data Structures and Algorithms",
    sectionGroup: 1,
    schedule: "MWF 10:00 AM - 11:00 AM",
    enrolledCurrent: 15,
    enrolledTotal: 30,
    instructor: "Prof. Williams",
    room: "LB301",
    status: "OK",
    extractedAt: new Date().toISOString()
  },
  {
    courseCode: "CIS 2103",
    courseName: "Database Systems",
    sectionGroup: 1,
    schedule: "TuTh 02:00 PM - 03:30 PM",
    enrolledCurrent: 28,
    enrolledTotal: 30,
    instructor: "Dr. Brown",
    room: "LB401",
    status: "AT-RISK",
    extractedAt: new Date().toISOString()
  },
  {
    courseCode: "CIS 2104",
    courseName: "Web Development",
    sectionGroup: 1,
    schedule: "MW 03:00 PM - 04:30 PM",
    enrolledCurrent: 20,
    enrolledTotal: 25,
    instructor: "Prof. Davis",
    room: "LB302",
    status: "OK",
    extractedAt: new Date().toISOString()
  },
  {
    courseCode: "MATH 2101",
    courseName: "Discrete Mathematics",
    sectionGroup: 1,
    schedule: "MWF 09:00 AM - 10:00 AM",
    enrolledCurrent: 22,
    enrolledTotal: 30,
    instructor: "Dr. Taylor",
    room: "SC101",
    status: "OK",
    extractedAt: new Date().toISOString()
  },
  {
    courseCode: "PHYS 1101",
    courseName: "Physics for Engineers",
    sectionGroup: 1,
    schedule: "TuTh 10:30 AM - 12:00 PM",
    enrolledCurrent: 18,
    enrolledTotal: 25,
    instructor: "Prof. Anderson",
    room: "SC201",
    status: "OK",
    extractedAt: new Date().toISOString()
  },
  {
    courseCode: "ENG 1101",
    courseName: "English Composition",
    sectionGroup: 1,
    schedule: "MW 01:00 PM - 02:30 PM",
    enrolledCurrent: 19,
    enrolledTotal: 20,
    instructor: "Dr. Martinez",
    room: "HU101",
    status: "AT-RISK",
    extractedAt: new Date().toISOString()
  }
];

export const MOCK_AUTH_RESPONSE = {
  success: true,
  token: "mock_jwt_token_12345",
  userId: "mock_user_123",
  email: "test@example.com"
};

export const MOCK_SEMESTERS = [
  {
    id: "semester_1",
    name: "Fall 2024",
    year: 2024,
    type: "Fall",
    active: true
  },
  {
    id: "semester_2",
    name: "Spring 2025",
    year: 2025,
    type: "Spring",
    active: false
  },
  {
    id: "semester_3",
    name: "Summer 2025",
    year: 2025,
    type: "Summer",
    active: false
  }
];

export const MOCK_IMPORT_RESPONSE = {
  success: true,
  message: "Successfully imported 8 courses",
  coursesImported: 8
};
