import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { FilterIcon, KeyboardIcon } from '../../../shared/components/icons';
import { palette } from '../../../shared/theme';
import { getCategoryLabel } from '../lib/category';
import { SortMode } from '../lib/commandReference';
import { commandReferenceStyles as styles } from './commandReferenceStyles';

type CommandReferenceControlsProps = {
  categories: string[];
  commandCount: number;
  query: string;
  scenarioCount: number;
  selectedCategory: string;
  sortMode: SortMode;
  topicCount: number;
  visibleCount: number;
  onChangeQuery: (query: string) => void;
  onSelectCategory: (category: string) => void;
  onSelectSortMode: (sortMode: SortMode) => void;
};

export function CommandReferenceControls({
  categories,
  commandCount,
  query,
  scenarioCount,
  selectedCategory,
  sortMode,
  topicCount,
  visibleCount,
  onChangeQuery,
  onSelectCategory,
  onSelectSortMode,
}: CommandReferenceControlsProps) {
  return (
    <>
      <View style={styles.summary}>
        <SummaryPill label="Команд" value={commandCount.toString()} />
        <SummaryPill label="Сценариев" value={scenarioCount.toString()} />
        <SummaryPill label="Тем" value={topicCount.toString()} />
      </View>

      <View style={styles.searchPanel}>
        <View style={styles.searchPanel__icon}>
          <KeyboardIcon color={palette.accentStrong} size={18} />
        </View>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={onChangeQuery}
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
          onPress={() => onSelectSortMode('alphabet')}
        />
        <SortChip
          isActive={sortMode === 'practice'}
          label="Больше сценариев"
          onPress={() => onSelectSortMode('practice')}
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
          onPress={() => onSelectCategory('all')}
        />
        {categories.map((category) => (
          <CategoryChip
            isActive={selectedCategory === category}
            key={category}
            label={getCategoryLabel(category)}
            onPress={() => onSelectCategory(category)}
          />
        ))}
      </ScrollView>

      <View style={styles.resultHeader}>
        <Text style={styles.resultHeader__title}>{visibleCount} в справочнике</Text>
        <View style={styles.resultHeader__badge}>
          <FilterIcon color={palette.accentStrong} size={15} />
          <Text style={styles.resultHeader__badgeText}>
            {selectedCategory === 'all' ? 'Все темы' : getCategoryLabel(selectedCategory)}
          </Text>
        </View>
      </View>
    </>
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
