import { useEffect, useRef, useCallback } from 'react';

type WSClient = {
  connect: () => void;
  disconnect: () => void;
  send: (payload: string) => void;
  subscribe: (cb: (data: any) => void) => () => void;
};

export function useStompClient(wsPath = '/ws') {
  const socketRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef(new Set<(d: any) => void>());
  const reconnectRef = useRef<number>(0);
  const urlRef = useRef(wsPath);

  const connect = useCallback(() => {
    const url = urlRef.current;
    try {
      const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const host = window.location.host;
      const wsUrl = `${proto}://${host}${url}`;
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        reconnectRef.current = 0;
      };

      ws.onmessage = (ev) => {
        let data: any = ev.data;
        try {
          data = JSON.parse(ev.data);
        } catch (e) {
          // keep raw
        }
        listenersRef.current.forEach((cb) => cb(data));
      };

      ws.onclose = () => {
        socketRef.current = null;
        // exponential backoff reconnect
        reconnectRef.current = Math.min(30000, reconnectRef.current ? reconnectRef.current * 2 : 1000);
        setTimeout(() => connect(), reconnectRef.current || 1000);
      };

      ws.onerror = () => {
        // close will trigger reconnect
        ws.close();
      };
    } catch (e) {
      // ignore — will retry
      reconnectRef.current = Math.min(30000, reconnectRef.current ? reconnectRef.current * 2 : 1000);
      setTimeout(() => connect(), reconnectRef.current || 1000);
    }
  }, []);

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

  const subscribe = useCallback((cb: (d: any) => void) => {
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
