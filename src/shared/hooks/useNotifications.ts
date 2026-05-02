import { useEffect, useState, useCallback } from 'react';
import { notificationApi } from '@/modules/notification/api/notificationApi';
import type { Notification } from '@/shared/contracts/notificationContract';
import { useAuth } from '@/shared/context/AuthContext';

export function useNotifications(pollInterval = 30000) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await notificationApi.getNotifications();
      const payload = res.data;
      const data = Array.isArray(payload) ? payload : payload?.content || [];
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await fetchNotifications();
    })();
    const id = setInterval(fetchNotifications, pollInterval);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [fetchNotifications, pollInterval, isAuthenticated]);

  const markRead = useCallback(async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      await fetchNotifications();
    } catch {
      // ignore
    }
  }, [fetchNotifications]);

  return { items, loading, unread: items.filter((i) => i.read === false || i.status !== 'READ').length, refresh: fetchNotifications, markRead };
}
