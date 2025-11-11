# Console Logging - Quick Reference Card

## TL;DR - See Your Extracted Courses in 30 Seconds

```
1. Reload extension: chrome://extensions/ → Find EnrollMate → Click reload ↻
2. Open course page or example_data/example_1.html
3. Press F12 (opens DevTools)
4. Click extension icon → "Extract Courses"
5. Look at Console tab → See [EnrollMate] messages with course details
```

---

## The Two Console Views

### View 1: Extracted Course Data
- **Where:** Page console (F12 on the course page itself)
- **Shows:** Detailed logs from course extraction process
- **Prefix:** `[EnrollMate]`

### View 2: Popup Communication
- **Where:** Popup inspector (right-click popup → Inspect)
- **Shows:** Messages between popup and content script
- **Prefix:** `[EnrollMate Popup]`
- **Bonus:** Includes `console.table()` with all courses

---

## Sample Output

```
[EnrollMate] 🔍 Starting course extraction...
[EnrollMate]   Detecting page type...
[EnrollMate]   ✓ 1 HTML table(s) found - using generic-table scraper
[EnrollMate]   Found 142 raw courses before validation
[EnrollMate]   142 → 142 courses after validation
[EnrollMate]   142 → 142 courses after deduplication
[EnrollMate] ✅ Extraction complete!
[EnrollMate] 📊 Found 142 courses (Page type: generic-table)
[EnrollMate] 📋 Extracted courses:
[EnrollMate]   1. CIS 1101 - Intro to Computing (Section 1)
[EnrollMate]      Schedule: MWF 01:30 PM - 03:30 PM
[EnrollMate]      Enrollment: 25/30 (OK)
[EnrollMate]   2. CIS 1102 - Data Structures (Section 1)
[EnrollMate]      Schedule: TuTh 09:00 AM - 10:30 AM
[EnrollMate]      Enrollment: 30/30 (FULL)
[EnrollMate] 📦 Full course data: [Array(142)]  ← Click to expand
```

---

## What Each Line Means

| Log | What It Means |
|-----|---------------|
| `🔍 Starting course extraction...` | Beginning the extraction process |
| `Detecting page type...` | Analyzing the page layout |
| `✓ 1 HTML table(s) found` | Found 1 table with courses |
| `Found 142 raw courses` | Grabbed 142 candidate items before filtering |
| `142 → 142 after validation` | All 142 passed quality checks |
| `142 → 142 after deduplication` | No duplicates removed |
| `✅ Extraction complete!` | Success! ✅ |
| `📊 Found 142 courses` | Total count and page type |
| `📋 Extracted courses:` | About to show list of each course |
| `1. CIS 1101 - Intro...` | Course code and name |
| `Schedule: MWF 01:30...` | Meeting times |
| `Enrollment: 25/30 (OK)` | Current/Total (Status) |
| `📦 Full course data: [Array]` | Full data - click to expand |

---

## Troubleshooting Quick Guide

| Problem | Check This First |
|---------|------------------|
| No console messages | Did you reload extension? |
| Says "Found 0 courses" | Is it a course listing page? |
| Extracted course count wrong | Check "Found X raw courses" number |
| Course data looks incomplete | Expand `[Array]` to see full fields |
| Different counts: `100 → 50` | Some courses failed validation |
| Different counts: `50 → 25` | Duplicate courses removed |

---

## Fields in Each Course

When you expand `[Array(142)]` you'll see objects like:

```javascript
{
  courseCode: "CIS 1101",              // Course ID
  courseName: "Intro to Computing",    // Full name
  sectionGroup: 1,                     // Section number
  schedule: "MWF 01:30 PM - 03:30 PM", // Meeting times
  enrolledCurrent: 25,                 // Students enrolled
  enrolledTotal: 30,                   // Total capacity
  instructor: "Dr. Smith",             // Professor
  room: "LB201",                       // Room number
  status: "OK",                        // OK/FULL/AT-RISK
  extractedAt: "2024-10-26T..."        // Timestamp
}
```

---

## Common Messages Explained

### Success Messages ✅
```
✅ Extraction complete!
✓ 1 HTML table(s) found
✓ Canvas system detected
✓ Row 5: Extracted CIS 1101
```

### Info Messages ℹ️
```
Found 142 raw courses before validation
142 → 142 courses after validation
ℹ No specific system detected
```

