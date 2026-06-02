import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  PanResponder,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

import { useLearning } from "../context/LearningContext";
import { Card } from "../types/card";
import { palette } from "../theme/palette";

const ALL_CATEGORIES_LABEL = "Все темы";
const difficultyOptions = [
  { key: "all", label: "Все уровни" },
  { key: "easy", label: "Easy" },
  { key: "medium", label: "Medium" },
  { key: "hard", label: "Hard" }
] as const;

export function HomeScreen() {
  const {
    cards,
    isHydrated,
    markCardForReview,
    markCardKnown,
    progress,
    restart,
    stats
  } = useLearning();
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES_LABEL);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<(typeof difficultyOptions)[number]["key"]>("all");
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const swipeOffset = useRef(new Animated.Value(0)).current;
  const showAnswerRef = useRef(false);
  const currentCardRef = useRef<Card | null>(null);
  const isCompletingSwipeRef = useRef(false);
  const swipeThreshold = 82;
  const exitDistance = 540;

  const categories = useMemo(
    () => [ALL_CATEGORIES_LABEL, ...new Set(cards.map((card) => card.category))],
    [cards]
  );

  const filteredCards = useMemo(
    () =>
      cards.filter((card) => {
        const categoryMatches =
          selectedCategory === ALL_CATEGORIES_LABEL || card.category === selectedCategory;
        const difficultyMatches =
          selectedDifficulty === "all" || card.difficulty === selectedDifficulty;

        return categoryMatches && difficultyMatches;
      }),
    [cards, selectedCategory, selectedDifficulty]
  );

  const remainingCards = useMemo(
    () => filteredCards.filter((card) => !(card.id in progress)),
    [filteredCards, progress]
  );

  const currentCard = remainingCards[0] ?? null;
  const nextCard = remainingCards[1] ?? null;
  const completedInFeed = filteredCards.length - remainingCards.length;
  const cardPosition = currentCard
    ? Math.min(completedInFeed + 1, filteredCards.length)
    : filteredCards.length;

  useEffect(() => {
    showAnswerRef.current = showAnswer;
  }, [showAnswer]);

  useEffect(() => {
    currentCardRef.current = currentCard;
  }, [currentCard]);

  useEffect(() => {
    setShowHint(false);
    setShowAnswer(false);
    swipeOffset.setValue(0);
  }, [currentCard?.id, swipeOffset]);

  const resetCardPosition = () => {
    Animated.spring(swipeOffset, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 8,
      speed: 13
    }).start();
  };

  const completeSwipe = (card: Card, direction: "up" | "down") => {
    if (isCompletingSwipeRef.current) {
      return;
    }

    isCompletingSwipeRef.current = true;

    Animated.timing(swipeOffset, {
      toValue: direction === "up" ? -exitDistance : exitDistance,
      duration: 220,
      useNativeDriver: true
    }).start(() => {
      const action =
        direction === "up" ? markCardKnown(card.id) : markCardForReview(card.id);

      void action.finally(() => {
        swipeOffset.setValue(0);
        isCompletingSwipeRef.current = false;
      });
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          showAnswerRef.current &&
          !isCompletingSwipeRef.current &&
          Math.abs(gestureState.dy) > 8 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onMoveShouldSetPanResponderCapture: (_, gestureState) =>
          showAnswerRef.current &&
          !isCompletingSwipeRef.current &&
          Math.abs(gestureState.dy) > 8 &&
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderGrant: () => {
          swipeOffset.stopAnimation();
        },
        onPanResponderMove: (_, gestureState) => {
          const nextValue = Math.max(Math.min(gestureState.dy, 180), -180);
          swipeOffset.setValue(nextValue);
        },
        onPanResponderRelease: (_, gestureState) => {
          const liveCard = currentCardRef.current;

          if (!liveCard) {
            resetCardPosition();
            return;
          }

          if (gestureState.dy <= -swipeThreshold) {
            completeSwipe(liveCard, "up");
            return;
          }

          if (gestureState.dy >= swipeThreshold) {
            completeSwipe(liveCard, "down");
            return;
          }

          resetCardPosition();
        },
        onPanResponderTerminate: resetCardPosition,
        onPanResponderTerminationRequest: () => false
      }),
    [swipeOffset]
  );

  const swipeUpOpacity = swipeOffset.interpolate({
    inputRange: [-180, -54, 0],
    outputRange: [0.95, 0.25, 0],
    extrapolate: "clamp"
  });
  const swipeDownOpacity = swipeOffset.interpolate({
    inputRange: [0, 54, 180],
    outputRange: [0, 0.25, 0.95],
    extrapolate: "clamp"
  });
  const cardRotation = swipeOffset.interpolate({
    inputRange: [-180, 0, 180],
    outputRange: ["-4deg", "0deg", "4deg"]
  });
  const cardScale = swipeOffset.interpolate({
    inputRange: [-180, 0, 180],
    outputRange: [0.985, 1, 0.985]
  });

  const clearFilters = () => {
    setSelectedCategory(ALL_CATEGORIES_LABEL);
    setSelectedDifficulty("all");
  };

  if (!isHydrated) {
    return (
      <SafeAreaView style={styles.screen}>
        <BackgroundDecor />
        <View style={styles.loader}>
          <ActivityIndicator color={palette.accentStrong} size="large" />
          <Text style={styles.loaderText}>Поднимаем ленту карточек...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (filteredCards.length === 0) {
    return (
      <SafeAreaView style={styles.screen}>
        <BackgroundDecor />
        <View style={styles.emptyShell}>
          <Text style={styles.emptyEyebrow}>Фильтры</Text>
          <Text style={styles.emptyTitle}>Под этот набор фильтров карточек пока нет</Text>
          <Text style={styles.emptyText}>
            Попробуйте другую тему или верните все уровни сложности.
          </Text>
          <Pressable onPress={clearFilters} style={styles.primaryAction}>
            <Text style={styles.primaryActionText}>Сбросить фильтры</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentCard) {
    return (
      <SafeAreaView style={styles.screen}>
        <BackgroundDecor />
        <View style={styles.emptyShell}>
          <Text style={styles.emptyEyebrow}>Лента завершена</Text>
          <Text style={styles.emptyTitle}>В этой подборке все карточки уже отмечены</Text>
          <Text style={styles.emptyText}>
            Можно сменить фильтры или начать колоду заново и пройти команды еще раз.
          </Text>

          <View style={styles.finishStats}>
            <View style={styles.finishStatCard}>
              <Text style={styles.finishStatValue}>{stats.known}</Text>
              <Text style={styles.finishStatLabel}>Знаю</Text>
            </View>
            <View style={styles.finishStatCard}>
              <Text style={styles.finishStatValue}>{stats.review}</Text>
              <Text style={styles.finishStatLabel}>Повторить</Text>
            </View>
          </View>

          <Pressable onPress={clearFilters} style={styles.secondaryAction}>
            <Text style={styles.secondaryActionText}>Показать все карточки</Text>
          </Pressable>
          <Pressable onPress={() => void restart()} style={styles.primaryAction}>
            <Text style={styles.primaryActionText}>Пройти заново</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <BackgroundDecor />

      <View style={styles.chrome}>
        <View style={styles.chromeTopRow}>
          <View>
            <Text style={styles.brand}>LinuxSwipe</Text>
            <Text style={styles.feedTitle}>Лента команд</Text>
          </View>

          <View style={styles.progressPill}>
            <Text style={styles.progressPillText}>
              {cardPosition}/{filteredCards.length}
            </Text>
          </View>
        </View>

        <FilterRail
          onSelect={setSelectedCategory}
          options={categories}
          selectedValue={selectedCategory}
        />
        <FilterRail
          onSelect={(value) =>
            setSelectedDifficulty(value as (typeof difficultyOptions)[number]["key"])
          }
          options={difficultyOptions.map((option) => option.label)}
          optionKeys={difficultyOptions.map((option) => option.key)}
          selectedValue={selectedDifficulty}
        />
      </View>

      <View style={styles.feedStage}>
        {nextCard ? (
          <View style={styles.backCard}>
            <View style={styles.backCardGlow} />
            <Text style={styles.backCardLabel}>Следующая</Text>
            <Text style={styles.backCardCommand}>{nextCard.command}</Text>
            <Text numberOfLines={2} style={styles.backCardQuestion}>
              {nextCard.question}
            </Text>
          </View>
        ) : null}

        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.frontCard,
            {
              transform: [
                { translateY: swipeOffset },
                { rotate: cardRotation },
                { scale: cardScale }
              ]
            }
          ]}
        >
          <Animated.View
            pointerEvents="none"
            style={[styles.swipeOverlay, styles.knowOverlay, { opacity: swipeUpOpacity }]}
          >
            <Text style={styles.swipeOverlayTitle}>ЗНАЮ</Text>
            <Text style={styles.swipeOverlaySubtitle}>Свайп вверх</Text>
          </Animated.View>

          <Animated.View
            pointerEvents="none"
            style={[
              styles.swipeOverlay,
              styles.reviewOverlay,
              { opacity: swipeDownOpacity }
            ]}
          >
            <Text style={styles.swipeOverlayTitle}>ПОВТОРИТЬ</Text>
            <Text style={styles.swipeOverlaySubtitle}>Свайп вниз</Text>
          </Animated.View>

          <View style={styles.cardHeader}>
            <View style={styles.commandChip}>
              <Text style={styles.commandChipText}>{currentCard.command}</Text>
            </View>
            <Text style={styles.cardMeta}>
              {currentCard.category} · {currentCard.difficulty}
            </Text>
          </View>

          <View style={styles.questionBlock}>
            <Text style={styles.questionEyebrow}>Вопрос</Text>
            <Text style={styles.question}>{currentCard.question}</Text>
          </View>

          {showHint ? (
            <View style={styles.hintCard}>
              <Text style={styles.surfaceLabel}>Подсказка</Text>
              <Text style={styles.hintText}>{currentCard.hint}</Text>
            </View>
          ) : (
            <View style={styles.shortHelp}>
              <Text style={styles.shortHelpText}>
                Сначала откройте ответ, затем свайпните карточку вверх или вниз.
              </Text>
            </View>
          )}

          <View style={styles.bottomSurface}>
            {!showAnswer ? (
              <>
                <View style={styles.ctaRow}>
                  <Pressable
                    onPress={() => setShowHint((value) => !value)}
                    style={styles.ghostButton}
                  >
                    <Text style={styles.ghostButtonText}>
                      {showHint ? "Скрыть подсказку" : "Подсказка"}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setShowAnswer(true)}
                    style={styles.primaryButton}
                  >
                    <Text style={styles.primaryButtonText}>Показать ответ</Text>
                  </Pressable>
                </View>

                <View style={styles.feedStatsRow}>
                  <StatPill label="Знаю" value={stats.known} />
                  <StatPill label="Повторить" value={stats.review} />
                  <StatPill label="Осталось" value={remainingCards.length} />
                </View>
              </>
            ) : (
              <>
                <View style={styles.answerSurface}>
                  <Text style={styles.surfaceLabel}>Правильная команда</Text>
                  <Text style={styles.answer}>{currentCard.answer}</Text>
                </View>

                <View style={styles.swipeGuide}>
                  <Text style={styles.swipeGuideText}>
                    Свайп вверх — знаю, свайп вниз — повторить позже
                  </Text>
                </View>

                <View style={styles.ctaRow}>
                  <Pressable
                    onPress={() => completeSwipe(currentCard, "down")}
                    style={styles.ghostButton}
                  >
                    <Text style={styles.ghostButtonText}>Повторить позже</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => completeSwipe(currentCard, "up")}
                    style={styles.primaryButton}
                  >
                    <Text style={styles.primaryButtonText}>Знаю</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

function FilterRail({
  onSelect,
  optionKeys,
  options,
  selectedValue
}: {
  onSelect: (value: string) => void;
  optionKeys?: string[];
  options: string[];
  selectedValue: string;
}) {
  return (
    <ScrollView
      contentContainerStyle={styles.filterRail}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {options.map((label, index) => {
        const value = optionKeys?.[index] ?? label;
        const isActive = value === selectedValue;

        return (
          <Pressable
            key={value}
            onPress={() => onSelect(value)}
            style={[styles.filterChip, isActive && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statPillValue}>{value}</Text>
      <Text style={styles.statPillLabel}>{label}</Text>
    </View>
  );
}

function BackgroundDecor() {
  return (
    <>
      <View style={styles.backgroundBase} />
      <View style={styles.greenGlow} />
      <View style={styles.blueGlow} />
      <View style={styles.orangeGlow} />
      <View style={styles.gridLineLeft} />
      <View style={styles.gridLineRight} />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background
  },
  backgroundBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: palette.background
  },
  greenGlow: {
    position: "absolute",
    top: -150,
    left: -70,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: palette.glowMint
  },
  blueGlow: {
    position: "absolute",
    top: 120,
    right: -110,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: palette.glowBlue
  },
  orangeGlow: {
    position: "absolute",
    bottom: -100,
    left: 20,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: palette.glowAmber
  },
  gridLineLeft: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 30,
    width: 1,
    backgroundColor: palette.hairline
  },
  gridLineRight: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 30,
    width: 1,
    backgroundColor: palette.hairline
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12
  },
  loaderText: {
    color: palette.textSecondary,
    fontSize: 16
  },
  chrome: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 10
  },
  chromeTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12
  },
  brand: {
    color: palette.accentStrong,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.8,
    textTransform: "uppercase"
  },
  feedTitle: {
    marginTop: 4,
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: "800"
  },
  progressPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: palette.overlayPill,
    borderWidth: 1,
    borderColor: palette.borderStrong
  },
  progressPillText: {
    color: palette.textPrimary,
    fontSize: 13,
    fontWeight: "800"
  },
  filterRail: {
    gap: 8,
    paddingRight: 14
  },
  filterChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: palette.overlayPill,
    borderWidth: 1,
    borderColor: palette.border
  },
  filterChipActive: {
    backgroundColor: palette.accentStrong,
    borderColor: palette.accentStrong
  },
  filterText: {
    color: palette.textSecondary,
    fontSize: 13,
    fontWeight: "700"
  },
  filterTextActive: {
    color: palette.background
  },
  feedStage: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14
  },
  backCard: {
    position: "absolute",
    left: 28,
    right: 28,
    bottom: 26,
    height: "88%",
    borderRadius: 34,
    backgroundColor: "rgba(17, 28, 50, 0.55)",
    borderWidth: 1,
    borderColor: "rgba(77, 101, 138, 0.28)",
    padding: 22
  },
  backCardGlow: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 20,
    height: 80,
    borderRadius: 24,
    backgroundColor: "rgba(130, 245, 208, 0.08)"
  },
  backCardLabel: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase"
  },
  backCardCommand: {
    marginTop: 10,
    color: palette.accentStrong,
    fontSize: 22,
    fontWeight: "900"
  },
  backCardQuestion: {
    marginTop: 12,
    color: palette.textSecondary,
    fontSize: 19,
    lineHeight: 26,
    fontWeight: "700",
    maxWidth: "85%"
  },
  frontCard: {
    flex: 1,
    borderRadius: 34,
    backgroundColor: palette.panelElevated,
    borderWidth: 1,
    borderColor: palette.border,
    overflow: "hidden",
    padding: 22,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 30,
    elevation: 12
  },
  swipeOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24
  },
  knowOverlay: {
    top: 0,
    height: "48%",
    backgroundColor: palette.overlaySuccess
  },
  reviewOverlay: {
    bottom: 0,
    height: "48%",
    backgroundColor: palette.overlayWarning
  },
  swipeOverlayTitle: {
    color: palette.textPrimary,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 2
  },
  swipeOverlaySubtitle: {
    marginTop: 8,
    color: palette.textPrimary,
    fontSize: 14,
    fontWeight: "700"
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12
  },
  commandChip: {
    backgroundColor: palette.commandPill,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  commandChipText: {
    color: palette.commandText,
    fontSize: 22,
    fontWeight: "900"
  },
  cardMeta: {
    color: palette.textMuted,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "lowercase",
    marginTop: 8
  },
  questionBlock: {
    marginTop: 28,
    gap: 12
  },
  questionEyebrow: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.3,
    textTransform: "uppercase"
  },
  question: {
    color: palette.textPrimary,
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 40
  },
  hintCard: {
    marginTop: 18,
    backgroundColor: palette.subtlePanel,
    borderRadius: 22,
    padding: 16,
    gap: 8
  },
  shortHelp: {
    marginTop: 18,
    paddingVertical: 8
  },
  shortHelpText: {
    color: palette.textSecondary,
    fontSize: 16,
    lineHeight: 24
  },
  bottomSurface: {
    marginTop: "auto",
    gap: 12
  },
  ctaRow: {
    flexDirection: "row",
    gap: 10
  },
  ghostButton: {
    flex: 1,
    backgroundColor: palette.secondaryButton,
    borderRadius: 20,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: palette.border
  },
  ghostButtonText: {
    color: palette.textPrimary,
    fontSize: 15,
    fontWeight: "800"
  },
  primaryButton: {
    flex: 1.2,
    backgroundColor: palette.accentStrong,
    borderRadius: 20,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center"
  },
  primaryButtonText: {
    color: palette.background,
    fontSize: 16,
    fontWeight: "900"
  },
  feedStatsRow: {
    flexDirection: "row",
    gap: 10
  },
  statPill: {
    flex: 1,
    backgroundColor: palette.footerPanel,
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 8,
    alignItems: "center",
    gap: 2
  },
  statPillValue: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: "900"
  },
  statPillLabel: {
    color: palette.textMuted,
    fontSize: 11,
    fontWeight: "700"
  },
  answerSurface: {
    backgroundColor: palette.answerPanel,
    borderRadius: 24,
    padding: 18,
    gap: 10
  },
  surfaceLabel: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase"
  },
  hintText: {
    color: palette.textSecondary,
    fontSize: 15,
    lineHeight: 22
  },
  answer: {
    color: palette.textPrimary,
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 32
  },
  swipeGuide: {
    alignItems: "center",
    paddingVertical: 4
  },
  swipeGuideText: {
    color: palette.textSecondary,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center"
  },
  emptyShell: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 16
  },
  emptyEyebrow: {
    color: palette.accentStrong,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase"
  },
  emptyTitle: {
    color: palette.textPrimary,
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 36
  },
  emptyText: {
    color: palette.textSecondary,
    fontSize: 16,
    lineHeight: 24
  },
  primaryAction: {
    backgroundColor: palette.accentStrong,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: "center"
  },
  primaryActionText: {
    color: palette.background,
    fontSize: 16,
    fontWeight: "900"
  },
  secondaryAction: {
    backgroundColor: palette.overlayPill,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: palette.border
  },
  secondaryActionText: {
    color: palette.textPrimary,
    fontSize: 15,
    fontWeight: "800"
  },
  finishStats: {
    flexDirection: "row",
    gap: 12
  },
  finishStatCard: {
    flex: 1,
    backgroundColor: palette.footerPanel,
    borderRadius: 20,
    padding: 16,
    gap: 6
  },
  finishStatValue: {
    color: palette.textPrimary,
    fontSize: 28,
    fontWeight: "900"
  },
  finishStatLabel: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: "800"
  }
});
