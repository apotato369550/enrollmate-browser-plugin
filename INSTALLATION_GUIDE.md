# EnrollMate Browser Extension - Installation & Testing Guide

## Overview

The EnrollMate Browser Extension allows you to extract course schedules from your university's course registration system and automatically import them into EnrollMate for scheduling.

## Project Structure

```
enrollmate-browser-plugin/
├── browser-extension/
│   ├── manifest.json                 # Extension metadata (v3)
│   ├── popup.html                    # Extension popup UI
│   ├── popup.css                     # Styling for popup
│   ├── popup.js                      # Popup logic and state management
│   ├── content-script.js             # DOM scraping logic
│   ├── background.js                 # Service worker for API calls
│   ├── utils/
│   │   ├── config.js                 # Configuration constants
│   │   ├── storage.js                # Local storage helpers
│   │   └── dataParser.js             # Time, enrollment parsing & validation
│   └── assets/
│       └── icon-placeholder.svg      # Extension icon (128x128)
├── example_data/                     # Sample HTML pages for testing
├── PLUGIN_GUIDE.md                   # Comprehensive implementation guide
└── INSTALLATION_GUIDE.md             # This file
```

## Prerequisites

- **Chrome Browser** (version 88+) - or Edge/Firefox with Chrome Extension compatibility
- **Text Editor** - VS Code recommended
- **EnrollMate Account** - for testing authentication

## Installation & Setup

### Step 1: Configure the Extension

1. Open `browser-extension/utils/config.js`
2. Update the `ENROLLMATE_API_URL` with your actual EnrollMate API endpoint:
   ```javascript
   export const ENROLLMATE_API_URL = 'https://your-enrollmate-domain.com';
   ```

### Step 2: Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Navigate to `enrollmate-browser-plugin/browser-extension/` folder
5. Click **Select Folder**
6. The extension should now appear in your extensions list with a green icon

### Step 3: Verify Extension Loads

- You should see the EnrollMate extension icon in your toolbar (green circle with "E")
- Click the icon to open the popup and verify it shows the "Extract Courses" button
- Check Chrome DevTools (F12) for any console errors

## Testing the Extension

### Test 1: Basic Popup UI

**Objective:** Verify the popup UI loads and displays correctly

**Steps:**
1. Click the EnrollMate extension icon
2. Verify the popup appears with:
   - Title: "📚 EnrollMate"
   - Subtitle: "Extract Courses from Your University"
   - Blue "🚀 Extract Courses" button
   - Green gradient background

**Expected Result:** Clean UI with proper styling and responsive layout

---

### Test 2: Course Extraction on Sample Page

**Objective:** Test course scraping on an example HTML page

**Steps:**

1. Open one of the example HTML files:
   - Navigate to `browser-extension/example_data/example_1.html` in Chrome
   - Or open it via File → Open File (use path: `file:///path/to/example_1.html`)

2. Click the EnrollMate extension icon

3. Click "🚀 Extract Courses" button

4. Check the result:
   - **Success:** Should see "✅ Courses Extracted" with a course count
   - **Error:** Should show error message if scraping fails

**Expected Result:**
- Extraction completes within 2-5 seconds
- Shows number of courses found
- Displays preview of first 3 courses with codes and schedules
- Provides "Extract Again" and "Continue to EnrollMate" buttons

**Common Issues:**
- If no courses found: Content script may not have run - check console (F12) for errors
- If popup doesn't open: Verify extension loaded correctly (check `chrome://extensions/`)

---

### Test 3: Data Parsing

**Objective:** Verify course data is parsed correctly

**Steps:**

1. In Chrome DevTools (F12), go to Console tab
2. Click "Extract Courses" in the extension popup
3. Check console output for logs
4. Verify extracted courses have:
   - `courseCode` (e.g., "CIS 2103")
   - `courseName` (full course name)
   - `sectionGroup` (e.g., 1, 2, 3)
   - `schedule` (e.g., "MWF 10:00 AM - 11:30 AM" or "TBA")
   - `enrolledCurrent` and `enrolledTotal` (numbers)
   - `instructor` (optional)
   - `room` (optional)
   - `status` (OK, FULL, AT-RISK, AVAILABLE)

