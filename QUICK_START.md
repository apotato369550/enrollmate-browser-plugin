# EnrollMate Browser Extension - Quick Start Guide

## What's Implemented ✅

You now have a fully functional Phase 1-3 browser extension with:

### Phase 1: Extension Fundamentals ✅
- `manifest.json` - Chrome extension v3 configuration
- Complete folder structure with all necessary files
- Asset placeholders for icons

### Phase 2: Course Scraping & Data Extraction ✅
- `content-script.js` - Scrapes courses from multiple page layouts
- `utils/dataParser.js` - Advanced time and enrollment parsing
- Support for Canvas, Banner, and generic table layouts
- Automatic duplicate detection
- Data validation and status inference

### Phase 3: Popup UI & User Interaction ✅
- `popup.html` / `popup.css` / `popup.js` - Full popup interface
- Multi-step workflow (Extract → Preview → Authenticate → Select Semester)
- State management without external dependencies
- Green EnrollMate theme with responsive design
- Error handling with user-friendly messages

### Supporting Files ✅
- `utils/config.js` - Configuration constants (update API URL here!)
- `utils/storage.js` - Chrome storage helper functions
- `background.js` - Service worker for API calls and auth
- Documentation: `README.md` and `INSTALLATION_GUIDE.md`

## Get Started in 3 Steps

### Step 1: Update Configuration

Edit `browser-extension/utils/config.js`:

```javascript
export const ENROLLMATE_API_URL = 'https://your-enrollmate-api.com';
```

### Step 2: Load Extension in Chrome

1. Open Chrome → Go to `chrome://extensions/`
2. Enable **Developer Mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `browser-extension` folder
5. Done! You'll see the green "E" icon in your toolbar

### Step 3: Test It

1. Open `browser-extension/example_data/example_1.html` in Chrome
2. Click the EnrollMate extension icon
3. Click "🚀 Extract Courses"
4. You should see extracted courses!

## File Overview

| File | Purpose |
|------|---------|
| `manifest.json` | Extension metadata & permissions |
| `popup.html` | Extension popup HTML structure |
| `popup.css` | Beautiful green-themed styling |
| `popup.js` | Popup logic & state management |
| `content-script.js` | Scrapes courses from pages |
| `background.js` | Handles API calls & authentication |
| `utils/config.js` | **UPDATE THIS:** API URL configuration |
| `utils/storage.js` | Chrome storage helpers |
| `utils/dataParser.js` | Time/enrollment parsing utilities |
| `assets/icon-placeholder.svg` | Extension icon |

## How It Works

### 1. User opens popup
- Popup shows "Extract Courses" button

### 2. User clicks extract
- Content script runs on the page
- Scrapes course data from HTML
- Parses times, enrollment, instructor info

### 3. Data validation
- Removes duplicates
- Validates required fields
- Infers course status (OK, FULL, AT-RISK)

### 4. Shows preview
- Displays found courses
- User can continue to authentication

### 5. Authentication
- User enters email/password
- Background worker sends to EnrollMate API
- JWT token stored in Chrome storage

### 6. Import courses
- User selects or creates semester
- Courses sent to `/api/semesters/{id}/import-courses`
- Success message shown

## What's Ready for Phase 4 (Backend)

The extension is fully prepared for backend integration:

✅ Authentication flow ready for EnrollMate API
✅ Course import endpoint structure defined
✅ Error handling for API failures
✅ Token storage and refresh logic
✅ User session management

You just need to implement:
- `/api/auth/login` endpoint (email/password → JWT)
- `/api/users/{id}/semesters` endpoint (get user semesters)
- `/api/semesters/{id}/import-courses` endpoint (bulk import)

See [PLUGIN_GUIDE.md](./PLUGIN_GUIDE.md) Step 7 for backend details.

## Testing Checklist

- [ ] Extension loads without errors in chrome://extensions
- [ ] Green "E" icon appears in toolbar
- [ ] Popup opens when clicking icon
- [ ] "Extract Courses" button works on example_1.html
- [ ] Courses appear in preview (should show CIS courses, etc.)
- [ ] Duplicate detection works
- [ ] Data has correct format (courseCode, courseName, schedule, etc.)
- [ ] Error messages appear gracefully on invalid pages
- [ ] No console errors (F12 → Console)

## Troubleshooting

### Extension won't load
```
1. Check chrome://extensions/ for error messages
2. Verify manifest.json has valid JSON
3. Check popup.html, popup.js have no syntax errors
4. Remove and reload extension
```

### No courses extracted
```
1. Make sure you're testing on example_data/example_1.html
2. Open DevTools (F12) and check Console for errors
3. Check if content-script.js ran (should see log messages)
4. Try different example pages (example_2.html, etc.)
```

### API errors
```
1. Verify ENROLLMATE_API_URL in utils/config.js is correct
2. Check your backend server is running
3. Look at Network tab in DevTools for actual requests
4. Check backend logs for errors
```

## Next Steps

### Short Term
1. ✅ Test the extension thoroughly with examples
2. Build the EnrollMate API endpoints (Phase 4)
3. Connect real authentication
4. Test full import workflow

### Medium Term
5. Add support for more university systems
6. Improve course selection UI
7. Add progress tracking for imports
8. Implement error recovery/retry logic

### Long Term
9. Publish to Chrome Web Store
10. Support Firefox and Edge
11. Add advanced features (filtering, scheduling)
12. Build mobile app version

## Key Files to Understand

### `content-script.js` (210 lines)
The heart of scraping:
- `scrapeCoursesFromPage()` - Main entry point
- `detectPageType()` - Auto-detects Canvas/Banner/generic
- `extractCourseFromRow()` - Parses individual courses
- `validateCourse()` - Ensures data quality

### `popup.js` (230 lines)
User interface logic:
- `PopupApp` class - State management
- `setState()` - Updates UI reactively
- `render()` - Generates HTML based on state
- Event listeners for user interactions

### `background.js` (70 lines)
API integration:
- `authenticateUser()` - Handles login
- `sendCoursesToEnrollMate()` - Bulk import
- `getUserSemesters()` - Fetch user's semesters
- Chrome message listeners

## Code Examples

### Access stored data in popup:
```javascript
const stored = await this.getStoredData();
console.log(stored.email);      // User email
console.log(stored.token);      // JWT token
console.log(stored.userId);     // User ID
```

### Parse course data:
```javascript
import { parseScheduleTime, normalizeEnrollment } from './utils/dataParser.js';

const schedule = parseScheduleTime("MWF 10:00 AM - 11:30 AM");
// { days: ['M','W','F'], startTime: "10:00", endTime: "11:30", format: "12h" }

const enrollment = normalizeEnrollment("25/30");
// { enrolled: 25, total: 30 }
```

### Send message to background worker:
```javascript
chrome.runtime.sendMessage({
  action: 'AUTHENTICATE',
  email: 'user@example.com',
  password: 'password123'
}, (response) => {
  if (response.success) {
    console.log('Token:', response.token);
  }
});
```

## Documentation

- **[README.md](./README.md)** - Project overview and features
- **[INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)** - Detailed setup, testing, and troubleshooting
- **[PLUGIN_GUIDE.md](./PLUGIN_GUIDE.md)** - Complete implementation guide for all phases

## Support

- Check the comprehensive [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md) for detailed troubleshooting
- Review [PLUGIN_GUIDE.md](./PLUGIN_GUIDE.md) for implementation details
- Check Chrome DevTools (F12) Console for error messages
- Verify configuration in `utils/config.js`

---

**You're ready to test! Start with Step 3 above.** 🚀
