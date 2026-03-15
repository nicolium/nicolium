import { mappings } from '@mkljczk/url-purify';
import React, { useState } from 'react';
import { defineMessages, FormattedList, FormattedMessage, useIntl } from 'react-intl';
import { useMutative } from 'use-mutative';

import { changeSetting, saveSettings } from '@/actions/settings';
import List, { ListItem } from '@/components/list';
import Button from '@/components/ui/button';
import Card, { CardBody, CardHeader, CardTitle } from '@/components/ui/card';
import Column from '@/components/ui/column';
import Form from '@/components/ui/form';
import FormActions from '@/components/ui/form-actions';
import FormGroup from '@/components/ui/form-group';
import Input from '@/components/ui/input';
import Toggle from '@/components/ui/toggle';
import { useCurrentAccount } from '@/contexts/current-account-context';
import { SelectDropdown } from '@/features/forms';
import KVStore from '@/storage/kv-store';
import { useSettings } from '@/stores/settings';
import { hasCanvasExtractPermission } from '@/utils/favicon-service';

import type { KVStoreRedirectServicesItem } from '@/utils/url-purify';

const messages = defineMessages({
  heading: { id: 'column.privacy', defaultMessage: 'Privacy' },
  rulesUrlPlaceholder: { id: 'url_privacy.rules_url.placeholder', defaultMessage: 'Rules URL' },
  hashUrlPlaceholder: { id: 'url_privacy.hash_url.placeholder', defaultMessage: 'Hash URL' },
  redirectLinksModeOff: { id: 'url_privacy.redirect_links_mode.off', defaultMessage: 'Disabled' },
  redirectLinksModeAuto: { id: 'url_privacy.redirect_links_mode.auto', defaultMessage: 'From URL' },
  redirectLinksModeManual: {
    id: 'url_privacy.redirect_links_mode.manual',
    defaultMessage: 'Specify manually',
  },
  redirectServicesUrlPlaceholder: {
    id: 'url_privacy.redirect_services_url.placeholder',
    defaultMessage: 'Rules URL',
  },
  redirectServicePlaceholder: {
    id: 'url_privacy.redirect_service_url.placeholder',
    defaultMessage: 'eg. https://proxy.example.org',
  },
});

