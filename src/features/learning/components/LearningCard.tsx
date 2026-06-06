import { ReactNode, useEffect, useRef } from 'react';
import {
  Animated,
  GestureResponderHandlers,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  CheckIcon,
  ReviewIcon,
  SparkIcon,
} from '../../../shared/components/icons/AppIcons';
import { Card } from '../types/card';
import { getCategoryLabel } from '../lib/category';
import { palette } from '../../../shared/theme/palette';

type LearningCardProps = {
  currentCard: Card;
  deckLabel: string;
  flipProgress: Animated.Value;
  isCompact?: boolean;
  isCardFlipped: boolean;
  nextCard: Card | null;
  onOpenDetails: () => void;
  onToggleFace: () => void;
  panHandlers: GestureResponderHandlers;
  sessionIndex: number;
  sessionTotal: number;
  showSwipeHint?: boolean;
  successGlow: Animated.Value;
  swipeOffset: Animated.Value;
  warningGlow: Animated.Value;
};

export function LearningCard({
  currentCard,
  deckLabel,
  flipProgress,
  isCompact = false,
  isCardFlipped,
  nextCard,
  onOpenDetails,
  onToggleFace,
  panHandlers,
  sessionIndex,
  sessionTotal,
  showSwipeHint = false,
  successGlow,
  swipeOffset,
  warningGlow,
}: LearningCardProps) {
  const { width } = useWindowDimensions();
  const isNarrow = isCompact || width < 390;
  const questionFontSize = isNarrow ? 24 : 32;
  const questionLineHeight = isNarrow ? 30 : 38;

  const swipeUpOpacity = swipeOffset.interpolate({
    inputRange: [-180, -40, 0],
    outputRange: [0.18, 0.05, 0],
    extrapolate: 'clamp',
  });
  const swipeDownOpacity = swipeOffset.interpolate({
    inputRange: [0, 40, 180],
    outputRange: [0, 0.05, 0.18],
    extrapolate: 'clamp',
  });
  const cardRotation = swipeOffset.interpolate({
    inputRange: [-180, 0, 180],
    outputRange: ['-4deg', '0deg', '4deg'],
  });
  const cardScale = swipeOffset.interpolate({
    inputRange: [-180, 0, 180],
    outputRange: [0.988, 1, 0.988],
  });
  const frontFaceRotation = flipProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backFaceRotation = flipProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });
  const frontFaceOpacity = flipProgress.interpolate({
    inputRange: [0, 0.49, 0.5, 1],
    outputRange: [1, 1, 0, 0],
  });
  const backFaceOpacity = flipProgress.interpolate({
    inputRange: [0, 0.5, 0.51, 1],
    outputRange: [0, 0, 1, 1],
  });
  const sessionProgress = sessionTotal === 0 ? 0 : sessionIndex / sessionTotal;

  return (
    <View style={styles.cardStage}>
      {nextCard ? (
        <View style={styles.cardStage__queueCard}>
          <View style={styles.cardStage__queueGlow} />
          <Text style={styles.cardStage__queueEyebrow}>Следом</Text>
          <Text numberOfLines={2} style={styles.cardStage__queueQuestion}>
            {nextCard.question}
          </Text>
        </View>
      ) : null}

      {showSwipeHint ? <SwipeHint /> : null}

      <Animated.View
        {...panHandlers}
        style={[
          styles.card,
          {
            transform: [
              { translateY: swipeOffset },
              { rotate: cardRotation },
              { scale: cardScale },
            ],
          },
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[styles.card__glowSuccess, { opacity: successGlow }]}
        />
        <Animated.View
          pointerEvents="none"
          style={[styles.card__glowWarning, { opacity: warningGlow }]}
        />
        <Animated.View
          pointerEvents="none"
          style={[styles.card__swipeAuraTop, { opacity: swipeUpOpacity }]}
        />
        <Animated.View
          pointerEvents="none"
          style={[styles.card__swipeAuraBottom, { opacity: swipeDownOpacity }]}
        />

        <Animated.View
          pointerEvents={isCardFlipped ? 'none' : 'auto'}
          style={[
            styles.cardFace,
            {
              opacity: frontFaceOpacity,
              transform: [{ perspective: 1400 }, { rotateY: frontFaceRotation }],
            },
          ]}
        >
          <Pressable onPress={onToggleFace} style={styles.cardFace__pressable}>
            <View style={styles.cardFace__metaRail}>
              <MetaPill
                isCompact={isNarrow}
                label={getCategoryLabel(currentCard.category)}
                variant="category"
              />
              <MetaPill
                isCompact={isNarrow}
                label={`${sessionIndex}/${sessionTotal}`}
                variant="index"
              />
              <MetaPill
                isCompact={isNarrow}
                label={getDifficultyLabel(currentCard.difficulty)}
                variant="difficulty"
              />
            </View>

            <View
              style={[
                styles.cardFace__questionBlock,
                isNarrow && styles.cardFace__questionBlockCompact,
              ]}
            >
              <Text
                style={[
                  styles.cardFace__eyebrow,
                  isNarrow && styles.cardFace__eyebrowCompact,
                ]}
              >
                Сценарий
              </Text>
              <Text
                style={[
                  styles.cardFace__question,
                  isNarrow && styles.cardFace__questionCompact,
                  { fontSize: questionFontSize, lineHeight: questionLineHeight },
                ]}
              >
                {currentCard.question}
              </Text>
            </View>

            <View
              style={[
                styles.cardFace__footer,
                isNarrow && styles.cardFace__footerCompact,
              ]}
            >
              <View style={styles.cardFace__footerHead}>
                <Text
                  style={[
                    styles.cardFace__footerTitle,
                    isNarrow && styles.cardFace__footerTitleCompact,
                  ]}
                >
                  {deckLabel}
                </Text>
                {!isNarrow ? (
                  <Text style={styles.cardFace__footerMeta}>Карточка в фокусе</Text>
                ) : null}
              </View>
              <View style={styles.cardFace__footerTrack}>
                <View
                  style={[
                    styles.cardFace__footerFill,
                    { width: `${Math.max(sessionProgress * 100, 4)}%` },
                  ]}
                />
              </View>
            </View>
          </Pressable>
        </Animated.View>

        <Animated.View
          pointerEvents={isCardFlipped ? 'auto' : 'none'}
          style={[
            styles.cardFace,
            styles.cardFaceBack,
            {
              opacity: backFaceOpacity,
              transform: [{ perspective: 1400 }, { rotateY: backFaceRotation }],
            },
          ]}
        >
          <View style={styles.cardFace__pressable}>
            <View style={styles.cardFace__metaRail}>
              <MetaPill
                isCompact={isNarrow}
                label={getCategoryLabel(currentCard.category)}
                variant="category"
              />
              <MetaPill
                isCompact={isNarrow}
                label={`${sessionIndex}/${sessionTotal}`}
                variant="index"
              />
              <MetaPill
                isCompact={isNarrow}
                label={getDifficultyLabel(currentCard.difficulty)}
                variant="difficulty"
              />
            </View>

            <Pressable onPress={onToggleFace}>
              <SurfaceCard
                body={currentCard.answer}
                icon={<CheckIcon color={palette.accentStrong} size={18} />}
                title="Правильный ответ"
                tone="accent"
              />
            </Pressable>

            <View style={styles.cardFaceBack__detailsWrap}>
              <View style={styles.cardFaceBack__detailsHint}>
                <SparkIcon color={palette.accentStrong} size={16} />
                <Text style={styles.cardFaceBack__detailsHintText}>
                  Полное объяснение, контекст и подсказка живут в отдельном окне.
                </Text>
              </View>

              <View style={styles.cardFaceBack__actions}>
                <Pressable
                  onPress={onToggleFace}
                  style={styles.cardFaceBack__ghostButton}
                >
                  <Text style={styles.cardFaceBack__ghostButtonText}>Назад</Text>
                </Pressable>
                <Pressable
                  onPress={onOpenDetails}
                  style={styles.cardFaceBack__primaryButton}
                >
                  <Text style={styles.cardFaceBack__primaryButtonText}>Подробнее</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

function SwipeHint() {
  const hintProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(hintProgress, {
          toValue: 1,
          duration: 1150,
          useNativeDriver: true,
        }),
        Animated.timing(hintProgress, {
          toValue: 0,
          duration: 1150,
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();

    return () => {
      loop.stop();
    };
  }, [hintProgress]);

  const translateY = hintProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [7, -7],
  });
  const opacity = hintProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.52, 0.92, 0.64],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.swipeHint, { opacity, transform: [{ translateY }] }]}
    >
      <View style={styles.swipeHint__item}>
        <CheckIcon color={palette.accentStrong} size={15} />
        <Text style={styles.swipeHint__direction}>Вверх</Text>
        <Text style={styles.swipeHint__label}>Знаю</Text>
      </View>
      <View style={styles.swipeHint__line} />
      <View style={styles.swipeHint__item}>
        <ReviewIcon color="#f4a261" size={15} />
        <Text style={styles.swipeHint__direction}>Вниз</Text>
        <Text style={styles.swipeHint__label}>Повтор</Text>
      </View>
    </Animated.View>
  );
}

