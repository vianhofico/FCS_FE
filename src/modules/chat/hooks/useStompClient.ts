import { useEffect, useRef, useCallback } from 'react';
import { env } from '@/app/config/env';

type WSClient = {
  connect: () => void;
  disconnect: () => void;
  send: (payload: string) => void;
  subscribe: (cb: (data: unknown) => void) => () => void;
};

export function useStompClient(wsPath = '/ws') {
  const socketRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef(new Set<(d: unknown) => void>());
  const reconnectRef = useRef<number>(0);
  const urlRef = useRef(wsPath);
  const connectRef = useRef<() => void>(() => {});

  const scheduleReconnect = useCallback(() => {
    reconnectRef.current = Math.min(30000, reconnectRef.current ? reconnectRef.current * 2 : 1000);
    window.setTimeout(() => connectRef.current(), reconnectRef.current || 1000);
  }, []);

  const connect = useCallback(() => {
    const url = urlRef.current;
    try {
      const wsUrl = url.startsWith('ws://') || url.startsWith('wss://') ? url : env.wsBaseUrl;
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        reconnectRef.current = 0;
      };

      ws.onmessage = (ev) => {
        let data: unknown = ev.data;
        try {
          data = JSON.parse(ev.data);
        } catch {
          // keep raw
        }
        listenersRef.current.forEach((cb) => cb(data));
      };

      ws.onclose = () => {
        socketRef.current = null;
        scheduleReconnect();
      };

      ws.onerror = () => {
        // close will trigger reconnect
        ws.close();
      };
    } catch {
      // ignore — will retry
      scheduleReconnect();
    }
  }, [scheduleReconnect]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  const disconnect = useCallback(() => {
    socketRef.current?.close();
    socketRef.current = null;
  }, []);

  const send = useCallback((payload: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(payload);
      return true;
    }
    return false;
  }, []);

  const subscribe = useCallback((cb: (d: unknown) => void) => {
    listenersRef.current.add(cb);
    return () => listenersRef.current.delete(cb);
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  const client: WSClient = {
    connect,
    disconnect,
    send,
    subscribe,
  };

  return client;
}
