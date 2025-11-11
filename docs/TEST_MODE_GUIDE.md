# TEST_MODE Guide - EnrollMate Browser Extension

## What is TEST_MODE?

TEST_MODE is a configuration setting that allows you to test the extension without needing:
- A live backend API
- A real course registration page
- Content script injection

When `TEST_MODE = true`, the extension uses **mock data** instead of actual scraping and API calls.

---

## When to Use TEST_MODE

✅ **Use TEST_MODE when:**
- Testing the extension UI and workflow
- Backend API isn't ready yet
- Developing locally without a server
- Testing on restricted pages (chrome://, chrome-extension://)
- Demonstrating the extension to stakeholders
- You get "Could not establish connection" errors

❌ **Don't use TEST_MODE when:**
- Testing actual course scraping
- Testing with real university pages
- Backend is ready and you want to test integration
- Deploying to production

---

## How to Enable/Disable TEST_MODE

### Method 1: Edit popup.js (Recommended for Testing)

1. Open `browser-extension/popup.js`
2. Find line 6: `const TEST_MODE = true;`
3. Change to:
   - `const TEST_MODE = true;` for **TEST MODE** (uses mock data)
   - `const TEST_MODE = false;` for **PRODUCTION MODE** (uses real scraping)

### Method 2: Edit utils/config.js (For Backend Configuration)

1. Open `browser-extension/utils/config.js`
2. Find line 10: `export const TEST_MODE = true;`
3. Change to:
   - `export const TEST_MODE = true;` for test
   - `export const TEST_MODE = false;` for production

**Important:** Both files should match for consistency!

---

## What Changes in TEST_MODE?

### TEST_MODE = true (Mock Data)

| Feature | Behavior |
|---------|----------|
| Course Extraction | Returns 3 mock courses immediately |
| Page Requirements | Works on ANY page (even chrome://) |
| Content Script | Not needed - bypasses it |
| API Calls | Skipped (will be mocked in future) |
| Speed | Instant (500ms simulated delay) |
| Console Logs | Shows "🧪 TEST MODE ENABLED" |

### TEST_MODE = false (Production)

| Feature | Behavior |
|---------|----------|
| Course Extraction | Actual DOM scraping from page |
| Page Requirements | Must be on course registration page |
| Content Script | Must inject and run |
| API Calls | Real backend calls |
| Speed | Depends on page complexity |
| Console Logs | Shows actual extraction process |

---

## Testing with TEST_MODE

### Quick Test (TEST_MODE = true)

```
1. Set TEST_MODE = true in popup.js
2. Reload extension (chrome://extensions/)
3. Click extension icon on ANY page
4. Click "Extract Courses"
5. Should see 3 mock courses appear
```

**Expected Output:**
```
[EnrollMate Popup] 🧪 TEST MODE ENABLED - Using mock data
[EnrollMate Popup] Courses found: Array(3)
[EnrollMate Popup] Course count: 3

Table with:
- CIS 1101 - Introduction to Computing Concepts
- CIS 1102 - Data Structures
- CIS 2103 - Database Systems
```

---

## Mock Data Included

When TEST_MODE is enabled, you'll see these sample courses:

1. **CIS 1101 - Introduction to Computing Concepts**
   - Section 1
   - MWF 01:30 PM - 03:30 PM
   - 25/30 enrolled (OK)
   - Dr. Smith, LB201

2. **CIS 1102 - Data Structures**
   - Section 1
   - TuTh 09:00 AM - 10:30 AM
   - 30/30 enrolled (FULL)
   - Dr. Johnson, LB202

3. **CIS 2103 - Database Systems**
   - Section 1
   - MWF 10:00 AM - 11:00 AM
   - 15/30 enrolled (OK)
   - Prof. Williams, LB301

---

## Understanding the "Could not establish connection" Error

### What This Error Means

This error occurs when the popup tries to send a message to the content script, but the content script isn't available.

### Common Causes

1. **You're on a Chrome internal page**
   - `chrome://extensions/`
   - `chrome://settings/`
   - `chrome-extension://...`
   - Content scripts can't run on these pages

2. **You're on a restricted page**
   - Chrome Web Store
   - Gmail
   - Google Docs
   - Other restricted domains

3. **Content script hasn't loaded yet**
   - Page just loaded
   - Script is still injecting
   - Script crashed during injection

4. **Page was already open when you installed**
   - Content scripts only inject when page loads
   - Need to refresh the page

### Solutions

#### Solution 1: Enable TEST_MODE (Quickest)
```javascript
// In popup.js line 6:
const TEST_MODE = true; // ← Set to true
```
Reload extension, test again. Works on ANY page!

#### Solution 2: Navigate to a Valid Page
- Open example_data/example_1.html
- Or navigate to your university course page
- Make sure it's NOT a chrome:// page

#### Solution 3: Refresh the Page
- If page was open before installing, refresh it (F5)
- This ensures content script runs

#### Solution 4: Manual Content Script Injection
The extension now auto-injects the content script, but if it fails:
```
1. Make sure manifest.json has correct permissions
2. Check DevTools console for injection errors
3. Try reloading extension and refreshing page
```

---

## How the Fix Works

### Before (Error Prone)

```javascript
// Old code - would fail immediately
const response = await chrome.tabs.sendMessage(tab.id, {
  action: 'SCRAPE_COURSES'
});
```

### After (With Fixes)

```javascript
// 1. Check TEST_MODE first
if (TEST_MODE) {
  // Return mock data - no content script needed!
  return MOCK_COURSES;
}

// 2. Check if page allows content scripts
if (tab.url.startsWith('chrome://')) {
  throw new Error('Cannot run on Chrome internal pages');
}

// 3. Try to inject content script
await chrome.scripting.executeScript({
  target: { tabId: tab.id },
  files: ['content-script.js']
});

// 4. Then send message
const response = await chrome.tabs.sendMessage(tab.id, {
  action: 'SCRAPE_COURSES'
});

// 5. Provide helpful error message if it still fails
if (err.message.includes('Receiving end does not exist')) {
  // Show detailed troubleshooting steps
}
```

---

## Switching Between Modes

### Development Workflow

**Phase 1: UI Testing (TEST_MODE = true)**
```
1. Set TEST_MODE = true
2. Test all popup states
3. Test authentication flow (will need mocking)
4. Test semester selection
5. Verify UI works correctly
```

**Phase 2: Scraping Testing (TEST_MODE = false)**
```
1. Set TEST_MODE = false
2. Navigate to course page
3. Test actual scraping
4. Verify course data format
5. Check console logs
```

**Phase 3: Backend Integration (TEST_MODE = false)**
```
1. Set TEST_MODE = false
2. Update ENROLLMATE_API_URL in config.js
3. Test authentication
4. Test course import
5. Test full workflow
```

**Phase 4: Production (TEST_MODE = false)**
```
1. Set TEST_MODE = false in both files
2. Update API URLs to production
3. Test on real university pages
4. Deploy extension
```

---

## Troubleshooting TEST_MODE

### Issue: TEST_MODE doesn't seem to work
**Check:**
- [ ] Is `TEST_MODE = true` in popup.js?
- [ ] Did you reload the extension?
- [ ] Are you looking at the right console logs?

### Issue: Want to add more mock courses
**Edit:**
1. Open `popup.js`
2. Find `MOCK_COURSES` array
3. Add more course objects following the same format
4. Reload extension

### Issue: TEST_MODE works but production doesn't
**This is normal!** It means:
- TEST_MODE is working correctly ✅
- Content script has an issue when TEST_MODE is off
- Follow the "Solutions" section above

---

## Console Messages

### TEST_MODE = true
```
[EnrollMate Popup] 🧪 TEST MODE ENABLED - Using mock data
[EnrollMate Popup] Courses found: Array(3) [ {...}, {...}, {...} ]
[EnrollMate Popup] Course count: 3
```

### TEST_MODE = false (Success)
```
[EnrollMate Popup] Sending SCRAPE_COURSES message to tab 12345
[EnrollMate Popup] Tab URL: https://ismis.usc.edu.ph/...
[EnrollMate Popup] Content script injected successfully
[EnrollMate Popup] Received response: {success: true, ...}
[EnrollMate Popup] ✅ Extraction successful!
```

### TEST_MODE = false (Error)
```
[EnrollMate Popup] ❌ Error during extraction: Error: Could not establish connection...
```
Then shows detailed troubleshooting steps in the popup.

---

## Quick Reference

| Action | TEST_MODE = true | TEST_MODE = false |
|--------|------------------|-------------------|
| Works on chrome:// pages? | ✅ Yes | ❌ No |
| Needs content script? | ❌ No | ✅ Yes |
| Uses mock data? | ✅ Yes | ❌ No |
| Scrapes real pages? | ❌ No | ✅ Yes |
| Calls backend API? | ❌ No (future) | ✅ Yes |
| Speed | Instant | Variable |
| Best for | UI testing | Production |

---

## Files Modified

1. **utils/config.js**
   - Added TEST_MODE constant
   - Added comments explaining when to use it

2. **popup.js**
   - Added TEST_MODE check
   - Added MOCK_COURSES data
   - Added better error handling
   - Added content script auto-injection
   - Added helpful error messages

3. **utils/mockData.js** (NEW)
   - Centralized mock data
   - Future: Can be imported by other files

---

## Next Steps

### For Testing Now (TEST_MODE = true)
1. ✅ Set TEST_MODE = true in popup.js
2. ✅ Reload extension
3. ✅ Click extension icon on any page
4. ✅ See mock courses appear
5. ✅ Verify UI works correctly

### For Production Later (TEST_MODE = false)
1. ⏭️ Build backend API
2. ⏭️ Update ENROLLMATE_API_URL
3. ⏭️ Set TEST_MODE = false
4. ⏭️ Test on real course pages
5. ⏭️ Deploy extension

---

## Summary

**Problem:** "Could not establish connection" error
**Root Cause:** Content script can't run on Chrome internal pages
**Solution:** Added TEST_MODE to bypass content script with mock data

**Now you can:**
- ✅ Test extension on ANY page (even chrome://)
- ✅ Test UI without backend
- ✅ Demo to stakeholders easily
- ✅ Switch to production mode when ready

---

**Ready to test! Set TEST_MODE = true and try the extension now.** 🚀