function MetaPill({
  isCompact = false,
  label,
  variant = 'category',
}: {
  isCompact?: boolean;
  label: string;
  variant?: 'category' | 'difficulty' | 'index';
}) {
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

function SurfaceCard({
  body,
  icon,
  title,
  tone,
}: {
  body: string;
  icon: ReactNode;
  title: string;
  tone: 'accent' | 'default' | 'subtle';
}) {
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

function getDifficultyLabel(value: Card['difficulty']) {
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

const styles = StyleSheet.create({
  cardStage: {
    alignSelf: 'stretch',
    flex: 1,
    minHeight: 0,
    paddingBottom: 2,
    overflow: 'visible',
    position: 'relative',
    zIndex: 20,
    elevation: 20,
  },
  cardStage__queueCard: {
    position: 'absolute',
    left: 28,
    right: 28,
    top: 12,
    bottom: 22,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(92, 117, 159, 0.24)',
    backgroundColor: 'rgba(18, 29, 49, 0.54)',
    padding: 24,
  },
  cardStage__queueGlow: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 22,
    height: 92,
    borderRadius: 24,
    backgroundColor: 'rgba(130, 245, 208, 0.06)',
  },
  cardStage__queueEyebrow: {
    color: palette.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  cardStage__queueQuestion: {
    marginTop: 12,
    color: palette.textSecondary,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
    maxWidth: '84%',
  },
  swipeHint: {
    position: 'absolute',
    right: -6,
    top: '50%',
    marginTop: -72,
    width: 64,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(130, 245, 208, 0.2)',
    backgroundColor: 'rgba(7, 16, 26, 0.78)',
    paddingHorizontal: 7,
    paddingVertical: 10,
    gap: 8,
    zIndex: 34,
    elevation: 34,
  },
  swipeHint__item: {
    alignItems: 'center',
    gap: 2,
  },
  swipeHint__direction: {
    color: palette.textPrimary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.45,
    textTransform: 'uppercase',
  },
  swipeHint__label: {
    color: palette.textMuted,
    fontSize: 9,
    fontWeight: '800',
  },
  swipeHint__line: {
    alignSelf: 'center',
    width: 1,
    height: 18,
    borderRadius: 999,
    backgroundColor: 'rgba(130, 245, 208, 0.18)',
  },
  card: {
    flex: 1,
    position: 'relative',
    borderRadius: 34,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.panelElevated,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 30,
    elevation: 24,
    zIndex: 24,
  },
  card__glowSuccess: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 34,
    borderWidth: 1.5,
    borderColor: palette.accentStrong,
    backgroundColor: 'rgba(130, 245, 208, 0.06)',
  },
  card__glowWarning: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 34,
    borderWidth: 1.5,
    borderColor: '#f4a261',
    backgroundColor: 'rgba(170, 98, 41, 0.08)',
  },
  card__swipeAuraTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '24%',
    backgroundColor: 'rgba(49, 141, 109, 0.24)',
  },
  card__swipeAuraBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '24%',
    backgroundColor: 'rgba(144, 85, 42, 0.24)',
  },
  cardFace: {
    ...StyleSheet.absoluteFillObject,
    padding: 20,
    backfaceVisibility: 'hidden',
  },
  cardFaceBack: {
    backgroundColor: palette.panelElevated,
  },
  cardFace__pressable: {
    flex: 1,
  },
  cardFace__metaRail: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardFace__questionBlock: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 16,
    gap: 10,
  },
  cardFace__questionBlockCompact: {
    paddingTop: 6,
    paddingBottom: 12,
    gap: 8,
  },
  cardFace__eyebrow: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  cardFace__eyebrowCompact: {
    fontSize: 11,
  },
  cardFace__question: {
    maxWidth: '100%',
    color: palette.textPrimary,
    fontWeight: '900',
    flexShrink: 1,
  },
  cardFace__questionCompact: {
    maxWidth: '100%',
  },
  cardFace__footer: {
    gap: 10,
    paddingTop: 14,
  },
  cardFace__footerCompact: {
    gap: 8,
    paddingTop: 10,
  },
  cardFace__footerHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardFace__footerTitle: {
    color: palette.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  cardFace__footerTitleCompact: {
    fontSize: 12,
  },
  cardFace__footerMeta: {
    color: palette.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  cardFace__footerTrack: {
    height: 9,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(10, 20, 37, 0.6)',
  },
  cardFace__footerFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: 'rgba(130, 245, 208, 0.22)',
  },
  cardFaceBack__detailsWrap: {
    marginTop: 'auto',
    gap: 14,
    paddingTop: 16,
  },
  cardFaceBack__detailsHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(93, 118, 160, 0.18)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  cardFaceBack__detailsHintText: {
    flex: 1,
    color: palette.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  cardFaceBack__actions: {
    flexDirection: 'row',
    gap: 10,
  },
  cardFaceBack__ghostButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.overlayPill,
  },
  cardFaceBack__ghostButtonText: {
    color: palette.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  cardFaceBack__primaryButton: {
    flex: 1.15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: palette.accentStrong,
  },
  cardFaceBack__primaryButtonText: {
    color: palette.background,
    fontSize: 15,
    fontWeight: '900',
  },
  metaPill: {
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.overlayPill,
  },
  metaPillCategory: {
    flex: 1.35,
  },
  metaPillIndex: {
    flex: 0.8,
  },
  metaPillDifficulty: {
    flex: 1,
  },
  metaPillCompact: {
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  metaPill__text: {
    color: palette.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  metaPill__textCompact: {
    fontSize: 10,
  },
  surface: {
    marginTop: 10,
    borderRadius: 22,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(96, 128, 168, 0.14)',
    backgroundColor: palette.footerPanel,
  },
  surfaceAccent: {
    marginTop: 16,
    backgroundColor: palette.answerPanel,
  },
  surfaceSubtle: {
    backgroundColor: palette.subtlePanel,
  },
  surface__head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  surface__label: {
    color: palette.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  surface__answer: {
    color: palette.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 26,
  },
  surface__body: {
    color: palette.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
});