### Warning Messages ⚠️
```
⚠️ No courses found on this page
Found 0 raw courses
```

### Error Messages ❌
```
❌ Failed to extract courses
[EnrollMate ERROR] Failed to scrape
```

---

## Step-by-Step for WAY 1: See Course Data

1. **Reload Extension**
   ```
   Go to chrome://extensions/
   Find EnrollMate extension
   Click reload icon (circular arrow)
   ```

2. **Open Page with Courses**
   ```
   Go to university course registration
   Or open example_data/example_1.html
   ```

3. **Open DevTools**
   ```
   Press F12 on your keyboard
   Or: Right-click page → Inspect
   ```

4. **Click on "Console" Tab**
   ```
   You should see empty console or past messages
   Clear it if needed: console.clear() and press Enter
   ```

5. **Trigger Extraction**
   ```
   Click the green "E" extension icon
   Click "🚀 Extract Courses" button
   ```

6. **Watch Console Populate**
   ```
   [EnrollMate] 🔍 Starting...
   [EnrollMate]   Detecting page type...
   [EnrollMate] ✅ Extraction complete!
   [EnrollMate] 📋 Extracted courses:
   ...and so on
   ```

---

## Step-by-Step for WAY 2: See Communication

1. **Click Extension Icon**
   ```
   Click green "E" icon in toolbar
   Popup window opens
   ```

2. **Right-Click on Popup**
   ```
   Right-click anywhere on the popup
   Select "Inspect" or "Inspect Element"
   DevTools opens for the popup
   ```

3. **Go to Console Tab**
   ```
   Make sure you're in "Console" tab
   Not "Elements" or other tabs
   ```

4. **Click "Extract Courses"**
   ```
   In the popup, click "🚀 Extract Courses"
   Watch console populate with [EnrollMate Popup] messages
   ```

5. **See the Results**
   ```
   [EnrollMate Popup] Sending SCRAPE_COURSES message...
   [EnrollMate Popup] Received response: {success: true, ...}
   [EnrollMate Popup] ✅ Extraction successful!
   [EnrollMate Popup] Courses found: Array(142)

   Plus a nice table via console.table()
   ```

---

## Expanding the Course Array

When you see:
```
[EnrollMate] 📦 Full course data: [Array(142)]
```

**Click on `[Array(142)]`** to expand and see all 142 courses with:
- courseCode
- courseName
- sectionGroup
- schedule
- enrolledCurrent
- enrolledTotal
- instructor
- room
- status

---

## Export/Share Logs

To save logs for troubleshooting:

1. **Copy console text:**
   ```
   Ctrl+A (select all in console)
   Ctrl+C (copy)
   Paste into text file
   ```

2. **Or take screenshot:**
   ```
   F12 to open DevTools
   Console shows your logs
   Screenshot with Shift+S
   ```

3. **Or use browser export:**
   ```
   Right-click console → Save as...
   (varies by browser)
   ```

---

## Disabling Debug Mode

If logs get too noisy, turn them off:

1. Open `browser-extension/content-script.js`
2. Find: `const DEBUG = true;`
3. Change to: `const DEBUG = false;`
4. Reload extension
5. To re-enable: change back to `true`

---

## Quick Checklist

- [ ] Reloaded extension?
- [ ] Opened course page or example_data/example_1.html?
- [ ] Pressed F12?
- [ ] Clicked "Extract Courses"?
- [ ] See `[EnrollMate]` messages?
- [ ] See course list in console?
- [ ] Data looks correct?

---

## Files Related to Logging

- `content-script.js` - Contains `log()` function and all [EnrollMate] messages
- `popup.js` - Contains `console.log()` and `console.table()` calls
- `DEBUGGING_GUIDE.md` - Full debugging guide with scenarios
- This file - Quick reference

---

## Next Steps

✅ If you see courses in console:
- Verify data looks correct
- Check all fields are populated
- Continue to Phase 4 backend integration

❌ If you don't see courses:
- Check "Found 0 raw courses" message
- Try with example_data/example_1.html
- Read DEBUGGING_GUIDE.md Common Scenarios
- Check that you're on a course listing page

---

**Happy debugging! Check DEBUGGING_GUIDE.md for detailed help.** 🚀
