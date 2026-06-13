import { Animated, Text } from 'react-native';

import { learningCardStyles as styles } from './learningCardStyles';

type LearningSwipeCoachProps = {
  coachProgress: Animated.Value;
};

export function LearningSwipeCoach({ coachProgress }: LearningSwipeCoachProps) {
  const upOpacity = coachProgress.interpolate({
    inputRange: [-1, -0.15, 0.25, 1],
    outputRange: [0, 0, 0.28, 0.9],
    extrapolate: 'clamp',
  });
  const downOpacity = coachProgress.interpolate({
    inputRange: [-1, -0.25, 0.15, 1],
    outputRange: [0.9, 0.28, 0, 0],
    extrapolate: 'clamp',
  });
  const upTranslateY = coachProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [6, -4],
    extrapolate: 'clamp',
  });
  const downTranslateY = coachProgress.interpolate({
    inputRange: [-1, 0],
    outputRange: [4, -6],
    extrapolate: 'clamp',
  });

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.swipeCoach,
          styles.swipeCoachUp,
          { opacity: upOpacity, transform: [{ translateY: upTranslateY }] },
        ]}
      >
        <Text style={styles.swipeCoach__eyebrow}>Свайп вверх</Text>
        <Text style={styles.swipeCoach__label}>Знаю команду</Text>
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.swipeCoach,
          styles.swipeCoachDown,
          { opacity: downOpacity, transform: [{ translateY: downTranslateY }] },
        ]}
      >
        <Text style={styles.swipeCoach__eyebrow}>Свайп вниз</Text>
        <Text style={styles.swipeCoach__label}>Повторить позже</Text>
      </Animated.View>
    </>
  );
}
