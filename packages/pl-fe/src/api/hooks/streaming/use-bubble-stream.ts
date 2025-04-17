import { useTimelineStream } from './use-timeline-stream';

interface UseBubbleStreamOpts {
  onlyMedia?: boolean;
  enabled?: boolean;
}

const useBubbleStream = ({ onlyMedia, enabled }: UseBubbleStreamOpts = {}) =>
  useTimelineStream(`bubble${onlyMedia ? ':media' : ''}`, {}, enabled);

export { useBubbleStream };
