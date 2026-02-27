import type { PlApiBaseClient } from '@/client-base';
import type { EmptyObject } from '@/utils/types';

const emails = (client: PlApiBaseClient) => ({
  resendConfirmationEmail: async (email: string) => {
    const response = await client.request<EmptyObject>('/api/v1/emails/confirmations', {
      method: 'POST',
      body: { email },
    });

    return response.json;
  },
});

export { emails };
