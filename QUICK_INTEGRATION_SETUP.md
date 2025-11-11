# Quick Integration Setup Guide

**Goal:** Connect your browser extension to your Enrollmate fullstack/frontend in 10 minutes

---

## Prerequisites

- [ ] Browser extension installed and working (phases 1-3 complete)
- [ ] Enrollmate fullstack app running locally or deployed
- [ ] Supabase project set up
- [ ] Node.js and npm/yarn installed

---

## 5-Step Quick Setup

### Step 1: Copy API Endpoint Files (2 minutes)

Copy the 3 API endpoint files from `/backend-examples/` to your backend:

**For Next.js Pages Router:**
```bash
# Navigate to your Enrollmate backend directory
cd /path/to/your/enrollmate-backend

# Create API directories
mkdir -p pages/api/auth
mkdir -p pages/api/users/[userId]
mkdir -p pages/api/semesters/[id]

# Copy files
cp /path/to/enrollmate-browser-plugin/backend-examples/api-auth-login.js pages/api/auth/login.js
cp /path/to/enrollmate-browser-plugin/backend-examples/api-users-semesters.js pages/api/users/[userId]/semesters.js
cp /path/to/enrollmate-browser-plugin/backend-examples/api-import-courses.js pages/api/semesters/[id]/import-courses.js
```

**For Next.js App Router (13+):**
```bash
# Create API directories
mkdir -p app/api/auth/login
mkdir -p app/api/users/[userId]/semesters
mkdir -p app/api/semesters/[id]/import-courses

# Copy and rename to route.js
cp backend-examples/api-auth-login.js app/api/auth/login/route.js
cp backend-examples/api-users-semesters.js app/api/users/[userId]/semesters/route.js
cp backend-examples/api-import-courses.js app/api/semesters/[id]/import-courses/route.js
```

---

### Step 2: Update API File Imports (1 minute)

In each copied API file, update the import paths to match your project structure:

**Example changes:**
```javascript
// FROM:
import { SemesterAPI } from '../../../lib/api/semesterAPI';
import { supabase } from '../../../lib/supabaseClient';

// TO (adjust based on your structure):
import { SemesterAPI } from '@/lib/api/semesterAPI';
import { supabase } from '@/lib/supabaseClient';
```

---

### Step 3: Enable CORS (2 minutes)

**For Next.js, create/update `next.config.js`:**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Apply CORS to all API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

**For Express.js:**

```javascript
const cors = require('cors');

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

### Step 4: Update Browser Extension API URL (1 minute)

Edit: **`browser-extension/background.js`**

```javascript
// Line 7: Change this URL
const ENROLLMATE_API_URL = 'http://localhost:3000'; // For local development

// OR for production:
// const ENROLLMATE_API_URL = 'https://your-enrollmate-domain.com';
```

**Reload the extension in Chrome:**
1. Go to `chrome://extensions`
2. Click the refresh icon on EnrollMate extension
3. Extension is now updated

---

### Step 5: Test the Integration (4 minutes)

#### Test 1: Test Authentication Endpoint

**Using curl:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test-email@example.com","password":"your-password"}'
```

**Expected response:**
```json
{
  "token": "eyJhbGc...",
  "userId": "uuid-here",
  "email": "your-test-email@example.com"
}
```

✅ If you get a token, authentication works!

---

#### Test 2: Test Get Semesters Endpoint

**Using curl (replace {TOKEN} and {USER_ID}):**
```bash
curl -X GET http://localhost:3000/api/users/{USER_ID}/semesters \
  -H "Authorization: Bearer {TOKEN}"
```

**Expected response:**
```json
{
  "semesters": [
    {
      "id": "semester-uuid",
      "name": "1st Semester 2025",
      "year": 2025,
      "semester_type": "1st",
      "is_current": true
    }
  ]
}
```

✅ If you get semesters array, it works!

---

#### Test 3: Test Full Extension Workflow

1. **Open a test page:**
   - Navigate to `enrollmate-browser-plugin/example_data/example_1.html`
   - Or go to a real university course page

2. **Click extension icon:**
   - Should see green "E" icon in browser toolbar
   - Click it to open popup

3. **Extract courses:**
   - Click "Extract Courses" button
   - Should see list of extracted courses

4. **Authenticate:**
   - Enter your Enrollmate credentials
   - Should redirect to semester selection

5. **Import courses:**
   - Select a semester
   - Click import
   - Should see "Success! X courses imported"

6. **Verify in database:**
   - Open Supabase dashboard
   - Check `semester_courses` table
   - Should see imported courses

✅ If all steps work, integration is complete!

---

## Troubleshooting Quick Fixes

### Issue: CORS Error

**Fix:**
```bash
# Restart your Next.js dev server
npm run dev
# or
yarn dev
```

Make sure `next.config.js` has CORS headers enabled.

---

### Issue: 401 Unauthorized

**Fix:**
- Check token is being sent in Authorization header
- Verify Supabase URL and keys in `.env.local`:
  ```bash
  NEXT_PUBLIC_SUPABASE_URL=your-url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
  ```

---

### Issue: Module Not Found

**Fix:**
Update import paths in API files to match your project structure.

Example:
```javascript
// If you get "Cannot find module '@/lib/api/semesterAPI'"
// Change to:
import { SemesterAPI } from '../../../lib/api/semesterAPI';
```

---

### Issue: Extension Can't Connect

**Fix:**
1. Check `ENROLLMATE_API_URL` in `browser-extension/background.js`
2. Verify backend is running: `http://localhost:3000`
3. Check browser console (F12) for errors

---

## Verification Checklist

After setup, verify these work:

- [ ] Backend starts without errors
- [ ] Can access `http://localhost:3000/api/auth/login` via curl
- [ ] Extension loads in Chrome without errors
- [ ] Extension popup opens when clicked
- [ ] Can authenticate via extension popup
- [ ] Can see semester list after auth
- [ ] Can extract courses from example page
- [ ] Can import courses to semester
- [ ] Courses appear in Supabase database

---

## Next Steps

Once basic integration works:

1. **Deploy backend to production**
   - Update `ENROLLMATE_API_URL` in `background.js`
   - Test with production URL

2. **Add error tracking**
   - Consider Sentry or similar service
   - Monitor API errors

3. **Optimize performance**
   - Add caching for semesters
   - Implement retry logic

4. **Enhance security**
   - Implement rate limiting
   - Add request validation
   - Set up audit logging

---

## Support Resources

- **Full Integration Guide:** `/INTEGRATION_GUIDE.md`
- **API Documentation:** `/API_DOCUMENTATION.md`
- **Browser Extension Docs:** `/docs/INDEX.md`
- **Testing Guide:** `/docs/INSTALLATION_GUIDE.md`

---

## Common Commands

**Start backend (Next.js):**
```bash
npm run dev
# or
yarn dev
```

**Test API endpoint:**
```bash
# Auth
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

# Get semesters
curl -X GET http://localhost:3000/api/users/{USER_ID}/semesters \
  -H "Authorization: Bearer {TOKEN}"
```

**Reload extension:**
1. Go to `chrome://extensions`
2. Click refresh icon on EnrollMate extension

**Check extension logs:**
1. Right-click extension icon
2. Select "Inspect popup"
3. Go to Console tab

---

**Estimated Total Time:** 10-15 minutes
**Difficulty:** Easy (if you follow steps exactly)

Good luck! 🚀
