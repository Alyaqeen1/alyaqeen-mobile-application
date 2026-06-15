import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  GestureDetector,
  Gesture,
  Directions,
} from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const KNOB_SIZE = 52;
const TRACK_PADDING = 6;

export default function SplashScreen({ onFinish }) {
  const swipeAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const chevronAnim = useRef(new Animated.Value(0)).current;

  const [trackWidth, setTrackWidth] = useState(SCREEN_WIDTH - 40);
  const hasTriggeredThresholdHaptic = useRef(false);

  const maxTranslate = Math.max(trackWidth - KNOB_SIZE - TRACK_PADDING * 2, 1);
  const swipeThreshold = maxTranslate * 0.75;

  // Looping chevron pulse animation to draw attention
  React.useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(chevronAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(chevronAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [chevronAnim]);

  const handleComplete = () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // Ignore haptics errors
    }

    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(swipeAnim, {
        toValue: maxTranslate,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onFinish && onFinish();
    });
  };

  const resetSwipe = () => {
    hasTriggeredThresholdHaptic.current = false;
    Animated.spring(swipeAnim, {
      toValue: 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const swipeGesture = Gesture.Fling()
    .direction(Directions.RIGHT)
    .onEnd(handleComplete);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      const next = Math.min(Math.max(event.translationX, 0), maxTranslate);
      swipeAnim.setValue(next);

      // Vibration feedback as the knob crosses the threshold
      if (next >= swipeThreshold && !hasTriggeredThresholdHaptic.current) {
        hasTriggeredThresholdHaptic.current = true;
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (error) {}
      } else if (next < swipeThreshold && hasTriggeredThresholdHaptic.current) {
        hasTriggeredThresholdHaptic.current = false;
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {}
      }
    })
    .onEnd((event) => {
      const next = Math.min(Math.max(event.translationX, 0), maxTranslate);
      if (next >= swipeThreshold) {
        handleComplete();
      } else {
        resetSwipe();
      }
    });

  const combinedGesture = Gesture.Race(panGesture, swipeGesture);

  // Fade out the label/chevrons as the knob slides over them
  const labelOpacity = swipeAnim.interpolate({
    inputRange: [0, maxTranslate * 0.6],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const chevronTranslate = chevronAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 6],
  });

  return (
    <GestureDetector gesture={combinedGesture}>
      <TouchableOpacity
        style={styles.container}
        activeOpacity={1}
        onPress={handleComplete}
      >
        <LinearGradient
          colors={["#F8F5EE", "#F8F5EE"]}
          style={{ flex: 1 }}
        >
          {/* Soft Golden Glow at the top */}
          <View pointerEvents="none" style={styles.glowWrap}>
            <LinearGradient
              colors={[
                "rgba(201, 162, 39, 0.25)",
                "rgba(201, 162, 39, 0.1)",
                "rgba(201, 162, 39, 0)",
              ]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.glowGradient}
            />
            {Platform.OS !== "web" && (
              <BlurView
                intensity={40}
                tint="light"
                style={StyleSheet.absoluteFill}
              />
            )}
          </View>

          <SafeAreaView style={styles.safeArea}>
            <Animated.View style={[styles.content, { opacity: opacityAnim }]}>
              <Image
                source={require("../../assets/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.title}>Alyaqeen Academy</Text>
              <Text style={styles.subtitle}>
                Three Interconnected{`\n`}Educational Program
              </Text>

              {/* Pill-shaped swipe track */}
              <View
                style={styles.swipeTrack}
                onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
              >
                {/* Centered label + chevrons */}
                <Animated.View
                  style={[styles.swipeLabelWrap, { opacity: labelOpacity }]}
                >
                  <Text style={styles.swipeText}>SWIPE TO START</Text>
                  <Animated.View
                    style={{ transform: [{ translateX: chevronTranslate }] }}
                  >
                    <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
                  </Animated.View>
                  <Animated.View
                    style={{
                      marginLeft: -10,
                      transform: [{ translateX: chevronTranslate }],
                    }}
                  >
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="rgba(255,255,255,0.5)"
                    />
                  </Animated.View>
                </Animated.View>

                {/* Sliding circular knob */}
                <Animated.View
                  style={[
                    styles.swipeKnob,
                    {
                      transform: [{ translateX: swipeAnim }],
                    },
                  ]}
                >
                  <Ionicons name="walk" size={26} color="#0F172A" />
                </Animated.View>
              </View>
            </Animated.View>
          </SafeAreaView>
        </LinearGradient>
      </TouchableOpacity>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  glowWrap: {
    position: "absolute",
    top: -120,
    left: -80,
    right: -80,
    height: 500,
    borderRadius: 300,
    overflow: "hidden",
    zIndex: 0,
  },
  glowGradient: {
    flex: 1,
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

  // Pill track
  swipeTrack: {
    width: "100%",
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(201, 162, 39, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(201, 162, 39, 0.35)",
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
    gap: 4,
  },
  swipeText: {
    fontSize: 14,
    letterSpacing: 2,
    color: "#1F3A32",
    fontWeight: "600",
    marginRight: 4,
  },

  // Circular sliding knob
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