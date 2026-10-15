import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bell,
  CheckCheck,
  Circle,
  Trash2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import {
  connectNotificationStream,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../services/notifications';
import type { HrNotification } from '../../types/notification';
import './NotificationBell.css';

interface NotificationItem extends HrNotification {
  isRead: boolean;
}

function formatFieldName(field: string): string {
  const names: Record<string, string> = {
    phoneNumber: 'phone number',
    photoUrl: 'profile photo',
    fullName: 'full name',
    companyEmail: 'company email',
    position: 'position',
    password: 'password',
  };

  return names[field] ?? field;
}

function getNotificationTitle(notification: HrNotification): string {
  return notification.type === 'EMPLOYEE_PASSWORD_CHANGED'
    ? 'Employee password changed'
    : 'Employee profile updated';
}

function formatNotificationTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Unknown time';

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function mergeNotifications(
  current: NotificationItem[],
  incoming: NotificationItem[],
): NotificationItem[] {
  const byId = new Map<string, NotificationItem>();

  for (const notification of incoming) {
    byId.set(notification.id, notification);
  }

  for (const notification of current) {
    const existing = byId.get(notification.id);

    byId.set(notification.id, {
      ...notification,
      ...existing,
      isRead: notification.isRead || (existing?.isRead ?? false),
    });
  }

  return [...byId.values()]
    .sort(
      (a, b) =>
        new Date(b.occurredAt).getTime() -
        new Date(a.occurredAt).getTime(),
    )
    .slice(0, 50);
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyIds, setBusyIds] = useState<string[]>([]);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const centerRef = useRef<HTMLDivElement>(null);
  const dismissedIdsRef = useRef<Set<string>>(new Set());

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length;

  const loadSavedNotifications = useCallback(async () => {
    try {
      const result = await getNotifications();
      const dismissedIds = dismissedIdsRef.current;

      const saved = result.data
        .filter((notification) => !dismissedIds.has(notification.id))
        .map((notification) => ({
          ...notification,
          isRead: Boolean(notification.readAt),
        }));

      setNotifications((current) =>
        mergeNotifications(
          current.filter((item) => !dismissedIds.has(item.id)),
          saved,
        ),
      );
      setError(null);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Could not load notifications.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;
    let retryDelay = 1000;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const connect = async () => {
      while (!controller.signal.aborted && !disposed) {
        try {
          await connectNotificationStream(
            (notification) => {
              if (disposed) return;
              if (dismissedIdsRef.current.has(notification.id)) return;

              const item: NotificationItem = {
                ...notification,
                isRead: Boolean(notification.readAt),
              };

              setNotifications((current) =>
                mergeNotifications(current, [item]),
              );
            },
            controller.signal,
            () => {
              if (disposed) return;

              setIsConnected(true);
              retryDelay = 1000;
              void loadSavedNotifications();
            },
          );
        } catch (cause) {
          if (controller.signal.aborted || disposed) break;

          setError(
            cause instanceof Error
              ? cause.message
              : 'Notification connection interrupted.',
          );
        }

        if (controller.signal.aborted || disposed) break;

        setIsConnected(false);

        await new Promise<void>((resolve) => {
          retryTimer = setTimeout(resolve, retryDelay);
        });

        retryDelay = Math.min(retryDelay * 2, 30000);
      }
    };

    void connect();

    return () => {
      disposed = true;
      controller.abort();

      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [loadSavedNotifications]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        centerRef.current &&
        event.target instanceof Node &&
        !centerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleMarkRead = async (notification: NotificationItem) => {
    if (notification.isRead || busyIds.includes(notification.id)) return;

    setBusyIds((current) => [...current, notification.id]);

    try {
      await markNotificationRead(notification.id);

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? { ...item, isRead: true, readAt: new Date().toISOString() }
            : item,
        ),
      );

      setError(null);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Could not mark notification as read.',
      );
    } finally {
      setBusyIds((current) =>
        current.filter((id) => id !== notification.id),
      );
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || isMarkingAll) return;

    setIsMarkingAll(true);

    try {
      await markAllNotificationsRead();

      const readAt = new Date().toISOString();

      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          isRead: true,
          readAt: item.readAt ?? readAt,
        })),
      );

      setError(null);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Could not mark notifications as read.',
      );
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleClear = () => {
    for (const notification of notifications) {
      dismissedIdsRef.current.add(notification.id);
    }

    setNotifications([]);
    setError(null);
  };

  return (
    <div className="notification-center" ref={centerRef}>
      <button
        type="button"
        className="notification-bell-button"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="notification-unread-count">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            className="notification-backdrop"
            aria-label="Close notifications"
            onClick={() => setIsOpen(false)}
          />

          <section className="notification-panel" aria-label="Notifications">
            <header className="notification-panel-header">
              <div>
                <h2>Notifications</h2>
                <p className="notification-connection">
                  {isConnected ? (
                    <>
                      <Wifi size={13} />
                      Live updates connected
                    </>
                  ) : (
                    <>
                      <WifiOff size={13} />
                      Reconnecting…
                    </>
                  )}
                </p>
              </div>

              <div className="notification-panel-actions">
                <button
                  type="button"
                  aria-label="Mark all notifications as read"
                  title="Mark all read"
                  onClick={() => void handleMarkAllRead()}
                  disabled={unreadCount === 0 || isMarkingAll}
                >
                  <CheckCheck size={16} />
                </button>

                <button
                  type="button"
                  aria-label="Clear notification view"
                  title="Clear view"
                  onClick={handleClear}
                  disabled={notifications.length === 0}
                >
                  <Trash2 size={16} />
                </button>

                <button
                  type="button"
                  aria-label="Close notifications"
                  title="Close"
                  onClick={() => setIsOpen(false)}
                >
                  ×
                </button>
              </div>
            </header>

            {error && (
              <div className="notification-connection" role="alert">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => void loadSavedNotifications()}
                >
                  Retry
                </button>
              </div>
            )}

            {isLoading && notifications.length === 0 ? (
              <div className="notification-empty">
                Loading notifications…
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <Bell size={24} />
                <strong>You're all caught up</strong>
                <span>
                  Employee profile and password changes will appear here.
                </span>
              </div>
            ) : (
              <div className="notification-list">
                {notifications.map((notification) => (
                  <article
                    className={`notification-item${notification.isRead ? ' is-read' : ' is-unread'}`}
                    key={notification.id}
                  >
                    <div className="notification-item-indicator">
                      {!notification.isRead && (
                        <Circle
                          size={8}
                          className="notification-unread-dot"
                          fill="currentColor"
                        />
                      )}
                    </div>

                    <div className="notification-item-content">
                      <strong>{getNotificationTitle(notification)}</strong>
                      <p>{notification.message}</p>

                      {notification.changedFields.length > 0 && (
                        <p className="notification-changed-fields">
                          Changed:{' '}
                          {notification.changedFields
                            .map(formatFieldName)
                            .join(', ')}
                        </p>
                      )}

                      <time dateTime={notification.occurredAt}>
                        {formatNotificationTime(notification.occurredAt)}
                      </time>

                      {!notification.isRead && (
                        <button
                          type="button"
                          className="notification-mark-read"
                          disabled={busyIds.includes(notification.id)}
                          onClick={() => void handleMarkRead(notification)}
                        >
                          {busyIds.includes(notification.id)
                            ? 'Saving…'
                            : 'Mark as read'}
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}