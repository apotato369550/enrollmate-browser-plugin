# EnrollMate Browser Extension - Architecture Diagram

**Purpose:** Visual guide to understanding how the browser extension integrates with your fullstack app

---

## System Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                                   │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │           ENROLLMATE CHROME EXTENSION                          │    │
│  │                                                                │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │    │
│  │  │   Popup UI   │  │  Background  │  │   Content    │        │    │
│  │  │  (popup.js)  │◄─┤   Worker     │  │   Script     │        │    │
│  │  │              │  │ background.js│  │content-script│        │    │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘        │    │
│  │         │                 │                  │                │    │
│  │         │   Messages      │    Scrapes       │                │    │
│  │         └────────┬────────┘    DOM           │                │    │
│  │                  │                            │                │    │
│  │                  │             ┌──────────────▼─────┐          │    │
│  │                  │             │  University Page   │          │    │
│  │                  │             │  (Course Listing)  │          │    │
│  │                  │             └────────────────────┘          │    │
│  └──────────────────┼──────────────────────────────────────────────┘    │
│                     │                                                   │
│                     │ HTTPS API Calls                                   │
│                     │ (Authorization: Bearer {token})                   │
└─────────────────────┼───────────────────────────────────────────────────┘
                      │
                      │
                      ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    ENROLLMATE BACKEND API                                │
│                    (Next.js / Express / etc.)                            │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │                      API ENDPOINTS                             │     │
│  │                                                                │     │
│  │  ┌──────────────────────────────────────────────────┐         │     │
│  │  │  POST /api/auth/login                            │         │     │
│  │  │  ────────────────────────────────────────        │         │     │
│  │  │  Request: { email, password }                    │         │     │
│  │  │  Response: { token, userId, email }              │         │     │
│  │  └──────────────────────────────────────────────────┘         │     │
│  │                                                                │     │
│  │  ┌──────────────────────────────────────────────────┐         │     │
│  │  │  GET /api/users/{userId}/semesters               │         │     │
│  │  │  ────────────────────────────────────────        │         │     │
│  │  │  Headers: Authorization: Bearer {token}          │         │     │
│  │  │  Response: { semesters: [...] }                  │         │     │
│  │  └──────────────────────────────────────────────────┘         │     │
│  │                                                                │     │
│  │  ┌──────────────────────────────────────────────────┐         │     │
│  │  │  POST /api/semesters/{id}/import-courses         │         │     │
│  │  │  ────────────────────────────────────────        │         │     │
│  │  │  Headers: Authorization: Bearer {token}          │         │     │
│  │  │  Request: { courses: [...] }                     │         │     │
│  │  │  Response: { message, coursesImported }          │         │     │
│  │  └──────────────────────────────────────────────────┘         │     │
│  │                                                                │     │
│  └────────────────────────────┬───────────────────────────────────┘     │
│                               │                                         │
│                               │ Uses existing APIs:                     │
│                               │ - SemesterAPI                           │
│                               │ - UserCourseAPI                         │
│                               │ - SemesterCourseAPI                     │
│                               │                                         │
└───────────────────────────────┼─────────────────────────────────────────┘
                                │
                                │ Supabase Auth & Database Queries
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE                                         │
│                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │   Auth Service   │  │   PostgreSQL DB  │  │   Storage        │      │
│  │                  │  │                  │  │                  │      │
│  │  - JWT tokens    │  │  Tables:         │  │  - User files    │      │
│  │  - User sessions │  │  • users         │  │                  │      │
│  │  - Password auth │  │  • semesters     │  │                  │      │
│  │                  │  │  • semester_     │  │                  │      │
│  │                  │  │    courses       │  │                  │      │
│  │                  │  │  • user_courses  │  │                  │      │
│  │                  │  │  • schedules     │  │                  │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### Flow 1: User Authentication

