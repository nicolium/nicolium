import { WebSocket } from 'isows';
import * as v from 'valibot';

import { shoutMessageSchema } from '@/entities';
import { filteredArray } from '@/entities/utils';

import { buildFullPath } from '../utils/url';

import type { PlApiBaseClient } from '@/client-base';
import type { ShoutMessage } from '@/entities';

const shoutbox = (client: PlApiBaseClient) => ({
  connect: (
    token: string,
    {
      onMessage,
      onMessages,
    }: {
      onMessages: (messages: Array<ShoutMessage>) => void;
      onMessage: (message: ShoutMessage) => void;
    },
  ) => {
    let counter = 2;
    let intervalId: NodeJS.Timeout;
    if (client.shoutSocket) return client.shoutSocket;

    const path = buildFullPath('/socket/websocket', client.baseURL, { token, vsn: '2.0.0' });

    const ws = new WebSocket(path);

    ws.onmessage = (event) => {
      const [_, __, ___, type, payload] = JSON.parse(event.data as string);
      if (type === 'new_msg') {
        const message = v.parse(shoutMessageSchema, payload);
        onMessage(message);
      } else if (type === 'messages') {
        const messages = v.parse(filteredArray(shoutMessageSchema), payload.messages);
        onMessages(messages);
      }
    };

    ws.onopen = () => {
      ws.send(JSON.stringify(['3', `${++counter}`, 'chat:public', 'phx_join', {}]));

      intervalId = setInterval(() => {
        ws.send(JSON.stringify([null, `${++counter}`, 'phoenix', 'heartbeat', {}]));
      }, 5000);
    };

    ws.onclose = () => {
      clearInterval(intervalId);
    };

    client.shoutSocket = {
      message: (text: string) => {
        // guess this is meant to be incremented on each call but idk
        ws.send(JSON.stringify(['3', `${++counter}`, 'chat:public', 'new_msg', { text: text }]));
      },
      close: () => {
        ws.close();
        client.shoutSocket = undefined;
        clearInterval(intervalId);
      },
    };

    return client.shoutSocket;
  },
});

export { shoutbox };
