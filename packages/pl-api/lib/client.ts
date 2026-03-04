import { PlApiBaseClient, type PlApiClientConstructorOpts } from '@/client-base';
import { accounts } from '@/client/accounts';
import { admin } from '@/client/admin';
import { announcements } from '@/client/announcements';
import { antennas } from '@/client/antennas';
import { apps } from '@/client/apps';
import { asyncRefreshes } from '@/client/async-refreshes';
import { chats } from '@/client/chats';
import { circles } from '@/client/circles';
import { drive } from '@/client/drive';
import { emails } from '@/client/emails';
import { events } from '@/client/events';
import { experimental } from '@/client/experimental';
import { filtering } from '@/client/filtering';
import { groupedNotifications } from '@/client/grouped-notifications';
import { instance } from '@/client/instance';
import { interactionRequests } from '@/client/interaction-requests';
import { lists } from '@/client/lists';
import { media } from '@/client/media';
import { myAccount } from '@/client/my-account';
import { notifications } from '@/client/notifications';
import { oauth } from '@/client/oauth';
import { oembed } from '@/client/oembed';
import { polls } from '@/client/polls';
import { pushNotifications } from '@/client/push-notifications';
import { rssFeedSubscriptions } from '@/client/rss-feed-subscriptions';
import { scheduledStatuses } from '@/client/scheduled-statuses';
import { search } from '@/client/search';
import { settings } from '@/client/settings';
import { shoutbox } from '@/client/shoutbox';
import { statuses } from '@/client/statuses';
import { stories } from '@/client/stories';
import { streaming } from '@/client/streaming';
import { subscriptions } from '@/client/subscriptions';
import { timelines } from '@/client/timelines';
import { trends } from '@/client/trends';
import { utils } from '@/client/utils';
import { ICESHRIMP_NET } from '@/features';

import type { Instance } from '@/entities/instance';

interface PlApiClientFullConstructorOpts extends PlApiClientConstructorOpts {
  /** Fetch instance after constructing */
  fetchInstance?: boolean;
  /** Abort signal which can be used to cancel the callbacks */
  fetchInstanceSignal?: AbortSignal;
  /** Executed after the initial instance fetch */
  onInstanceFetchSuccess?: (instance: Instance) => void;
  /** Executed when the initial instance fetch failed */
  onInstanceFetchError?: (error?: any) => void;
}

/**
 * Mastodon API client with all categories.
 * @category Clients
 */
class PlApiClient extends PlApiBaseClient {
  readonly accounts = accounts(this);
  readonly admin = admin(this);
  readonly announcements = announcements(this);
  readonly antennas = antennas(this);
  readonly apps = apps(this);
  readonly asyncRefreshes = asyncRefreshes(this);
  readonly chats = chats(this);
  readonly circles = circles(this);
  readonly drive = drive(this);
  readonly emails = emails(this);
  readonly events = events(this);
  readonly experimental = experimental(this);
  readonly filtering = filtering(this);
  readonly groupedNotifications = groupedNotifications(this);
  readonly instance = instance(this);
  readonly interactionRequests = interactionRequests(this);
  readonly lists = lists(this);
  readonly media = media(this);
  readonly myAccount = myAccount(this);
  readonly notifications = notifications(this);
  readonly oauth = oauth(this);
  readonly oembed = oembed(this);
  readonly polls = polls(this);
  readonly pushNotifications = pushNotifications(this);
  readonly rssFeedSubscriptions = rssFeedSubscriptions(this);
  readonly scheduledStatuses = scheduledStatuses(this);
  readonly search = search(this);
  readonly settings = settings(this);
  readonly shoutbox = shoutbox(this);
  readonly statuses = statuses(this);
  readonly stories = stories(this);
  readonly streaming = streaming(this);
  readonly subscriptions = subscriptions(this);
  readonly timelines = timelines(this);
  readonly trends = trends(this);
  readonly utils = utils(this);

  constructor(
    baseURL: string,
    accessToken?: string,
    {
      fetchInstance,
      fetchInstanceSignal,
      onInstanceFetchSuccess,
      onInstanceFetchError,
      ...opts
    }: PlApiClientFullConstructorOpts = {},
  ) {
    super(baseURL, accessToken, opts);

    if (fetchInstance) {
      this.instance
        .getInstance()
        .then((instance) => {
          if (fetchInstanceSignal?.aborted) return;
          return onInstanceFetchSuccess?.(instance);
        })
        .catch((error) => {
          if (fetchInstanceSignal?.aborted) return;
          onInstanceFetchError?.(error);
        });
    }
  }

  override getIceshrimpAccessToken = async (): Promise<void> => {
    if (this.iceshrimpAccessToken) return;
    if (this.features.version.software === ICESHRIMP_NET) {
      this.setIceshrimpAccessToken(await this.settings.authorizeIceshrimp());
    }
  };
}

export { PlApiClient as default };
export {
  accounts,
  admin,
  announcements,
  antennas,
  apps,
  asyncRefreshes,
  chats,
  circles,
  drive,
  emails,
  events,
  experimental,
  filtering,
  groupedNotifications,
  instance,
  interactionRequests,
  lists,
  media,
  myAccount,
  notifications,
  oauth,
  oembed,
  polls,
  pushNotifications,
  rssFeedSubscriptions,
  scheduledStatuses,
  search,
  settings,
  shoutbox,
  statuses,
  stories,
  streaming,
  subscriptions,
  timelines,
  trends,
  utils,
};
