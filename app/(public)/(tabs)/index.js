import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../../contexts";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorState from "../../../components/common/ErrorState";
import { htmlToPlainText } from "../../../utils/html";
import { useGetAnnouncementPublicLatestQuery } from "../../../redux/features/announcements/announcementsApi";
import { useGetPrayerTimesQuery } from "../../../redux/features/prayer_times/prayer_timesApi";

const PRAYER_CONFIG = [
  { key: "fajr", label: "Fajr", arabic: "الفجر" },
  { key: "zuhr", label: "Dhuhr", arabic: "الظهر" },
  { key: "asr", label: "Asr", arabic: "العصر" },
  { key: "maghrib", label: "Magh", arabic: "المغرب" },
  { key: "isha", label: "Isha", arabic: "العشاء" },
];

const EXPLORE_ITEMS = [
  {
    key: "events",
    label: "Events",
    icon: "calendar-outline",
    route: "/(public)/(tabs)/events",
    tint: "#F3D8AA",
    iconColor: "#255B3E",
  },
  {
    key: "news",
    label: "News",
    icon: "notifications-outline",
    route: "/(public)/(tabs)/announcements",
    tint: "#BFE6CE",
    iconColor: "#255B3E",
  },
  {
    key: "jobs",
    label: "Jobs",
    icon: "briefcase-outline",
    route: "/(public)/vacancies",
    tint: "#C7DCF4",
    iconColor: "#255B3E",
  },
  {
    key: "volunteer",
    label: "Volunteer",
    icon: "heart-half-outline",
    route: "/(public)/volunteer-opportunities",
    tint: "#F3D0CC",
    iconColor: "#255B3E",
  },
];

function parseTimeString(timeStr, baseDate = new Date()) {
  if (!timeStr) return null;

  try {
    const cleaned = String(timeStr).replace(/\s+/g, " ").trim();
    const [time, period] = cleaned.split(" ");
    if (!time || !period) return null;

    const [hours, minutes] = time.split(":");
    let hour = Number(hours);

    if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
    if (period.toUpperCase() === "AM" && hour === 12) hour = 0;

    const date = new Date(baseDate);
    date.setHours(hour, Number(minutes), 0, 0);
    return date;
  } catch {
    return null;
  }
}

function getDateParts(date) {
  return {
    currentDate: new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
    }).format(date),
    currentMonthName: new Intl.DateTimeFormat("en-US", {
      month: "long",
    }).format(date),
  };
}

function getTodayAndTomorrowTimes(times, now) {
  const todayParts = getDateParts(now);
  const todayTimes = times?.[0]?.[todayParts.currentMonthName]?.find(
    (day) => String(day?.date) === String(Number(todayParts.currentDate))
  );

  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowParts = getDateParts(tomorrowDate);
  const tomorrowTimes = times?.[0]?.[tomorrowParts.currentMonthName]?.find(
    (day) => String(day?.date) === String(Number(tomorrowParts.currentDate))
  );

  return { todayTimes, tomorrowTimes };
}

function buildPrayerList(todayTimes) {
  if (!todayTimes) return [];

  return PRAYER_CONFIG.map((prayer) => ({
    key: prayer.key,
    name: prayer.label,
    arabic: prayer.arabic,
    time: todayTimes[prayer.key]?.jamat || todayTimes[prayer.key]?.start || "TBC",
  }));
}

function getNextPrayer(todayTimes, tomorrowTimes, now) {
  if (!todayTimes) return null;

  const prayersToday = PRAYER_CONFIG.map((prayer) => ({
    key: prayer.key,
    name: prayer.label,
    arabic: prayer.arabic,
    time: todayTimes[prayer.key]?.jamat || todayTimes[prayer.key]?.start,
    prayerDate: new Date(now),
  }));

  let nextPrayer = null;
  let smallestDiff = Infinity;

  prayersToday.forEach((prayer) => {
    if (!prayer.time) return;
    const prayerTime = parseTimeString(prayer.time, prayer.prayerDate);
    if (!prayerTime) return;

    const diff = prayerTime.getTime() - now.getTime();
    if (diff > 0 && diff < smallestDiff) {
      smallestDiff = diff;
      nextPrayer = { ...prayer, targetTime: prayerTime };
    }
  });

  if (nextPrayer) return nextPrayer;

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowFajr = tomorrowTimes?.fajr?.jamat || tomorrowTimes?.fajr?.start;

  if (tomorrowFajr) {
    return {
      key: "fajr",
      name: "Fajr",
      arabic: "الفجر",
      time: tomorrowFajr,
      targetTime: parseTimeString(tomorrowFajr, tomorrow),
      nextDay: true,
    };
  }

  return null;
}

