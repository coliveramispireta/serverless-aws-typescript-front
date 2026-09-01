"use client";

/**
 * Store local de notificaciones de la app (centro de notificaciones).
 * Se persiste en localStorage por usuario para sobrevivir recargas.
 * El origen (IndexedDB del SW / broadcast) lo maneja el NotificationContext.
 */

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  url?: string;
  tag?: string;
  emoji?: string;
  image?: string;
  ts: number;
  read?: boolean;
}

const MAX_NOTIFS = 50;
const RETENTION_MS = 30 * 24 * 60 * 60 * 1000; // 30 días

function keyFor(userId: string): string {
  return `kf-notifications:${userId || "anon"}`;
}

function readRaw(userId: string): AppNotification[] {
  try {
    const raw = localStorage.getItem(keyFor(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as AppNotification[]) : [];
  } catch {
    return [];
  }
}

function write(userId: string, list: AppNotification[]): void {
  try {
    // poda por antigüedad y tope
    const now = Date.now();
    const fresh = list
      .filter((n) => now - (n.ts || 0) < RETENTION_MS)
      .slice(0, MAX_NOTIFS);
    localStorage.setItem(keyFor(userId), JSON.stringify(fresh));
  } catch {
    /* sin espacio / modo privado: ignora */
  }
}

/** Lista ordenada por más reciente primero */
export function listNotifications(userId: string): AppNotification[] {
  return readRaw(userId).slice().sort((a, b) => (b.ts || 0) - (a.ts || 0));
}

export function unreadCount(userId: string): number {
  return readRaw(userId).filter((n) => !n.read).length;
}

/** Añade (o actualiza) una notificación; deduplica por id si llegó duplicada */
export function upsertNotification(userId: string, notif: AppNotification): AppNotification[] {
  const list = readRaw(userId).filter((n) => n.id !== notif.id);
  list.unshift(notif);
  write(userId, list);
  return list;
}

export function markNotificationRead(userId: string, id: string): AppNotification[] {
  const list = readRaw(userId).map((n) => (n.id === id ? { ...n, read: true } : n));
  write(userId, list);
  return list;
}

export function markAllNotificationsRead(userId: string): AppNotification[] {
  const list = readRaw(userId).map((n) => ({ ...n, read: true }));
  write(userId, list);
  return list;
}

export function clearNotifications(userId: string): AppNotification[] {
  write(userId, []);
  return [];
}

export { MAX_NOTIFS, RETENTION_MS };
