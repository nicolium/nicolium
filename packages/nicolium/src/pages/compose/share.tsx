import { useNavigate } from '@tanstack/react-router';
import React, { useEffect } from 'react';

import { shareRoute } from '@/router';
import { openDedicatedComposeWindow, useComposeActions } from '@/stores/compose';
import { useSettings } from '@/stores/settings';
import { userTouching } from '@/utils/is-mobile';

const SharePage: React.FC = () => {
  const { openComposeWithText } = useComposeActions();
  const navigate = useNavigate();
  const { useDedicatedComposePage } = useSettings();

  const params = shareRoute.useSearch();

  useEffect(() => {
    const text = [params.title, params.text, params.url].filter((v) => v).join('\n\n');

    if (text && useDedicatedComposePage && !userTouching.matches) {
      openDedicatedComposeWindow({ text });
      navigate({ to: '/', replace: true });
      return;
    }

    navigate({ to: '/', replace: true });

    if (text) {
      openComposeWithText('compose-modal', text);
    }
  }, []);

  return null;
};

export { SharePage as default };
