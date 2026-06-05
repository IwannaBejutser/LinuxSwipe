import { Card } from '../types/card';

export function getDifficultyLabel(value: Card['difficulty']) {
  switch (value) {
    case 'easy':
      return 'Легко';
    case 'medium':
      return 'Средне';
    case 'hard':
      return 'Сложно';
    default:
      return value;
  }
}
