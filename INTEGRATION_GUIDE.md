# EnrollMate Browser Plugin Integration Guide

**Last Updated:** 2025-11-12
**Status:** Ready for Backend Integration

---

## Overview

This guide explains how to integrate the EnrollMate Browser Extension with your fullstack/frontend application. The browser extension is **phases 1-3 complete** and ready to connect to your backend API.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Required Backend Endpoints](#required-backend-endpoints)
3. [API Endpoint Implementation](#api-endpoint-implementation)
4. [Configuration Steps](#configuration-steps)
5. [Testing the Integration](#testing-the-integration)
6. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser Extension                        │
│                                                             │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────┐    │
│  │  Popup   │ ←→ │   Background │ ←→ │    Content   │    │
│  │   UI     │    │   Worker     │    │    Script    │    │
│  └──────────┘    └──────────────┘    └──────────────┘    │
│                          ↓                                  │
└──────────────────────────┼──────────────────────────────────┘
                           ↓
                    HTTPS API Calls
                           ↓
┌──────────────────────────┼──────────────────────────────────┐
│                   Backend API                               │
│                          ↓                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │     Auth     │  │  Semesters   │  │   Courses    │    │
│  │   Endpoint   │  │   Endpoint   │  │   Import     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                          ↓                                  │
└──────────────────────────┼──────────────────────────────────┘
                           ↓
                    ┌──────────────┐
                    │   Supabase   │
                    │   Database   │
                    └──────────────┘
```

---

## Required Backend Endpoints

The browser extension requires **3 API endpoints** to function:

### 1. Authentication Endpoint

**Purpose:** Authenticate user and return JWT token

```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "userPassword123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "user-uuid-here",
  "email": "user@example.com"
}
```

**Response (401 Unauthorized):**
```json
{
  "message": "Invalid credentials"
}
```

---

### 2. Get User Semesters Endpoint

**Purpose:** Fetch all semesters for authenticated user

```
GET /api/users/{userId}/semesters
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "semesters": [
    {
      "id": "semester-uuid-1",
      "name": "1st Semester 2025",
      "year": 2025,
      "semester_type": "1st",
      "is_current": true
    },
    {
      "id": "semester-uuid-2",
      "name": "2nd Semester 2025",
      "year": 2025,
      "semester_type": "2nd",
      "is_current": false
    }
  ]
}
```

---

### 3. Import Courses Endpoint

**Purpose:** Bulk import courses into a semester

```
POST /api/semesters/{semesterId}/import-courses
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "courses": [
    {
      "courseCode": "CIS 2103",
      "courseName": "Database Systems",
      "sectionGroup": 1,
      "schedule": "MWF 10:00 AM - 11:30 AM",
      "enrolledCurrent": 25,
      "enrolledTotal": 30,
      "instructor": "Dr. Smith",
      "room": "LB201",
      "status": "OK"
    }
  ],
  "importedAt": "2025-11-12T10:30:00.000Z"
}
```

**Response (200 OK):**
```json
{
  "message": "Imported 15 courses successfully",
  "coursesImported": 15
}
```

**Response (400 Bad Request):**
```json
{
  "message": "No courses provided"
}
```

**Response (401 Unauthorized):**
```json
{
  "message": "Invalid or expired token"
}
```

---

## API Endpoint Implementation

Here's how to implement each endpoint using your existing Enrollmate API structure:

### Option A: Using Your Existing UserCourseAPI (Recommended)

Your existing `UserCourseAPI` can be adapted for the browser extension with minimal changes:

#### 1. Authentication Endpoint

Create a new API route file: **`/api/auth/login.js`** (or equivalent for your framework)

```javascript
import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password } = req.body;

  try {
    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ message: error.message });
    }

    // Return user info and token
    return res.status(200).json({
      token: data.session.access_token,
      userId: data.user.id,
      email: data.user.email
    });

  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
