import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import DrawerContent from "../../components/navigation/DrawerContent";

export default function ParentLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <DrawerContent role="parent" {...props} />}
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: "#F8F5EE" },
          headerTintColor: "#1E3A5F",
          drawerStyle: { backgroundColor: "#F8F5EE" },
        }}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            title: "Parent Portal",
            headerTitle: "Parent Portal",
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
