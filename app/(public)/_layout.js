import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import DrawerContent from "../../components/navigation/DrawerContent";
import CustomHeader from "../../components/navigation/CustomHeader";
import { useTheme } from "../../contexts";
import AppBackground from "../../components/common/AppBackground";

export default function PublicLayout() {
  const { colors } = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppBackground>
        <Drawer
          drawerContent={(props) => <DrawerContent {...props} />}
          screenOptions={{
            headerShown: true,
            header: (props) => <CustomHeader {...props} />,
            drawerStyle: { backgroundColor: colors.drawerBackground },
            sceneStyle: { backgroundColor: "transparent" },
            drawerActiveTintColor: colors.gold,
            drawerInactiveTintColor: colors.text,
          }}
        >
          <Drawer.Screen
            name="(tabs)"
            options={{
              title: "Home",
              drawerLabel: "Home",
            }}
          />
          <Drawer.Screen
            name="about"
            options={{
              title: "About Academy",
              drawerLabel: "About Academy",
            }}
          />
          <Drawer.Screen
            name="vacancies"
            options={{
              title: "Vacancies",
              drawerLabel: "Vacancies",
            }}
          />
          <Drawer.Screen
            name="volunteer-opportunities"
            options={{
              title: "Volunteer Opportunities",
              drawerLabel: "Volunteer Opportunities",
            }}
          />
          <Drawer.Screen
            name="contact"
            options={{
              title: "Contact Us",
              drawerLabel: "Contact Us",
            }}
          />
          <Drawer.Screen
            name="settings"
            options={{
              title: "Settings",
              drawerLabel: "Settings",
            }}
          />
        </Drawer>
      </AppBackground>
    </GestureHandlerRootView>
  );
}
