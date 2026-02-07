import { useNavigate } from '@tanstack/react-router';
import React, { useEffect } from 'react';

import { openComposeWithText } from '@/actions/compose';
import { shareRoute } from '@/features/ui/router';
import { useAppDispatch } from '@/hooks/use-app-dispatch';

const SharePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const params = shareRoute.useSearch();

  useEffect(() => {
    const text = [params.title, params.text, params.url]
      .filter(v => v)
      .join('\n\n');

    navigate({ to: '/', replace: true });

    if (text) {
      dispatch(openComposeWithText('compose-modal', text));
    }
  }, []);

  return null;
};

export { SharePage as default };
