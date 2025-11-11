/**
 * EnrollMate Browser Extension - Authentication Endpoint
 *
 * File: /api/auth/login.js (or /app/api/auth/login/route.js for Next.js 13+)
 * Purpose: Authenticate user and return JWT token for browser extension
 *
 * IMPORTANT: Place this file in your backend's API routes folder
 */

import { supabase } from '../../../lib/supabaseClient';

/**
 * POST /api/auth/login
 * Authenticate user with email and password
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      message: 'Method not allowed. Use POST.'
    });
  }

  const { email, password } = req.body;

  // Validate request body
  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required'
    });
  }

  try {
    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Authentication error:', error.message);
      return res.status(401).json({
        message: error.message || 'Invalid credentials'
      });
    }

    // Check if user data exists
    if (!data.user || !data.session) {
      return res.status(401).json({
        message: 'Authentication failed'
      });
    }

    // Return user info and token for browser extension
    return res.status(200).json({
      token: data.session.access_token,
      userId: data.user.id,
      email: data.user.email,
      expiresAt: data.session.expires_at
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
}

/**
 * NEXT.JS 13+ APP ROUTER VERSION:
 *
 * Create: /app/api/auth/login/route.js
 */

/*
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return NextResponse.json(
        { message: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json({
      token: data.session.access_token,
      userId: data.user.id,
      email: data.user.email,
      expiresAt: data.session.expires_at
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
*/

/**
 * TESTING:
 *
 * Using curl:
 * curl -X POST http://localhost:3000/api/auth/login \
 *   -H "Content-Type: application/json" \
 *   -d '{"email":"test@example.com","password":"password123"}'
 *
 * Using Postman:
 * - Method: POST
 * - URL: http://localhost:3000/api/auth/login
 * - Headers: Content-Type: application/json
 * - Body (raw JSON):
 *   {
 *     "email": "test@example.com",
 *     "password": "password123"
 *   }
 *
 * Expected Response (200):
 * {
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "userId": "uuid-here",
 *   "email": "test@example.com",
 *   "expiresAt": 1699564800
 * }
 */
