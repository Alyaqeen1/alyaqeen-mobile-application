import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../contexts";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import EmptyState from "../../../components/common/EmptyState";
import ErrorState from "../../../components/common/ErrorState";
import { useGetPrayerTimesQuery } from "../../../redux/features/prayer_times/prayer_timesApi";

const PRAYER_CONFIG = [
  { key: "fajr", label: "Fajr", arabic: "الفجر", icon: "sunny-outline" },
  { key: "zuhr", label: "Zuhr", arabic: "الظهر", icon: "sunny-outline" },
  { key: "asr", label: "Asr", arabic: "العصر", icon: "partly-sunny-outline" },
  { key: "maghrib", label: "Maghrib", arabic: "المغرب", icon: "moon-outline" },
  { key: "isha", label: "Isha", arabic: "العشاء", icon: "moon-outline" },
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

function getCurrentSeason() {
  const currentMonth = new Date().getMonth() + 1;
  return currentMonth >= 4 && currentMonth <= 10 ? "summer" : "winter";
}

function getDateParts(date) {
  return {
    currentDate: new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
    }).format(date),
    currentMonthName: new Intl.DateTimeFormat("en-US", {
      month: "long",
    }).format(date),
    currentFullDate: new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
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

  return {
    todayParts,
    todayTimes,
    tomorrowTimes,
  };
}

function buildPrayerList(todayTimes) {
  if (!todayTimes) return [];

  return PRAYER_CONFIG.map((prayer) => ({
    key: prayer.key,
    name: prayer.label,
    arabic: prayer.arabic,
    icon: prayer.icon,
    start: todayTimes[prayer.key]?.start || "TBC",
    jamat: todayTimes[prayer.key]?.jamat || todayTimes[prayer.key]?.start || "TBC",
  }));
}

