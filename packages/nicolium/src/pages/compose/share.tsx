import { useNavigate } from '@tanstack/react-router';
import React, { useEffect } from 'react';

import { shareRoute } from '@/router';
import { useComposeActions } from '@/stores/compose';

const SharePage: React.FC = () => {
  const { openComposeWithText } = useComposeActions();
  const navigate = useNavigate();

  const params = shareRoute.useSearch();

  useEffect(() => {
    const text = [params.title, params.text, params.url].filter((v) => v).join('\n\n');

    navigate({ to: '/', replace: true });

    if (text) {
      openComposeWithText('compose-modal', text);
    }
  }, []);

  return null;
};

export { SharePage as default };
