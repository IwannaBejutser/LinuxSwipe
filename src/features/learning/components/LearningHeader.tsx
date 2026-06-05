import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FilterIcon } from '../../../shared/components/icons/AppIcons';
import { palette } from '../../../shared/theme/palette';

type LearningHeaderProps = {
  activeFiltersCount: number;
  isCompact?: boolean;
  onOpenFilters: () => void;
};

export function LearningHeader({
  activeFiltersCount,
  isCompact = false,
  onOpenFilters,
}: LearningHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.header__copy}>
        <Text style={[styles.header__brand, isCompact && styles.header__brandCompact]}>
          LinuxSwipe
        </Text>
        <Text style={[styles.header__title, isCompact && styles.header__titleCompact]}>
          Учебная сессия
        </Text>
      </View>

      <Pressable
        onPress={onOpenFilters}
        style={({ pressed }) => [
          styles.header__button,
          isCompact && styles.header__buttonCompact,
          pressed && styles.header__buttonPressed,
        ]}
      >
        <FilterIcon color={palette.textPrimary} size={16} />
        <Text
          style={[
            styles.header__buttonText,
            isCompact && styles.header__buttonTextCompact,
          ]}
        >
          {activeFiltersCount > 0 ? `Фильтры ${activeFiltersCount}` : 'Фильтры'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  header__copy: {
    flexShrink: 1,
  },
  header__brand: {
    color: palette.accentStrong,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  header__brandCompact: {
    fontSize: 10,
    letterSpacing: 1.4,
  },
  header__title: {
    marginTop: 4,
    color: palette.textPrimary,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 24,
  },
  header__titleCompact: {
    fontSize: 18,
    lineHeight: 22,
  },
  header__button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.overlayPill,
  },
  header__buttonCompact: {
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  header__buttonPressed: {
    opacity: 0.92,
  },
  header__buttonText: {
    color: palette.textPrimary,
    fontSize: 12,
    fontWeight: '800',
  },
  header__buttonTextCompact: {
    fontSize: 11,
  },
});
