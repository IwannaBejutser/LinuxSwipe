import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { CheckIcon, KeyboardIcon, ReviewIcon } from '../../../shared/components/icons';
import { palette } from '../../../shared/theme';

type FirstRunOnboardingProps = {
  onComplete: () => void;
  visible: boolean;
};

export function FirstRunOnboarding({ onComplete, visible }: FirstRunOnboardingProps) {
  const motion = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      motion.stopAnimation();
      motion.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(motion, {
          toValue: 1,
          duration: 820,
          useNativeDriver: true,
        }),
        Animated.timing(motion, {
          toValue: 0,
          duration: 420,
          useNativeDriver: true,
        }),
        Animated.timing(motion, {
          toValue: -1,
          duration: 820,
          useNativeDriver: true,
        }),
        Animated.timing(motion, {
          toValue: 0,
          duration: 420,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();

    return () => {
      loop.stop();
    };
  }, [motion, visible]);

  if (!visible) {
    return null;
  }

  const translateY = motion.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [28, 0, -28],
  });
  const rotate = motion.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['4deg', '0deg', '-4deg'],
  });
  const upOpacity = motion.interpolate({
    inputRange: [-1, -0.2, 0.35, 1],
    outputRange: [0.2, 0.2, 0.65, 1],
    extrapolate: 'clamp',
  });
  const downOpacity = motion.interpolate({
    inputRange: [-1, -0.35, 0.2, 1],
    outputRange: [1, 0.65, 0.2, 0.2],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.onboarding}>
      <View style={styles.onboarding__panel}>
        <Text style={styles.onboarding__eyebrow}>Быстрый старт</Text>
        <Text style={styles.onboarding__title}>Карточки отвечают на жесты</Text>
        <Text style={styles.onboarding__body}>
          Тап открывает ручную проверку. Свайп вверх засчитывает знание, свайп вниз
          отправляет команду на повтор.
        </Text>

        <View style={styles.demo}>
          <Animated.View
            style={[styles.demo__badge, styles.demo__badgeTop, { opacity: upOpacity }]}
          >
            <CheckIcon color={palette.accentStrong} size={16} />
            <Text style={styles.demo__badgeText}>Знаю</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.demo__card,
              {
                transform: [{ translateY }, { rotate }],
              },
            ]}
          >
            <View style={styles.demo__metaRow}>
              <Text style={styles.demo__pill}>Поиск</Text>
              <Text style={styles.demo__pill}>1/3</Text>
            </View>
            <Text style={styles.demo__label}>Сценарий</Text>
            <Text style={styles.demo__question}>
              Как найти строки с текстом error в файле app.log?
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.demo__badge,
              styles.demo__badgeBottom,
              { opacity: downOpacity },
            ]}
          >
            <ReviewIcon color="#f4a261" size={16} />
            <Text style={styles.demo__badgeText}>Повторить</Text>
          </Animated.View>
        </View>

        <View style={styles.onboarding__tip}>
          <KeyboardIcon color={palette.accentStrong} size={18} />
          <Text style={styles.onboarding__tipText}>
            Ручной ответ помогает закрепить синтаксис, а свайпы остаются быстрым способом
            оценить карточку.
          </Text>
        </View>

        <Pressable onPress={onComplete} style={styles.onboarding__button}>
          <Text style={styles.onboarding__buttonText}>Начать тренировку</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  onboarding: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    elevation: 100,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    backgroundColor: 'rgba(1, 2, 3, 0.9)',
  },
  onboarding__panel: {
    width: '100%',
    maxWidth: 430,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(130, 245, 208, 0.16)',
    backgroundColor: palette.panel,
    padding: 22,
    gap: 14,
  },
  onboarding__eyebrow: {
    color: palette.accentStrong,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  onboarding__title: {
    color: palette.textPrimary,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 33,
  },
  onboarding__body: {
    color: palette.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  demo: {
    height: 300,
    position: 'relative',
    justifyContent: 'center',
  },
  demo__card: {
    minHeight: 220,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(158, 184, 214, 0.14)',
    backgroundColor: palette.panelElevated,
    padding: 18,
    justifyContent: 'center',
    gap: 12,
  },
  demo__metaRow: {
    position: 'absolute',
    left: 18,
    right: 18,
    top: 18,
    flexDirection: 'row',
    gap: 8,
  },
  demo__pill: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: palette.hairline,
    color: palette.textSecondary,
    backgroundColor: 'rgba(7, 10, 14, 0.7)',
    fontSize: 11,
    fontWeight: '800',
    paddingHorizontal: 12,
    paddingVertical: 7,
    textAlign: 'center',
  },
  demo__label: {
    color: palette.textMuted,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  demo__question: {
    color: palette.textPrimary,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
  },
  demo__badge: {
    position: 'absolute',
    left: 22,
    right: 22,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 999,
    paddingVertical: 9,
    borderWidth: 1,
    backgroundColor: 'rgba(7, 10, 14, 0.82)',
  },
  demo__badgeTop: {
    top: 12,
    borderColor: 'rgba(130, 245, 208, 0.22)',
  },
  demo__badgeBottom: {
    bottom: 12,
    borderColor: 'rgba(244, 162, 97, 0.22)',
  },
  demo__badgeText: {
    color: palette.textPrimary,
    fontSize: 13,
    fontWeight: '900',
  },
  onboarding__tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 18,
    padding: 14,
    backgroundColor: 'rgba(130, 245, 208, 0.06)',
  },
  onboarding__tipText: {
    flex: 1,
    color: palette.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  onboarding__button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingVertical: 15,
    backgroundColor: palette.accentStrong,
  },
  onboarding__buttonText: {
    color: palette.background,
    fontSize: 15,
    fontWeight: '900',
  },
});
