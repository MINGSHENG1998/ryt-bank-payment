import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RootStackParamList } from "../navigation/AppNavigator";

type ConfirmationScreenRouteProp = RouteProp<
  RootStackParamList,
  "Confirmation"
>;

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Confirmation"
>;

interface Props {
  route: ConfirmationScreenRouteProp;
}

export default function ConfirmationScreen({ route }: Props) {
  const { transaction } = route.params;
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-MY", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("en-MY", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const { date, time } = formatDate(transaction.date);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#22c55e" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 20 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.successIcon}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Transfer Successful!</Text>
          <Text style={styles.successSubtitle}>Your money has been sent</Text>
        </View>

        <View style={styles.receiptCard}>
          <View style={styles.receiptHeader}>
            <Text style={styles.receiptTitle}>Transaction Receipt</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Completed</Text>
            </View>
          </View>

          <View style={styles.transactionDetails}>
            <View style={styles.amountSection}>
              <Text style={styles.amountLabel}>Amount Sent</Text>
              <Text style={styles.amountValue}>
                {formatBalance(transaction.amount)}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailsSection}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>To</Text>
                <Text style={styles.detailValue}>
                  {transaction.recipient.name}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Account</Text>
                <Text style={styles.detailValue}>
                  {transaction.recipient.accountNumber}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Transaction ID</Text>
                <Text style={styles.detailValue}>{transaction.id}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <View style={styles.dateTimeContainer}>
                  <Text style={styles.detailValue}>{date}</Text>
                  <Text style={styles.timeValue}>{time}</Text>
                </View>
              </View>

              {transaction.note && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Note</Text>
                  <Text style={styles.detailValue}>{transaction.note}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("Home")}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Back to Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("Payment")}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>
              Send Another Transfer
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#22c55e",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#22c55e",
    paddingTop: 40,
    paddingBottom: 60,
    alignItems: "center",
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  checkmark: {
    fontSize: 40,
    color: "#22c55e",
    fontWeight: "bold",
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
  },
  receiptCard: {
    backgroundColor: "#ffffff",
    margin: 20,
    marginTop: -30,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  receiptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  receiptTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  statusBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#166534",
  },
  transactionDetails: {
    padding: 20,
  },
  amountSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#22c55e",
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginBottom: 24,
  },
  detailsSection: {
    gap: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  detailLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
  dateTimeContainer: {
    flex: 2,
    alignItems: "flex-end",
  },
  timeValue: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  actionSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#1a365d",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#f1f5f9",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#475569",
    fontSize: 16,
    fontWeight: "500",
  },
});