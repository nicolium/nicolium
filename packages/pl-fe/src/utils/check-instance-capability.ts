import KVStore from 'pl-fe/storage/kv-store';

type DomainCapabilities = {
  lastChecked: number;
} & ({
  failed: true;
} | {
  failed: false;
  emojiReacts: boolean;
});

interface Capabilities {
  _version: number;
  domains: Record<string, DomainCapabilities>;
}

let capabilities: Capabilities = {
  _version: 1,
  domains: {},
};

const getCapabilitiesFromMemory = () =>
  KVStore.getItem<Capabilities>('instanceCapabilities').then((capabilitiesFromMemory) => {
    if (capabilitiesFromMemory) {
      capabilities = capabilitiesFromMemory;
    }
  }).catch(() => { });

const checkEmojiReactsSupport = (instance: Record<string, any>) => instance.configuration?.reactions?.max_reactions > 0 || instance.pleroma?.metadata?.features?.includes('pleroma_emoji_reactions');

const setDomainCapabilities = async (domain: string, domainCapabilities: DomainCapabilities) => {
  await getCapabilitiesFromMemory();
  capabilities.domains[domain] = domainCapabilities;
  await KVStore.setItem('instanceCapabilities', capabilities);
};

const fetchCapabilities = async (domain: string): Promise<DomainCapabilities> => {
  try {
    const response = await fetch(`https://${domain}/api/v1/instance`, {
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => res.json());

    const emojiReacts = checkEmojiReactsSupport(response);

    const domainCapabilities: DomainCapabilities = {
      lastChecked: Date.now(),
      failed: false,
      emojiReacts,
    };
    await setDomainCapabilities(domain, domainCapabilities);
    return domainCapabilities;
  } catch (e) {
    const domainCapabilities: DomainCapabilities = {
      lastChecked: Date.now(),
      failed: true,
    };
    await setDomainCapabilities(domain, domainCapabilities);
    return domainCapabilities;
  }
};

const supportsEmojiReacts = async (accountUrl: string): Promise<'true' | 'false' | 'unknown'> => {
  const domain = new URL(accountUrl).hostname;
  let domainCapabilities = capabilities.domains[domain];

  if (!domainCapabilities || domainCapabilities.lastChecked < Date.now() - 1000 * 60 * 60 * 24 * (domainCapabilities.failed ? 1 : 7)) {
    domainCapabilities = await fetchCapabilities(domain);
  }

  if (domainCapabilities.failed) {
    return 'unknown';
  }
  if (domainCapabilities.emojiReacts) {
    return 'true';
  }
  return 'false';
};

getCapabilitiesFromMemory();

export { supportsEmojiReacts };
