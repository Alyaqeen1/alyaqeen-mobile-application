import React from "react";
import { Tabs } from "expo-router";
import { Text, View } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
        },
        tabBarActiveTintColor: "#C9A227",
        tabBarInactiveTintColor: "#6B7280",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginBottom: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Text style={{ fontSize: size, color }}>
              {focused ? "🏠" : "🏠"}
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="prayer"
        options={{
          title: "Prayer",
          tabBarIcon: ({ color, size, focused }) => (
            <Text style={{ fontSize: size, color }}>
              {focused ? "🕌" : "🕌"}
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          tabBarIcon: ({ color, size, focused }) => (
            <Text style={{ fontSize: size, color }}>
              {focused ? "📅" : "📅"}
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="announcements"
        options={{
          title: "Announcements",
          tabBarIcon: ({ color, size, focused }) => (
            <Text style={{ fontSize: size, color }}>
              {focused ? "📢" : "📢"}
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, size, focused }) => (
            <Text style={{ fontSize: size, color }}>
              {focused ? "☰" : "☰"}
            </Text>
          ),
        }}
      />
    </Tabs>
  );
}