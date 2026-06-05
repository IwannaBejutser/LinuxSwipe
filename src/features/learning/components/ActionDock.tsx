import { Pressable, StyleSheet, Text, View } from "react-native";

import { CheckIcon, KeyboardIcon, ReviewIcon } from "../../../shared/components/icons/AppIcons";
import { palette } from "../../../shared/theme/palette";

type ActionDockProps = {
  isCompact?: boolean;
  onOpenManualAnswer: () => void;
  onSendKnown: () => void;
  onSendReview: () => void;
};

export function ActionDock({
  isCompact = false,
  onOpenManualAnswer,
  onSendKnown,
  onSendReview
}: ActionDockProps) {
  return (
    <View style={[styles.dock, isCompact && styles.dockCompact]}>
      <Pressable
        onPress={onOpenManualAnswer}
        style={({ pressed }) => [
          styles.dock__challenge,
          isCompact && styles.dock__challengeCompact,
          pressed && styles.dock__buttonPressed
        ]}
      >
        <View style={styles.dock__challengeLead}>
          <View
            style={[
              styles.dock__challengeIconWrap,
              isCompact && styles.dock__challengeIconWrapCompact
            ]}
          >
            <KeyboardIcon color={palette.accentStrong} size={18} />
          </View>
          <View style={styles.dock__challengeCopy}>
            <Text
              style={[
                styles.dock__challengeEyebrow,
                isCompact && styles.dock__challengeEyebrowCompact
              ]}
            >
              Режим тренировки
            </Text>
            <Text
              style={[
                styles.dock__challengeTitle,
                isCompact && styles.dock__challengeTitleCompact
              ]}
            >
              Ввести ответ руками
            </Text>
          </View>
        </View>
        <Text
          style={[styles.dock__challengeMeta, isCompact && styles.dock__challengeMetaCompact]}
        >
          +18 XP
        </Text>
      </Pressable>

      <View style={[styles.dock__actions, isCompact && styles.dock__actionsCompact]}>
        <Pressable
          onPress={onSendReview}
          style={({ pressed }) => [
            styles.dock__actionReview,
            isCompact && styles.dock__actionCompact,
            pressed && styles.dock__buttonPressed
          ]}
        >
          <ReviewIcon color="#f4a261" size={18} />
          <Text style={[styles.dock__actionEyebrow, isCompact && styles.dock__actionEyebrowCompact]}>
            Нужно закрепить
          </Text>
          <Text style={[styles.dock__actionTitle, isCompact && styles.dock__actionTitleCompact]}>
            На повтор
          </Text>
        </Pressable>

        <Pressable
          onPress={onSendKnown}
          style={({ pressed }) => [
            styles.dock__actionKnown,
            isCompact && styles.dock__actionCompact,
            pressed && styles.dock__buttonPressed
          ]}
        >
          <CheckIcon color={palette.background} size={18} />
          <Text
            style={[
              styles.dock__actionEyebrowKnown,
              isCompact && styles.dock__actionEyebrowCompact
            ]}
          >
            Уже уверенно
          </Text>
          <Text
            style={[
              styles.dock__actionTitleKnown,
              isCompact && styles.dock__actionTitleCompact
            ]}
          >
            Знаю
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    alignSelf: "stretch",
    position: "relative",
    zIndex: 2,
    elevation: 2,
    padding: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: "rgba(9, 18, 34, 0.58)",
    gap: 10
  },
  dockCompact: {
    padding: 8,
    borderRadius: 22,
    gap: 8
  },
  dock__challenge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.overlayPill
  },
  dock__challengeCompact: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16
  },
  dock__challengeLead: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  dock__challengeIconWrap: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "rgba(130, 245, 208, 0.08)"
  },
  dock__challengeIconWrapCompact: {
    width: 32,
    height: 32,
    borderRadius: 11
  },
  dock__challengeCopy: {
    flexShrink: 1
  },
  dock__challengeEyebrow: {
    color: palette.accentStrong,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  dock__challengeEyebrowCompact: {
    fontSize: 9
  },
  dock__challengeTitle: {
    marginTop: 3,
    color: palette.textPrimary,
    fontSize: 15,
    fontWeight: "800"
  },
  dock__challengeTitleCompact: {
    fontSize: 14
  },
  dock__challengeMeta: {
    color: palette.textMuted,
    fontSize: 11,
    fontWeight: "700"
  },
  dock__challengeMetaCompact: {
    fontSize: 10
  },
  dock__actions: {
    flexDirection: "row",
    gap: 10
  },
  dock__actionsCompact: {
    gap: 8
  },
  dock__actionReview: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.warningPanel,
    gap: 3
  },
  dock__actionKnown: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: palette.accentStrong,
    backgroundColor: palette.accentStrong,
    gap: 3
  },
  dock__actionCompact: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 18
  },
  dock__actionEyebrow: {
    color: palette.textMuted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  dock__actionEyebrowKnown: {
    color: palette.background,
    opacity: 0.72,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase"
  },
  dock__actionEyebrowCompact: {
    fontSize: 10,
    letterSpacing: 0.6
  },
  dock__actionTitle: {
    color: palette.textPrimary,
    fontSize: 18,
    fontWeight: "900"
  },
  dock__actionTitleKnown: {
    color: palette.background,
    fontSize: 18,
    fontWeight: "900"
  },
  dock__actionTitleCompact: {
    fontSize: 16
  },
  dock__buttonPressed: {
    opacity: 0.92
  }
});
