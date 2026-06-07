import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CardsIcon, KeyboardIcon } from '../../../shared/components/icons/AppIcons';
import { palette } from '../../../shared/theme/palette';

export type TrainingMode = 'manual' | 'swipe';

type ActionDockProps = {
  isCompact?: boolean;
  mode: TrainingMode;
  onSelectMode: (mode: TrainingMode) => void;
};

export function ActionDock({ isCompact = false, mode, onSelectMode }: ActionDockProps) {
  return (
    <View style={[styles.dock, isCompact && styles.dockCompact]}>
      <ModeButton
        icon={
          <CardsIcon
            color={mode === 'swipe' ? palette.background : palette.textMuted}
            size={18}
          />
        }
        isActive={mode === 'swipe'}
        isCompact={isCompact}
        label="Свайпы"
        meta="+10 опыта"
        onPress={() => onSelectMode('swipe')}
      />
      <ModeButton
        icon={
          <KeyboardIcon
            color={mode === 'manual' ? palette.background : palette.accentStrong}
            size={18}
          />
        }
        isActive={mode === 'manual'}
        isCompact={isCompact}
        label="Ручной ответ"
        meta="+18 опыта"
        onPress={() => onSelectMode('manual')}
      />
    </View>
  );
}

function ModeButton({
  icon,
  isActive,
  isCompact,
  label,
  meta,
  onPress,
}: {
  icon: ReactNode;
  isActive: boolean;
  isCompact: boolean;
  label: string;
  meta: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.dock__mode,
        isCompact && styles.dock__modeCompact,
        isActive && styles.dock__modeActive,
        pressed && styles.dock__buttonPressed,
      ]}
    >
      <View
        style={[
          styles.dock__modeIconWrap,
          isCompact && styles.dock__modeIconWrapCompact,
          isActive && styles.dock__modeIconWrapActive,
        ]}
      >
        {icon}
      </View>
      <View style={styles.dock__modeCopy}>
        <Text
          style={[
            styles.dock__modeTitle,
            isCompact && styles.dock__modeTitleCompact,
            isActive && styles.dock__modeTitleActive,
          ]}
        >
          {label}
        </Text>
        <Text
          style={[
            styles.dock__modeMeta,
            isCompact && styles.dock__modeMetaCompact,
            isActive && styles.dock__modeMetaActive,
          ]}
        >
          {meta}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  dock: {
    alignSelf: 'stretch',
    position: 'relative',
    zIndex: 2,
    elevation: 2,
    padding: 8,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: palette.hairline,
    backgroundColor: 'rgba(7, 10, 14, 0.56)',
    flexDirection: 'row',
    gap: 8,
  },
  dockCompact: {
    padding: 7,
    borderRadius: 20,
  },
  dock__mode: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 11,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(158, 184, 214, 0.1)',
    backgroundColor: 'rgba(7, 10, 14, 0.72)',
  },
  dock__modeActive: {
    borderColor: 'rgba(130, 245, 208, 0.28)',
    backgroundColor: palette.accentStrong,
  },
  dock__modeCompact: {
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 15,
  },
  dock__modeIconWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(130, 245, 208, 0.08)',
  },
  dock__modeIconWrapActive: {
    backgroundColor: 'rgba(1, 2, 3, 0.08)',
  },
  dock__modeIconWrapCompact: {
    width: 30,
    height: 30,
    borderRadius: 11,
  },
  dock__modeCopy: {
    alignItems: 'center',
    gap: 2,
  },
  dock__modeTitle: {
    color: palette.textPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  dock__modeTitleActive: {
    color: palette.background,
  },
  dock__modeTitleCompact: {
    fontSize: 12,
  },
  dock__modeMeta: {
    color: palette.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  dock__modeMetaActive: {
    color: 'rgba(1, 2, 3, 0.72)',
  },
  dock__modeMetaCompact: {
    fontSize: 9,
  },
  dock__buttonPressed: {
    opacity: 0.92,
  },
});
