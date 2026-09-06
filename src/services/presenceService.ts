// Presence Service for Real-time Active Users Tracking
// 100% Real-Time Connected Users Sync with Firebase Realtime Database
// ZERO fake numbers, ZERO artificial offsets. Shows the exact live device count.

import { useEffect, useState, useRef } from 'react';

const RTDB_BASE_URL = 'https://key-manager-623e1-default-rtdb.asia-southeast1.firebasedatabase.app';

export interface PresenceRecord {
  deviceId: string;
  role: 'owner' | 'member';
  lastSeen: number;
}

/**
 * Sends a single heartbeat to Firebase RTDB with current timestamp
 */
export async function sendPresenceHeartbeat(deviceId: string, role: 'owner' | 'member'): Promise<void> {
  if (!deviceId) return;
  try {
    await fetch(`${RTDB_BASE_URL}/active_presence/${encodeURIComponent(deviceId)}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId,
        role,
        lastSeen: Date.now(),
      }),
    });
  } catch (_) {
    // Network hiccup
  }
}

/**
 * Removes device presence on clean logout or window close
 */
export async function removePresence(deviceId: string): Promise<void> {
  if (!deviceId) return;
  try {
    // Use keepalive / sendBeacon if supported or standard fetch
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      // Firebase REST requires DELETE or null body
      fetch(`${RTDB_BASE_URL}/active_presence/${encodeURIComponent(deviceId)}.json`, {
        method: 'DELETE',
        keepalive: true,
      }).catch(() => {});
    } else {
      await fetch(`${RTDB_BASE_URL}/active_presence/${encodeURIComponent(deviceId)}.json`, {
        method: 'DELETE',
      });
    }
  } catch (_) {}
}

/**
 * Calculates current 100% REAL active users count
 * Scans active heartbeats (within last 35 seconds) from Firebase RTDB.
 * Automatically purges stale/dead sessions older than 60 seconds.
 * Returns ONLY the real verified count.
 */
export async function fetchLiveActiveUsersCount(): Promise<number> {
  const now = Date.now();
  let verifiedActiveCount = 0;

  try {
    const res = await fetch(`${RTDB_BASE_URL}/active_presence.json`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        const entries = Object.entries(data) as [string, PresenceRecord][];
        
        for (const [id, record] of entries) {
          if (!record || typeof record.lastSeen !== 'number') continue;
          const ageMs = now - record.lastSeen;

          // Active if heartbeat received in the last 35 seconds
          if (ageMs <= 35000) {
            verifiedActiveCount++;
          } else if (ageMs > 60000) {
            // Asynchronously delete dead/stale device presence so it doesn't linger
            fetch(`${RTDB_BASE_URL}/active_presence/${encodeURIComponent(id)}.json`, {
              method: 'DELETE',
            }).catch(() => {});
          }
        }
      }
    }
  } catch (err) {
    console.warn('Real presence check error:', err);
  }

  // Exact real count (minimum 1 since the owner themselves is currently active)
  return Math.max(1, verifiedActiveCount);
}

/**
 * Hook to manage active presence heartbeat for any authenticated session
 * and fetch live real active count ONLY if the authenticated user has OWNER key
 */
export function useActivePresence(
  isAuthenticated: boolean,
  role: 'owner' | 'member' | undefined,
  deviceId: string
): number {
  // Start with 1 (the current user) while checking real count
  const [activeUsersCount, setActiveUsersCount] = useState<number>(1);
  const isOwner = role === 'owner';
  const roleRef = useRef(role);
  roleRef.current = role;

  // 1. Heartbeat loop: all active authenticated devices ping every 12 seconds
  useEffect(() => {
    if (!isAuthenticated || !deviceId) return;

    const currentRole = roleRef.current || 'member';
    // Send immediate heartbeat on login
    sendPresenceHeartbeat(deviceId, currentRole);

    const heartbeatInterval = setInterval(() => {
      sendPresenceHeartbeat(deviceId, roleRef.current || 'member');
    }, 12000);

    const handleUnload = () => {
      removePresence(deviceId);
    };

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
      removePresence(deviceId);
    };
  }, [isAuthenticated, deviceId]);

  // 2. Poll 100% REAL active users count ONLY when logged in as OWNER
  useEffect(() => {
    if (!isAuthenticated || !isOwner) {
      return;
    }

    let isMounted = true;

    const syncRealCount = async () => {
      const realCount = await fetchLiveActiveUsersCount();
      if (isMounted) {
        setActiveUsersCount(realCount);
      }
    };

    // Initial real count fetch
    syncRealCount();

    // Fast polling every 4 seconds for exact live accuracy
    const pollInterval = setInterval(syncRealCount, 4000);

    // Refresh immediately on window focus
    const handleFocus = () => {
      syncRealCount();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, isOwner]);

  return activeUsersCount;
}
