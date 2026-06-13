import { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

import { AnimatedBackdrop } from '../../../shared/components/AnimatedBackdrop';
import { CommandDetailsModal } from '../components/CommandDetailsModal';
import { CommandReferenceCard } from '../components/CommandReferenceCard';
import { CommandReferenceControls } from '../components/CommandReferenceControls';
import { commandReferenceStyles as styles } from '../components/commandReferenceStyles';
import { useLearning } from '../context/LearningContext';
import {
  buildCommandCategories,
  buildCommandReferences,
  CommandReference,
  filterCommandReferences,
  SortMode,
} from '../lib/commandReference';

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
  const categories = useMemo(() => buildCommandCategories(cards), [cards]);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredReferences = useMemo(
    () =>
      filterCommandReferences({
        commandReferences,
        normalizedQuery,
        selectedCategory,
        sortMode,
      }),
    [commandReferences, normalizedQuery, selectedCategory, sortMode],
  );

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

        <CommandReferenceControls
          categories={categories}
          commandCount={commandReferences.length}
          onChangeQuery={setQuery}
          onSelectCategory={setSelectedCategory}
          onSelectSortMode={setSortMode}
          query={query}
          scenarioCount={cards.length}
          selectedCategory={selectedCategory}
          sortMode={sortMode}
          topicCount={categories.length}
          visibleCount={filteredReferences.length}
        />

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
