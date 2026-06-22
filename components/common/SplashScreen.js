import React, { useState, useRef } from "react";
import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  useDerivedValue,
  interpolate,
  Extrapolate,
  useAnimatedReaction,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../contexts";
import AppBackground from "./AppBackground";
import ThemeToggleButton from "./ThemeToggleButton";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const KNOB_SIZE = 52;
const TRACK_PADDING = 6;

export default function SplashScreen({ onFinish }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  // Reanimated shared values
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const chevronProgress = useSharedValue(0);

  const [trackWidth, setTrackWidth] = useState(SCREEN_WIDTH - 40);
  const hasTriggeredThresholdHaptic = useRef(false);

  const maxTranslate = Math.max(trackWidth - KNOB_SIZE - TRACK_PADDING * 2, 1);
  const swipeThreshold = maxTranslate * 0.75;

  // Looping chevron pulse animation
  React.useEffect(() => {
    let isMounted = true;
    let animationFrame;

    const animateChevrons = () => {
      if (!isMounted) return;

      chevronProgress.value = withTiming(1, { duration: 700 });

      setTimeout(() => {
        if (!isMounted) return;
        chevronProgress.value = withTiming(0, { duration: 700 });

        setTimeout(() => {
          if (!isMounted) return;
          animateChevrons();
        }, 100);
      }, 700);
    };

    animateChevrons();

    return () => {
      isMounted = false;
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  const handleComplete = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // Ignore haptics errors
    }

    opacity.value = withTiming(0, { duration: 300 });
    translateX.value = withTiming(maxTranslate, { duration: 250 }, () => {
      runOnJS(onFinish)();
    });
  };

  const resetSwipe = () => {
    hasTriggeredThresholdHaptic.current = false;
    translateX.value = withSpring(0, {
      damping: 8,
      stiffness: 40,
    });
  };

  // Haptic feedback when crossing threshold
  useAnimatedReaction(
    () => translateX.value,
    (current) => {
      const shouldTrigger =
        current >= swipeThreshold && !hasTriggeredThresholdHaptic.current;
      const shouldReset =
        current < swipeThreshold && hasTriggeredThresholdHaptic.current;

      if (shouldTrigger) {
        hasTriggeredThresholdHaptic.current = true;
        runOnJS(() => {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } catch (error) {}
        });
      } else if (shouldReset) {
        hasTriggeredThresholdHaptic.current = false;
        runOnJS(() => {
          try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch (error) {}
        });
      }
    },
  );

  // Pan gesture for dragging the knob
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const next = Math.min(Math.max(event.translationX, 0), maxTranslate);
      translateX.value = next;
    })
    .onEnd((event) => {
      const next = Math.min(Math.max(event.translationX, 0), maxTranslate);
      if (next >= swipeThreshold) {
        runOnJS(handleComplete)();
      } else {
        runOnJS(resetSwipe)();
      }
    });

  // Tap gesture for accessibility (click to complete)
  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(handleComplete)();
  });

  // Combine gestures - Pan takes priority, Tap is fallback
  const combinedGesture = Gesture.Race(panGesture, tapGesture);

  // Animated styles
  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const labelOpacity = useDerivedValue(() => {
    return interpolate(
      translateX.value,
      [0, maxTranslate * 0.6],
      [1, 0],
      Extrapolate.CLAMP,
    );
  });

  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
  }));

  const chevronTranslateX = useDerivedValue(() => {
    return interpolate(chevronProgress.value, [0, 1], [0, 6]);
  });

  const chevron1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: chevronTranslateX.value }],
  }));

  const chevron2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: chevronTranslateX.value }],
  }));

  return (
    <View style={styles.container}>
      <AppBackground>
        <SafeAreaView style={styles.safeArea}>
          <ThemeToggleButton
            accessibilityLabel="Toggle app theme on splash screen"
            style={[styles.themeToggle, { top: insets.top + 12 }]}
          />
          <Animated.View style={[styles.content, containerStyle]}>
            <Image
              source={require("../../assets/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.title, { color: colors.text }]}>
              Alyaqeen Academy
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Three Interconnected{"\n"}Educational Program
            </Text>

            {/* Pill-shaped swipe track */}
            <View
              style={[
                styles.swipeTrack,
                {
                  backgroundColor: colors.goldSoft,
                  borderColor: colors.border,
                },
              ]}
              onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
            >
              {/* Centered label + chevrons */}
              <Animated.View style={[styles.swipeLabelWrap, labelStyle]}>
                <Text style={[styles.swipeText, { color: colors.text }]}>
                  SWIPE TO START
                </Text>
                <Animated.View style={chevron1Style}>
                  <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
                </Animated.View>
                <Animated.View style={[chevron2Style, { marginLeft: -10 }]}>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="rgba(255,255,255,0.5)"
                  />
                </Animated.View>
              </Animated.View>

              {/* Sliding circular knob */}
              <GestureDetector gesture={combinedGesture}>
                <Animated.View style={[styles.swipeKnob, knobStyle]}>
                  <Ionicons name="walk" size={26} color={colors.background} />
                </Animated.View>
              </GestureDetector>
            </View>
          </Animated.View>
        </SafeAreaView>
      </AppBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  themeToggle: {
    position: "absolute",
    top: 12,
    right: 20,
    zIndex: 20,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1F3A32",
    marginBottom: 16,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 60,
    textAlign: "center",
    lineHeight: 24,
  },
  swipeTrack: {
    width: "100%",
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    justifyContent: "center",
    overflow: "hidden",
  },
  swipeLabelWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  swipeText: {
    fontSize: 14,
    letterSpacing: 2,
    fontWeight: "600",
    marginRight: 4,
  },
  swipeKnob: {
    position: "absolute",
    left: TRACK_PADDING,
    top: TRACK_PADDING,
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: "#C9A227",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
