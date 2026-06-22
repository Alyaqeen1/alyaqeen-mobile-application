import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useTheme } from "../../contexts";

export default function AppBackground({ children, style }) {
  const {
    gradientColors,
    gradientLocations,
    glowColors,
    glowStyle,
    blurTint,
    blurIntensity,
  } = useTheme();

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
