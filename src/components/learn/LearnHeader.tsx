import { Pressable, StyleSheet, Text, View } from "react-native";

import { FilterIcon } from "../AppIcon";
import { palette } from "../../theme/palette";

type LearnHeaderProps = {
  activeFiltersCount: number;
  onOpenFilters: () => void;
};

export function LearnHeader({ activeFiltersCount, onOpenFilters }: LearnHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.header__copy}>
        <Text style={styles.header__brand}>LinuxSwipe</Text>
        <Text style={styles.header__title}>Учебная сессия</Text>
      </View>

      <Pressable
        onPress={onOpenFilters}
        style={({ pressed }) => [styles.header__button, pressed && styles.header__buttonPressed]}
      >
        <FilterIcon color={palette.textPrimary} size={16} />
        <Text style={styles.header__buttonText}>
          {activeFiltersCount > 0 ? `Фильтры ${activeFiltersCount}` : "Фильтры"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  header__copy: {
    flexShrink: 1
  },
  header__brand: {
    color: palette.accentStrong,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.6,
    textTransform: "uppercase"
  },
  header__title: {
    marginTop: 4,
    color: palette.textPrimary,
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 24
  },
  header__button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.overlayPill
  },
  header__buttonPressed: {
    opacity: 0.92
  },
  header__buttonText: {
    color: palette.textPrimary,
    fontSize: 12,
    fontWeight: "800"
  }
});
