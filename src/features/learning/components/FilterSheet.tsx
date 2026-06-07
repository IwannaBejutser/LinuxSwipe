import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FilterIcon } from '../../../shared/components/icons/AppIcons';
import { palette } from '../../../shared/theme/palette';
import { getCategoryLabel } from '../lib/category';
import {
  CollectionFilter,
  collectionOptions,
  deckModeOptions,
  DeckMode,
  difficultyOptions,
  DifficultyFilter,
} from '../lib/deckBuilder';
import { BottomSheetPanel } from './BottomSheetPanel';

type FilterSheetProps = {
  categories: string[];
  dailyGoal: number;
  deckMode: DeckMode;
  onClearFilters: () => void;
  onClose: () => void;
  onResetOnboarding: () => void;
  onSelectCollection: (value: CollectionFilter) => void;
  onSelectDailyGoal: (value: number) => void;
  onSelectCategory: (value: string) => void;
  onSelectDeckMode: (value: DeckMode) => void;
  onSelectDifficulty: (value: DifficultyFilter) => void;
  selectedCategory: string;
  selectedCollection: CollectionFilter;
  selectedDifficulty: DifficultyFilter;
  visible: boolean;
};

export function FilterSheet({
  categories,
  dailyGoal,
  deckMode,
  onClearFilters,
  onClose,
  onResetOnboarding,
  onSelectCollection,
  onSelectDailyGoal,
  onSelectCategory,
  onSelectDeckMode,
  onSelectDifficulty,
  selectedCategory,
  selectedCollection,
  selectedDifficulty,
  visible,
}: FilterSheetProps) {
  return (
    <BottomSheetPanel onClose={onClose} visible={visible}>
      <View style={styles.sheet__head}>
        <View style={styles.sheet__titleIcon}>
          <FilterIcon color={palette.accentStrong} size={18} />
        </View>
        <View style={styles.sheet__titleCopy}>
          <Text style={styles.sheet__title}>Фильтры сессии</Text>
          <Text style={styles.sheet__subtitle}>
            Настройте колоду, не перегружая главный экран и не отнимая высоту у карточки.
          </Text>
        </View>
      </View>

      <View style={styles.sheet__section}>
        <Text style={styles.sheet__sectionTitle}>Режим колоды</Text>
        <FilterRail
          onSelect={(value) => onSelectDeckMode(value as DeckMode)}
          optionKeys={deckModeOptions.map((option) => option.key)}
          options={deckModeOptions.map((option) => option.label)}
          selectedValue={deckMode}
        />
      </View>

      <View style={styles.sheet__section}>
        <Text style={styles.sheet__sectionTitle}>Тема</Text>
        <FilterRail
          onSelect={onSelectCategory}
          optionKeys={categories}
          options={categories.map(getCategoryLabel)}
          selectedValue={selectedCategory}
        />
      </View>

      <View style={styles.sheet__section}>
        <Text style={styles.sheet__sectionTitle}>Сложность</Text>
        <FilterRail
          onSelect={(value) => onSelectDifficulty(value as DifficultyFilter)}
          optionKeys={difficultyOptions.map((option) => option.key)}
          options={difficultyOptions.map((option) => option.label)}
          selectedValue={selectedDifficulty}
        />
      </View>

      <View style={styles.sheet__section}>
        <Text style={styles.sheet__sectionTitle}>Подборка</Text>
        <FilterRail
          onSelect={(value) => onSelectCollection(value as CollectionFilter)}
          optionKeys={collectionOptions.map((option) => option.key)}
          options={collectionOptions.map((option) => option.label)}
          selectedValue={selectedCollection}
        />
      </View>

      <View style={styles.sheet__section}>
        <Text style={styles.sheet__sectionTitle}>Дневная цель</Text>
        <FilterRail
          onSelect={(value) => onSelectDailyGoal(Number(value))}
          optionKeys={['5', '10', '15']}
          options={['5 карточек', '10 карточек', '15 карточек']}
          selectedValue={String(dailyGoal)}
        />
      </View>

      <Pressable onPress={onResetOnboarding} style={styles.sheet__resetLearning}>
        <Text style={styles.sheet__resetLearningTitle}>Показать обучение снова</Text>
        <Text style={styles.sheet__resetLearningBody}>
          Откроет короткую демо-карточку со свайпами и ручной проверкой.
        </Text>
      </Pressable>

      <View style={styles.sheet__actions}>
        <Pressable onPress={onClearFilters} style={styles.sheet__ghostButton}>
          <Text style={styles.sheet__ghostButtonText}>Сбросить</Text>
        </Pressable>
        <Pressable onPress={onClose} style={styles.sheet__primaryButton}>
          <Text style={styles.sheet__primaryButtonText}>Готово</Text>
        </Pressable>
      </View>
    </BottomSheetPanel>
  );
}

function FilterRail({
  onSelect,
  optionKeys,
  options,
  selectedValue,
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
            style={[styles.filterRail__chip, isActive && styles.filterRail__chipActive]}
          >
            <Text
              style={[
                styles.filterRail__chipText,
                isActive && styles.filterRail__chipTextActive,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sheet__head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  sheet__titleIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(130, 245, 208, 0.08)',
  },
  sheet__titleCopy: {
    flex: 1,
    gap: 6,
  },
  sheet__title: {
    color: palette.textPrimary,
    fontSize: 24,
    fontWeight: '900',
  },
  sheet__subtitle: {
    color: palette.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  sheet__section: {
    gap: 8,
  },
  sheet__sectionTitle: {
    color: palette.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  sheet__resetLearning: {
    gap: 5,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.hairline,
    backgroundColor: 'rgba(130, 245, 208, 0.05)',
    padding: 14,
  },
  sheet__resetLearningTitle: {
    color: palette.textPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  sheet__resetLearningBody: {
    color: palette.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  filterRail: {
    gap: 8,
    paddingRight: 10,
  },
  filterRail__chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.overlayPill,
  },
  filterRail__chipActive: {
    borderColor: palette.accentStrong,
    backgroundColor: palette.accentStrong,
  },
  filterRail__chipText: {
    color: palette.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  filterRail__chipTextActive: {
    color: palette.background,
  },
  sheet__actions: {
    flexDirection: 'row',
    gap: 12,
  },
  sheet__ghostButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.overlayPill,
  },
  sheet__ghostButtonText: {
    color: palette.textPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  sheet__primaryButton: {
    flex: 1.2,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.accentStrong,
  },
  sheet__primaryButtonText: {
    color: palette.background,
    fontSize: 15,
    fontWeight: '900',
  },
});
