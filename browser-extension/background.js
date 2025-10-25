/**
 * Background Service Worker for EnrollMate Course Extractor
 * Handles authentication and API calls
 */

// Configuration constants
const ENROLLMATE_API_URL = 'https://enrollmate.com'; // TODO: Update with actual EnrollMate API URL
const TIMEOUTS = {
  FETCH_DEFAULT: 30000,
  AUTH: 10000,
  UPLOAD_COURSES: 60000
};

// Listen for messages from popup/content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'AUTHENTICATE') {
    authenticateUser(request.email, request.password)
      .then(result => sendResponse({ success: true, ...result }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; // Keep channel open for async response
  }
  else if (request.action === 'SEND_COURSES') {
    sendCoursesToEnrollMate(request.courses, request.semesterId, request.token)
      .then(result => sendResponse({ success: true, ...result }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }
  else if (request.action === 'GET_SEMESTERS') {
    getUserSemesters(request.userId, request.token)
      .then(result => sendResponse({ success: true, ...result }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }
});

/**
 * Authenticate user with EnrollMate
 */
async function authenticateUser(email, password) {
  const response = await fetch(`${ENROLLMATE_API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Invalid credentials');
  }

  const data = await response.json();
  return {
    token: data.token,
    userId: data.userId,
    email: data.email
  };
}

/**
 * Send courses to EnrollMate
 */
async function sendCoursesToEnrollMate(courses, semesterId, token) {
  if (!token) {
    throw new Error('No authentication token found. Please log in again.');
  }

  const response = await fetch(
    `${ENROLLMATE_API_URL}/api/semesters/${semesterId}/import-courses`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        courses,
        importedAt: new Date().toISOString()
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to save courses');
  }

  const data = await response.json();
  return {
    message: data.message,
    coursesImported: data.coursesImported
  };
}

/**
 * Get user semesters from EnrollMate
 */
async function getUserSemesters(userId, token) {
  if (!token) {
    throw new Error('No authentication token found. Please log in again.');
  }

  const response = await fetch(
    `${ENROLLMATE_API_URL}/api/users/${userId}/semesters`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch semesters');
  }

  const data = await response.json();
  return {
    semesters: data.semesters || data
  };
}

console.log('EnrollMate background service worker loaded');
