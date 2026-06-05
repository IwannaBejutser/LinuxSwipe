import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from "react-native";

import { palette } from "../theme/palette";

export function AnimatedBackdrop() {
  const { height, width } = useWindowDimensions();
  const beamDrift = useRef(new Animated.Value(0)).current;
  const sheetFloat = useRef(new Animated.Value(0)).current;
  const scanlineShift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const beamLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(beamDrift, {
          toValue: 1,
          duration: 12000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        }),
        Animated.timing(beamDrift, {
          toValue: 0,
          duration: 12000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        })
      ])
    );

    const sheetLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sheetFloat, {
          toValue: 1,
          duration: 16000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        }),
        Animated.timing(sheetFloat, {
          toValue: 0,
          duration: 16000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        })
      ])
    );

    const scanlineLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanlineShift, {
          toValue: 1,
          duration: 9000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        }),
        Animated.timing(scanlineShift, {
          toValue: 0,
          duration: 9000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true
        })
      ])
    );

    beamLoop.start();
    sheetLoop.start();
    scanlineLoop.start();

    return () => {
      beamLoop.stop();
      sheetLoop.stop();
      scanlineLoop.stop();
    };
  }, [beamDrift, scanlineShift, sheetFloat]);

  const beamTranslateX = beamDrift.interpolate({
    inputRange: [0, 1],
    outputRange: [-width * 0.1, width * 0.08]
  });
  const beamTranslateY = beamDrift.interpolate({
    inputRange: [0, 1],
    outputRange: [-18, 14]
  });
  const beamOpacity = beamDrift.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.2, 0.36, 0.24]
  });

  const sheetTranslateX = sheetFloat.interpolate({
    inputRange: [0, 1],
    outputRange: [width * 0.05, -width * 0.04]
  });
  const sheetTranslateY = sheetFloat.interpolate({
    inputRange: [0, 1],
    outputRange: [10, -16]
  });
  const sheetOpacity = sheetFloat.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.22, 0.32, 0.24]
  });

  const scanlineTranslateY = scanlineShift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 22]
  });
  const scanlineOpacity = scanlineShift.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.22, 0.08, 0.22]
  });

  return (
    <View pointerEvents="none" style={styles.backdrop}>
      <View style={styles.backdrop__base} />
      <View style={styles.backdrop__vignetteTop} />
      <View style={styles.backdrop__vignetteBottom} />

      <Animated.View
        style={[
          styles.backdrop__beamMint,
          {
            opacity: beamOpacity,
            transform: [{ translateX: beamTranslateX }, { translateY: beamTranslateY }]
          }
        ]}
      />
      <Animated.View
        style={[
          styles.backdrop__beamBlue,
          {
            opacity: sheetOpacity,
            transform: [{ translateX: sheetTranslateX }, { translateY: sheetTranslateY }]
          }
        ]}
      />
      <Animated.View
        style={[
          styles.backdrop__sheet,
          {
            opacity: sheetOpacity,
            transform: [{ translateX: sheetTranslateX }, { translateY: sheetTranslateY }]
          }
        ]}
      />

      <View style={styles.backdrop__gridLeft} />
      <View style={styles.backdrop__gridRight} />

      <Animated.View
        style={[
          styles.backdrop__scanlineTop,
          { opacity: scanlineOpacity, transform: [{ translateY: scanlineTranslateY }] }
        ]}
      />
      <Animated.View
        style={[
          styles.backdrop__scanlineBottom,
          { opacity: scanlineOpacity, transform: [{ translateY: scanlineTranslateY }] }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject
  },
  backdrop__base: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: palette.background
  },
  backdrop__vignetteTop: {
    position: "absolute",
    top: -40,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: "rgba(0, 0, 0, 0.24)"
  },
  backdrop__vignetteBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -30,
    height: 200,
    backgroundColor: "rgba(0, 0, 0, 0.34)"
  },
  backdrop__beamMint: {
    position: "absolute",
    top: 8,
    left: -120,
    width: 420,
    height: 180,
    borderRadius: 42,
    backgroundColor: palette.glowMint,
    transform: [{ rotate: "-14deg" }]
  },
  backdrop__beamBlue: {
    position: "absolute",
    top: 180,
    right: -160,
    width: 520,
    height: 240,
    borderRadius: 56,
    backgroundColor: palette.glowBlue,
    transform: [{ rotate: "12deg" }]
  },
  backdrop__sheet: {
    position: "absolute",
    bottom: 70,
    left: -60,
    width: 380,
    height: 180,
    borderRadius: 36,
    backgroundColor: palette.backdropPanel,
    transform: [{ rotate: "-10deg" }]
  },
  backdrop__gridLeft: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 30,
    width: 1,
    backgroundColor: palette.backdropLine
  },
  backdrop__gridRight: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 30,
    width: 1,
    backgroundColor: palette.backdropLine
  },
  backdrop__scanlineTop: {
    position: "absolute",
    top: 92,
    left: 30,
    right: 30,
    height: 1,
    backgroundColor: palette.backdropLine
  },
  backdrop__scanlineBottom: {
    position: "absolute",
    bottom: 138,
    left: 30,
    right: 30,
    height: 1,
    backgroundColor: palette.backdropLine
  }
});