**Expected Format:**
```javascript
{
  courseCode: "CIS 2103",
  courseName: "Database Systems",
  sectionGroup: 1,
  schedule: "MWF 10:00 AM - 11:30 AM",
  enrolledCurrent: 25,
  enrolledTotal: 30,
  instructor: "Dr. Smith",
  room: "LB201",
  status: "OK"
}
```

---

### Test 4: Storage & Authentication (Mock)

**Objective:** Verify local storage works correctly

**Steps:**

1. Open Chrome DevTools (F12)
2. Go to Application → Local Storage → Extension URL
3. Verify these keys exist after extraction:
   - `enrollmate_user_email`
   - `enrollmate_user_id`
   - `enrollmate_auth_token`

**Expected Result:**
- Storage can save and retrieve data
- Data persists across browser sessions
- Data clears on logout

**To Test Manually:**
1. In DevTools Console, run:
   ```javascript
   chrome.storage.local.get(null, (result) => console.log(result));
   ```
2. Should show stored extension data

---

### Test 5: Duplicate Detection

**Objective:** Verify duplicate courses are removed

**Steps:**

1. Extract courses from a page that has duplicate entries
2. Check that duplicate courses are filtered out
3. Verify only unique combinations are shown:
   - Same `courseCode` + `sectionGroup` + `schedule` = duplicate

**Expected Result:**
- Duplicate courses removed
- Only unique courses displayed in preview

---

### Test 6: Large Course Lists

**Objective:** Verify extension handles large datasets

**Steps:**

1. Use a sample page with 100+ courses (or modify example HTML)
2. Click "Extract Courses"
3. Monitor performance (should take < 5 seconds)
4. Check memory usage in DevTools (Performance tab)

**Expected Result:**
- All courses extracted successfully
- No UI freezing or lag
- Memory usage remains reasonable

---

### Test 7: Error Handling

**Objective:** Verify graceful error handling

**Steps:**

1. **Test missing course data:**
   - Extract from a page with incomplete course information
   - Verify invalid/incomplete courses are skipped
   - Only valid courses are shown

2. **Test with empty/invalid HTML:**
   - Try extracting from a plain text page
   - Should show error message: "No courses found on this page"

3. **Test content script not running:**
   - Open a restricted page (e.g., Chrome Web Store)
   - Click "Extract Courses"
   - Should show: "Unable to scrape this page"

**Expected Result:**
- No console errors
- User-friendly error messages
- Graceful degradation

---

## Debugging & Troubleshooting

### View Console Logs

1. Open DevTools: **F12** or Right-click → Inspect
2. Go to **Console** tab
3. Messages from content script and background will appear here

### Check for Errors

**Extension errors:**
- Go to `chrome://extensions/`
- Click "Details" on EnrollMate extension
- Check for any error messages

**Content script errors:**
- Open any page and click the extension
- Press F12 to open DevTools on that page
- Check Console for errors (might see "Content script not loaded")

### Reset Extension

If the extension is misbehaving:

1. Go to `chrome://extensions/`
2. Find EnrollMate extension
3. Click the trash icon to remove it
4. Click "Load unpacked" again
5. Reload the test page (F5)

### Test Network Requests

To verify API calls work (once backend is ready):

1. In DevTools, go to **Network** tab
2. In popup, try to authenticate or send courses
3. Look for POST/GET requests to your API
4. Check response status and body

---

## Configuration Options

### Update API URL

Edit `browser-extension/utils/config.js`:

```javascript
export const ENROLLMATE_API_URL = 'https://your-api.com';
export const SUPABASE_URL = 'https://your-project.supabase.co';
export const SUPABASE_ANON_KEY = 'your-key-here';
```

