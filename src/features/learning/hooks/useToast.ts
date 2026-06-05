import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

export type FeedbackTone = "success" | "warning";

export type ToastState = {
  body: string;
  title: string;
  tone: FeedbackTone;
} | null;

export function useToast() {
  const [toastState, setToastState] = useState<ToastState>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(18)).current;
  const toastTimerRef = useRef<null | ReturnType<typeof setTimeout>>(null);

  useEffect(
    () => () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    },
    []
  );

  const showToast = (tone: FeedbackTone, title: string, body: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToastState({ body, title, tone });
    toastOpacity.stopAnimation();
    toastTranslateY.stopAnimation();
    toastOpacity.setValue(0);
    toastTranslateY.setValue(18);

    Animated.parallel([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true
      }),
      Animated.spring(toastTranslateY, {
        toValue: 0,
        bounciness: 8,
        speed: 16,
        useNativeDriver: true
      })
    ]).start();

    toastTimerRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true
        }),
        Animated.timing(toastTranslateY, {
          toValue: 12,
          duration: 180,
          useNativeDriver: true
        })
      ]).start(() => {
        setToastState(null);
      });
    }, 1750);
  };

  return {
    showToast,
    toastOpacity,
    toastState,
    toastTranslateY
  };
}
