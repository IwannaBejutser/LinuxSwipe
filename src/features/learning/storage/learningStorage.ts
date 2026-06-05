import AsyncStorage from '@react-native-async-storage/async-storage';

import { LearningState } from '../types/progress';

const STORAGE_KEY = 'linuxswipe.learning-state';

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