### Customize Timeouts

```javascript
export const TIMEOUTS = {
  FETCH_DEFAULT: 30000,    // 30 seconds
  AUTH: 10000,             // 10 seconds
  UPLOAD_COURSES: 60000    // 60 seconds
};
```

### Add University Support

Edit `browser-extension/content-script.js` to add university-specific CSS selectors:

```javascript
function detectPageType() {
  // Add pattern for your university
  if (url.includes('your-university.edu')) {
    return 'your-university';
  }
}
```

---

## Common Issues & Solutions

### Issue: "Content script not injected"
**Solution:**
- Verify `manifest.json` has correct `content_scripts` configuration
- Check host permissions include the domain
- Reload extension and try again

### Issue: No courses extracted
**Solution:**
- Verify you're on a course listing page
- Check the page has HTML elements matching expected selectors
- Open DevTools Console and look for scraping errors
- Try different example pages

### Issue: "Invalid credentials" error
**Solution:**
- Verify `ENROLLMATE_API_URL` is correct
- Check EnrollMate backend is running
- Try with valid test account credentials
- Check network tab for 401/403 responses

### Issue: Popup doesn't open
**Solution:**
- Verify extension is enabled (`chrome://extensions/`)
- Clear extension cache: Remove and reload extension
- Check for permission issues in chrome://extensions/ details
- Restart Chrome browser

---

## Next Steps

### Phase 2: Advanced Features (When Ready)

1. **University Detection:**
   - Detect Canvas, Banner, and custom university systems
   - Support multiple page layouts (tables, grids, lists)

2. **Enhanced Data Parsing:**
   - Handle various time formats
   - Parse different enrollment formats
   - Support different instructor/room layouts

3. **Pagination Support:**
   - Handle "Next" buttons
   - Scrape across multiple pages
   - Show progress tracking

### Phase 3: UI Improvements

1. **Authentication Integration:**
   - Real login with EnrollMate credentials
   - Token refresh handling
   - Secure credential storage

2. **Semester Selection:**
   - Load user's existing semesters
   - Create new semesters
   - Handle multiple semesters

3. **Interactive Features:**
   - Course selection/deselection
   - Manual editing of extracted data
   - Export extracted courses

### Phase 4: Backend Integration

1. **API Endpoint:**
   - Build `/api/semesters/{id}/import-courses` endpoint
   - Implement bulk course import
   - Validate and store in database

---

## Testing Checklist

- [ ] Extension loads in Chrome without errors
- [ ] Popup opens and displays correctly
- [ ] Course extraction works on sample page
- [ ] Extracted courses have all required fields
- [ ] Data formatting is correct (times, enrollment)
- [ ] Duplicates are removed
- [ ] Errors are handled gracefully
- [ ] Large course lists don't cause issues
- [ ] Local storage persists data
- [ ] Console has no errors

---

## Support & Troubleshooting

### Enable Debug Mode

Add to `popup.js`:
```javascript
const DEBUG = true; // Set to true for verbose logging

if (DEBUG) {
  console.log('[DEBUG]', message);
}
```

### Check Storage Contents

In Chrome DevTools Console:
```javascript
chrome.storage.local.get(null, (items) => {
  console.log('Stored items:', items);
});
```

### Test Data Parser Functions

In DevTools Console on popup page:
```javascript
// After extracting, check parsed data
console.log('Extracted courses:', window.lastExtractedCourses);
```

---

## Next: Continue to Phase Implementation

Once testing passes, proceed with:
1. **Phase 2** - Advanced scraping for multiple university systems
2. **Phase 3** - Full React-based popup UI
3. **Phase 4** - Backend API integration
4. **Phase 5** - Polish and additional features

For detailed implementation steps, see [PLUGIN_GUIDE.md](./PLUGIN_GUIDE.md).