const Privacy = () => {
  const me = useCurrentAccount();
  const intl = useIntl();

  const settings = useSettings();
  const { urlPrivacy } = settings;

  const [displayTargetHost, setDisplayTargetHost] = useState(urlPrivacy.displayTargetHost);
  const [clearLinksInCompose, setClearLinksInCompose] = useState(urlPrivacy.clearLinksInCompose);
  const [clearLinksInContent, setClearLinksInContent] = useState(urlPrivacy.clearLinksInContent);
  const [hashUrl, setHashUrl] = useState(urlPrivacy.hashUrl);
  const [rulesUrl, setRulesUrl] = useState(urlPrivacy.rulesUrl);
  const [redirectLinksMode, setRedirectLinksMode] = useState(urlPrivacy.redirectLinksMode);
  const [redirectServicesUrl, setRedirectServicesUrl] = useState(urlPrivacy.redirectServicesUrl);
  const [redirectServices, setRedirectServices] = useMutative(urlPrivacy.redirectServices);
  const [stripMetadata, setStripMetadata] = useState(settings.stripMetadata);

  const onSubmit = () => {
    const value = {
      ...urlPrivacy,
      displayTargetHost,
      clearLinksInCompose,
      clearLinksInContent,
      hashUrl,
      rulesUrl,
      redirectLinksMode,
      redirectServicesUrl,
      redirectServices,
    };

    switch (redirectLinksMode) {
      case 'off':
        value.redirectServicesUrl = '';
        value.redirectServices = {};
        break;
      case 'manual':
        value.redirectServicesUrl = '';
        break;
      case 'auto':
        value.redirectServices = {};
        break;
    }

    changeSetting(['urlPrivacy'], value);
    changeSetting(['stripMetadata'], stripMetadata);

    saveSettings({
      showAlert: true,
    });
  };

  const handleChangeRedirectLinksMode = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (redirectLinksMode === 'auto' && event.target.value === 'manual') {
      KVStore.getItem<KVStoreRedirectServicesItem>(`url-purify-redirect-services:${me}`)
        .then((services) => {
          if (!services?.redirectServices) return;

          setRedirectServices(
            Object.fromEntries(
              mappings.map(({ name, targets }) => [
                name,
                services.redirectServices
                  .find((service) => targets.includes(service.type) && service.instances.length)
                  ?.instances[0].split('|')[0] ?? '',
              ]),
            ),
          );
        })
        .catch(() => {});
    }
    setRedirectLinksMode(event.target.value as 'off');
  };

  return (
    <Column label={intl.formatMessage(messages.heading)} transparent withHeader={false}>
      <Card className='space-y-4' variant='rounded'>
        <CardHeader backHref='/settings'>
          <CardTitle title={intl.formatMessage(messages.heading)} />
        </CardHeader>

        <CardBody>
          <Form onSubmit={onSubmit}>
            <List>
              <ListItem
                label={
                  <FormattedMessage
                    id='url_privacy.display_target_host'
                    defaultMessage='Always display the domain external links lead to'
                  />
                }
              >
                <Toggle
                  checked={displayTargetHost}
                  onChange={({ target }) => {
                    setDisplayTargetHost(target.checked);
                  }}
                />
              </ListItem>
            </List>

            <List>
              <ListItem
                label={
                  <FormattedMessage
                    id='url_privacy.clear_links_in_compose'
                    defaultMessage='Suggest removing tracking parameters when composing a post'
                  />
                }
              >
                <Toggle
                  checked={clearLinksInCompose}
                  onChange={({ target }) => {
                    setClearLinksInCompose(target.checked);
                  }}
                />
              </ListItem>

              <ListItem
                label={
                  <FormattedMessage
                    id='url_privacy.clear_links_in_content'
                    defaultMessage='Remove tracking parameters from displayed posts'
                  />
                }
              >
                <Toggle
                  checked={clearLinksInContent}
                  onChange={({ target }) => {
                    setClearLinksInContent(target.checked);
                  }}
                />
              </ListItem>
            </List>

            <FormGroup
              labelText={
                <FormattedMessage
                  id='url_privacy.rules_url.label'
                  defaultMessage='URL cleaning rules database address'
                />
              }
              hintText={
                <FormattedMessage
                  id='url_privacy.rules_url.hint'
                  defaultMessage='Rules database in ClearURLs-compatible format, eg. {url}'
                  values={{ url: 'https://rules2.clearurls.xyz/data.minify.json' }}
                />
              }
            >
              <Input
                type='text'
                placeholder={intl.formatMessage(messages.rulesUrlPlaceholder)}
                value={rulesUrl}
                onChange={({ target }) => {
                  setRulesUrl(target.value);
                }}
              />
            </FormGroup>

            <FormGroup
              labelText={
                <FormattedMessage
                  id='url_privacy.hash_url.label'
                  defaultMessage='URL cleaning rules hash address (optional)'
                />
              }
              hintText={
                <FormattedMessage
                  id='url_privacy.hash_url.hint'
                  defaultMessage='SHA256 hash of rules database, used to avoid unnecessary fetches, eg. {url}'
                  values={{ url: 'https://rules2.clearurls.xyz/rules.minify.hash' }}
                />
              }
            >
              <Input
                type='text'
                placeholder={intl.formatMessage(messages.hashUrlPlaceholder)}
                value={hashUrl}
                onChange={({ target }) => {
                  setHashUrl(target.value);
                }}
              />
            </FormGroup>

            <List>
              <ListItem
                label={
                  <FormattedMessage
                    id='url_privacy.redirect_links_mode'
                    defaultMessage='Redirect links to popular websites to privacy-respecting proxy services'
                  />
                }
              >
                <SelectDropdown
                  className='max-w-fit'
                  items={{
                    off: intl.formatMessage(messages.redirectLinksModeOff),
                    auto: intl.formatMessage(messages.redirectLinksModeAuto),
                    manual: intl.formatMessage(messages.redirectLinksModeManual),
                  }}
                  defaultValue={redirectLinksMode}
                  onChange={handleChangeRedirectLinksMode}
                />
              </ListItem>
            </List>

            {redirectLinksMode === 'auto' && (
              <FormGroup
                labelText={
                  <FormattedMessage
                    id='url_privacy.redirect_services_url.label'
                    defaultMessage='Redirect services URLs database address'
                  />
                }
                hintText={
                  <FormattedMessage
                    id='url_privacy.redirect_services_url.hint'
                    defaultMessage='URLs database in Farside-compatible format, eg. {url}'
                    values={{
                      url: 'https://raw.githubusercontent.com/benbusby/farside/refs/heads/main/services.json',
                    }}
                  />
                }
              >
                <Input
                  type='text'
                  placeholder={intl.formatMessage(messages.redirectServicesUrlPlaceholder)}
                  value={redirectServicesUrl}
                  onChange={({ target }) => {
                    setRedirectServicesUrl(target.value);
                  }}
                />
              </FormGroup>
            )}

            {redirectLinksMode === 'manual' &&
              mappings.map((service) => (
                <FormGroup
                  key={service.name}
                  labelText={
                    <FormattedMessage
                      id='url_privacy.redirect_services.name'
                      defaultMessage='{name}'
                      values={{ name: service.name }}
                    />
                  }
                  hintText={
                    <FormattedMessage
                      id='url_privacy.redirect_services.patterns'
                      defaultMessage='Matches: {pattern}, eg. {services}, leave empty for no redirect'
                      values={{
                        pattern: service.urlPattern,
                        services: <FormattedList value={service.targets} />,
                      }}
                    />
                  }
                >
                  <Input
                    outerClassName='grow'
                    type='text'
                    value={redirectServices[service.name]}
                    onChange={(e) => {
                      setRedirectServices((services) => {
                        services[service.name] = e.target.value;
                      });
                    }}
                    placeholder={intl.formatMessage(messages.redirectServicePlaceholder)}
                  />
                </FormGroup>
              ))}

            <List>
              <ListItem
                label={
                  <FormattedMessage
                    id='url_privacy.strip_metadata'
                    defaultMessage='Strip metadata from uploaded images'
                  />
                }
                hint={
                  hasCanvasExtractPermission ? (
                    <FormattedMessage
                      id='url_privacy.strip_metadata.hint'
                      defaultMessage='Removes metadata such as EXIF tags, including geolocation, from images before hitting the server. This is usually done server-side, regardless of client settings.'
                    />
                  ) : (
                    <FormattedMessage
                      id='url_privacy.strip_metadata.hint_no_permission'
                      defaultMessage='This option requires additional permissions to function. Please enable canvas extraction permission in your browser settings.'
                    />
                  )
                }
              >
                <Toggle
                  checked={stripMetadata}
                  onChange={({ target }) => {
                    setStripMetadata(target.checked);
                  }}
                  disabled={!hasCanvasExtractPermission}
                />
              </ListItem>
            </List>

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

export { Privacy as default };
