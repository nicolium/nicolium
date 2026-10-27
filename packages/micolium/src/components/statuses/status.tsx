import {
  Card,
  Icon,
  IconButton,
  Text,
  TouchableRipple,
  useTheme,
} from '@mkljczk/react-native-paper';
import { Link, useNavigation } from '@react-navigation/native';
import { EyeSlashIcon } from 'phosphor-react-native/src/icons/EyeSlash';
import { PaperclipIcon } from 'phosphor-react-native/src/icons/Paperclip';
import { QuotesIcon } from 'phosphor-react-native/src/icons/Quotes';
import React from 'react';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { type SelectedStatus, useStatus } from '@/queries/statuses/use-status';
import { useStatusMeta, useStatusMetaActions } from '@/stores/status-meta';

import { Account } from '../accounts/account';
import { iconHelper } from '../ui/icon';
import { UIStatus } from '../ui/status';

import { StatusActions } from './status-actions';
import { StatusActionsDropdown } from './status-actions-dropdown';
import {
  StatusMaybeFollowedHashtagChip,
  StatusPinnedChip,
  StatusRebloggedChip,
} from './status-chips';
import { StatusEmojiReactions } from './status-emoji-reactions';
import { StatusLinkPreview } from './status-link-preview';
import { StatusMedia } from './status-media';
import { StatusPoll } from './status-poll';
import { StatusQuote } from './status-quote';
import { StatusReplyMentions } from './status-reply-mentions';
import { StatusVisibilityIcon } from './status-visibility-icon';

import type { FilterContext, FilterResult } from 'pl-api';

interface IStatusDetailedInfo {
  status: SelectedStatus;
}

const StatusDetailedInfo: React.FC<IStatusDetailedInfo> = ({ status }) => {
  const { colors } = useTheme();

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
      <Text variant='bodyMedium' style={{ color: colors.onSurfaceVariant }}>
        <FormattedDate
          value={new Date(status.created_at)}
          hour12
          year='numeric'
          month='short'
          day='2-digit'
          hour='numeric'
          minute='2-digit'
        />
      </Text>
      {status.edited_at && (
        <>
          <Text variant='bodyMedium' style={{ color: colors.onSurfaceVariant }}>
            ·
          </Text>
          <Link screen='status' params={{ screen: 'history', params: { id: status.id } }}>
            <Text variant='bodyMedium' style={{ color: colors.primary }}>
              <FormattedMessage
                id='status.edited'
                defaultMessage='Edited {date}'
                values={{
                  date: (
                    <FormattedDate
                      value={new Date(status.edited_at)}
                      hour12
                      month='short'
                      day='2-digit'
                      hour='numeric'
                      minute='2-digit'
                    />
                  ),
                }}
              />
            </Text>
          </Link>
        </>
      )}
    </View>
  );
};

interface IStatus {
  id: string;
  rebloggedBy?: Array<string>;
  showPinned?: boolean;
  context?: FilterContext;
  isConnectedBottom?: boolean | ((status: SelectedStatus) => boolean);
  withLink?: boolean;
  withActions?: boolean;
  style?: StyleProp<ViewStyle>;
  detailed?: boolean;
  compact?: boolean;
  textOnly?: boolean;
}

