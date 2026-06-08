import { ReactNode, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { AnimatedBackdrop } from '../../../shared/components/AnimatedBackdrop';
import { FilterIcon, KeyboardIcon, SparkIcon } from '../../../shared/components/icons';
import { palette } from '../../../shared/theme';
import { useLearning } from '../context/LearningContext';
import { getCategoryLabel } from '../lib/category';
import { Card } from '../types/card';

type CommandReference = {
  cards: Card[];
  categories: string[];
  command: string;
  difficulties: Card['difficulty'][];
};

type SortMode = 'alphabet' | 'practice';

const difficultyOrder: Record<Card['difficulty'], number> = {
  easy: 0,
  medium: 1,
  hard: 2,
};

function buildCommandReferences(cards: Card[]) {
  const commandMap = new Map<string, CommandReference>();

  cards.forEach((card) => {
    const currentReference = commandMap.get(card.command) ?? {
      cards: [],
      categories: [],
      command: card.command,
      difficulties: [],
    };

    currentReference.cards.push(card);

    if (!currentReference.categories.includes(card.category)) {
      currentReference.categories.push(card.category);
    }

    if (!currentReference.difficulties.includes(card.difficulty)) {
      currentReference.difficulties.push(card.difficulty);
    }

    commandMap.set(card.command, currentReference);
  });

  return Array.from(commandMap.values())
    .map((reference) => ({
      ...reference,
      categories: reference.categories.sort((left, right) =>
        getCategoryLabel(left).localeCompare(getCategoryLabel(right)),
      ),
      difficulties: reference.difficulties.sort(
        (left, right) => difficultyOrder[left] - difficultyOrder[right],
      ),
    }))
    .sort((left, right) => left.command.localeCompare(right.command));
}

function getDifficultyLabel(difficulty: Card['difficulty']) {
  const labels: Record<Card['difficulty'], string> = {
    easy: 'Легко',
    hard: 'Сложно',
    medium: 'Средне',
  };

  return labels[difficulty];
}

function getCommandSummary(reference: CommandReference) {
  const [firstCard] = reference.cards;

  if (!firstCard) {
    return 'Команда пока без описания.';
  }

  return firstCard.explanation.split(' Запоминайте ее как связку:')[0];
}

function getSearchIndex(reference: CommandReference) {
  return [
    reference.command,
    ...reference.categories.map(getCategoryLabel),
    ...reference.cards.flatMap((card) => [
      card.answer,
      card.example,
      card.explanation,
      card.hint,
      card.question,
    ]),
  ]
    .join(' ')
    .toLowerCase();
}

function getUniqueAnswers(reference: CommandReference) {
  return Array.from(new Set(reference.cards.map((card) => card.answer)));
}

export function CommandsScreen() {
  const { cards } = useLearning();
  const tabBarHeight = useBottomTabBarHeight();
  const { width } = useWindowDimensions();
  const frameWidth = width >= 768 ? Math.min(width - 32, 720) : Math.max(width - 32, 0);
  const frameMaxWidth = width >= 768 ? 720 : undefined;
  const [query, setQuery] = useState('');
  const [selectedReference, setSelectedReference] = useState<CommandReference | null>(
    null,
  );
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortMode, setSortMode] = useState<SortMode>('alphabet');

  const commandReferences = useMemo(() => buildCommandReferences(cards), [cards]);
  const categories = useMemo(
    () =>
      Array.from(new Set(cards.map((card) => card.category))).sort((left, right) =>
        getCategoryLabel(left).localeCompare(getCategoryLabel(right)),
      ),
    [cards],
  );
  const normalizedQuery = query.trim().toLowerCase();
  const filteredReferences = useMemo(() => {
    const nextReferences = commandReferences.filter((reference) => {
      const matchesCategory =
        selectedCategory === 'all' || reference.categories.includes(selectedCategory);
      const matchesQuery =
        normalizedQuery.length === 0 ||
        getSearchIndex(reference).includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });

    if (sortMode === 'practice') {
      return nextReferences.sort(
        (left, right) =>
          right.cards.length - left.cards.length ||
          left.command.localeCompare(right.command),
      );
    }

    return nextReferences;
  }, [commandReferences, normalizedQuery, selectedCategory, sortMode]);

  return (
    <SafeAreaView style={styles.screen}>
      <AnimatedBackdrop />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: tabBarHeight + 96, width: frameWidth },
          frameMaxWidth ? { maxWidth: frameMaxWidth } : null,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.hero__eyebrow}>LinuxSwipe Reference</Text>
          <Text style={styles.hero__title}>Команды под рукой</Text>
          <Text style={styles.hero__body}>
            Справочник собирается из учебной колоды: что делает команда, где пригодится и
            какие варианты уже встречались в карточках.
          </Text>
        </View>

        <View style={styles.summary}>
          <SummaryPill label="Команд" value={commandReferences.length.toString()} />
          <SummaryPill label="Сценариев" value={cards.length.toString()} />
          <SummaryPill label="Тем" value={categories.length.toString()} />
        </View>

        <View style={styles.searchPanel}>
          <View style={styles.searchPanel__icon}>
            <KeyboardIcon color={palette.accentStrong} size={18} />
          </View>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setQuery}
            placeholder="grep, права, сеть, systemctl..."
            placeholderTextColor={palette.textMuted}
            selectionColor={palette.accentStrong}
            style={styles.searchPanel__input}
            value={query}
          />
        </View>

        <View style={styles.sortRail}>
          <SortChip
            isActive={sortMode === 'alphabet'}
            label="Алфавит"
            onPress={() => setSortMode('alphabet')}
          />
          <SortChip
            isActive={sortMode === 'practice'}
            label="Больше сценариев"
            onPress={() => setSortMode('practice')}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.filters}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <CategoryChip
            isActive={selectedCategory === 'all'}
            label="Все темы"
            onPress={() => setSelectedCategory('all')}
          />
          {categories.map((category) => (
            <CategoryChip
              isActive={selectedCategory === category}
              key={category}
              label={getCategoryLabel(category)}
              onPress={() => setSelectedCategory(category)}
            />
          ))}
        </ScrollView>

        <View style={styles.resultHeader}>
          <Text style={styles.resultHeader__title}>
            {filteredReferences.length} в справочнике
          </Text>
          <View style={styles.resultHeader__badge}>
            <FilterIcon color={palette.accentStrong} size={15} />
            <Text style={styles.resultHeader__badgeText}>
              {selectedCategory === 'all'
                ? 'Все темы'
                : getCategoryLabel(selectedCategory)}
            </Text>
          </View>
        </View>

        <View style={styles.commandList}>
          {filteredReferences.length > 0 ? (
            filteredReferences.map((reference) => (
              <CommandReferenceCard
                key={reference.command}
                onOpen={() => setSelectedReference(reference)}
                reference={reference}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyState__title}>Ничего не нашли</Text>
              <Text style={styles.emptyState__body}>
                Попробуйте другой запрос или вернитесь к полному списку тем.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <CommandDetailsModal
        onClose={() => setSelectedReference(null)}
        reference={selectedReference}
        visible={selectedReference !== null}
      />
    </SafeAreaView>
  );
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryPill}>
      <Text style={styles.summaryPill__value}>{value}</Text>
      <Text style={styles.summaryPill__label}>{label}</Text>
    </View>
  );
}

