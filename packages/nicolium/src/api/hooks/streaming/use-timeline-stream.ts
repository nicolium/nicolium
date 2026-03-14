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

  const client = useClient();

  const instance = useInstance();
  const socket = useRef<{
    listen: (listener: (event: StreamingEvent) => void, stream?: string) => number;
    unlisten: (listener: (event: StreamingEvent) => void) => void;
    subscribe: (stream: string, params?: StreamingParams) => void;
    unsubscribe: (stream: string, params?: StreamingParams) => void;
    onDisconnect: (callback: () => void) => () => void;
    close: () => void;
  } | null>(null);
  const disconnectCleanup = useRef<(() => void) | null>(null);

  const accessToken = useAuthStore((state) => {
    const me = state.me;
    return me ? state.users[me]?.access_token : undefined;
  });
  const streamingUrl = instance.configuration.urls.streaming;

  const [connected, setConnected] = useState(false);

  const handleDisconnect = useCallback(() => {
    socket.current = null;
    setConnected(false);
  }, []);

  const connect = () => {
    if (!socket.current && streamingUrl) {
      socket.current = client.streaming.connect();

      disconnectCleanup.current?.();
      disconnectCleanup.current = socket.current.onDisconnect(handleDisconnect);

      socket.current.subscribe(stream, params);
      if (listener) socket.current.listen(listener);
      setConnected(true);
    }
  };

  const disconnect = () => {
    if (socket.current) {
      disconnectCleanup.current?.();
      disconnectCleanup.current = null;
      socket.current.close();
      socket.current = null;
      setConnected(false);
    }
  };

  useEffect(() => {
    socket.current?.subscribe(stream, params);

    return () => socket.current?.unsubscribe(stream, params);
  }, [stream, params.list, params.tag, params.group, params.instance, enabled]);

  useEffect(() => {
    if (enabled) {
      connect();

      return () => {
        if (listener) socket.current?.unlisten(listener);
      };
    }
  }, [enabled]);

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
    } else {
      disconnect();
      connect();

      return () => {
        if (listener) socket.current?.unlisten(listener);
      };
    }
  }, [accessToken, streamingUrl]);

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
