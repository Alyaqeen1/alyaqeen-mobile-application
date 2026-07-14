import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../contexts";
import useAuth from "../../../hooks/useAuth";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorState from "../../../components/common/ErrorState";
import {
  useGetEnrolledFullFamilyQuery,
  useGetFamilyDebitQuery,
  useGetFullFamilyQuery,
} from "../../../redux/features/families/familiesApi";
import { useGetUserQuery } from "../../../redux/features/role/roleApi";

export default function ParentProfileScreen() {
  const { colors } = useTheme();
  const { user, loading: authLoading, signOutUser } = useAuth();

  const {
    data: profile,
    isLoading: userLoading,
    isError: userError,
    refetch: refetchUser,
  } = useGetUserQuery(user?.email, { skip: !user?.email });

  const {
    data: family,
    isLoading: familyLoading,
    isError: familyError,
    refetch: refetchFamily,
  } = useGetFullFamilyQuery(undefined, { skip: !user?.email });

  const { data: enrolledFamily } = useGetEnrolledFullFamilyQuery(user?.email, {
    skip: authLoading || !user?.email,
  });

  const { data: debitData } = useGetFamilyDebitQuery(enrolledFamily?._id, {
    skip: !enrolledFamily?._id,
  });

  const isLoading = authLoading || userLoading || familyLoading;
  const displayName =
    family?.parentName ||
    profile?.name ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Parent";
  const displayEmail = family?.email || profile?.email || user?.email || "—";
  const avatarLetter = String(displayName || "P").charAt(0).toUpperCase();
  const childrenCount = family?.childrenDocs?.length ?? 0;
  const directDebitStatus = debitData?.directDebit?.status || "Not set up";

  const handleLogout = async () => {
    await signOutUser();
  };

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.container}>
      {isLoading ? (
        <LoadingSpinner label="Loading profile..." />
      ) : userError || familyError ? (
        <View style={styles.stateWrapper}>
          <ErrorState
            title="Couldn't load profile"
            message="Please try again."
            onRetry={() => {
              refetchUser();
              refetchFamily();
            }}
          />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{avatarLetter}</Text>
            </View>
            <Text style={[styles.name, { color: colors.textStrong }]}>
              {displayName}
            </Text>
            <Text style={[styles.email, { color: colors.textMuted }]}>
              {displayEmail}
            </Text>
          </View>

          <View
            style={[
              styles.summaryCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: colors.shadowColor,
              },
            ]}
          >
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
                Family name
              </Text>
              <Text style={[styles.summaryValue, { color: colors.textStrong }]}>
                {family?.familyName || "—"}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
                Phone
              </Text>
              <Text style={[styles.summaryValue, { color: colors.textStrong }]}>
                {family?.phone || profile?.phone || "—"}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
                Children
              </Text>
              <Text style={[styles.summaryValue, { color: colors.textStrong }]}>
                {childrenCount}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
                Direct debit
              </Text>
              <Text style={[styles.summaryValue, { color: colors.textStrong }]}>
                {directDebitStatus}
              </Text>
            </View>
          </View>

          <View style={styles.menu}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.menuItem,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  shadowColor: colors.shadowColor,
                },
              ]}
            >
              <View style={styles.menuRow}>
                <Ionicons color={colors.gold} name="settings-outline" size={18} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  Settings
                </Text>
              </View>
              <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.menuItem,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  shadowColor: colors.shadowColor,
                },
              ]}
            >
              <View style={styles.menuRow}>
                <Ionicons color={colors.gold} name="help-circle-outline" size={18} />
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  Help & Support
                </Text>
              </View>
              <Ionicons color={colors.textMuted} name="chevron-forward" size={18} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleLogout}
              style={[
                styles.menuItem,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  shadowColor: colors.shadowColor,
                },
              ]}
            >
              <View style={styles.menuRow}>
                <Ionicons color={colors.danger} name="log-out-outline" size={18} />
                <Text style={[styles.menuItemText, { color: colors.danger }]}>
                  Logout
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 120,
    gap: 18,
  },
  stateWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  profileHeader: {
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#C9A227",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
  },
  summaryCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 2,
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right",
    flexShrink: 1,
  },
  menu: {
    gap: 4,
  },
  menuItem: {
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  menuItemText: {
    fontSize: 16,
  },
});
