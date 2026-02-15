// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.
//
// I hope I got this relicensing stuff right xD
import {
  mappings,
  URLPurify,
  type SerializedRules,
  type SerializedServices,
} from '@mkljczk/url-purify';

import KVStore from '@/storage/kv-store';
import { Me } from '@/types/pl-fe';

interface KVStoreRulesItem {
  hashUrl?: string;
  rulesUrl?: string;
  hash?: string;
  rules: SerializedRules;
  fetchedAt: number;
}

interface KVStoreRedirectServicesItem {
  redirectServicesUrl?: string;
  redirectServices: SerializedServices;
  fetchedAt: number;
}

const sha256 = async (message: string) =>
  Array.from(
    new Uint8Array(await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(message))),
  )
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

// Adapted from ClearURLs Rules
// https://github.com/ClearURLs/Rules/blob/master/data.min.json
// Licensed under the LGPL-3.0 license.
const DEFAULT_RULESET: SerializedRules = {
  providers: {
    globalRules: {
      urlPattern: '.*',
      rules: [
        '(?:%3F)?utm(?:_[a-z_]*)?',
        '(?:%3F)?ga_[a-z_]+',
        '(?:%3F)?yclid',
        '(?:%3F)?_openstat',
        '(?:%3F)?fb_action_(?:types|ids)',
        '(?:%3F)?fb_(?:source|ref)',
        '(?:%3F)?fbclid',
        '(?:%3F)?action_(?:object|type|ref)_map',
        '(?:%3F)?gs_l',
        '(?:%3F)?mkt_tok',
        '(?:%3F)?hmb_(?:campaign|medium|source)',
        '(?:%3F)?gclid',
        '(?:%3F)?srsltid',
        '(?:%3F)?otm_[a-z_]*',
        '(?:%3F)?cmpid',
        '(?:%3F)?os_ehash',
        '(?:%3F)?_ga',
        '(?:%3F)?_gl',
        '(?:%3F)?__twitter_impression',
        '(?:%3F)?wt_?z?mc',
        '(?:%3F)?wtrid',
        '(?:%3F)?[a-z]?mc',
        '(?:%3F)?dclid',
        'Echobox',
        '(?:%3F)?spm',
        '(?:%3F)?vn(?:_[a-z]*)+',
        '(?:%3F)?tracking_source',
        '(?:%3F)?ceneo_spo',
        '(?:%3F)?itm_(?:campaign|medium|source)',
        '(?:%3F)?__hsfp',
        '(?:%3F)?__hssc',
        '(?:%3F)?__hstc',
        '(?:%3F)?_hsenc',
        '(?:%3F)?__s',
        '(?:%3F)?hsCtaTracking',
        '(?:%3F)?mc_(?:eid|cid|tc)',
        '(?:%3F)?ml_subscriber',
        '(?:%3F)?ml_subscriber_hash',
        '(?:%3F)?msclkid',
        '(?:%3F)?oly_anon_id',
        '(?:%3F)?oly_enc_id',
        '(?:%3F)?rb_clickid',
        '(?:%3F)?s_cid',
        '(?:%3F)?vero_conv',
        '(?:%3F)?vero_id',
        '(?:%3F)?wickedid',
        '(?:%3F)?twclid',
        '(?:%3F)?ref_?',
        '(?:%3F)?referrer',
      ],
    },
    youtube: {
      urlPattern: '^https?:\\/\\/(?:[a-z0-9-]+\\.)*?(youtube\\.com|youtu\\.be)',
      rules: ['feature', 'gclid', 'kw', 'si', 'pp'],
      exceptions: ['^https?:\\/\\/(?:[a-z0-9-]+\\.)*?youtube\\.com\\/signin\\?.*?'],
      redirections: ['^https?:\\/\\/(?:[a-z0-9-]+\\.)*?youtube\\.com\\/redirect?.*?q=([^&]*)'],
    },
  },
};

const Purify = new URLPurify({
  rulesFromMemory: DEFAULT_RULESET,
  instancePickMode: 'random',
});

