import React from "react";
import { View, Text, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SplashScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#F8F5EE]">
      <View className="flex-1 items-center justify-center p-5">
        <Image
          source={require("../../assets/logo.png")}
          className="w-16 h-16 mb-4"
          resizeMode="contain"
          style={{ width: 120, height: 120 }}
        />
        <Text className="text-2xl font-bold text-[#1E3A5F] mb-8">
          Alyaqeen Academy
        </Text>
        <ActivityIndicator className="mt-4" color="#C9A227" size="large" />
      </View>
    </SafeAreaView>
  );
}