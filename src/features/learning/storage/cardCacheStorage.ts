import AsyncStorage from '@react-native-async-storage/async-storage';

import { validateCards } from '../data/cardSchema';
import { Card } from '../types/card';

const CARD_CACHE_KEY = 'linuxswipe.cards-cache.v1';

export type CardCache = {
  cards: Card[];
  savedAt: string;
  version: string;
};

export async function loadCardCache(): Promise<CardCache | null> {
  try {
    const rawValue = await AsyncStorage.getItem(CARD_CACHE_KEY);

    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue) as Partial<CardCache>;

    if (!parsedValue.version || !parsedValue.savedAt || !parsedValue.cards) {
      return null;
    }

    return {
      cards: validateCards(parsedValue.cards),
      savedAt: parsedValue.savedAt,
      version: parsedValue.version,
    };
  } catch {
    return null;
  }
}

export async function saveCardCache(version: string, cards: Card[]): Promise<void> {
  try {
    const nextCache: CardCache = {
      cards,
      savedAt: new Date().toISOString(),
      version,
    };

    await AsyncStorage.setItem(CARD_CACHE_KEY, JSON.stringify(nextCache));
  } catch {
    // Card cache improves startup/offline UX, but must never block learning.
  }
}
