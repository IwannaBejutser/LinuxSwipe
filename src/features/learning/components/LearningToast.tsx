import { Animated, StyleSheet, Text, View } from "react-native";

import { BoltIcon, ReviewIcon } from "../../../shared/components/icons/AppIcons";
import { palette } from "../../../shared/theme/palette";
import { ToastState } from "../hooks/useToast";

type LearningToastProps = {
  opacity: Animated.Value;
  state: ToastState;
  translateY: Animated.Value;
};

export function LearningToast({ opacity, state, translateY }: LearningToastProps) {
  if (!state) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        state.tone === "success" ? styles.toastSuccess : styles.toastWarning,
        {
          opacity,
          transform: [{ translateY }]
        }
      ]}
    >
      <View style={styles.toast__iconWrap}>
        {state.tone === "success" ? (
          <BoltIcon color={palette.accentStrong} size={18} />
        ) : (
          <ReviewIcon color="#f4a261" size={18} />
        )}
      </View>
      <View style={styles.toast__copy}>
        <Text style={styles.toast__title}>{state.title}</Text>
        <Text style={styles.toast__body}>{state.body}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 142,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderWidth: 1,
    zIndex: 30,
    elevation: 20
  },
  toastSuccess: {
    backgroundColor: "rgba(7, 18, 21, 0.94)",
    borderColor: "rgba(130, 245, 208, 0.22)"
  },
  toastWarning: {
    backgroundColor: "rgba(32, 19, 14, 0.94)",
    borderColor: "rgba(244, 162, 97, 0.22)"
  },
  toast__iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    alignItems: "center",
    justifyContent: "center"
  },
  toast__copy: {
    flex: 1,
    gap: 2
  },
  toast__title: {
    color: palette.textPrimary,
    fontSize: 14,
    fontWeight: "800"
  },
  toast__body: {
    color: palette.textSecondary,
    fontSize: 12,
    lineHeight: 18
  }
});