function getNextPrayer(todayTimes, tomorrowTimes, now) {
  if (!todayTimes) return null;

  const prayersToday = [
    {
      key: "fajr",
      name: "Fajr",
      arabic: "الفجر",
      time: todayTimes.fajr?.jamat || todayTimes.fajr?.start,
      prayerDate: new Date(now),
    },
    {
      key: "zuhr",
      name: "Zuhr",
      arabic: "الظهر",
      time: todayTimes.zuhr?.jamat || todayTimes.zuhr?.start,
      prayerDate: new Date(now),
    },
    {
      key: "asr",
      name: "Asr",
      arabic: "العصر",
      time: todayTimes.asr?.jamat || todayTimes.asr?.start,
      prayerDate: new Date(now),
    },
    {
      key: "maghrib",
      name: "Maghrib",
      arabic: "المغرب",
      time: todayTimes.maghrib?.jamat || todayTimes.maghrib?.start,
      prayerDate: new Date(now),
    },
    {
      key: "isha",
      name: "Isha",
      arabic: "العشاء",
      time: todayTimes.isha?.jamat || todayTimes.isha?.start,
      prayerDate: new Date(now),
    },
  ];

  let nextPrayer = null;
  let smallestDiff = Infinity;

  prayersToday.forEach((prayer) => {
    if (!prayer.time) return;

    const prayerTime = parseTimeString(prayer.time, prayer.prayerDate);
    if (!prayerTime) return;

    const diff = prayerTime.getTime() - now.getTime();
    if (diff > 0 && diff < smallestDiff) {
      smallestDiff = diff;
      nextPrayer = {
        ...prayer,
        targetTime: prayerTime,
      };
    }
  });

  if (nextPrayer) return nextPrayer;

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowFajr = tomorrowTimes?.fajr?.jamat || tomorrowTimes?.fajr?.start;

  if (tomorrowFajr) {
    return {
      key: "fajr",
      name: "Fajr (Tomorrow)",
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

export default function PublicPrayerScreen() {
  const { colors } = useTheme();
  const [now, setNow] = useState(() => new Date());
  const { data: times, isLoading, isError, refetch } = useGetPrayerTimesQuery();

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const { todayParts, todayTimes, tomorrowTimes } = useMemo(
    () => getTodayAndTomorrowTimes(times, now),
    [times, now]
  );
  const prayerList = useMemo(() => buildPrayerList(todayTimes), [todayTimes]);
  const nextPrayer = useMemo(
    () => getNextPrayer(todayTimes, tomorrowTimes, now),
    [todayTimes, tomorrowTimes, now]
  );

  const currentSeason = getCurrentSeason();
  const jumuahTimes = times?.[0]?.jumuah?.[currentSeason];
  const seasonLabel =
    currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1);
  const jumuahSlots = [
    { label: "1st", value: jumuahTimes?.first },
    { label: "2nd", value: jumuahTimes?.second },
    { label: "3rd", value: jumuahTimes?.third },
  ].filter((item) => item.value);

  if (isLoading) {
    return (
      <SafeAreaView edges={["left", "right"]} style={styles.container}>
        <LoadingSpinner label="Loading prayer times..." />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView edges={["left", "right"]} style={styles.container}>
        <View style={styles.stateWrapper}>
          <ErrorState
            title="Couldn't load prayer times"
            message="Please try again to load today's prayer timetable."
            onRetry={refetch}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!todayTimes || prayerList.length === 0) {
    return (
      <SafeAreaView edges={["left", "right"]} style={styles.container}>
        <View style={styles.stateWrapper}>
          <EmptyState
            title="Prayer times unavailable"
            message="We couldn't find a timetable for today."
            icon="time-outline"
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
        <View style={styles.headerRow}>
          <View style={[styles.iconBubble, { borderColor: colors.border }]}>
            <Ionicons color={colors.textStrong} name="time-outline" size={18} />
          </View>
          <Text style={[styles.headerTitle, { color: colors.textStrong }]}>
            Prayer Times
          </Text>
          <View style={[styles.iconBubble, { borderColor: colors.border }]}>
            <Ionicons color={colors.textStrong} name="location-outline" size={18} />
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={[styles.todayLabel, { color: colors.gold }]}>TODAY</Text>
          <Text style={[styles.todayDate, { color: colors.textStrong }]}>
            {todayParts.currentFullDate}
          </Text>

          {nextPrayer ? (
            <View style={styles.ringsWrap}>
              <View
                style={[
                  styles.ringOuter,
                  { borderColor: "rgba(201, 162, 39, 0.35)" },
                ]}
              >
                <View
                  style={[
                    styles.ringInner,
                    { borderColor: "rgba(201, 162, 39, 0.22)" },
                  ]}
                >
                  <Text style={[styles.nextLabel, { color: colors.textMuted }]}>
                    NEXT
                  </Text>
                  <Text style={[styles.nextArabic, { color: colors.gold }]}>
                    {nextPrayer.arabic}
                  </Text>
                  <Text style={[styles.nextTime, { color: colors.textStrong }]}>
                    {nextPrayer.time}
                  </Text>
                  <Text style={[styles.countdownText, { color: colors.textMuted }]}>
                    {formatCountdown(nextPrayer.targetTime, now)}
                  </Text>
                </View>
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.listSection}>
          {prayerList.map((prayer) => {
            const isNext =
              nextPrayer?.key === prayer.key && nextPrayer?.nextDay !== true;
            const cardBackground = isNext ? colors.gold : colors.surface;
            const cardBorder = isNext ? colors.gold : colors.border;
            const primaryText = isNext ? "#0B1220" : colors.textStrong;
            const mutedText = isNext ? "rgba(11, 18, 32, 0.75)" : colors.textMuted;

            return (
              <View
                key={prayer.key}
                style={[
                  styles.prayerCard,
                  {
                    backgroundColor: cardBackground,
                    borderColor: cardBorder,
                    shadowColor: colors.shadowColor,
                  },
                ]}
              >
                <View
                  style={[
                    styles.prayerIconWrap,
                    {
                      backgroundColor: isNext
                        ? "rgba(11, 18, 32, 0.12)"
                        : colors.surfaceSoft,
                    },
                  ]}
                >
                  <Ionicons color={primaryText} name={prayer.icon} size={20} />
                </View>

                <View style={styles.prayerInfo}>
                  <Text style={[styles.prayerName, { color: primaryText }]}>
                    {prayer.name}
                  </Text>
                  <Text style={[styles.jamaahText, { color: mutedText }]}>
                    Jamaa&apos;h {prayer.jamat}
                  </Text>
                </View>

                <View style={styles.prayerTimeBlock}>
                  <Text
                    style={[
                      styles.prayerArabic,
                      { color: isNext ? "#6E4C00" : colors.gold },
                    ]}
                  >
                    {prayer.arabic}
                  </Text>
                  <Text style={[styles.prayerTime, { color: primaryText }]}>
                    {prayer.start}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {jumuahTimes && (
          <View
            style={[
              styles.jumuahCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: colors.shadowColor,
              },
            ]}
          >
            <View style={styles.jumuahHeader}>
              <Text style={[styles.jumuahTitle, { color: colors.gold }]}>
                JUMU&apos;AH - FRIDAY
              </Text>
              <Ionicons color={colors.gold} name="star-outline" size={18} />
            </View>

            {jumuahSlots.length > 0 ? (
              <View style={styles.jumuahSection}>
                <Text style={[styles.jumuahSeasonText, { color: colors.gold }]}>
                  Jumu&apos;ah Prayer Times ({seasonLabel} Schedule)
                </Text>
                <View style={styles.jumuahSlotsWrap}>
                  {jumuahSlots.map((slot) => (
                    <View key={slot.label} style={styles.jumuahSlot}>
                      <View
                        style={[
                          styles.jumuahBadge,
                          { backgroundColor: colors.gold },
                        ]}
                      >
                        <Text style={styles.jumuahBadgeText}>{slot.label}</Text>
                      </View>
                      <Text
                        style={[styles.jumuahSlotValue, { color: colors.textStrong }]}
                      >
                        {slot.value}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
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
    paddingTop: 10,
    paddingBottom: 28,
  },
  stateWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
  },
  hero: {
    alignItems: "center",
    paddingTop: 26,
    paddingBottom: 24,
  },
  todayLabel: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 2.5,
  },
  todayDate: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  ringsWrap: {
    marginTop: 26,
  },
  ringOuter: {
    width: 176,
    height: 176,
    borderRadius: 88,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  ringInner: {
    width: 142,
    height: 142,
    borderRadius: 71,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  nextLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.4,
  },
  nextArabic: {
    marginTop: 8,
    fontSize: 30,
    fontWeight: "700",
  },
  nextTime: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: "800",
  },
  countdownText: {
    marginTop: 6,
    fontSize: 14,
  },
  listSection: {
    gap: 12,
  },
  prayerCard: {
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  prayerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  prayerInfo: {
    flex: 1,
    marginLeft: 14,
  },
  prayerName: {
    fontSize: 18,
    fontWeight: "700",
  },
  jamaahText: {
    marginTop: 4,
    fontSize: 14,
  },
  prayerTimeBlock: {
    alignItems: "flex-end",
    marginLeft: 12,
  },
  prayerArabic: {
    fontSize: 18,
    fontWeight: "700",
  },
  prayerTime: {
    marginTop: 4,
    fontSize: 26,
    fontWeight: "800",
  },
  jumuahCard: {
    marginTop: 20,
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  jumuahHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  jumuahTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  jumuahSection: {
    marginTop: 12,
  },
  jumuahSeasonText: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  jumuahSlotsWrap: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  jumuahSlot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  jumuahBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  jumuahBadgeText: {
    color: "#0B1220",
    fontSize: 12,
    fontWeight: "800",
  },
  jumuahSlotValue: {
    fontSize: 18,
    fontWeight: "700",
  },
});
