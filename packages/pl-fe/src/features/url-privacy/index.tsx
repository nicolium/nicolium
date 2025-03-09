import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { changeSetting } from 'pl-fe/actions/settings';
import List, { ListItem } from 'pl-fe/components/list';
import Button from 'pl-fe/components/ui/button';
import Card, { CardBody, CardHeader, CardTitle } from 'pl-fe/components/ui/card';
import Column from 'pl-fe/components/ui/column';
import Form from 'pl-fe/components/ui/form';
import FormActions from 'pl-fe/components/ui/form-actions';
import FormGroup from 'pl-fe/components/ui/form-group';
import Input from 'pl-fe/components/ui/input';
import Toggle from 'pl-fe/components/ui/toggle';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useSettings } from 'pl-fe/hooks/use-settings';

const messages = defineMessages({
  urlPrivacy: { id: 'settings.url_privacy', defaultMessage: 'URL privacy' },
  rulesUrlPlaceholder: { id: 'url_privacy.rules_url.placeholder', defaultMessage: 'Rules URL' },
  hashUrlPlaceholder: { id: 'url_privacy.hash_url.placeholder', defaultMessage: 'Hash URL' },
});

const UrlPrivacy = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const { urlPrivacy } = useSettings();

  const [clearLinksInCompose, setClearLinksInCompose] = useState(urlPrivacy.clearLinksInCompose);
  const [clearLinksInContent, setClearLinksInContent] = useState(urlPrivacy.clearLinksInContent);
  // const [allowReferralMarketing, setAllowReferralMarketing] = useState(urlPrivacy.allowReferralMarketing);
  const [hashUrl, setHashUrl] = useState(urlPrivacy.hashUrl);
  const [rulesUrl, setRulesUrl] = useState(urlPrivacy.rulesUrl);

  const onSubmit = () => {
    dispatch(changeSetting(['urlPrivacy'], {
      ...urlPrivacy,
      clearLinksInCompose,
      clearLinksInContent,
      // allowReferralMarketing,
      hashUrl,
      rulesUrl,
    }, {
      save: true,
      showAlert: true,
    }));
  };

  useEffect(() => {
  }, [dispatch]);

  return (
    <Column label={intl.formatMessage(messages.urlPrivacy)} transparent withHeader={false}>
      <Card className='space-y-4' variant='rounded'>
        <CardHeader backHref='/settings'>
          <CardTitle title={intl.formatMessage(messages.urlPrivacy)} />
        </CardHeader>

        <CardBody>
          <Form onSubmit={onSubmit}>
            <List>
              <ListItem label={<FormattedMessage id='url_privacy.clear_links_in_compose' defaultMessage='Suggest removing tracking parameters when composing a post' />}>
                <Toggle checked={clearLinksInCompose} onChange={({ target }) => setClearLinksInCompose(target.checked)} />
              </ListItem>

              <ListItem label={<FormattedMessage id='url_privacy.clear_links_in_content' defaultMessage='Remove tracking parameters from displayed posts' />}>
                <Toggle checked={clearLinksInContent} onChange={({ target }) => setClearLinksInContent(target.checked)} />
              </ListItem>

              {/* <ListItem label={<FormattedMessage id='url_privacy.allow_referral_marketing' defaultMessage='Make exception for referral marketing parameters' />}>
                <Toggle checked={allowReferralMarketing} onChange={({ target }) => setAllowReferralMarketing(target.checked)} disabled={!clearLinksInCompose && !clearLinksInContent} />
              </ListItem> */}
            </List>

            <FormGroup
              labelText={<FormattedMessage id='url_privacy.rules_url.label' defaultMessage='URL cleaning rules database address' />}
              hintText={<FormattedMessage id='url_privacy.rules_url.hint' defaultMessage='Rules database in ClearURLs-compatible format, eg. {url}' values={{ url: 'https://rules2.clearurls.xyz/data.minify.json' }} />}
            >
              <Input
                type='text'
                placeholder={intl.formatMessage(messages.rulesUrlPlaceholder)}
                value={rulesUrl}
                onChange={({ target }) => setRulesUrl(target.value)}
              />
            </FormGroup>

            <FormGroup
              labelText={<FormattedMessage id='url_privacy.hash_url.label' defaultMessage='URL cleaning rules hash address (optional)' />}
              hintText={<FormattedMessage id='url_privacy.hash_url.hint' defaultMessage='SHA256 hash of rules database, used to avoid unnecessary fetches, eg. {url}' values={{ url: 'https://rules2.clearurls.xyz/rules.minify.hash' }} />}
            >
              <Input
                type='text'
                placeholder={intl.formatMessage(messages.hashUrlPlaceholder)}
                value={hashUrl}
                onChange={({ target }) => setHashUrl(target.value)}
              />
            </FormGroup>

            <FormActions>
              <Button type='submit'>
                <FormattedMessage id='url_privacy.save' defaultMessage='Save' />
              </Button>
            </FormActions>
          </Form>
        </CardBody>
      </Card>
    </Column>
  );
};

export { UrlPrivacy as default };
