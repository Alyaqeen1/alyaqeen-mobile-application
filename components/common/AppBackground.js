import React, { useMemo, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Platform,
  Dimensions,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useTheme } from "../../contexts";

const { width, height } = Dimensions.get("window");

// Dark mode: white star flecks, twinkling, scattered across the screen.
const STAR_COUNT = 45;
const STARS = Array.from({ length: STAR_COUNT }).map((_, i) => ({
  id: i,
  top: Math.random() * height,
  left: Math.random() * width,
  size: Math.random() * 1.6 + 0.6,
  baseOpacity: Math.random() * 0.5 + 0.15,
  delay: Math.random() * 2500,
  duration: 1600 + Math.random() * 1400,
}));

// Light mode: NO SPARKLES - empty array
const SPARKLES = [];

function Fleck({ top, left, size, baseOpacity, delay, duration, color }) {
  const twinkle = useRef(new Animated.Value(baseOpacity)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(twinkle, {
          toValue: baseOpacity * 0.25,
          duration,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(twinkle, {
          toValue: baseOpacity,
          duration,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        top,
        left,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity: twinkle,
      }}
    />
  );
}

export default function AppBackground({ children, style }) {
  const {
    isDark,
    colors,
    gradientColors,
    gradientLocations,
    glowColors,
    glowStyle,
    blurTint,
    blurIntensity,
  } = useTheme();

  // Only show flecks in dark mode - empty array for light mode
  const flecks = useMemo(() => (isDark ? STARS : SPARKLES), [isDark]);
  const fleckColor = isDark ? "#FFFFFF" : "#C9A227";

  return (
    <LinearGradient
      colors={gradientColors}
      locations={gradientLocations}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[styles.container, style]}
    >
      <View pointerEvents="none" style={[styles.glowWrap, glowStyle]}>
        <LinearGradient
          colors={glowColors}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.glowGradient}
        />
        {Platform.OS !== "web" && (
          <BlurView
            intensity={blurIntensity}
            tint={blurTint}
            style={StyleSheet.absoluteFill}
          />
        )}
      </View>

      {/* Flecks: ONLY shown in dark mode */}
      {flecks.map((fleck) => (
        <Fleck key={fleck.id} {...fleck} color={fleckColor} />
      ))}

      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glowWrap: {
    position: "absolute",
    overflow: "hidden",
    zIndex: 0,
  },
  glowGradient: {
    flex: 1,
  },
});