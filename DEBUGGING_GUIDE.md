# EnrollMate Extension - Debugging Guide

## Console Logging is Now Enabled! 🎉

I've added comprehensive logging to help you see exactly what's being extracted.

## How to View the Logs

### Option 1: Page Console (For Extracted Data)
When you extract courses, follow these steps:

1. **Open the page** you want to extract from
2. **Press F12** to open DevTools
3. Go to **Console** tab
4. **Click the extension icon** and select "Extract Courses"
5. **Look for messages starting with `[EnrollMate]`**

You'll see output like:
```
[EnrollMate] 🔍 Starting course extraction...
[EnrollMate]   Detecting page type...
[EnrollMate]   URL: https://ismis.usc.edu.ph/courseschedule/...
[EnrollMate]   ✓ 1 HTML table(s) found - using generic-table scraper
[EnrollMate]   Found 142 raw courses before validation
[EnrollMate]   142 → 142 courses after validation
[EnrollMate]   142 → 142 courses after deduplication
[EnrollMate] ✅ Extraction complete!
[EnrollMate] 📊 Found 142 courses (Page type: generic-table)
[EnrollMate] 📋 Extracted courses:
[EnrollMate]   1. CIS 1101 - Introduction to Computing Concepts (Section 1)
[EnrollMate]      Schedule: MWF 01:30 PM - 03:30 PM
[EnrollMate]      Enrollment: 25/30 (OK)
[EnrollMate]      Instructor: Dr. Smith
[EnrollMate]      Room: LB201
[EnrollMate]   2. CIS 1102 - Introduction to Computing Concepts (Section 2)
[EnrollMate]      Schedule: TBA
[EnrollMate]      Enrollment: 0/0 (AT-RISK)
...
[EnrollMate] 📦 Full course data: [Array of 142 courses]
```

### Option 2: Popup Console (For Communication Logs)
This shows what the popup is sending/receiving:

1. **Click the extension icon** to open the popup
2. **Right-click the popup** → "Inspect"
3. Go to **Console** tab in DevTools
4. **Click "Extract Courses"**
5. **Look for messages starting with `[EnrollMate Popup]`**

You'll see:
```
[EnrollMate Popup] Sending SCRAPE_COURSES message to tab 12345
[EnrollMate Popup] Received response: {success: true, courseCount: 142, ...}
[EnrollMate Popup] ✅ Extraction successful!
[EnrollMate Popup] Courses found: Array(142) [ {...}, {...}, ... ]
[EnrollMate Popup] Course count: 142
[EnrollMate Popup] Page type: generic-table
```

The popup also includes a **table view** of all courses:
```
┌─────────┬───────────────────────────────────────────┬──────────┬────────┬────────┬────────────┬──────────┬────────────┐
│ (index) │           courseCode                      │ courseName │ section│schedule│enrolledCur│enrolledTo│ instructor │
├─────────┼───────────────────────────────────────────┼──────────┼────────┼────────┼────────────┼──────────┼────────────┤
│    0    │            "CIS 1101"                     │ "Intro..." │   1    │ "MWF..." │    25    │    30    │ "Dr. Smith"│
│    1    │            "CIS 1102"                     │ "Intro..." │   2    │  "TBA"  │    0     │    0     │     ""     │
└─────────┴───────────────────────────────────────────┴──────────┴────────┴────────┴────────────┴──────────┴────────────┘
```

## Debugging Workflow

### Step 1: Check if Content Script Ran
Look for this message on the page console:
```
[EnrollMate] 🔍 Starting course extraction...
```

**If you see it:** Content script loaded ✅
**If you don't:** Check browser console for errors (might be permission issue)

### Step 2: Check Page Type Detection
Look for:
```
[EnrollMate]   Page type detected: generic-table
```

This tells you which scraping strategy was used. Possible values:
- `canvas` - Canvas/Instructure system
- `banner` - Banner/Ellucian system
- `generic-table` - HTML tables detected
- `generic` - Generic page scraper

