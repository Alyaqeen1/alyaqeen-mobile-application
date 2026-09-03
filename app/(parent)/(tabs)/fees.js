// app/(parent)/tabs/FeesScreen.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts';
import useAuth from '../../../hooks/useAuth';
import { useGetEnrolledFullFamilyQuery } from '../../../redux/features/families/familiesApi';
import {
  useGetUnpaidFeesQuery,
  useGetFeesByIdQuery,
} from '../../../redux/features/fees/feesApi';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import PaymentModal from './PaymentModal';

export default function FeesScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Get family data
  const {
    data: enrolledFamily = {},
    isLoading: familyLoading,
    refetch: refetchFamily,
  } = useGetEnrolledFullFamilyQuery(user?.email, {
    skip: !user?.email,
  });

  const familyId = enrolledFamily?._id;

  // Get unpaid fees
  const {
    data: unpaidFeesData,
    isLoading: unpaidLoading,
    refetch: refetchUnpaid,
  } = useGetUnpaidFeesQuery(familyId, {
    skip: !familyId,
  });

  // Get payment history
  const {
    data: fees,
    isLoading: feesLoading,
    refetch: refetchFees,
  } = useGetFeesByIdQuery(familyId, {
    skip: !familyId,
  });

  const isLoading = familyLoading || unpaidLoading || feesLoading;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchFamily(), refetchUnpaid(), refetchFees()]);
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return `£${Number(amount || 0).toFixed(2)}`;
  };

  const unpaidRows = unpaidFeesData?.unpaidMonths || [];
  const totalOutstanding = unpaidRows.reduce((sum, row) => {
    return sum + (row.totalAmount || 0);
  }, 0);

  const familyDiscount = enrolledFamily?.discount || 0;

  if (isLoading) {
    return <LoadingSpinner label="Loading fee details..." />;
  }

  return (
    <SafeAreaView edges={["left", "right"]} style={[styles.container, { backgroundColor: "transparent" }]}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header - Matches Academy Tab */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textStrong }]}>
            💳 Fee Summary
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {enrolledFamily?.family_name || 'Your family'}
          </Text>
        </View>

        {/* Stats Cards Row */}
        <View style={styles.statsContainer}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Outstanding
            </Text>
            <Text style={[styles.statValue, { color: '#DC2626' }]}>
              {formatCurrency(totalOutstanding)}
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Unpaid
            </Text>
            <Text style={[styles.statValue, { color: colors.textStrong }]}>
              {unpaidRows.length}
            </Text>
            <Text style={[styles.statSub, { color: colors.textMuted }]}>
              months
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>
              Discount
            </Text>
            <Text style={[styles.statValue, { color: '#047857' }]}>
              {familyDiscount}%
            </Text>
          </View>
        </View>

        {/* Pending Payments Section */}
        {unpaidRows.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textStrong }]}>
                ⚠️ Pending Payments
              </Text>
              <View style={styles.badgeContainer}>
                <Text style={[styles.sectionBadge, { color: '#DC2626' }]}>
                  {unpaidRows.length} months
                </Text>
              </View>
            </View>

            {unpaidRows.map((item, index) => (
              <View
                key={item.month}
                style={[
                  styles.unpaidCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View style={styles.unpaidHeader}>
                  <View style={styles.unpaidLeft}>
                    <View style={styles.monthBadge}>
                      <Text style={styles.monthBadgeText}>
                        {new Date(item.month + '-01').toLocaleString('default', {
                          month: 'short',
                        })}
                      </Text>
                    </View>
                    <Text style={[styles.unpaidYear, { color: colors.textMuted }]}>
                      {new Date(item.month + '-01').toLocaleString('default', {
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  <Text style={[styles.unpaidAmount, { color: '#DC2626' }]}>
                    {formatCurrency(item.totalAmount)}
                  </Text>
                </View>
                <Text style={[styles.unpaidStudents, { color: colors.textMuted }]}>
                  <Ionicons name="people-outline" size={14} color={colors.textMuted} />{' '}
                  {item.studentNames}
                </Text>
              </View>
            ))}

            {/* Total Row */}
            <View
              style={[
                styles.totalCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.totalLabel, { color: colors.textStrong }]}>
                Total Outstanding
              </Text>
              <Text style={[styles.totalAmount, { color: '#DC2626' }]}>
                {formatCurrency(totalOutstanding)}
              </Text>
            </View>

            {/* Pay Button */}
            <TouchableOpacity
              style={styles.payButton}
              onPress={() => setShowPaymentModal(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="card" size={22} color="#fff" />
              <Text style={styles.payButtonText}>
                Pay Now - {formatCurrency(totalOutstanding)}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons name="checkmark-circle" size={64} color="#047857" />
            <Text style={[styles.emptyTitle, { color: colors.textStrong }]}>
              All Caught Up! 🎉
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
              No outstanding payments
            </Text>
          </View>
        )}

        <View style={styles.footer} />
      </ScrollView>

      {/* Payment Modal */}
      <PaymentModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        familyId={familyId}
        totalAmount={totalOutstanding}
        unpaidRows={unpaidRows}
        enrolledFamily={enrolledFamily}
        formatCurrency={formatCurrency}
        onSuccess={() => {
          setShowPaymentModal(false);
          onRefresh();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  statSub: {
    fontSize: 10,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  badgeContainer: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sectionBadge: {
    fontSize: 13,
    fontWeight: '600',
  },
  unpaidCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10,
  },
  unpaidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unpaidLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  monthBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  monthBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  unpaidYear: {
    fontSize: 14,
    fontWeight: '500',
  },
  unpaidAmount: {
    fontSize: 17,
    fontWeight: '800',
  },
  unpaidStudents: {
    fontSize: 13,
    marginTop: 6,
  },
  totalCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '800',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#047857',
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 20,
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  emptyCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  footer: {
    height: 40,
  },
});