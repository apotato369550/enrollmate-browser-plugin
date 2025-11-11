/**
 * EnrollMate Browser Extension - Import Courses Endpoint
 *
 * File: /api/semesters/[id]/import-courses.js (or /app/api/semesters/[id]/import-courses/route.js)
 * Purpose: Bulk import courses from browser extension to semester
 *
 * IMPORTANT: Place this file in your backend's API routes folder
 */

import { UserCourseAPI } from '../../../lib/api/userCourseAPI';
import { SemesterCourseAPI } from '../../../lib/api/semesterCourseAPI';
import { supabase } from '../../../lib/supabaseClient';

/**
 * POST /api/semesters/{semesterId}/import-courses
 * Import courses from browser extension
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      message: 'Method not allowed. Use POST.'
    });
  }

  const { id: semesterId } = req.query;
  const { courses, importedAt } = req.body;
  const authHeader = req.headers.authorization;

  // Validate authorization header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Unauthorized. Missing or invalid Authorization header.'
    });
  }

  try {
    // Extract and verify token
    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Token verification error:', error?.message);
      return res.status(401).json({
        message: 'Invalid or expired token'
      });
    }

    // Validate courses array
    if (!Array.isArray(courses) || courses.length === 0) {
      return res.status(400).json({
        message: 'No courses provided. Expected array of courses.'
      });
    }

    console.log(`Importing ${courses.length} courses for user ${user.id}`);

    // OPTION 1: Import to semester_courses table (for schedule building)
    // This is the recommended approach for the scheduler functionality
    const semesterCoursesResult = await importToSemesterCourses(semesterId, courses, user.id);

    // OPTION 2: Also save to user_courses library (optional - for 50-course limit tracking)
    // Uncomment if you want courses in both tables:
    // await importToUserCourses(user.id, courses);

    return res.status(200).json({
      message: `Imported ${semesterCoursesResult.imported} courses successfully`,
      coursesImported: semesterCoursesResult.imported,
      errors: semesterCoursesResult.errors || []
    });

  } catch (error) {
    console.error('Import courses error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to import courses'
    });
  }
}

/**
 * Helper: Import courses to semester_courses table
 * This table is used for schedule building and course selection
 */
async function importToSemesterCourses(semesterId, courses, userId) {
  try {
    // Verify semester belongs to user
    const { data: semester, error: semesterError } = await supabase
      .from('semesters')
      .select('id, user_id')
      .eq('id', semesterId)
      .single();

    if (semesterError || !semester) {
      throw new Error('Semester not found');
    }

    if (semester.user_id !== userId) {
      throw new Error('Unauthorized: Semester does not belong to user');
    }

    // Format courses for semester_courses table
    const coursesToInsert = courses.map(course => ({
      semester_id: semesterId,
      course_code: course.courseCode,
      course_name: course.courseName,
      section_group: course.sectionGroup,
      schedule: course.schedule || 'TBA',
      enrolled_current: course.enrolledCurrent || 0,
      enrolled_total: course.enrolledTotal || 0,
      room: course.room || null,
      instructor: course.instructor || null,
      status: course.status || 'AVAILABLE'
    }));

    // Insert courses using bulk import
    const { data, error } = await supabase
      .from('semester_courses')
      .insert(coursesToInsert)
      .select();

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return {
      imported: data.length,
      errors: []
    };

  } catch (error) {
    console.error('Error importing to semester_courses:', error);
    throw error;
  }
}

/**
 * Helper: Import courses to user_courses library (optional)
 * This enforces the 50-course limit per user
 */
async function importToUserCourses(userId, courses) {
  try {
    // Check course limit
    const stats = await UserCourseAPI.getCourseStats(userId);

    if (courses.length > stats.remaining) {
      console.warn(`User ${userId} can only save ${stats.remaining} more courses`);
      // Truncate to available space
      courses = courses.slice(0, stats.remaining);
    }

    if (courses.length === 0) {
      throw new Error('Course library is full (50 courses maximum)');
    }

    // Save courses with 'extension' source
    const result = await UserCourseAPI.saveCourses(userId, courses, 'extension');

    return {
      imported: result.success.length,
      errors: result.errors
    };

  } catch (error) {
    console.error('Error importing to user_courses:', error);
    throw error;
  }
}

/**
 * NEXT.JS 13+ APP ROUTER VERSION:
 *
 * Create: /app/api/semesters/[id]/import-courses/route.js
 */

/*
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request, { params }) {
  try {
    const { id: semesterId } = params;
    const { courses } = await request.json();
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    if (!Array.isArray(courses) || courses.length === 0) {
      return NextResponse.json(
        { message: 'No courses provided' },
        { status: 400 }
      );
    }

    const result = await importToSemesterCourses(semesterId, courses, user.id);

    return NextResponse.json({
      message: `Imported ${result.imported} courses successfully`,
      coursesImported: result.imported
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
*/

/**
 * TESTING:
 *
 * Using curl:
 * curl -X POST http://localhost:3000/api/semesters/{SEMESTER_ID}/import-courses \
 *   -H "Content-Type: application/json" \
 *   -H "Authorization: Bearer {YOUR_TOKEN}" \
 *   -d '{
 *     "courses": [
 *       {
 *         "courseCode": "CIS 2103",
 *         "courseName": "Database Systems",
 *         "sectionGroup": 1,
 *         "schedule": "MWF 10:00 AM - 11:30 AM",
 *         "enrolledCurrent": 25,
 *         "enrolledTotal": 30,
 *         "instructor": "Dr. Smith",
 *         "room": "LB201",
 *         "status": "OK"
 *       }
 *     ],
 *     "importedAt": "2025-11-12T10:30:00Z"
 *   }'
 *
 * Using Postman:
 * - Method: POST
 * - URL: http://localhost:3000/api/semesters/{semesterId}/import-courses
 * - Headers:
 *   - Content-Type: application/json
 *   - Authorization: Bearer {token}
 * - Body (raw JSON):
 *   {
 *     "courses": [...],
 *     "importedAt": "2025-11-12T10:30:00Z"
 *   }
 *
 * Expected Response (200):
 * {
 *   "message": "Imported 15 courses successfully",
 *   "coursesImported": 15,
 *   "errors": []
 * }
 */