const resetRules = async (user: Me) => {
  Purify.setRules(DEFAULT_RULESET);
  await KVStore.setItem('url-purify-rules:last', user);
  return KVStore.removeItem(`url-purify-rules:${user}`);
};

const updateRulesFromUrl = async (
  user: Me,
  rulesUrl: string,
  hashUrl?: string,
  oldHash?: string,
) => {
  if (oldHash && hashUrl) {
    const newHash = await fetch(hashUrl).then((response) => response.text());
    if (newHash === oldHash) return;
  }

  const rules = await fetch(rulesUrl).then((response) => response.text());

  const parsedRules = JSON.parse(rules);
  const hash = await sha256(rules);
  Purify.setRules(parsedRules, hash);

  await KVStore.setItem('url-purify-rules:last', user);
  return KVStore.setItem<KVStoreRulesItem>(`url-purify-rules:${user}`, {
    hashUrl,
    rulesUrl,
    hash,
    rules: parsedRules,
    fetchedAt: Date.now(),
  });
};

const updateRedirectServicesFromUrl = async (user: Me, redirectServicesUrl: string) => {
  const redirectServices = await fetch(redirectServicesUrl).then((response) => response.text());

  const parsedRedirectServices = JSON.parse(redirectServices);
  Purify.setRedirectServices(parsedRedirectServices);

  await KVStore.setItem('url-purify-redirect-services:last', user);
  return KVStore.setItem<KVStoreRedirectServicesItem>(`url-purify-redirect-services:${user}`, {
    redirectServicesUrl,
    redirectServices: parsedRedirectServices,
    fetchedAt: Date.now(),
  });
};

const setManualRedirectServices = async (user: Me, redirectServices: Record<string, string>) => {
  const parsedRedirectServices: SerializedServices = Object.entries(redirectServices)
    .filter(([_, instance]) => instance.trim())
    .map((service) => ({
      fallback: service[1],
      instances: [service[1]],
      test_url: '',
      type: mappings.find((mapping) => mapping.name === service[0])?.targets[0] ?? 'unknown',
    }));
  Purify.setRedirectServices(parsedRedirectServices);

  await KVStore.setItem('url-purify-redirect-services:last', user);
  return KVStore.setItem<KVStoreRedirectServicesItem>(`url-purify-redirect-services:${user}`, {
    redirectServices: parsedRedirectServices,
    fetchedAt: Date.now(),
  });
};

const getRulesForUser = (user: Me) => {
  if (!user || typeof user !== 'string') return;
  KVStore.getItem<KVStoreRulesItem>(`url-purify-rules:${user}`)
    .then((rules) => {
      if (!rules?.rulesUrl) return;
      Purify.setRules(rules.rules, rules.hash);

      if (rules.fetchedAt + 1000 * 60 * 60 * 24 < Date.now()) {
        updateRulesFromUrl(user, rules.rulesUrl, rules.hashUrl, rules.hash);
      }
    })
    .catch(() => {});
};

const getRulesFromMemory = () => {
  KVStore.getItem<string>('url-purify-rules:last')
    .then((url) => {
      if (!url) return;
      getRulesForUser(url);
    })
    .catch(() => {});
};

const getRedirectServicesForUser = (user: Me) => {
  if (!user || typeof user !== 'string') return;
  KVStore.getItem<KVStoreRedirectServicesItem>(`url-purify-redirect-services:${user}`)
    .then((services) => {
      if (!services) return;
      Purify.setRedirectServices(services.redirectServices);

      if (services.redirectServicesUrl && services.fetchedAt + 1000 * 60 * 60 * 24 < Date.now()) {
        updateRedirectServicesFromUrl(user, services.redirectServicesUrl);
      }
    })
    .catch(() => {});
};

const getRedirectServicesFromMemory = () => {
  KVStore.getItem<string>('url-purify-redirect-services:last')
    .then((url) => {
      if (!url) return;
      getRedirectServicesForUser(url);
    })
    .catch(() => {});
};

getRulesFromMemory();
getRedirectServicesFromMemory();

export {
  Purify as default,
  resetRules,
  setManualRedirectServices,
  updateRedirectServicesFromUrl,
  updateRulesFromUrl,
  type KVStoreRedirectServicesItem,
};
