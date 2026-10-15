import { apiRequest, getAccessToken } from './api';
import type {
  HrNotification,
  HrNotificationsResponse,
} from '../types/notification';

const API_URL = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
).replace(/\/$/, '');

export function getNotifications(): Promise<HrNotificationsResponse> {
  return apiRequest<HrNotificationsResponse>('/notifications');
}

export function markNotificationRead(id: string): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>(
    `/notifications/${encodeURIComponent(id)}/read`,
    { method: 'PATCH' },
  );
}

export function markAllNotificationsRead(): Promise<{
  success: boolean;
  updatedCount: number;
}> {
  return apiRequest('/notifications/read-all', { method: 'PATCH' });
}

function parseNotification(value: string): HrNotification | null {
  try {
    const parsed: unknown = JSON.parse(value);
    if (typeof parsed !== 'object' || parsed === null) return null;

    const event = parsed as Record<string, unknown>;

    if (
      typeof event.id !== 'string' ||
      typeof event.employeeId !== 'string' ||
      !Array.isArray(event.changedFields) ||
      !event.changedFields.every((field) => typeof field === 'string') ||
      typeof event.message !== 'string' ||
      typeof event.occurredAt !== 'string'
    ) {
      return null;
    }

    return {
      id: event.id,
      type: 'EMPLOYEE_PROFILE_UPDATED',
      employeeId: event.employeeId,
      changedFields: event.changedFields,
      message: event.message,
      occurredAt: event.occurredAt,
      readAt: typeof event.readAt === 'string' ? event.readAt : null,
    };
  } catch {
    return null;
  }
}

export async function connectNotificationStream(
  onNotification: (notification: HrNotification) => void,
  signal: AbortSignal,
  onConnected?: () => void,
): Promise<void> {
  const token = getAccessToken();

  if (!token) {
    throw new Error('Cannot connect to notifications without a session.');
  }

  const response = await fetch(`${API_URL}/notifications/stream`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'text/event-stream',
    },
    signal,
  });

  if (response.status === 401) {
    window.dispatchEvent(new Event('auth:unauthorized'));
    throw new Error('Your session has expired.');
  }

  if (response.status === 403) {
    throw new Error('You are not authorized to receive notifications.');
  }

  if (!response.ok) {
    throw new Error(`Notification stream failed (${response.status}).`);
  }

  if (!response.body) {
    throw new Error('Notification stream is not supported by this response.');
  }

  onConnected?.();

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = '';
  let eventType = '';
  let dataLines: string[] = [];

  const dispatchEvent = () => {
    const data = dataLines.join('\n');

    if (eventType === 'EMPLOYEE_PROFILE_UPDATED' && data) {
      const notification = parseNotification(data);
      if (notification) onNotification(notification);
    }

    eventType = '';
    dataLines = [];
  };

  try {
    while (!signal.aborted) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split(/\r\n|\r|\n/);
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (line === '') {
          dispatchEvent();
          continue;
        }

        if (line.startsWith(':')) continue;

        const separator = line.indexOf(':');
        const field = separator === -1 ? line : line.slice(0, separator);
        let fieldValue =
          separator === -1 ? '' : line.slice(separator + 1);

        if (fieldValue.startsWith(' ')) {
          fieldValue = fieldValue.slice(1);
        }

        if (field === 'event') {
          eventType = fieldValue;
        } else if (field === 'data') {
          dataLines.push(fieldValue);
        }
      }
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}