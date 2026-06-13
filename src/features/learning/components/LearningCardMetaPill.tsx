import { Text, View } from 'react-native';

import { learningCardStyles as styles } from './learningCardStyles';

type LearningCardMetaPillProps = {
  isCompact?: boolean;
  label: string;
  variant?: 'category' | 'difficulty' | 'index';
};

export function LearningCardMetaPill({
  isCompact = false,
  label,
  variant = 'category',
}: LearningCardMetaPillProps) {
  return (
    <View
      style={[
        styles.metaPill,
        variant === 'category' && styles.metaPillCategory,
        variant === 'index' && styles.metaPillIndex,
        variant === 'difficulty' && styles.metaPillDifficulty,
        isCompact && styles.metaPillCompact,
      ]}
    >
      <Text
        numberOfLines={1}
        style={[styles.metaPill__text, isCompact && styles.metaPill__textCompact]}
      >
        {label}
      </Text>
    </View>
  );
}
