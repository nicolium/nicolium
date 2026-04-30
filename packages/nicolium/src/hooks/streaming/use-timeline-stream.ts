import { useCallback, useEffect, useRef, useState } from 'react';

import { useClient } from '@/hooks/use-client';
import { useAuthStore } from '@/stores/auth';
import { useInstance } from '@/stores/instance';

import type { StreamingEvent, StreamingParams } from 'pl-api';

const useTimelineStream = (
  stream: string,
  params: StreamingParams = {},
  enabled = true,
  listener?: (event: StreamingEvent) => any,
) => {
  const firstUpdate = useRef(true);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttempt = useRef(0);
  const reconnectEnabled = useRef(false);
  const latestStream = useRef(stream);
  const latestParams = useRef(params);
  const latestListener = useRef(listener);
  const activeListener = useRef<typeof listener>(undefined);

  const client = useClient();

  const instance = useInstance();
  const socket = useRef<{
    listen: (listener: (event: StreamingEvent) => void, stream?: string) => number;
    unlisten: (listener: (event: StreamingEvent) => void) => void;
    subscribe: (stream: string, params?: StreamingParams) => void;
    unsubscribe: (stream: string, params?: StreamingParams) => void;
    onDisconnect: (callback: (event?: CloseEvent) => void) => () => void;
    close: () => void;
  } | null>(null);
  const disconnectCleanup = useRef<(() => void) | null>(null);

  const accessToken = useAuthStore((state) => {
    const me = state.me;
    return me ? state.users[me]?.access_token : undefined;
  });
  const streamingUrl = instance.configuration.urls.streaming;

  const [connected, setConnected] = useState(false);

  latestStream.current = stream;
  latestParams.current = params;
  latestListener.current = listener;

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
  }, []);

  const attachListener = useCallback(() => {
    if (!socket.current || activeListener.current === latestListener.current) return;

    if (activeListener.current) socket.current.unlisten(activeListener.current);
    if (latestListener.current) socket.current.listen(latestListener.current);
    activeListener.current = latestListener.current;
  }, []);

  const connect = useCallback(() => {
    clearReconnectTimer();

    if (!reconnectEnabled.current || socket.current || !streamingUrl) return;

    socket.current = client.streaming.connect();

    disconnectCleanup.current?.();
    disconnectCleanup.current = socket.current.onDisconnect((event) => {
      disconnectCleanup.current = null;
      socket.current = null;
      activeListener.current = undefined;
      setConnected(false);

      if (!reconnectEnabled.current || !streamingUrl) return;
      if (!event || ![1002, 1003, 1007, 1008].includes(event.code)) {
        reconnectEnabled.current = false;
        return;
      }

      const delay = reconnectAttempt.current === 0 ? 5 * 1000 : 30 * 1000;
      reconnectAttempt.current += 1;
      reconnectTimer.current = setTimeout(connect, delay);
    });

    socket.current.subscribe(latestStream.current, latestParams.current);
    attachListener();
    reconnectAttempt.current = 0;
    setConnected(true);
  }, [attachListener, clearReconnectTimer, client, streamingUrl]);

  const disconnect = useCallback(() => {
    reconnectEnabled.current = false;
    clearReconnectTimer();

    if (socket.current) {
      disconnectCleanup.current?.();
      disconnectCleanup.current = null;
      if (activeListener.current) socket.current.unlisten(activeListener.current);
      activeListener.current = undefined;
      socket.current.close();
      socket.current = null;
      setConnected(false);
    }
  }, [clearReconnectTimer]);

  useEffect(() => {
    socket.current?.subscribe(stream, params);

    return () => socket.current?.unsubscribe(stream, params);
  }, [stream, params.list, params.tag, params.group, params.instance, enabled]);

  useEffect(() => {
    attachListener();
  }, [attachListener, listener]);

  useEffect(() => {
    if (enabled) {
      reconnectEnabled.current = true;
      connect();

      return () => {
        if (activeListener.current) socket.current?.unlisten(activeListener.current);
        activeListener.current = undefined;
        reconnectEnabled.current = false;
        clearReconnectTimer();
      };
    }
  }, [connect, enabled, clearReconnectTimer]);

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
    } else {
      disconnect();
      reconnectEnabled.current = enabled;
      connect();

      return () => {
        if (activeListener.current) socket.current?.unlisten(activeListener.current);
        activeListener.current = undefined;
        reconnectEnabled.current = false;
        clearReconnectTimer();
      };
    }
  }, [accessToken, streamingUrl, connect, disconnect, enabled, clearReconnectTimer]);

  useEffect(() => {
    if (!enabled) {
      disconnect();
    }
  }, [enabled]);

  return {
    disconnect,
    connected,
  };
};

export { useTimelineStream };
