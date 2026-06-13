import { useEffect, useRef } from 'react';
import {
  Animated,
  GestureResponderHandlers,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  CheckIcon,
  KeyboardIcon,
  SparkIcon,
} from '../../../shared/components/icons/AppIcons';
import { Card } from '../types/card';
import { getCategoryLabel } from '../lib/category';
import { getDifficultyLabel } from '../lib/difficulty';
import { palette } from '../../../shared/theme/palette';
import { LearningCardMetaPill } from './LearningCardMetaPill';
import { LearningCardSurface } from './LearningCardSurface';
import { LearningSwipeCoach } from './LearningSwipeCoach';
import { learningCardStyles as styles } from './learningCardStyles';

type LearningCardProps = {
  currentCard: Card;
  deckLabel: string;
  flipProgress: Animated.Value;
  isCompact?: boolean;
  isCardFlipped: boolean;
  nextCard: Card | null;
  onOpenManualAnswer?: () => void;
  onOpenDetails: () => void;
  onToggleFace: () => void;
  panHandlers: GestureResponderHandlers;
  sessionIndex: number;
  sessionTotal: number;
  showSwipeCoach?: boolean;
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
  onOpenManualAnswer,
  onOpenDetails,
  onToggleFace,
  panHandlers,
  sessionIndex,
  sessionTotal,
  showSwipeCoach = false,
  successGlow,
  swipeOffset,
  warningGlow,
}: LearningCardProps) {
  const { width } = useWindowDimensions();
  const isNarrow = isCompact || width < 390;
  const questionFontSize = isNarrow ? 24 : 32;
  const questionLineHeight = isNarrow ? 30 : 38;
  const coachProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!showSwipeCoach || isCardFlipped) {
      coachProgress.stopAnimation();
      coachProgress.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(coachProgress, {
          toValue: 1,
          duration: 760,
          useNativeDriver: true,
        }),
        Animated.timing(coachProgress, {
          toValue: 0,
          duration: 420,
          useNativeDriver: true,
        }),
        Animated.timing(coachProgress, {
          toValue: -1,
          duration: 760,
          useNativeDriver: true,
        }),
        Animated.timing(coachProgress, {
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
  }, [coachProgress, isCardFlipped, showSwipeCoach]);

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
  const coachTranslateY = coachProgress.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [14, 0, -14],
  });
  const coachTilt = coachProgress.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['2deg', '0deg', '-2deg'],
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

      <Animated.View
        {...panHandlers}
        style={[
          styles.card,
          {
            transform: [
              { translateY: Animated.add(swipeOffset, coachTranslateY) },
              { rotate: cardRotation },
              { rotateZ: coachTilt },
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
        {showSwipeCoach && !isCardFlipped ? (
          <LearningSwipeCoach coachProgress={coachProgress} />
        ) : null}

        <Animated.View
          pointerEvents={isCardFlipped ? 'none' : 'auto'}
          style={[
            styles.cardFace,
            {
              opacity: frontFaceOpacity,
              pointerEvents: isCardFlipped ? 'none' : 'auto',
              zIndex: isCardFlipped ? 0 : 2,
              transform: [{ perspective: 1400 }, { rotateY: frontFaceRotation }],
            },
          ]}
        >
          <View style={styles.cardFace__pressable}>
            <View style={styles.cardFace__metaRail}>
              <LearningCardMetaPill
                isCompact={isNarrow}
                label={getCategoryLabel(currentCard.category)}
                variant="category"
              />
              <LearningCardMetaPill
                isCompact={isNarrow}
                label={`${sessionIndex}/${sessionTotal}`}
                variant="index"
              />
              <LearningCardMetaPill
                isCompact={isNarrow}
                label={getDifficultyLabel(currentCard.difficulty)}
                variant="difficulty"
              />
            </View>

            <Pressable
              accessibilityLabel="Перевернуть карточку"
              accessibilityRole="button"
              onPress={onToggleFace}
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
            </Pressable>

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
                {onOpenManualAnswer ? (
                  <Pressable
                    accessibilityLabel="Открыть ручной ответ"
                    accessibilityRole="button"
                    onPress={onOpenManualAnswer}
                    style={({ pressed }) => [
                      styles.cardFace__manualButton,
                      pressed && styles.cardFace__manualButtonPressed,
                    ]}
                  >
                    <KeyboardIcon color={palette.accentStrong} size={15} />
                    <Text style={styles.cardFace__manualButtonText}>Ответ руками</Text>
                  </Pressable>
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
          </View>
        </Animated.View>

        <Animated.View
          pointerEvents={isCardFlipped ? 'auto' : 'none'}
          style={[
            styles.cardFace,
            styles.cardFaceBack,
            {
              opacity: backFaceOpacity,
              pointerEvents: isCardFlipped ? 'auto' : 'none',
              zIndex: isCardFlipped ? 2 : 0,
              transform: [{ perspective: 1400 }, { rotateY: backFaceRotation }],
            },
          ]}
        >
          <View style={styles.cardFace__pressable}>
            <View style={styles.cardFace__metaRail}>
              <LearningCardMetaPill
                isCompact={isNarrow}
                label={getCategoryLabel(currentCard.category)}
                variant="category"
              />
              <LearningCardMetaPill
                isCompact={isNarrow}
                label={`${sessionIndex}/${sessionTotal}`}
                variant="index"
              />
              <LearningCardMetaPill
                isCompact={isNarrow}
                label={getDifficultyLabel(currentCard.difficulty)}
                variant="difficulty"
              />
            </View>

            <Pressable
              accessibilityLabel="Вернуться к вопросу"
              accessibilityRole="button"
              onPress={onToggleFace}
            >
              <LearningCardSurface
                body={currentCard.answer}
                icon={<CheckIcon color={palette.accentStrong} size={18} />}
                title="Правильный ответ"
                tone="accent"
              />
            </Pressable>

            <LearningCardSurface
              body={currentCard.example}
              icon={<SparkIcon color={palette.accentStrong} size={16} />}
              title="Когда пригодится"
              tone="subtle"
            />

            <View style={styles.cardFaceBack__detailsWrap}>
              <View style={styles.cardFaceBack__detailsHint}>
                <SparkIcon color={palette.accentStrong} size={16} />
                <Text style={styles.cardFaceBack__detailsHintText}>
                  Полное объяснение, контекст и подсказка живут в отдельном окне.
                </Text>
              </View>

              <View style={styles.cardFaceBack__actions}>
                <Pressable
                  accessibilityLabel="Вернуться к вопросу"
                  accessibilityRole="button"
                  onPress={onToggleFace}
                  style={styles.cardFaceBack__ghostButton}
                >
                  <Text style={styles.cardFaceBack__ghostButtonText}>Назад</Text>
                </Pressable>
                <Pressable
                  accessibilityLabel="Открыть подробности карточки"
                  accessibilityRole="button"
                  hitSlop={8}
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
