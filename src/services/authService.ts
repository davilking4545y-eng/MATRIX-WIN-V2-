// Authentication Service for MATRIX WIN V2
// Supports MASTER KEY override and Firebase Realtime Database Key Authentication

import { AuthSession } from '../types';

export const MASTER_KEY = 'RUPADHIKARY';
const RTDB_BASE_URL = 'https://key-manager-623e1-default-rtdb.asia-southeast1.firebasedatabase.app';
const SESSION_STORAGE_KEY = 'matrix_v2_auth_session';
const DEVICE_ID_KEY = 'elite_device_id';

export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'DEV-SIMULATED';
  try {
    let devId = localStorage.getItem(DEVICE_ID_KEY) || localStorage.getItem('matrix_device_id');
    if (!devId) {
      devId = 'DEV-' + Math.random().toString(36).substring(2, 15).toUpperCase();
      localStorage.setItem(DEVICE_ID_KEY, devId);
      localStorage.setItem('matrix_device_id', devId);
    }
    return devId;
  } catch {
    return 'DEV-' + Math.random().toString(36).substring(2, 15).toUpperCase();
  }
}

export function getStoredSession(): AuthSession | null {
  // Requirement: Har bar refresh kerne pe Login key mange (prompt for login key on every refresh)
  return null;
}

export function saveSession(session: AuthSession): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.warn('Could not save auth session:', err);
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {}
}

export interface AuthResult {
  success: boolean;
  message: string;
  session?: AuthSession;
}

export async function authenticateKey(inputKey: string): Promise<AuthResult> {
  const trimmed = inputKey.trim();
  const deviceId = getOrCreateDeviceId();

  if (!trimmed) {
    return { success: false, message: 'Please enter your access key or master key' };
  }

  // 1. MASTER KEY VERIFICATION (Owner Bypass)
  if (trimmed.toUpperCase() === MASTER_KEY.toUpperCase()) {
    const session: AuthSession = {
      authenticated: true,
      role: 'owner',
      accessKey: MASTER_KEY,
      deviceId,
      loginTime: new Date().toISOString(),
      expiryDate: undefined, // Lifetime
    };
    saveSession(session);
    return {
      success: true,
      message: 'OWNER ACCESS GRANTED. Welcome, Owner.',
      session,
    };
  }

  // 2. FIREBASE REALTIME DATABASE KEY VERIFICATION
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const checkUrl = `${RTDB_BASE_URL}/valid_keys/${encodeURIComponent(trimmed)}.json`;
    const res = await fetch(checkUrl, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return { success: false, message: `Authentication server error (${res.status})` };
    }

    const keyData = await res.json();

    if (!keyData) {
      return { success: false, message: 'Invalid Access Key. Please check and try again.' };
    }

    // Check expiry
    if (keyData.expiryDate) {
      const expDate = new Date(keyData.expiryDate);
      if (expDate.getTime() < Date.now()) {
        return {
          success: false,
          message: `Key expired on ${expDate.toLocaleDateString()}. Please renew your access.`,
        };
      }
    }

    // Check device lock
    if (keyData.status === 'used' && keyData.usedBy && keyData.usedBy !== deviceId) {
      return {
        success: false,
        message: `Key locked to another device (${keyData.usedBy.slice(0, 8)}...). Single-device license.`,
      };
    }

    // Register / Update authorized device in Firebase
    try {
      await fetch(`${RTDB_BASE_URL}/authorized_devices/${encodeURIComponent(deviceId)}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorized: true,
          authorizedOn: new Date().toISOString(),
          usedKey: trimmed,
          keyExpiry: keyData.expiryDate || null,
        }),
      });

      await fetch(`${RTDB_BASE_URL}/valid_keys/${encodeURIComponent(trimmed)}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'used',
          usedBy: deviceId,
          usedOn: new Date().toISOString(),
        }),
      });
    } catch (writeErr) {
      // If write is blocked or network hiccup, the key was still valid
      console.warn('Telemetry write warning:', writeErr);
    }

    const isOwnerRole = keyData.role === 'owner' || keyData.isOwner === true;
    const session: AuthSession = {
      authenticated: true,
      role: isOwnerRole ? 'owner' : 'member',
      accessKey: trimmed,
      deviceId,
      loginTime: new Date().toISOString(),
      expiryDate: keyData.expiryDate,
    };

    saveSession(session);
    return {
      success: true,
      message: 'Access granted. Synchronizing quantum terminal...',
      session,
    };
  } catch (err: unknown) {
    console.error('Authentication error:', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Network error connecting to verification gateway',
    };
  }
}
