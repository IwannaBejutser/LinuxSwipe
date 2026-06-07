import AsyncStorage from '@react-native-async-storage/async-storage';

import { LearningState } from '../types/progress';

const STORAGE_KEY = 'linuxswipe.learning-state';
const ONBOARDING_KEY = 'linuxswipe.onboarding-seen';

export async function loadLearningState(): Promise<LearningState | null> {
  try {
    const rawValue = await AsyncStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    return JSON.parse(rawValue) as LearningState;
  } catch {
    return null;
  }
}

export async function saveLearningState(state: LearningState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage errors in MVP to keep the learning flow responsive.
  }
}

export async function loadOnboardingSeen(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(ONBOARDING_KEY)) === 'true';
  } catch {
    return false;
  }
}

export async function saveOnboardingSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  } catch {
    // Onboarding is helpful, not critical. Never block learning on storage errors.
  }
}
