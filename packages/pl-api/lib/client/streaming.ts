import { WebSocket } from 'isows';
import * as v from 'valibot';

import { streamingEventSchema } from '../entities';
import { buildFullPath } from '../utils/url';

import type { PlApiBaseClient } from '../client-base';
import type { StreamingEvent } from '../entities';

const streaming = (client: PlApiBaseClient) => ({
  /**
   * Check if the server is alive
   * Verify that the streaming service is alive before connecting to it
   * @see {@link https://docs.joinmastodon.org/methods/streaming/#health}
   */
  health: async () => {
    const response = await client.request('/api/v1/streaming/health');

    return v.parse(v.literal('OK'), response.json);
  },

  /**
   * Establishing a WebSocket connection
   * Open a multiplexed WebSocket connection to receive events.
   * @see {@link https://docs.joinmastodon.org/methods/streaming/#websocket}
   */
  connect: () => {
    if (client.socket) return client.socket;

    const path = buildFullPath(
      '/api/v1/streaming',
      client.instanceInformation?.configuration.urls.streaming,
      { access_token: client.accessToken },
    );

    const ws = new WebSocket(path, client.accessToken);

    let listeners: Array<{ listener: (event: StreamingEvent) => any; stream?: string }> = [];
    const queue: Array<() => any> = [];

    const enqueue = (fn: () => any) =>
      ws.readyState === WebSocket.CONNECTING ? queue.push(fn) : fn();

    ws.onmessage = (event) => {
      const message = v.parse(streamingEventSchema, JSON.parse(event.data as string));

      listeners.filter(
        ({ listener, stream }) => (!stream || message.stream.includes(stream)) && listener(message),
      );
    };

    ws.onopen = () => {
      queue.forEach((fn) => fn());
    };

    client.socket = {
      listen: (listener: (event: StreamingEvent) => any, stream?: string) =>
        listeners.push({ listener, stream }),
      unlisten: (listener: (event: StreamingEvent) => any) =>
        (listeners = listeners.filter((value) => value.listener !== listener)),
      subscribe: (stream: string, { list, tag }: { list?: string; tag?: string } = {}) =>
        enqueue(() => ws.send(JSON.stringify({ type: 'subscribe', stream, list, tag }))),
      unsubscribe: (stream: string, { list, tag }: { list?: string; tag?: string } = {}) =>
        enqueue(() => ws.send(JSON.stringify({ type: 'unsubscribe', stream, list, tag }))),
      close: () => {
        ws.close();
        client.socket = undefined;
      },
    };

    return client.socket;
  },
});

export { streaming };
