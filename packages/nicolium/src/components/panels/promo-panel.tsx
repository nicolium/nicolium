import React from 'react';

import ForkAwesomeIcon from '@/components/fork-awesome-icon';
import List, { ListItem } from '@/components/list';
import Widget from '@/components/ui/widget';
import { useFrontendConfig } from '@/hooks/use-frontend-config';
import { useInstance } from '@/stores/instance';
import { useSettings } from '@/stores/settings';

const PromoPanel: React.FC = () => {
  const instance = useInstance();
  const { promoPanel } = useFrontendConfig();
  const { locale } = useSettings();

  const promoItems = promoPanel.items;

  if (!promoItems || !promoItems.length) return null;

  return (
    <Widget title={instance.title}>
      <List>
        {promoItems.map((item, i) => (
          <ListItem
            key={i}
            href={item.url}
            label={
              <div className='flex items-center gap-2'>
                <ForkAwesomeIcon id={item.icon} className='flex-none text-lg' fixedWidth />
                <span>{item.textLocales[locale] || item.text}</span>
              </div>
            }
            size='sm'
          />
        ))}
      </List>
    </Widget>
  );
};

export { PromoPanel as default };
