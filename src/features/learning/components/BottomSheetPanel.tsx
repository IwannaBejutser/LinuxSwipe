import { ReactNode, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { palette } from '../../../shared/theme/palette';

type BottomSheetPanelProps = {
  children: ReactNode;
  keyboardAware?: boolean;
  onClose: () => void;
  visible: boolean;
};

export function BottomSheetPanel({
  children,
  keyboardAware = false,
  onClose,
  visible,
}: BottomSheetPanelProps) {
  const panelTranslateY = useRef(new Animated.Value(0)).current;
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          gestureState.dy > 8 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onMoveShouldSetPanResponderCapture: (_, gestureState) =>
          gestureState.dy > 8 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
        onPanResponderMove: (_, gestureState) => {
          panelTranslateY.setValue(Math.max(gestureState.dy, 0));
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 78 || gestureState.vy > 1.1) {
            onClose();
            return;
          }

          Animated.spring(panelTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 7,
            speed: 15,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(panelTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 7,
            speed: 15,
          }).start();
        },
      }),
    [onClose, panelTranslateY],
  );

  useEffect(() => {
    if (visible) {
      panelTranslateY.setValue(0);
    }
  }, [panelTranslateY, visible]);

  const content = (
    <>
      <Pressable onPress={onClose} style={styles.sheet__backdrop} />
      <View pointerEvents="box-none" style={styles.sheet__host}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.sheet__panel,
            {
              transform: [{ translateY: panelTranslateY }],
            },
          ]}
        >
          <View style={styles.sheet__handle} />
          {children}
        </Animated.View>
      </View>
    </>
  );

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      {keyboardAware ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheet__keyboardHost}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.sheet__plainHost}>{content}</View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet__plainHost: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet__keyboardHost: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet__backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(3, 10, 19, 0.62)',
  },
  sheet__host: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet__panel: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.panelElevated,
    gap: 18,
  },
  sheet__handle: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: palette.borderStrong,
  },
});
