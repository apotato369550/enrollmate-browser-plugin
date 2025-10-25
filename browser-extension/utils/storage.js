/**
 * Storage Helper Functions for EnrollMate Browser Extension
 * Uses chrome.storage.local for persistence
 */

import { STORAGE_KEYS } from './config.js';

/**
 * Get authentication token from storage
 */
export async function getAuthToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEYS.AUTH_TOKEN, (result) => {
      resolve(result[STORAGE_KEYS.AUTH_TOKEN] || null);
    });
  });
}

/**
 * Set authentication token in storage
 */
export async function setAuthToken(token) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEYS.AUTH_TOKEN]: token }, () => {
      resolve();
    });
  });
}

/**
 * Clear authentication token from storage
 */
export async function clearAuthToken() {
  return new Promise((resolve) => {
    chrome.storage.local.remove(STORAGE_KEYS.AUTH_TOKEN, () => {
      resolve();
    });
  });
}

/**
 * Get user email from storage
 */
export async function getUserEmail() {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEYS.USER_EMAIL, (result) => {
      resolve(result[STORAGE_KEYS.USER_EMAIL] || null);
    });
  });
}

/**
 * Set user email in storage
 */
export async function setUserEmail(email) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEYS.USER_EMAIL]: email }, () => {
      resolve();
    });
  });
}

/**
 * Get user ID from storage
 */
export async function getUserId() {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEYS.USER_ID, (result) => {
      resolve(result[STORAGE_KEYS.USER_ID] || null);
    });
  });
}

/**
 * Set user ID in storage
 */
export async function setUserId(userId) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEYS.USER_ID]: userId }, () => {
      resolve();
    });
  });
}

/**
 * Get current semester ID from storage
 */
export async function getCurrentSemesterId() {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEYS.CURRENT_SEMESTER_ID, (result) => {
      resolve(result[STORAGE_KEYS.CURRENT_SEMESTER_ID] || null);
    });
  });
}

/**
 * Set current semester ID in storage
 */
export async function setCurrentSemesterId(semesterId) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEYS.CURRENT_SEMESTER_ID]: semesterId }, () => {
      resolve();
    });
  });
}

/**
 * Get semesters from storage
 */
export async function getSemesters() {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEYS.SEMESTERS, (result) => {
      resolve(result[STORAGE_KEYS.SEMESTERS] || []);
    });
  });
}

/**
 * Set semesters in storage
 */
export async function setSemesters(semesters) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEYS.SEMESTERS]: semesters }, () => {
      resolve();
    });
  });
}

/**
 * Get extension preferences from storage
 */
export async function getExtensionPreferences() {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEYS.PREFERENCES, (result) => {
      resolve(result[STORAGE_KEYS.PREFERENCES] || {
        theme: 'light',
        notifications: true,
        autoDetectUniversity: true
      });
    });
  });
}

/**
 * Set extension preferences in storage
 */
export async function setExtensionPreferences(preferences) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEYS.PREFERENCES]: preferences }, () => {
      resolve();
    });
  });
}

/**
 * Clear all stored data (logout)
 */
export async function clearAllData() {
  return new Promise((resolve) => {
    chrome.storage.local.clear(() => {
      resolve();
    });
  });
}

/**
 * Get user session (email, token, userId)
 */
export async function getUserSession() {
  return new Promise((resolve) => {
    chrome.storage.local.get(
      [STORAGE_KEYS.USER_EMAIL, STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.USER_ID],
      (result) => {
        resolve({
          email: result[STORAGE_KEYS.USER_EMAIL] || null,
          token: result[STORAGE_KEYS.AUTH_TOKEN] || null,
          userId: result[STORAGE_KEYS.USER_ID] || null
        });
      }
    );
  });
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const session = await getUserSession();
  return !!(session.token && session.email);
}
