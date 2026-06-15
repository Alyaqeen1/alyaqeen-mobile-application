import React from "react";
import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import FloatingTabBar from "../../../components/navigation/FloatingTabBar";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <FloatingTabBar {...props} />}
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