import { useEffect, useState, useCallback } from 'react';
import { notificationApi } from '@/modules/notification/api/notificationApi';
import type { Notification } from '@/shared/contracts/notificationContract';

export function useNotifications(pollInterval = 30000) {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationApi.getNotifications();
      const data = res?.data?.content || [];
      setItems(data);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
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
  }, [fetchNotifications, pollInterval]);

  const markRead = useCallback(async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      await fetchNotifications();
    } catch {
      // ignore
    }
  }, [fetchNotifications]);

  return { items, loading, unread: items.filter((i) => !i.read).length, refresh: fetchNotifications, markRead };
}
