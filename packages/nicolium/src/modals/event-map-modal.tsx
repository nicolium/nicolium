import iconCompass from '@phosphor-icons/core/regular/compass.svg';
import L from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import React, { useEffect, useRef } from 'react';
import { FormattedMessage } from 'react-intl';

import 'leaflet/dist/leaflet.css';
import Button from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import { useFrontendConfig } from '@/hooks/use-frontend-config';
import { useMinimalStatus } from '@/queries/statuses/use-status';

import type { BaseModalProps } from '@/features/ui/components/modal-root';

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

interface EventMapModalProps {
  statusId: string;
}

const EventMapModal: React.FC<BaseModalProps & EventMapModalProps> = ({ onClose, statusId }) => {
  const { tileServer, tileServerAttribution } = useFrontendConfig();

  const { data: status } = useMinimalStatus(statusId);
  const location = status?.event?.location!;

  const map = useRef<L.Map | null>(null);

  useEffect(() => {
    const latlng: [number, number] = [location.latitude!, location.longitude!];

    map.current = L.map('event-map').setView(latlng, 15);

    L.marker(latlng, {
      title: location.name,
    }).addTo(map.current);

    L.tileLayer(tileServer, {
      attribution: tileServerAttribution,
    }).addTo(map.current);

    return () => {
      map.current?.remove();
    };
  }, []);

  const onClickClose = () => {
    onClose('EVENT_MAP');
  };

  const onClickNavigate = () => {
    window.open(
      `https://www.openstreetmap.org/directions?from=&to=${location.latitude},${location.longitude}#map=14/${location.latitude}/${location.longitude}`,
      '_blank',
    );
  };

  return (
    <Modal
      title={<FormattedMessage id='column.event_map' defaultMessage='Event location' />}
      onClose={onClickClose}
      className='⁂-event-map-modal'
    >
      <div className='flex flex-col items-center gap-6'>
        <div className='h-96 w-full' id='event-map' />
        <Button onClick={onClickNavigate} icon={iconCompass}>
          <FormattedMessage id='event_map.navigate' defaultMessage='Navigate' />
        </Button>
      </div>
    </Modal>
  );
};

export { EventMapModal as default, type EventMapModalProps };
