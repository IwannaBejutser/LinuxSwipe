import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Platform } from 'react-native';
import { useEffect, useState } from 'react';

import { clearCardCache } from '../../features/learning/storage/cardCacheStorage';

const APP_VERSION_ENDPOINT = '/version.json';
const APP_VERSION_STORAGE_KEY = 'linuxswipe.app-version.v1';

export type AppVersionManifest = {
  buildTime?: string;
  gitSha?: string;
  packageVersion?: string;
  version: string;
};

function isVersionManifest(value: unknown): value is AppVersionManifest {
  return (
    typeof value === 'object' &&
    value !== null &&
    'version' in value &&
    typeof value.version === 'string' &&
    value.version.length > 0
  );
}

async function fetchAppVersion(): Promise<AppVersionManifest | null> {
  try {
    const response = await fetch(`${APP_VERSION_ENDPOINT}?t=${Date.now()}`, {
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });

    if (!response.ok) {
      return null;
    }

    const manifest = (await response.json()) as unknown;
    return isVersionManifest(manifest) ? manifest : null;
  } catch {
    return null;
  }
}

async function reloadWebApp() {
  await clearCardCache();

  if (typeof window !== 'undefined' && window.location) {
    window.location.reload();
  }
}

export function useAppUpdateCheck() {
  const [availableVersion, setAvailableVersion] = useState<AppVersionManifest | null>(
    null,
  );
  const [dismissedVersion, setDismissedVersion] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return undefined;
    }

    let isMounted = true;

    async function checkVersion() {
      const remoteVersion = await fetchAppVersion();

      if (!remoteVersion || !isMounted) {
        return;
      }

      const storedVersion = await AsyncStorage.getItem(APP_VERSION_STORAGE_KEY);

      if (!storedVersion) {
        await AsyncStorage.setItem(APP_VERSION_STORAGE_KEY, remoteVersion.version);
        return;
      }

      if (
        storedVersion !== remoteVersion.version &&
        dismissedVersion !== remoteVersion.version
      ) {
        setAvailableVersion(remoteVersion);
      }
    }

    void checkVersion();

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void checkVersion();
      }
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, [dismissedVersion]);

  async function applyUpdate() {
    if (availableVersion) {
      await AsyncStorage.setItem(APP_VERSION_STORAGE_KEY, availableVersion.version);
    }

    await reloadWebApp();
  }

  function dismissUpdate() {
    setDismissedVersion(availableVersion?.version ?? null);
    setAvailableVersion(null);
  }

  return {
    availableVersion,
    dismissUpdate,
    hasUpdate: availableVersion !== null,
    applyUpdate,
  };
}
