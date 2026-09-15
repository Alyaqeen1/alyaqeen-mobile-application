import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { router } from "expo-router";
import DrawerContent from "../../components/navigation/DrawerContent";
import CustomHeader from "../../components/navigation/CustomHeader";
import { useTheme } from "../../contexts";
import useAuth from "../../hooks/useAuth";
import AppBackground from "../../components/common/AppBackground";
import { getDashboardRouteForRole } from "../../utils";

export default function PublicLayout() {
  const { colors } = useTheme();
  const { user, userRole, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (user && userRole && userRole !== "public") {
      router.replace(getDashboardRouteForRole(userRole));
    }
  }, [user, userRole, loading]);

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