```
┌─────────┐                ┌─────────┐                ┌─────────┐
│  Popup  │                │Background│               │ Backend │
│   UI    │                │  Worker  │               │   API   │
└────┬────┘                └────┬────┘                └────┬────┘
     │                          │                          │
     │ 1. User enters email/pwd │                          │
     ├─────────────────────────►│                          │
     │                          │ 2. POST /api/auth/login  │
     │                          ├─────────────────────────►│
     │                          │                          │
     │                          │                          │ 3. Verify with
     │                          │                          │    Supabase
     │                          │                          │
     │                          │ 4. Return token+userId   │
     │                          │◄─────────────────────────┤
     │ 5. Store token in        │                          │
     │    chrome.storage        │                          │
     │◄─────────────────────────┤                          │
     │                          │                          │
     │ 6. Show semester         │                          │
     │    selection screen      │                          │
     │                          │                          │
```

---

### Flow 2: Extract and Import Courses

```
┌────────┐  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌────────┐
│Content │  │ Popup   │  │Background│  │ Backend │  │Supabase│
│Script  │  │   UI    │  │  Worker  │  │   API   │  │   DB   │
└───┬────┘  └────┬────┘  └────┬─────┘  └────┬────┘  └───┬────┘
    │            │             │             │           │
    │ 1. User clicks           │             │           │
    │    "Extract Courses"     │             │           │
    │◄───────────┤             │             │           │
    │            │             │             │           │
    │ 2. Scrape DOM for courses│             │           │
    │ (courseCode, name, etc.) │             │           │
    │            │             │             │           │
    │ 3. Return extracted data │             │           │
    ├───────────►│             │             │           │
    │            │             │             │           │
    │            │ 4. Show preview           │           │
    │            │    (user reviews)         │           │
    │            │             │             │           │
    │            │ 5. User selects semester  │           │
    │            │    & clicks "Import"      │           │
    │            │             │             │           │
    │            │ 6. Send courses+semesterId│           │
    │            ├────────────►│             │           │
    │            │             │             │           │
    │            │             │ 7. POST /api/semesters/ │
    │            │             │    {id}/import-courses  │
    │            │             ├────────────►│           │
    │            │             │             │           │
    │            │             │             │ 8. Verify │
    │            │             │             │    token  │
    │            │             │             │           │
    │            │             │             │ 9. Insert │
    │            │             │             │    courses│
    │            │             │             ├──────────►│
    │            │             │             │           │
    │            │             │             │10. Return │
    │            │             │             │   success │
    │            │             │             │◄──────────┤
    │            │             │11. Return   │           │
    │            │             │   success   │           │
    │            │             │◄────────────┤           │
    │            │12. Show     │             │           │
    │            │   "Success!"│             │           │
    │            │◄────────────┤             │           │
    │            │             │             │           │
```

---

## File Structure

### Browser Extension Files

```
browser-extension/
│
├── manifest.json              # Extension configuration
│
├── popup.html                 # Popup UI structure
├── popup.css                  # Popup styling
├── popup.js                   # Popup logic & state management
│
├── content-script.js          # DOM scraping engine
├── background.js              # API calls & auth management
│
└── utils/
    ├── config.js              # Configuration constants
    ├── storage.js             # Chrome storage helpers
    └── dataParser.js          # Course data parsing utilities
```

### Backend API Files (to create)

```
your-enrollmate-backend/
│
├── pages/api/                 # For Next.js Pages Router
│   ├── auth/
│   │   └── login.js           # Authentication endpoint
│   │
│   ├── users/
│   │   └── [userId]/
│   │       └── semesters.js   # Get user semesters
│   │
│   └── semesters/
│       └── [id]/
│           └── import-courses.js  # Import courses
│
└── lib/
    └── api/
        ├── semesterAPI.js     # Existing - Semester operations
        ├── userCourseAPI.js   # Existing - User course library
        └── semesterCourseAPI.js  # Existing - Semester courses
```

---

## Data Models

### Course Data Format (Extension → Backend)