```

#### 2. Get Semesters Endpoint

Create: **`/api/users/[userId]/semesters.js`**

```javascript
import { SemesterAPI } from '../../../lib/api/semesterAPI';
import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId } = req.query;
  const authHeader = req.headers.authorization;

  try {
    // Verify authentication
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Verify user matches requested userId
    if (user.id !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Get semesters using existing API
    const semesters = await SemesterAPI.getUserSemesters(userId);

    return res.status(200).json({ semesters });

  } catch (error) {
    console.error('Get semesters error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
```

#### 3. Import Courses Endpoint

Create: **`/api/semesters/[id]/import-courses.js`**

```javascript
import { UserCourseAPI } from '../../../lib/api/userCourseAPI';
import { SemesterCourseAPI } from '../../../lib/api/semesterCourseAPI';
import { supabase } from '../../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id: semesterId } = req.query;
  const { courses, importedAt } = req.body;
  const authHeader = req.headers.authorization;

  try {
    // Verify authentication
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Validate courses
    if (!Array.isArray(courses) || courses.length === 0) {
      return res.status(400).json({ message: 'No courses provided' });
    }

    // OPTION 1: Import to semester_courses (for schedule building)
    const result = await SemesterCourseAPI.bulkImportCourses(semesterId, courses);

    // OPTION 2: Also save to user_courses library (optional)
    // await UserCourseAPI.saveCourses(user.id, courses, 'extension');

    return res.status(200).json({
      message: `Imported ${courses.length} courses successfully`,
      coursesImported: courses.length
    });

  } catch (error) {
    console.error('Import courses error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to import courses'
    });
  }
}
```

---

### Option B: Direct Integration with UserCourseAPI

If you prefer to save courses directly to the **user_courses** library instead of semester_courses:

**Modify:** `/api/semesters/[id]/import-courses.js`

```javascript
// ... (same auth code as above)

// Check course limit before importing
const stats = await UserCourseAPI.getCourseStats(user.id);

if (courses.length > stats.remaining) {
  return res.status(400).json({
    message: `Can only save ${stats.remaining} more courses. You have ${courses.length} to import.`,
    remaining: stats.remaining
  });
}

// Save to user_courses with 'extension' source
const result = await UserCourseAPI.saveCourses(user.id, courses, 'extension');

return res.status(200).json({
  message: result.message,
  coursesImported: result.success.length,
  errors: result.errors
});
```

---

## Configuration Steps

### Step 1: Update Browser Extension Configuration

Edit: **`browser-extension/background.js`**

```javascript
// Line 7: Update API URL to your deployed backend
const ENROLLMATE_API_URL = 'https://your-enrollmate-domain.com'; // Replace with your actual URL

// For local development:
// const ENROLLMATE_API_URL = 'http://localhost:3000';
```

### Step 2: Enable CORS on Your Backend

The browser extension makes cross-origin requests, so you need to enable CORS:

**For Next.js:**

Create/update: **`next.config.js`**

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' }, // Or specific extension ID
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};
```

**For Express.js:**

```javascript
const cors = require('cors');

app.use(cors({
  origin: '*', // Or specify chrome-extension://{your-extension-id}
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Step 3: Set Up Supabase Configuration

Ensure your Supabase client is properly configured:

**`lib/supabaseClient.js`**

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### Step 4: Environment Variables

Create/update: **`.env.local`**

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Testing the Integration

### Test 1: Authentication Flow

1. Load the browser extension in Chrome
2. Open the popup
3. Click "Extract Courses" (or go to auth step)
4. Enter your Enrollmate credentials
5. Verify token is received and stored

**Expected Result:**
- No errors in popup
- Token stored in `chrome.storage.local`
- User redirected to semester selection

**Debug:**
```javascript
// In browser console (F12):
chrome.storage.local.get(['token', 'userId', 'email'], (result) => {
  console.log('Stored data:', result);
});
```

### Test 2: Get Semesters

After authentication:

1. Extension should automatically fetch semesters
2. Semester list appears in popup

**Expected Result:**
- List of user's semesters displayed
- No API errors

**Debug:**
- Check Network tab in DevTools
- Look for `GET /api/users/{userId}/semesters` request
- Verify Authorization header is sent

### Test 3: Import Courses

1. Navigate to a university course listing page (or use example_data/example_1.html)
2. Click extension icon
3. Click "Extract Courses"
4. Verify course preview appears
5. Authenticate if needed
6. Select a semester
7. Confirm import

**Expected Result:**
- "Success! X courses imported" message
- Courses appear in Enrollmate database
- No errors in console

**Debug:**
- Check `semester_courses` table in Supabase
- Verify courses have correct `semester_id`
- Check browser console for errors

### Test 4: Error Handling

Test these scenarios:

- **Invalid credentials:** Should show error message
- **Expired token:** Should redirect to login
- **Network error:** Should show retry option
- **No courses found:** Should show helpful message
- **50-course limit:** Should warn user (if using UserCourseAPI)

---

## Troubleshooting

### Issue: "CORS error" in browser console

**Solution:**
- Enable CORS on your backend (see Configuration Step 2)
- Ensure `Access-Control-Allow-Origin` header is set
- For local dev, use `http://localhost:3000` in ENROLLMATE_API_URL

---

### Issue: "401 Unauthorized" error

**Solution:**
- Verify token is being sent in Authorization header
- Check token is not expired (Supabase tokens expire after 1 hour)
- Ensure `supabase.auth.getUser(token)` is working correctly

**Debug:**
```javascript
// In API endpoint:
console.log('Token received:', token);
const { data, error } = await supabase.auth.getUser(token);
console.log('User:', data.user);
console.log('Error:', error);
```

---

### Issue: "No courses imported" or partial imports

**Solution:**
- Check course data format matches expected schema
- Verify required fields: `courseCode`, `courseName`, `sectionGroup`
- Check Supabase database constraints
- Review API endpoint logs for errors

**Debug:**
```javascript
// In import endpoint:
console.log('Courses received:', courses.length);
console.log('First course:', courses[0]);
```

---

### Issue: Extension can't connect to backend

**Solution:**
- Verify `ENROLLMATE_API_URL` in `background.js` is correct
- Check backend is running and accessible
- Test API endpoints directly with Postman/Insomnia
- Check browser console for network errors

---

### Issue: "Method not allowed" error

**Solution:**
- Verify API route exports a handler function
- Check HTTP method matches (GET, POST)
- Ensure Next.js API routes are in `/pages/api/` or `/app/api/`

---

## Integration Checklist

Use this checklist to track your integration progress:

### Backend Setup
- [ ] Create `/api/auth/login` endpoint
- [ ] Create `/api/users/[userId]/semesters` endpoint
- [ ] Create `/api/semesters/[id]/import-courses` endpoint
- [ ] Enable CORS for API routes
- [ ] Set up Supabase authentication
- [ ] Test endpoints with Postman/Insomnia

### Browser Extension Setup
- [ ] Update `ENROLLMATE_API_URL` in `background.js`
- [ ] Load extension in Chrome
- [ ] Test extension loads without errors
- [ ] Verify popup appears correctly

### Integration Testing
- [ ] Test authentication flow
- [ ] Test get semesters
- [ ] Test course extraction
- [ ] Test course import
- [ ] Test error handling
- [ ] Verify courses in database

### Production Deployment
- [ ] Deploy backend to production
- [ ] Update extension with production API URL
- [ ] Test with production environment
- [ ] Monitor API logs for errors
- [ ] Set up error tracking (Sentry, etc.)

---

## Additional Resources

- **Browser Extension Docs:** `/docs/INDEX.md`
- **API Documentation:** `/API_DOCUMENTATION.md`
- **Plugin Implementation Guide:** `/docs/PLUGIN_GUIDE.md`
- **Quick Start:** `/docs/QUICK_START.md`

---

## Support

For issues or questions:
- Check browser console (F12) for errors
- Review API endpoint logs
- Verify Supabase database constraints
- Test API endpoints independently
- Check CORS configuration

---

**Last Updated:** 2025-11-12
**Version:** 1.0.0