function formatCountdown(targetTime, now) {
  if (!targetTime) return "";

  const diff = targetTime.getTime() - now.getTime();
  if (diff <= 0) return "Now";

  const totalMinutes = Math.ceil(diff / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `in ${minutes}m`;
  if (minutes === 0) return `in ${hours}h`;
  return `in ${hours}h ${minutes}m`;
}

function formatAnnouncementDate(value) {
  if (!value) return "Recently";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function normalizeAnnouncement(announcement) {
  if (!announcement) return null;

  const rawBody =
    announcement.content ||
    announcement.description ||
    announcement.message ||
    "";
  const body = htmlToPlainText(rawBody);

  return {
    title: announcement.title || announcement.heading || "Community update",
    body,
    badge: String(announcement.type || "Latest").toUpperCase(),
    date: formatAnnouncementDate(
      announcement.lastUpdated ||
        announcement.updatedAt ||
        announcement.createdAt ||
        announcement.date
    ),
  };
}

function getHeroGradient(isDark) {
  if (isDark) {
    return ["rgba(255,255,255,0.06)", "rgba(148,163,184,0.14)", "rgba(39,76,119,0.22)"];
  }

  return ["rgba(255,245,225,0.88)", "rgba(245,242,234,0.82)", "rgba(197,216,231,0.9)"];
}

export default function PublicHomeScreen() {
  const { colors, isDark } = useTheme();
  const [now, setNow] = useState(() => new Date());
  const {
    data: prayerTimes,
    isLoading: prayerLoading,
    isError: prayerError,
    refetch: refetchPrayerTimes,
  } = useGetPrayerTimesQuery();
  const { data: latestAnnouncement, isLoading: announcementLoading } =
    useGetAnnouncementPublicLatestQuery();

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const { todayTimes, tomorrowTimes } = useMemo(
    () => getTodayAndTomorrowTimes(prayerTimes, now),
    [prayerTimes, now]
  );
  const prayerList = useMemo(() => buildPrayerList(todayTimes), [todayTimes]);
  const nextPrayer = useMemo(
    () => getNextPrayer(todayTimes, tomorrowTimes, now),
    [todayTimes, tomorrowTimes, now]
  );
  const latestCard = useMemo(
    () => normalizeAnnouncement(latestAnnouncement),
    [latestAnnouncement]
  );

  if (prayerLoading && announcementLoading && !latestCard && prayerList.length === 0) {
    return (
      <SafeAreaView edges={["left", "right"]} style={styles.container}>
        <LoadingSpinner label="Loading public home..." />
      </SafeAreaView>
    );
  }

  if (prayerError && prayerList.length === 0 && !latestCard) {
    return (
      <SafeAreaView edges={["left", "right"]} style={styles.container}>
        <View style={styles.stateWrapper}>
          <ErrorState
            title="Couldn't load public home"
            message="Please try again to load the latest community updates."
            onRetry={refetchPrayerTimes}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={getHeroGradient(isDark)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.heroCard,
            {
              borderColor: colors.border,
              shadowColor: colors.shadowColor,
            },
          ]}
        >
          <View style={styles.heroHeaderRow}>
            <Text style={[styles.heroGreeting, { color: colors.gold }]}>
              ASSALAMU ALAIKUM
            </Text>
            <Ionicons color={colors.gold} name="sparkles-outline" size={18} />
          </View>

          <Text style={[styles.heroTitle, { color: colors.textStrong }]}>
            Three{"\n"}interconnected{"\n"}
            <Text style={[styles.heroAccent, { color: colors.gold }]}>educational</Text>
            {"\n"}programs
          </Text>

          <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
            Arabic Qa&apos;idah, Islamic Studies & Surah memorisation.
          </Text>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("/(auth)/login")}
            style={styles.heroButton}
          >
            <Text style={styles.heroButtonText}>Apply today</Text>
            <Ionicons color="#0B1220" name="arrow-forward" size={16} />
          </TouchableOpacity>
        </LinearGradient>

        <View
          style={[
            styles.prayerSummaryCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: colors.shadowColor,
            },
          ]}
        >
          <View style={styles.prayerSummaryHeader}>
            <View>
              <Text style={[styles.prayerSummaryEyebrow, { color: colors.textMuted }]}>
                NEXT PRAYER · YARDLEY
              </Text>
              <Text style={[styles.prayerSummaryTitle, { color: colors.textStrong }]}>
                {nextPrayer ? `${nextPrayer.name} · ${nextPrayer.time}` : "Prayer times unavailable"}
              </Text>
            </View>

            {nextPrayer ? (
              <View style={styles.prayerSummaryArabicWrap}>
                <Text style={[styles.prayerSummaryArabic, { color: colors.gold }]}>
                  {nextPrayer.arabic}
                </Text>
                <Text style={[styles.prayerSummaryCountdown, { color: colors.textMuted }]}>
                  {formatCountdown(nextPrayer.targetTime, now)}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.prayerPillRow}>
            {prayerList.map((prayer) => {
              const isActive = nextPrayer?.key === prayer.key && nextPrayer?.nextDay !== true;

              return (
                <TouchableOpacity
                  key={prayer.key}
                  activeOpacity={0.9}
                  onPress={() => router.push("/(public)/(tabs)/prayer")}
                  style={[
                    styles.prayerPill,
                    {
                      backgroundColor: isActive ? colors.gold : colors.surfaceSoft,
                      borderColor: isActive ? colors.gold : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.prayerPillName,
                      { color: isActive ? "#0B1220" : colors.textStrong },
                    ]}
                  >
                    {prayer.name}
                  </Text>
                  <Text
                    style={[
                      styles.prayerPillTime,
                      { color: isActive ? "#5F4300" : colors.textMuted },
                    ]}
                  >
                    {prayer.time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textStrong }]}>Explore</Text>
        </View>

        <View style={styles.exploreGrid}>
          {EXPLORE_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.9}
              onPress={() => router.push(item.route)}
              style={styles.exploreItem}
            >
              <View style={[styles.exploreIconWrap, { backgroundColor: item.tint }]}>
                <Ionicons color={item.iconColor} name={item.icon} size={24} />
              </View>
              <Text style={[styles.exploreLabel, { color: colors.textStrong }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textStrong }]}>Latest</Text>
          <TouchableOpacity onPress={() => router.push("/(public)/(tabs)/announcements")}>
            <Text style={[styles.seeAllText, { color: colors.gold }]}>See all</Text>
          </TouchableOpacity>
        </View>

        {latestCard ? (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("/(public)/(tabs)/announcements")}
            style={[
              styles.latestCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: colors.shadowColor,
              },
            ]}
          >
            <View style={styles.latestCardTop}>
              <View style={styles.latestIconWrap}>
                <Ionicons color="#FFFFFF" name="sparkles-outline" size={20} />
              </View>
              <View
                style={[
                  styles.latestBadge,
                  {
                    backgroundColor: colors.gold,
                  },
                ]}
              >
                <Text style={styles.latestBadgeText}>{latestCard.badge}</Text>
              </View>
            </View>

            <Text style={[styles.latestTitle, { color: colors.textStrong }]}>
              {latestCard.title}
            </Text>
            <Text style={[styles.latestBody, { color: colors.textMuted }]} numberOfLines={4}>
              {latestCard.body || "Read the latest community update from Alyaqeen Academy."}
            </Text>
            <Text style={[styles.latestDate, { color: colors.textMuted }]}>
              {latestCard.date}
            </Text>
          </TouchableOpacity>
        ) : (
          <View
            style={[
              styles.latestCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.latestTitle, { color: colors.textStrong }]}>
              Community updates coming soon
            </Text>
            <Text style={[styles.latestBody, { color: colors.textMuted }]}>
              Fresh announcements will appear here as soon as they are published.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  stateWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  heroCard: {
    borderRadius: 32,
    borderWidth: 1,
    padding: 22,
    minHeight: 250,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  heroHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroGreeting: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 2.4,
  },
  heroTitle: {
    marginTop: 16,
    fontSize: 22,
    lineHeight: 32,
    fontWeight: "800",
  },
  heroAccent: {
    fontStyle: "italic",
  },
  heroSubtitle: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 210,
  },
  heroButton: {
    marginTop: 22,
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#E1AC45",
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroButtonText: {
    color: "#0B1220",
    fontSize: 15,
    fontWeight: "800",
  },
  prayerSummaryCard: {
    marginTop: 20,
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  prayerSummaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  prayerSummaryEyebrow: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  prayerSummaryTitle: {
    marginTop: 6,
    fontSize: 17,
    fontWeight: "800",
  },
  prayerSummaryArabicWrap: {
    alignItems: "flex-end",
  },
  prayerSummaryArabic: {
    fontSize: 28,
    fontWeight: "700",
  },
  prayerSummaryCountdown: {
    marginTop: 3,
    fontSize: 12,
  },
  prayerPillRow: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  prayerPill: {
    minWidth: 56,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  prayerPillName: {
    fontSize: 11,
    fontWeight: "800",
  },
  prayerPillTime: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "700",
  },
  exploreGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  exploreItem: {
    flex: 1,
    alignItems: "center",
    gap: 10,
  },
  exploreIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  exploreLabel: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  latestCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  latestCardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  latestIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#0C6A43",
    alignItems: "center",
    justifyContent: "center",
  },
  latestBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  latestBadgeText: {
    color: "#0B1220",
    fontSize: 11,
    fontWeight: "800",
  },
  latestTitle: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: "800",
  },
  latestBody: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
  },
  latestDate: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: "600",
  },
});