### Step 3: Check Table Detection
Look for:
```
[EnrollMate]   ✓ 1 HTML table(s) found - using generic-table scraper
```

This shows how many tables were found on the page.

### Step 4: Check Raw Course Count
Look for:
```
[EnrollMate]   Found 142 raw courses before validation
```

This is before any filtering. If it's 0, the scraper couldn't find any elements matching course patterns.

### Step 5: Check Validation Results
Look for:
```
[EnrollMate]   142 → 142 courses after validation
```

The arrow shows: `before → after`

**Example interpretations:**
- `150 → 142` = 8 courses were invalid (missing required fields)
- `142 → 142` = All courses passed validation ✅
- `0 → 0` = No courses found

### Step 6: Check Deduplication
Look for:
```
[EnrollMate]   142 → 142 courses after deduplication
```

This removes duplicate courses (same code + section + schedule).

### Step 7: View Full Course List
Look for:
```
[EnrollMate] 📋 Extracted courses:
[EnrollMate]   1. CIS 1101 - Introduction to Computing Concepts (Section 1)
[EnrollMate]      Schedule: MWF 01:30 PM - 03:30 PM
[EnrollMate]      Enrollment: 25/30 (OK)
```

This shows a summary of each course. Look for:
- **Course codes** - Should be format like "CIS 1101"
- **Course names** - Full course titles
- **Schedules** - Meeting times or "TBA"
- **Enrollment** - "current/total" or "0/0"
- **Status** - OK, FULL, AT-RISK, or AVAILABLE

### Step 8: Full Data
Look for:
```
[EnrollMate] 📦 Full course data: [Array of 142 courses]
```

Click on the array to expand it and see all the detailed data for each course.

## Common Scenarios

### Scenario 1: "No courses found"
**Logs show:**
```
[EnrollMate]   Found 0 raw courses before validation
```

**Debugging:**
1. Are you on a course listing page? (Not login page, not empty page)
2. Does the page have HTML tables with course data?
3. Check if the page uses a custom layout not in the selectors
4. Take a screenshot and share the HTML structure

### Scenario 2: "High failure rate during validation"
**Logs show:**
```
[EnrollMate]   Found 200 raw courses before validation
[EnrollMate]   200 → 50 courses after validation
```

**Debugging:**
This means 150 courses were rejected because they're missing required fields (courseCode or courseName). The scraper is picking up extra elements. This might mean:
1. The CSS selectors are too broad
2. The page has nested tables
3. Extra rows with non-course data

### Scenario 3: "Duplicate removal is too aggressive"
**Logs show:**
```
[EnrollMate]   Found 100 raw courses before validation
[EnrollMate]   100 → 100 courses after validation
[EnrollMate]   100 → 50 courses after deduplication
```

