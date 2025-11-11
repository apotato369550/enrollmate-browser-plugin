/**
 * EnrollMate Browser Extension - Get User Semesters Endpoint
 *
 * File: /api/users/[userId]/semesters.js (or /app/api/users/[userId]/semesters/route.js)
 * Purpose: Fetch all semesters for authenticated user
 *
 * IMPORTANT: Place this file in your backend's API routes folder
 */

import { SemesterAPI } from '../../../lib/api/semesterAPI';
import { supabase } from '../../../lib/supabaseClient';

/**
 * GET /api/users/{userId}/semesters
 * Get all semesters for a specific user
 */
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      message: 'Method not allowed. Use GET.'
    });
  }

  const { userId } = req.query;
  const authHeader = req.headers.authorization;

  // Validate authorization header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Unauthorized. Missing or invalid Authorization header.'
    });
  }

  try {
    // Extract token from header
    const token = authHeader.split(' ')[1];

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Token verification error:', error?.message);
      return res.status(401).json({
        message: 'Invalid or expired token'
      });
    }

    // Verify user matches requested userId (authorization check)
    if (user.id !== userId) {
      return res.status(403).json({
        message: 'Forbidden. You can only access your own semesters.'
      });
    }

    // Fetch semesters using existing SemesterAPI
    const semesters = await SemesterAPI.getUserSemesters(userId);

    // Format response for browser extension
    return res.status(200).json({
      semesters: semesters.map(sem => ({
        id: sem.id,
        name: sem.name,
        year: sem.year,
        semester_type: sem.semester_type,
        is_current: sem.is_current,
        status: sem.status
      }))
    });

  } catch (error) {
    console.error('Get semesters error:', error);
    return res.status(500).json({
      message: error.message || 'Failed to fetch semesters'
    });
  }
}

/**
 * NEXT.JS 13+ APP ROUTER VERSION:
 *
 * Create: /app/api/users/[userId]/semesters/route.js
 */

/*
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SemesterAPI } from '../../../../../lib/api/semesterAPI';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request, { params }) {
  try {
    const { userId } = params;
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

    if (user.id !== userId) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    const semesters = await SemesterAPI.getUserSemesters(userId);

    return NextResponse.json({ semesters });

  } catch (error) {
    console.error('Get semesters error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
*/

/**
 * ALTERNATIVE: Direct Supabase Query (if SemesterAPI not available)
 */

/*
async function getUserSemestersDirect(userId) {
  const { data, error } = await supabase
    .from('semesters')
    .select('id, name, year, semester_type, is_current, status')
    .eq('user_id', userId)
    .order('year', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
*/

/**
 * TESTING:
 *
 * Using curl:
 * curl -X GET http://localhost:3000/api/users/{USER_ID}/semesters \
 *   -H "Authorization: Bearer {YOUR_TOKEN}"
 *
 * Using Postman:
 * - Method: GET
 * - URL: http://localhost:3000/api/users/{userId}/semesters
 * - Headers:
 *   - Authorization: Bearer {token}
 *
 * Expected Response (200):
 * {
 *   "semesters": [
 *     {
 *       "id": "uuid-1",
 *       "name": "1st Semester 2025",
 *       "year": 2025,
 *       "semester_type": "1st",
 *       "is_current": true,
 *       "status": "active"
 *     },
 *     {
 *       "id": "uuid-2",
 *       "name": "2nd Semester 2024",
 *       "year": 2024,
 *       "semester_type": "2nd",
 *       "is_current": false,
 *       "status": "completed"
 *     }
 *   ]
 * }
 */