```javascript
{
  courseCode: "CIS 2103",           // Required
  courseName: "Database Systems",   // Required
  sectionGroup: 1,                  // Required (number)
  schedule: "MWF 10:00 AM - 11:30 AM",
  enrolledCurrent: 25,              // Number
  enrolledTotal: 30,                // Number
  instructor: "Dr. Smith",          // Optional
  room: "LB201",                    // Optional
  status: "OK"                      // OK, FULL, AT-RISK
}
```

### Database Schema (Supabase)

#### semester_courses table
```sql
CREATE TABLE semester_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  semester_id UUID REFERENCES semesters(id),
  course_code TEXT NOT NULL,
  course_name TEXT NOT NULL,
  section_group INTEGER NOT NULL,
  schedule TEXT,
  enrolled_current INTEGER,
  enrolled_total INTEGER,
  instructor TEXT,
  room TEXT,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### user_courses table (optional)
```sql
CREATE TABLE user_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  course_code TEXT NOT NULL,
  course_name TEXT NOT NULL,
  section_group INTEGER NOT NULL,
  schedule TEXT,
  enrolled_current INTEGER,
  enrolled_total INTEGER,
  instructor TEXT,
  room TEXT,
  source TEXT, -- 'manual', 'csv', 'extension'
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Security Model

### Authentication Flow

```
1. User enters credentials in extension popup
   ↓
2. Extension sends to /api/auth/login
   ↓
3. Backend validates with Supabase Auth
   ↓
4. Returns JWT token (expires in 1 hour)
   ↓
5. Extension stores token in chrome.storage.local
   ↓
6. All subsequent API calls include:
   Authorization: Bearer {token}
   ↓
7. Backend verifies token with supabase.auth.getUser()
   ↓
8. If valid, processes request
   If invalid/expired, returns 401
```

### Authorization Checks

- **User can only access own semesters**
  - Verify `user.id === userId` in GET semesters endpoint

- **User can only import to own semesters**
  - Verify `semester.user_id === user.id` before insert

- **Token validation on every request**
  - Use `supabase.auth.getUser(token)` to verify

---

## Environment Variables

### Backend (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

### Extension (background.js)
```javascript
const ENROLLMATE_API_URL = 'http://localhost:3000'; // Development
// const ENROLLMATE_API_URL = 'https://enrollmate.com'; // Production
```

---

## Integration Points

### 1. Extension ↔ Backend
- **Protocol:** HTTPS REST API
- **Authentication:** JWT Bearer tokens
- **Data Format:** JSON
- **CORS:** Enabled on backend

### 2. Backend ↔ Supabase
- **Protocol:** Supabase JS client
- **Authentication:** Service role key
- **Database:** PostgreSQL via Supabase API

### 3. Extension ↔ User's Browser
- **Storage:** chrome.storage.local API
- **Permissions:** storage, tabs, scripting
- **Content Scripts:** Injected into course pages

---

## Testing Strategy

### Unit Testing
- Extension data parsing functions
- Course validation logic
- API response handling

### Integration Testing
- Full authentication flow
- Course extraction → import pipeline
- Error handling scenarios

### End-to-End Testing
1. User installs extension
2. Navigates to course page
3. Extracts courses
4. Authenticates
5. Imports to semester
6. Verifies in database

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| CORS Error | Backend not configured | Add CORS headers in next.config.js |
| 401 Unauthorized | Invalid/expired token | Verify token, check Supabase keys |
| No courses extracted | Wrong page type | Check content-script.js selectors |
| Import fails | Database constraint | Verify course data format |
| Extension won't load | Manifest error | Check manifest.json syntax |

---

## Performance Considerations

- **Extension:** Minimal memory footprint (~5-10MB)
- **Course extraction:** 1-3 seconds for typical pages
- **API calls:** Sub-second response times
- **Database:** Batch inserts for bulk imports
- **Caching:** Store semesters in chrome.storage

---

**Last Updated:** 2025-11-12
**Version:** 1.0.0