**Debugging:**
This means 50 courses had identical code + section + schedule combinations. This is expected if the page lists the same section multiple times. If this seems wrong, check if:
1. Different instructors have the same section (can't distinguish)
2. Different rooms have the same section (can't distinguish)
3. The page genuinely has duplicate entries

## Message Prefixes

| Prefix | Meaning |
|--------|---------|
| `🔍` | Starting a process |
| `✅` | Success |
| `❌` | Error/failed |
| `📊` | Statistics |
| `📋` | List of items |
| `📦` | Data payload |
| `✓` | Confirmed |
| `ℹ` | Information |
| `⚠️` | Warning |

## Enabling/Disabling Debug Mode

Debug mode is currently **ON** by default.

To turn it off (if logs get too noisy):

1. Open `browser-extension/content-script.js`
2. Find line 7: `const DEBUG = true;`
3. Change to: `const DEBUG = false;`
4. Reload the extension in chrome://extensions/

Then logs won't appear. Turn it back on by changing to `true` again.

## Exporting Logs

### Copy as Text
1. In console, right-click on logs
2. Select "Copy message" or "Copy as JS object"
3. Paste into a text file

### Export Full Console
1. Right-click in console
2. Select "Save as..." (some browsers)
3. Or select all text and copy (Ctrl+A, Ctrl+C)

## Troubleshooting Tips

**Problem:** See error messages in console?
- Read the error message carefully
- Check [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md) troubleshooting section
- Look for `[EnrollMate ERROR]` messages

**Problem:** See "Extension is not available on this page"?
- Content scripts can't run on restricted pages (Chrome Store, Gmail, etc.)
- Try on a regular university registration page instead
- Or test with the example HTML files

**Problem:** Logs show 0 tables found but page clearly has a table?
- Page might be using JavaScript to render tables
- Try waiting a moment for the page to fully load before extracting
- Or the tables might be in an iframe (content scripts can't access those)

**Problem:** Extracted data looks wrong?
- Check if course codes are properly formatted
- Check if schedules include times
- Look at the "Full course data" array to see the raw data
- Screenshot the page and compare with extracted data

## Next Steps

Once you see the extracted courses in the console:

1. **Verify the data looks correct**
   - Course codes match the page
   - Course names are complete
   - Times are properly formatted
   - Enrollment numbers are accurate

2. **If data looks good:**
   - You're ready for backend integration!
   - See [PLUGIN_GUIDE.md](./PLUGIN_GUIDE.md) Phase 4

3. **If data looks wrong:**
   - Note which fields are incorrect
   - Take a screenshot of the page
   - Update CSS selectors in content-script.js
   - Or create a custom scraper for that university

## Still Having Issues?

Check these resources:
- [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md) - Testing guide
- [QUICK_START.md](./QUICK_START.md) - Setup troubleshooting
- [README.md](./README.md) - FAQ section
- Chrome DevTools docs: https://developer.chrome.com/docs/devtools/console/

## Example: Full Debug Session

Here's what a successful extraction looks like:

```
[EnrollMate] 🔍 Starting course extraction...
[EnrollMate]   Detecting page type...
[EnrollMate]   URL: https://ismis.usc.edu.ph/courseschedule/CourseScheduleOfferedIndex
[EnrollMate]   ✓ 1 HTML table(s) found - using generic-table scraper
[EnrollMate]   Found 142 raw courses before validation
[EnrollMate]     Processing 1 table(s)...
[EnrollMate]     Table 1: 142 row(s)
[EnrollMate]       ✓ Row 1: Extracted CIS 1101
[EnrollMate]       ✓ Row 2: Extracted CIS 1101
[EnrollMate]       ✓ Row 3: Extracted CIS 1102
... (140 more rows)
[EnrollMate]   142 → 142 courses after validation
[EnrollMate]   142 → 142 courses after deduplication
[EnrollMate] ✅ Extraction complete!
[EnrollMate] 📊 Found 142 courses (Page type: generic-table)
[EnrollMate] 📋 Extracted courses:
[EnrollMate]   1. CIS 1101 - Introduction to Computing Concepts (Section 1)
[EnrollMate]      Schedule: MWF 01:30 PM - 03:30 PM
[EnrollMate]      Enrollment: 25/30 (OK)
[EnrollMate]   2. CIS 1101 - Introduction to Computing Concepts (Section 2)
[EnrollMate]      Schedule: TuTh 09:00 AM - 10:30 AM
[EnrollMate]      Enrollment: 30/30 (FULL)
[EnrollMate]   3. CIS 1102 - Data Structures (Section 1)
[EnrollMate]      Schedule: MWF 10:00 AM - 11:00 AM
[EnrollMate]      Enrollment: 0/30 (AVAILABLE)
... (142 courses total)
[EnrollMate] 📦 Full course data: [Array(142)]

[EnrollMate Popup] Sending SCRAPE_COURSES message to tab 12345
[EnrollMate Popup] Received response: {success: true, courses: Array(142), ...}
[EnrollMate Popup] ✅ Extraction successful!
[EnrollMate Popup] Courses found: Array(142) [ {...}, {...}, ... ]
[EnrollMate Popup] Course count: 142
[EnrollMate Popup] Page type: generic-table
```

Plus a nice table view showing all 142 courses in a formatted table!

---

Happy debugging! 🚀