const Status: React.FC<IStatus> = ({
  id,
  rebloggedBy,
  showPinned,
  context,
  isConnectedBottom,
  withLink,
  withActions = true,
  style,
  ...props
}) => {
  const { data: status } = useStatus(id, { withFilteredResults: true });
  const navigation = useNavigation();

  const { spoilerExpanded, showFiltered, mediaVisible } = useStatusMeta(id);
  const {
    expandStatusSpoiler,
    collapseStatusSpoiler,
    unfilterStatus,
    undoUnfilterStatus,
    revealStatusMedia,
    hideStatusMedia,
  } = useStatusMetaActions();

  const actualStatus = status?.reblog || status;

  const [hideFilters, warnFilters, blurFilters] = React.useMemo(() => {
    if (!context || !actualStatus) return [[], [], []];

    const hideResults: Array<FilterResult> = [];
    const warnResults: Array<FilterResult> = [];
    const blurResults: Array<FilterResult> = [];

    actualStatus.filtered
      .reduce<Array<FilterResult>>((uniqueFilters, current) => {
        if (
          !uniqueFilters.some(({ filter: uniqueFilter }) => uniqueFilter.id === current.filter.id)
        ) {
          uniqueFilters.push(current);
        }
        return uniqueFilters;
      }, [])
      .forEach((filter) => {
        if (filter.filter.filter_action === 'hide') hideResults.push(filter);
        if (filter.filter.filter_action === 'warn') warnResults.push(filter);
        if (filter.filter.filter_action === 'blur') blurResults.push(filter);
      });

    return [hideResults, warnResults, blurResults];
  }, [actualStatus?.filtered, context]);

  if (!actualStatus || (hideFilters.length && !props.detailed)) return null;

  let chip;

  if (showPinned) {
    chip = <StatusPinnedChip />;
  } else if (rebloggedBy?.length) {
    chip = <StatusRebloggedChip accountIds={rebloggedBy} />;
  } else if (
    (context === 'public' || context === 'home') &&
    actualStatus.reblog &&
    actualStatus.account_id
  ) {
    chip = <StatusRebloggedChip accountIds={[actualStatus.account_id]} />;
  } else if (context === 'home') {
    chip = <StatusMaybeFollowedHashtagChip status={actualStatus} />;
  }

  const statusBody = (
    <UIStatus
      chip={chip}
      account={
        <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'space-between' }}>
          <Account
            id={actualStatus.account_id!}
            timestamp={props.detailed ? undefined : actualStatus.created_at}
            style={{ padding: 8, margin: -8 }}
            withLink
            fullWidthPressable={false}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {showFiltered && warnFilters.length > 0 && (
              <IconButton
                icon={iconHelper(EyeSlashIcon)}
                style={{ height: 32, width: 32 }}
                onPress={() => undoUnfilterStatus(actualStatus.id)}
              />
            )}
            <StatusVisibilityIcon status={status} />
            {withActions && <StatusActionsDropdown status={status} />}
          </View>
        </View>
      }
      displayedMentions={<StatusReplyMentions status={actualStatus} />}
      content={actualStatus.content}
      emojis={actualStatus.emojis}
      mentions={actualStatus.mentions}
      spoilerText={actualStatus.spoiler_text}
      media={
        props.textOnly ? (
          <>
            {actualStatus.media_attachments.length > 0 && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Icon source={iconHelper(PaperclipIcon)} size={20} />
                <Text>
                  <FormattedMessage
                    id='status.attachment_count'
                    defaultMessage='{count, plural, one {# attachment} other {# attachments}}'
                    values={{ count: actualStatus.media_attachments.length }}
                  />
                </Text>
              </View>
            )}
            {actualStatus.quote_id && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Icon source={iconHelper(QuotesIcon)} size={20} />
                <Text>
                  <FormattedMessage id='status.quote_indicator' defaultMessage='Quoted post' />
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            <StatusMedia
              status={actualStatus}
              compact={props.compact}
              filters={blurFilters}
              mediaVisible={mediaVisible}
              revealStatusMedia={() => revealStatusMedia(actualStatus.id)}
              hideStatusMedia={() => hideStatusMedia(actualStatus.id)}
            />
            {actualStatus.poll_id && <StatusPoll status={actualStatus} />}
            {actualStatus.quote_id &&
              (props.compact ? (
                <Card mode='outlined'>
                  <Card.Content style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Icon source={iconHelper(QuotesIcon)} size={20} />
                    <Text>
                      <FormattedMessage id='status.quote_indicator' defaultMessage='Quoted post' />
                    </Text>
                  </Card.Content>
                </Card>
              ) : (
                <StatusQuote id={actualStatus.quote_id} context={context} />
              ))}
            {!props.compact && <StatusLinkPreview status={actualStatus} />}
            {props.detailed && <StatusDetailedInfo status={actualStatus} />}
          </>
        )
      }
      actions={
        withActions ? (
          <>
            <StatusEmojiReactions status={actualStatus} />
            <StatusActions status={actualStatus} />
          </>
        ) : undefined
      }
      isConnectedBottom={
        typeof isConnectedBottom === 'function'
          ? isConnectedBottom(actualStatus)
          : isConnectedBottom
      }
      spoilerExpanded={spoilerExpanded}
      expandStatusSpoiler={() => expandStatusSpoiler(id)}
      collapseStatusSpoiler={() => collapseStatusSpoiler(id)}
      filters={warnFilters}
      showFiltered={showFiltered}
      unfilterStatus={() => unfilterStatus(id)}
      contentKey={status.id}
      {...props}
    />
  );

  if (withLink) {
    return (
      <TouchableRipple
        onPress={() => {
          navigation.navigate('status', { screen: 'view', params: { id } });
        }}
        style={{ padding: 16, ...style }}
      >
        {statusBody}
      </TouchableRipple>
    );
  }

  return <View style={{ padding: 16, ...style }}>{statusBody}</View>;
};

export { Status };
