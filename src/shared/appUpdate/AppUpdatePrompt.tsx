import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { palette } from '../theme';
import { useAppUpdateCheck } from './useAppUpdateCheck';

export function AppUpdatePrompt() {
  const { applyUpdate, dismissUpdate, hasUpdate } = useAppUpdateCheck();

  return (
    <Modal animationType="fade" transparent visible={hasUpdate}>
      <View style={styles.overlay}>
        <View style={styles.panel}>
          <View style={styles.badge}>
            <Text style={styles.badge__text}>НОВАЯ ВЕРСИЯ</Text>
          </View>

          <Text style={styles.title}>Можно обновить приложение</Text>
          <Text style={styles.description}>
            Мы выкатили свежую сборку. Обновление перезагрузит PWA и подтянет новые
            карточки, но не тронет ваш опыт, серию и прогресс.
          </Text>

          <View style={styles.actions}>
            <Pressable onPress={dismissUpdate} style={styles.secondaryButton}>
              <Text style={styles.secondaryButton__text}>Позже</Text>
            </Pressable>
            <Pressable onPress={applyUpdate} style={styles.primaryButton}>
              <Text style={styles.primaryButton__text}>Обновить</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 18,
    paddingBottom: 22,
    backgroundColor: 'rgba(1, 2, 3, 0.72)',
  },
  panel: {
    gap: 14,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    padding: 20,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 28,
    backgroundColor: palette.panelElevated,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.32,
    shadowRadius: 30,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(130, 245, 208, 0.1)',
  },
  badge__text: {
    color: palette.accentStrong,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.6,
  },
  title: {
    color: palette.textPrimary,
    fontSize: 25,
    fontWeight: '900',
    lineHeight: 29,
  },
  description: {
    color: palette.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 4,
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 18,
    backgroundColor: palette.secondaryButton,
  },
  secondaryButton__text: {
    color: palette.textSecondary,
    fontSize: 15,
    fontWeight: '900',
  },
  primaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: palette.accentStrong,
  },
  primaryButton__text: {
    color: palette.background,
    fontSize: 15,
    fontWeight: '900',
  },
});
