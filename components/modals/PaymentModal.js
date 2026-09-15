import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStripe } from '@stripe/stripe-react-native';
import { useTheme } from '../../contexts';
import useAuth from '../../hooks/useAuth';
import { useCreateFeeDataMutation } from '../../redux/features/fees/feesApi';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');
const EXPO_PUBLIC_URL = process.env.EXPO_PUBLIC_URL || 'https://alyaqeen-server-two.vercel.app';

export default function PaymentModal({
  visible,
  onClose,
  familyId,
  totalAmount,
  unpaidRows,
  formatCurrency,
  onSuccess,
}) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [createFeeData] = useCreateFeeDataMutation();

  const buildFeeStudents = () => {
    const studentMap = {};
    
    unpaidRows.forEach((row) => {
      const [yearStr, monthStr] = row.month.split('-');
      const year = parseInt(yearStr);
      const month = monthStr;

      row.students.forEach((stu) => {
        const { studentId, name, monthsUnpaid, subtotal } = stu;

        if (!studentMap[studentId]) {
          studentMap[studentId] = {
            studentId,
            name,
            monthsPaid: [],
            subtotal: 0,
          };
        }

        monthsUnpaid.forEach(({ monthlyFee, discountedFee }) => {
          studentMap[studentId].monthsPaid.push({
            month,
            year,
            monthlyFee,
            discountedFee,
            paid: discountedFee,
          });
        });

        studentMap[studentId].subtotal += subtotal || 0;
      });
    });

    return Object.values(studentMap).map((stu) => ({
      ...stu,
      subtotal: parseFloat(stu.subtotal.toFixed(2)),
    }));
  };

  const saveFeeRecord = async (transactionId = null) => {
    try {
      const feeStudents = buildFeeStudents();
      const grandTotal = unpaidRows.reduce((acc, row) => acc + row.totalAmount, 0);

      console.log('💰 Saving fee record with correct format...');
      console.log('👨‍🎓 Students:', JSON.stringify(feeStudents, null, 2));

      const paymentData = {
        familyId: familyId,
        name: user?.displayName || 'Parent',
        email: user?.email,
        paymentType: 'monthly',
        status: 'paid',
        students: feeStudents,
        expectedTotal: grandTotal,
        remaining: 0,
        payments: [
          {
            amount: grandTotal,
            method: 'instant',
            date: new Date().toISOString().split('T')[0],
            transactionId: transactionId,
          },
        ],
      };

      console.log('📤 Sending payment data:', JSON.stringify(paymentData, null, 2));

      const result = await createFeeData(paymentData).unwrap();
      console.log('✅ CreateFeeData result:', result);

      if (result && result.insertedIds && result.insertedIds.length > 0) {
        Toast.show({
          type: 'success',
          text1: 'Payment Successful! 🎉',
          text2: `Your payment of ${formatCurrency(grandTotal)} has been processed.`,
        });
        
        Alert.alert(
          'Payment Successful! 🎉',
          `Your payment of ${formatCurrency(grandTotal)} has been processed successfully.`,
          [
            {
              text: 'OK',
              onPress: () => {
                onSuccess?.();
                onClose();
              },
            },
          ]
        );
        return true;
      } else {
        throw new Error('Failed to save fee record - no insertedIds');
      }
    } catch (error) {
      console.error('❌ Save fee error:', error);
      console.error('❌ Error data:', error?.data);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.data?.message || error?.message || 'Failed to save payment record',
      });
      return false;
    }
  };

  const handlePayment = async () => {
    if (totalAmount <= 0) {
      Alert.alert('Error', 'No outstanding payments to process.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${EXPO_PUBLIC_URL}/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: totalAmount,
          metadata: {
            familyId: familyId,
            userId: user?.uid || '',
            email: user?.email || '',
            name: user?.displayName || 'Parent',
            source: 'mobile_native'
          }
        })
      });

      const data = await response.json();
      
      if (!data.clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: data.clientSecret,
        merchantDisplayName: 'Alyaqeen Academy',
        defaultBillingDetails: {
          name: user?.displayName || 'Parent',
          email: user?.email || '',
        },
      });

      if (initError) {
        console.error('Init error:', initError);
        Toast.show({ 
          type: 'error', 
          text1: 'Payment Error', 
          text2: initError.message || 'Failed to initialize payment' 
        });
        setLoading(false);
        return;
      }

      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        console.error('Present error:', presentError);
        Toast.show({ 
          type: 'error', 
          text1: 'Payment Failed', 
          text2: presentError.message || 'Payment was cancelled or failed' 
        });
        setLoading(false);
        return;
      }

      const saved = await saveFeeRecord(data.paymentIntentId);
      setLoading(false);
      
      if (!saved) {
        Alert.alert(
          'Payment Processed but Save Failed',
          'Your payment was successful but we could not save the record. Please contact support.',
          [{ text: 'OK' }]
        );
      }

    } catch (error) {
      console.error('Payment error:', error);
      Toast.show({ 
        type: 'error', 
        text1: 'Payment Failed', 
        text2: error?.message || 'Something went wrong' 
      });
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.bottomSheetOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.textStrong }]}>
              💳 Make Payment
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#374151" />
            </TouchableOpacity>
          </View>

          <View style={styles.amountContainer}>
            <Text style={[styles.amountValue, { color: '#DC2626' }]}>
              {formatCurrency(totalAmount)}
            </Text>
            <Text style={[styles.amountSubtext, { color: colors.textMuted }]}>
              {unpaidRows.length} month(s) outstanding
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.payButton, loading && styles.payButtonDisabled]}
            onPress={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.payButtonText}>Pay {formatCurrency(totalAmount)}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footerNote}>
            <Ionicons name="lock-closed" size={12} color="#6b7280" />
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              Secure payment powered by Stripe
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  closeButton: {
    backgroundColor: '#f3f4f6',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  amountValue: {
    fontSize: 40,
    fontWeight: '800',
  },
  amountSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  payButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
  },
});
