# EnrollMate Extension - Testing Checklist

Use this checklist to verify everything is working correctly after the updates.

---

## ✅ Pre-Testing Setup

- [ ] Extension reloaded in `chrome://extensions/`
- [ ] Green EnrollMate icon visible in toolbar
- [ ] Example course page open or `example_data/example_1.html` in browser
- [ ] F12 (DevTools) ready to open

---

## ✅ Phase 1: Basic Extension Loading

### Check Extension is Loaded
- [ ] Go to `chrome://extensions/`
- [ ] EnrollMate extension appears in the list
- [ ] Status shows "Enabled"
- [ ] Extension ID is visible
- [ ] No error messages shown

### Check Icon Displays
- [ ] Green icon appears in browser toolbar
- [ ] Icon looks like EnrollMate branding (not placeholder)
- [ ] Clicking icon opens popup without errors
- [ ] Popup title shows "📚 EnrollMate"
- [ ] "Extract Courses" button visible

---

## ✅ Phase 2: Console Logging - Page View

**Location:** Open course page → Press F12 → Console tab

### Check Initial Logs
- [ ] Extension script loaded message appears
- [ ] No red errors in console at startup
- [ ] Console is ready for logging

### Extract Courses & Check Logs
- [ ] Click extension icon → "Extract Courses" button
- [ ] Watch for `[EnrollMate]` messages appearing
- [ ] See message: `🔍 Starting course extraction...`
- [ ] See message: `Detecting page type...`
- [ ] See message: `Page type detected: generic-table` (or canvas/banner)

### Check Table Detection
- [ ] See message showing number of tables: `✓ 1 HTML table(s) found`
- [ ] If 0 tables, page might not have expected structure
- [ ] Message shows which scraper was used

### Check Course Extraction
- [ ] See message: `Found X raw courses before validation` (should be > 0)
- [ ] See validation step: `X → Y courses after validation`
- [ ] See deduplication step: `Y → Z courses after deduplication`
- [ ] Final message: `✅ Extraction complete!`

### Check Course Listing
- [ ] See message: `📊 Found N courses (Page type: ...)`
- [ ] See: `📋 Extracted courses:`
- [ ] Each course listed with:
  - [ ] Course code (e.g., "CIS 1101")
  - [ ] Course name
  - [ ] Section number
  - [ ] Schedule (times or "TBA")
  - [ ] Enrollment (current/total)
  - [ ] Status (OK, FULL, AT-RISK)
  - [ ] Instructor (if available)
  - [ ] Room (if available)

### Check Full Data
- [ ] See: `📦 Full course data: [Array(N)]`
- [ ] Click on `[Array(N)]` to expand
- [ ] See all course objects with fields:
  - [ ] courseCode
  - [ ] courseName
  - [ ] sectionGroup
  - [ ] schedule
  - [ ] enrolledCurrent
  - [ ] enrolledTotal
  - [ ] instructor
  - [ ] room
  - [ ] status
  - [ ] extractedAt

---

## ✅ Phase 3: Console Logging - Popup View

**Location:** Right-click extension popup → Inspect → Console tab

### Check Popup Communication
- [ ] Click "Extract Courses" in popup
- [ ] See message: `[EnrollMate Popup] Sending SCRAPE_COURSES message...`
- [ ] See message: `[EnrollMate Popup] Received response: {...}`
- [ ] See message: `[EnrollMate Popup] ✅ Extraction successful!`
- [ ] See: `[EnrollMate Popup] Courses found: Array(N)`
- [ ] See: `[EnrollMate Popup] Course count: N`
- [ ] See: `[EnrollMate Popup] Page type: generic-table`

### Check Table View
- [ ] Below popup logs, see: `▼ Array(N)` (expandable)
- [ ] Expand to see `console.table()` output
- [ ] Table should show all courses with columns:
  - [ ] courseCode
  - [ ] courseName
  - [ ] sectionGroup
  - [ ] schedule
  - [ ] enrolledCurrent
  - [ ] enrolledTotal
  - [ ] instructor
  - [ ] status

### Check Popup Display
- [ ] Popup shows "✅ Courses Extracted"
- [ ] Shows course count
- [ ] Shows preview of first 3 courses
- [ ] Preview shows course code and schedule
- [ ] Button to continue or extract again

---

## ✅ Phase 4: Data Validation

### Check Data Format
- [ ] All courseCode values match pattern: "XXX 1234" (letters + 4 digits)
- [ ] All courseName values are non-empty strings
- [ ] All schedules are either times (e.g., "MWF 10:00 AM") or "TBA"
- [ ] All enrolledCurrent values are numbers
- [ ] All enrolledTotal values are numbers

### Check Status Inference
- [ ] Courses with enrollment = capacity show status "FULL"
- [ ] Courses with enrollment 0 show status "AT-RISK" or "AVAILABLE"
- [ ] Courses with 0 < enrollment < capacity show status "OK"

### Check Time Parsing
- [ ] Times include days (M, T, W, Th, F, S, Su)
- [ ] Times include start and end times (e.g., "10:00 AM - 11:30 AM")
- [ ] Times handle variations:
  - [ ] "MWF 10:00 AM - 11:30 AM"
  - [ ] "TuTh 9:00 AM - 10:30 AM"
  - [ ] Single course with "TBA"