function CategoryChip({
  isActive,
  label,
  onPress,
}: {
  isActive: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      onPress={onPress}
      style={[styles.categoryChip, isActive && styles.categoryChipActive]}
    >
      <Text
        style={[styles.categoryChip__text, isActive && styles.categoryChip__textActive]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function SortChip({
  isActive,
  label,
  onPress,
}: {
  isActive: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
      onPress={onPress}
      style={[styles.sortChip, isActive && styles.sortChipActive]}
    >
      <Text style={[styles.sortChip__text, isActive && styles.sortChip__textActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function CommandReferenceCard({
  onOpen,
  reference,
}: {
  onOpen: () => void;
  reference: CommandReference;
}) {
  const [primaryCard, ...relatedCards] = reference.cards;

  return (
    <Pressable
      accessibilityLabel={`Открыть справку по команде ${reference.command}`}
      accessibilityRole="button"
      onPress={onOpen}
      style={({ pressed }) => [styles.commandCard, pressed && styles.commandCardPressed]}
    >
      <View style={styles.commandCard__header}>
        <View style={styles.commandCard__mark}>
          <SparkIcon color={palette.accentStrong} size={16} />
        </View>
        <View style={styles.commandCard__heading}>
          <Text style={styles.commandCard__command}>{reference.command}</Text>
          <Text style={styles.commandCard__meta}>
            {reference.cards.length} сценариев ·{' '}
            {reference.categories.map(getCategoryLabel).join(', ')}
          </Text>
        </View>
      </View>

      <Text style={styles.commandCard__summary}>{getCommandSummary(reference)}</Text>

      {primaryCard ? (
        <View style={styles.commandCard__example}>
          <Text style={styles.commandCard__exampleLabel}>Пример</Text>
          <Text style={styles.commandCard__answer}>{primaryCard.answer}</Text>
          <Text style={styles.commandCard__exampleBody}>{primaryCard.example}</Text>
        </View>
      ) : null}

      <View style={styles.commandCard__footer}>
        <View style={styles.commandCard__chips}>
          {reference.difficulties.map((difficulty) => (
            <View key={difficulty} style={styles.commandCard__chip}>
              <Text style={styles.commandCard__chipText}>
                {getDifficultyLabel(difficulty)}
              </Text>
            </View>
          ))}
        </View>
        {relatedCards.length > 0 ? (
          <Text style={styles.commandCard__more}>+{relatedCards.length} еще</Text>
        ) : (
          <Text style={styles.commandCard__more}>Открыть</Text>
        )}
      </View>
    </Pressable>
  );
}

function CommandDetailsModal({
  onClose,
  reference,
  visible,
}: {
  onClose: () => void;
  reference: CommandReference | null;
  visible: boolean;
}) {
  if (!reference) {
    return null;
  }

  const answers = getUniqueAnswers(reference);

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
      visible={visible}
    >
      <SafeAreaView style={styles.detailsScreen}>
        <View style={styles.detailsHeader}>
          <View style={styles.detailsHeader__copy}>
            <Text style={styles.detailsHeader__eyebrow}>Справочник команд</Text>
            <Text style={styles.detailsHeader__title}>{reference.command}</Text>
          </View>
          <Pressable onPress={onClose} style={styles.detailsHeader__closeButton}>
            <Text style={styles.detailsHeader__closeButtonText}>Закрыть</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.detailsContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.detailsHero}>
            <View style={styles.detailsHero__meta}>
              <Text style={styles.detailsHero__metaText}>
                {reference.cards.length} сценариев
              </Text>
              <Text style={styles.detailsHero__metaText}>
                {reference.categories.map(getCategoryLabel).join(', ')}
              </Text>
            </View>
            <Text style={styles.detailsHero__summary}>
              {getCommandSummary(reference)}
            </Text>
          </View>

          <DetailsPanel title="Типовые варианты">
            {answers.slice(0, 8).map((answer) => (
              <View key={answer} style={styles.answerRow}>
                <Text style={styles.answerRow__text}>{answer}</Text>
              </View>
            ))}
          </DetailsPanel>

          <DetailsPanel title="Где пригодится">
            {reference.cards.map((card) => (
              <View key={card.id} style={styles.scenarioRow}>
                <View style={styles.scenarioRow__header}>
                  <Text style={styles.scenarioRow__category}>
                    {getCategoryLabel(card.category)}
                  </Text>
                  <Text style={styles.scenarioRow__difficulty}>
                    {getDifficultyLabel(card.difficulty)}
                  </Text>
                </View>
                <Text style={styles.scenarioRow__question}>{card.question}</Text>
                <Text style={styles.scenarioRow__answer}>{card.answer}</Text>
                <Text style={styles.scenarioRow__body}>{card.example}</Text>
              </View>
            ))}
          </DetailsPanel>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function DetailsPanel({ children, title }: { children: ReactNode; title: string }) {
  return (
    <View style={styles.detailsPanel}>
      <Text style={styles.detailsPanel__title}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    alignSelf: 'center',
    gap: 18,
    paddingHorizontal: 0,
    paddingTop: 24,
  },
  hero: {
    gap: 10,
    paddingTop: 10,
  },
  hero__eyebrow: {
    color: palette.accentStrong,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 3.5,
    textTransform: 'uppercase',
  },
  hero__title: {
    color: palette.textPrimary,
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 38,
  },
  hero__body: {
    color: palette.textSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  summary: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryPill: {
    flex: 1,
    gap: 5,
    padding: 16,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 22,
    backgroundColor: 'rgba(7, 10, 14, 0.78)',
  },
  summaryPill__value: {
    color: palette.textPrimary,
    fontSize: 24,
    fontWeight: '900',
  },
  summaryPill__label: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  searchPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 24,
    backgroundColor: 'rgba(7, 10, 14, 0.88)',
  },
  searchPanel__icon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: 'rgba(130, 245, 208, 0.08)',
  },
  searchPanel__input: {
    flex: 1,
    color: palette.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  filters: {
    gap: 10,
    paddingRight: 12,
  },
  sortRail: {
    flexDirection: 'row',
    gap: 10,
  },
  sortChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 999,
    backgroundColor: 'rgba(7, 10, 14, 0.74)',
  },
  sortChipActive: {
    borderColor: 'rgba(130, 245, 208, 0.32)',
    backgroundColor: 'rgba(130, 245, 208, 0.08)',
  },
  sortChip__text: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: '900',
  },
  sortChip__textActive: {
    color: palette.accentStrong,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 999,
    backgroundColor: palette.overlayPill,
  },
  categoryChipActive: {
    borderColor: 'rgba(130, 245, 208, 0.48)',
    backgroundColor: palette.accentStrong,
  },
  categoryChip__text: {
    color: palette.textSecondary,
    fontSize: 13,
    fontWeight: '800',
  },
  categoryChip__textActive: {
    color: palette.background,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  resultHeader__title: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: '900',
  },
  resultHeader__badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 999,
    backgroundColor: palette.overlayPill,
  },
  resultHeader__badgeText: {
    color: palette.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  commandList: {
    gap: 14,
  },
  commandCard: {
    gap: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 26,
    backgroundColor: 'rgba(7, 10, 14, 0.86)',
  },
  commandCardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.992 }],
  },
  commandCard__header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  commandCard__mark: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: 'rgba(130, 245, 208, 0.08)',
  },
  commandCard__heading: {
    flex: 1,
    gap: 4,
  },
  commandCard__command: {
    color: palette.commandText,
    fontSize: 23,
    fontWeight: '900',
  },
  commandCard__meta: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  commandCard__summary: {
    color: palette.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  commandCard__example: {
    gap: 8,
    padding: 14,
    borderRadius: 20,
    backgroundColor: palette.panelElevated,
  },
  commandCard__exampleLabel: {
    color: palette.accentStrong,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  commandCard__answer: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '900',
  },
  commandCard__exampleBody: {
    color: palette.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  commandCard__footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  commandCard__chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  commandCard__chip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: palette.hairline,
    borderRadius: 999,
    backgroundColor: palette.overlayPill,
  },
  commandCard__chipText: {
    color: palette.textSecondary,
    fontSize: 11,
    fontWeight: '800',
  },
  commandCard__more: {
    color: palette.accentStrong,
    fontSize: 12,
    fontWeight: '900',
  },
  emptyState: {
    gap: 8,
    padding: 22,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 26,
    backgroundColor: 'rgba(7, 10, 14, 0.82)',
  },
  emptyState__title: {
    color: palette.textPrimary,
    fontSize: 20,
    fontWeight: '900',
  },
  emptyState__body: {
    color: palette.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  detailsScreen: {
    flex: 1,
    backgroundColor: palette.background,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: palette.hairline,
    backgroundColor: 'rgba(1, 2, 3, 0.96)',
  },
  detailsHeader__copy: {
    flex: 1,
    gap: 4,
  },
  detailsHeader__eyebrow: {
    color: palette.accentStrong,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  detailsHeader__title: {
    color: palette.commandText,
    fontSize: 30,
    fontWeight: '900',
  },
  detailsHeader__closeButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: palette.hairline,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  detailsHeader__closeButtonText: {
    color: palette.textSecondary,
    fontSize: 12,
    fontWeight: '800',
  },
  detailsContent: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 760,
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 42,
  },
  detailsHero: {
    gap: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 28,
    backgroundColor: palette.panel,
  },
  detailsHero__meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailsHero__metaText: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: '800',
  },
  detailsHero__summary: {
    color: palette.textSecondary,
    fontSize: 15,
    lineHeight: 23,
  },
  detailsPanel: {
    gap: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 26,
    backgroundColor: 'rgba(7, 10, 14, 0.86)',
  },
  detailsPanel__title: {
    color: palette.accentStrong,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.7,
    textTransform: 'uppercase',
  },
  answerRow: {
    padding: 14,
    borderRadius: 18,
    backgroundColor: palette.panelElevated,
  },
  answerRow__text: {
    color: palette.textPrimary,
    fontSize: 15,
    fontWeight: '900',
    lineHeight: 21,
  },
  scenarioRow: {
    gap: 8,
    padding: 14,
    borderRadius: 20,
    backgroundColor: palette.panelElevated,
  },
  scenarioRow__header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  scenarioRow__category: {
    color: palette.accentStrong,
    fontSize: 11,
    fontWeight: '900',
  },
  scenarioRow__difficulty: {
    color: palette.textMuted,
    fontSize: 11,
    fontWeight: '800',
  },
  scenarioRow__question: {
    color: palette.textPrimary,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 22,
  },
  scenarioRow__answer: {
    color: palette.commandText,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 20,
  },
  scenarioRow__body: {
    color: palette.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
});
