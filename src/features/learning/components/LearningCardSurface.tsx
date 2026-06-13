import { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { learningCardStyles as styles } from './learningCardStyles';

type LearningCardSurfaceProps = {
  body: string;
  icon: ReactNode;
  title: string;
  tone: 'accent' | 'default' | 'subtle';
};

export function LearningCardSurface({
  body,
  icon,
  title,
  tone,
}: LearningCardSurfaceProps) {
  return (
    <View
      style={[
        styles.surface,
        tone === 'accent' && styles.surfaceAccent,
        tone === 'subtle' && styles.surfaceSubtle,
      ]}
    >
      <View style={styles.surface__head}>
        {icon}
        <Text style={styles.surface__label}>{title}</Text>
      </View>
      <Text style={tone === 'accent' ? styles.surface__answer : styles.surface__body}>
        {body}
      </Text>
    </View>
  );
}