### Check Deduplication
- [ ] No two courses have identical:
  - [ ] courseCode + sectionGroup + schedule
- [ ] If multiple sections exist, they have different schedules
- [ ] If same schedule, different section numbers

---

## ✅ Phase 5: Error Handling

### Check on Invalid Page
- [ ] Open a non-course page (e.g., Google)
- [ ] Click "Extract Courses"
- [ ] Either:
  - [ ] Shows 0 courses found, or
  - [ ] Shows error message in popup
- [ ] No red errors in DevTools
- [ ] Extension remains stable

### Check on Course Page with Issues
- [ ] Extract from a course page with unusual structure
- [ ] Check console for any `[EnrollMate ERROR]` messages
- [ ] Popup either shows courses or error message
- [ ] Never crashes or freezes

---

## ✅ Phase 6: UI/UX

### Check Popup Appearance
- [ ] Popup width is appropriate (~400px)
- [ ] Green background gradient visible (EnrollMate colors)
- [ ] Text is readable (good contrast)
- [ ] Buttons are clickable and respond
- [ ] No layout issues or overlapping elements

### Check States
- [ ] **Idle state:** Shows "Extract Courses" button
- [ ] **Extracting state:** Shows loading spinner
- [ ] **Preview state:** Shows course list, buttons
- [ ] **Error state:** Shows error message
- [ ] **Success state:** Shows success message

### Check Responsiveness
- [ ] Popup works on different screen sizes
- [ ] Text doesn't get cut off
- [ ] Buttons remain clickable
- [ ] Long course names display properly

---

## ✅ Phase 7: Icon Display

### Check Icon Appearance
- [ ] Icon visible in toolbar (top-right)
- [ ] Icon is the EnrollMate logo (not placeholder)
- [ ] Icon looks professional and clear
- [ ] Icon works at 16px, 32px, and 128px sizes
- [ ] Icon appears in:
  - [ ] Toolbar
  - [ ] Extensions menu
  - [ ] `chrome://extensions/` page

---

## ✅ Phase 8: Performance

### Check Extraction Speed
- [ ] Extraction completes in < 5 seconds
- [ ] No noticeable lag while extracting
- [ ] DevTools doesn't show high CPU usage
- [ ] Memory usage is reasonable

### Check with Large Dataset
- [ ] Works with 100+ courses without issues
- [ ] Works with 500+ courses without crashing
- [ ] Console logs display properly for large datasets

---

## ✅ Phase 9: Consistency

### Check Multiple Extractions
- [ ] Extract same page twice
- [ ] Both extractions show same course count
- [ ] Course data is identical both times
- [ ] No memory leaks (run multiple times)

### Check Different Pages
- [ ] Extract from example_data/example_1.html ✓
- [ ] Extract from example_data/example_2.html ✓
- [ ] Extract from real university page ✓
- [ ] All show appropriate results

---

## ✅ Phase 10: Documentation

### Check Quick Reference
- [ ] CONSOLE_LOGGING_QUICK_REF.md is clear and helpful
- [ ] Instructions are easy to follow
- [ ] Sample output matches what you see

### Check Debugging Guide
- [ ] DEBUGGING_GUIDE.md answers your questions
- [ ] Common scenarios are explained
- [ ] Troubleshooting section is helpful
- [ ] Examples are accurate

### Check Other Docs
- [ ] README.md provides good overview
- [ ] QUICK_START.md is clear
- [ ] INSTALLATION_GUIDE.md is comprehensive
- [ ] FINAL_SUMMARY.md ties everything together

---

## 📝 Test Results

### Overall Status
- [ ] All checkboxes above are checked
- [ ] No critical issues found
- [ ] Extension works as expected

### Summary
```
Date Tested: _______________
Tester Name: _______________
Browser: Chrome _____ version
Page Tested: _______________
Courses Extracted: _________
Any Issues: _______________
Recommendations: ___________
```

---

## 🎯 Sign-Off

### Ready for Phase 4?
- [ ] All tests passed
- [ ] Logging is clear and helpful
- [ ] Icon displays correctly
- [ ] Ready to build backend API

### Notes
```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## Quick Retest After Updates

If you update the extension, run this quick test:

1. [ ] Reload extension (chrome://extensions/)
2. [ ] Click icon - does it work?
3. [ ] Extract courses - do you see logs?
4. [ ] Check console - are [EnrollMate] messages there?
5. [ ] Check course count - does it match page?
6. [ ] Done!

---

## Troubleshooting During Testing

**Issue: Don't see [EnrollMate] logs**
- [ ] Reload extension
- [ ] Open F12 BEFORE clicking Extract
- [ ] Try on example_data/example_1.html

**Issue: Icon looks wrong**
- [ ] Reload extension
- [ ] Check manifest.json points to correct icon file
- [ ] Verify icon file exists: assets/icon-enrollmate.png

**Issue: Extract shows 0 courses**
- [ ] Check "Found 0 raw courses" message
- [ ] Try with example_data/example_1.html
- [ ] Verify page has HTML tables

**Issue: Course data incomplete**
- [ ] Expand [Array] to see full objects
- [ ] Compare with CONSOLE_LOGGING_QUICK_REF.md
- [ ] Check all fields are being parsed

---

**Testing Complete! 🎉 Check FINAL_SUMMARY.md to proceed.**
