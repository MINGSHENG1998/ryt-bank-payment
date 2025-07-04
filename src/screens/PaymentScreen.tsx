import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as LocalAuthentication from "expo-local-authentication";

import { Contact, Transaction } from "../types";
import { useBalance } from "../context/BalanceContext";
import { RootStackParamList } from "../navigation/AppNavigator";
import {
  getContacts,
  processTransaction,
  saveTransaction,
  getRecentTransactions,
} from "../services/api";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Payment">;

export default function PaymentScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricTypes, setBiometricTypes] = useState<string[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  );
  const [activeTab, setActiveTab] = useState<"contacts" | "recent">("contacts");
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState("");
  const [pinValidationCallback, setPinValidationCallback] = useState<
    ((result: boolean) => void) | null
  >(null);
  const { balance, updateBalance } = useBalance();

  useEffect(() => {
    checkBiometricSupport();
    loadContacts();
    loadRecentTransactions();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes =
        await LocalAuthentication.supportedAuthenticationTypesAsync();

      setBiometricAvailable(hasHardware && isEnrolled);

      const typeNames = supportedTypes.map((type) => {
        switch (type) {
          case LocalAuthentication.AuthenticationType.FINGERPRINT:
            return "Fingerprint";
          case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
            return "Face ID";
          case LocalAuthentication.AuthenticationType.IRIS:
            return "Iris";
          default:
            return "Biometric";
        }
      });

      setBiometricTypes(typeNames);
    } catch (error) {
      console.error("Error checking biometric support:", error);
      setBiometricAvailable(false);
    }
  };

  const loadContacts = async () => {
    const contactList = await getContacts();
    setContacts(contactList);
  };

  const loadRecentTransactions = async () => {
    const transactions = await getRecentTransactions();
    setRecentTransactions(transactions);
  };

  const processPayment = async (paymentData: Transaction) => {
    try {
      const res = await processTransaction(paymentData);
      await saveTransaction(paymentData);
      return {
        status: "VALID",
        ...res,
      };
    } catch (error) {
      console.error("Payment processing error:", error);
      return {
        status: "INVALID",
        error: error instanceof Error ? error.message : "Transaction failed",
      };
    }
  };

  const selectRecentTransaction = (transaction: Transaction) => {
    setRecipient(transaction.recipient.name);
    setAmount(transaction.amount.toString());
    setNote(transaction.note || "");
  };

  const validateBiometric = async () => {
    try {
      if (!biometricAvailable) {
        // Show PIN/Passcode validation for devices without biometric
        return new Promise((resolve) => {
          Alert.alert(
            "Confirm Transaction",
            "Biometric authentication is not available. Would you like to use a PIN or proceed without additional authentication?",
            [
              {
                text: "Cancel",
                style: "cancel",
                onPress: () => resolve(false),
              },
              {
                text: "Use PIN",
                onPress: async () => {
                  const pinResult = await showPinValidation();
                  resolve(pinResult);
                },
              },
              {
                text: "Proceed",
                onPress: () => resolve(true),
              },
            ]
          );
        });
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to complete your transfer",
        fallbackLabel: "Use Passcode",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
      });

      if (result.success) {
        return true;
      } else {
        console.error("Biometric authentication failed:", result.error);
        if (result.error === "user_cancel") {
          Alert.alert("Cancelled", "Transfer cancelled by user");
        } else if (result.error === "lockout") {
          Alert.alert("Too Many Attempts", "Please try again later");
        } else if (result.error === "system_cancel") {
          // Handle system cancellation (like when user switches apps)
          Alert.alert("Authentication Cancelled", "Please try again");
        } else {
          // For other failures, offer alternative confirmation
          return new Promise((resolve) => {
            Alert.alert(
              "Authentication Failed",
              "Biometric authentication failed. Would you like to use a PIN or proceed anyway?",
              [
                {
                  text: "Cancel",
                  style: "cancel",
                  onPress: () => resolve(false),
                },
                {
                  text: "Use PIN",
                  onPress: async () => {
                    const pinResult = await showPinValidation();
                    resolve(pinResult);
                  },
                },
                {
                  text: "Proceed",
                  onPress: () => resolve(true),
                },
              ]
            );
          });
        }
        return false;
      }
    } catch (error) {
      console.error("Biometric validation error:", error);
      // Fallback for any unexpected errors
      return new Promise((resolve) => {
        Alert.alert(
          "Authentication Error",
          "There was an issue with authentication. Would you like to use a PIN or proceed anyway?",
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => resolve(false),
            },
            {
              text: "Use PIN",
              onPress: async () => {
                const pinResult = await showPinValidation();
                resolve(pinResult);
              },
            },
            {
              text: "Proceed",
              onPress: () => resolve(true),
            },
          ]
        );
      });
    }
  };

  const handleTransfer = async () => {
    if (isProcessing) return;

    const transferAmount = parseFloat(amount);

    if (!recipient.trim()) {
      Alert.alert("Error", "Please enter recipient name");
      return;
    }

    if (!amount || isNaN(transferAmount) || transferAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (transferAmount > balance) {
      Alert.alert("Error", "Insufficient funds");
      return;
    }

    setIsProcessing(true);

    try {
      const biometricResult = await validateBiometric();
      if (!biometricResult) {
        setIsProcessing(false);
        return;
      }

      const transactionData = {
        id: `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        recipient: {
          id: Math.random().toString(36).substr(2, 9),
          name: recipient.trim(),
          accountNumber: `ACC${Math.floor(Math.random() * 900000) + 100000}`,
        },
        amount: transferAmount,
        note: note.trim(),
        date: new Date().toISOString(),
      };

      const result = await processPayment(transactionData);

      if (result.status === "VALID") {
        Alert.alert("Success", "Transfer completed successfully");
        updateBalance(transferAmount);
        setRecentTransactions([
          transactionData,
          ...recentTransactions.slice(0, 9),
        ]);
        setRecipient("");
        setAmount("");
        setNote("");
        navigation.navigate("Confirmation", {
          transaction: { ...transactionData, status: result.status },
        });
      } else {
        Alert.alert("Error", result.error || "Transfer failed");
      }
    } catch (err) {
      console.error("Transfer failed:", err);
      Alert.alert("Error", "Transfer failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const selectContact = (contact: Contact) => {
    setRecipient(contact.name);
  };

  const showPinValidation = () => {
    return new Promise<boolean>((resolve) => {
      setPinValidationCallback(() => resolve);
      setShowPinModal(true);
      setPin("");
    });
  };

  const handlePinSubmit = () => {
    // Simple PIN validation - in a real app, this should be more secure
    if (pin.length >= 4) {
      setShowPinModal(false);
      if (pinValidationCallback) {
        pinValidationCallback(true);
        setPinValidationCallback(null);
      }
    } else {
      Alert.alert("Invalid PIN", "Please enter at least 4 digits");
    }
  };

  const handlePinCancel = () => {
    setShowPinModal(false);
    setPin("");
    if (pinValidationCallback) {
      pinValidationCallback(false);
      setPinValidationCallback(null);
    }
  };

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const quickAmounts = [50, 100, 200, 500];

  const renderContacts = () => {
    if (contacts.length === 0) {
      return <Text style={styles.emptyText}>No contacts found</Text>;
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScrollContainer}
      >
        {contacts.map((contact) => (
          <TouchableOpacity
            key={contact.id}
            onPress={() => selectContact(contact)}
            style={styles.contactItem}
            activeOpacity={0.7}
          >
            <View style={styles.contactAvatar}>
              <Text style={styles.contactInitial}>
                {contact.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.contactName}>{contact.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderRecentTransactions = () => {
    if (recentTransactions.length === 0) {
      return <Text style={styles.emptyText}>No recent transfers</Text>;
    }

    // Limit to first 5 items for better UX
    const limitedTransactions = recentTransactions.slice(0, 5);

    return (
      <ScrollView
        style={styles.transactionsList}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {limitedTransactions.map((transaction) => (
          <TouchableOpacity
            key={transaction.id}
            onPress={() => selectRecentTransaction(transaction)}
            style={styles.transactionItem}
            activeOpacity={0.7}
          >
            <View style={styles.transactionIcon}>
              <Text style={styles.transactionIconText}>↗</Text>
            </View>
            <View style={styles.transactionDetails}>
              <Text style={styles.transactionName}>
                {transaction.recipient.name}
              </Text>
              <Text style={styles.transactionAmount}>
                {formatBalance(transaction.amount)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1a365d" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Send Money</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>{formatBalance(balance)}</Text>
          </View>

          <View style={styles.recipientSection}>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === "contacts" && styles.activeTab,
                ]}
                onPress={() => setActiveTab("contacts")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "contacts" && styles.activeTabText,
                  ]}
                >
                  Contacts
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === "recent" && styles.activeTab]}
                onPress={() => setActiveTab("recent")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "recent" && styles.activeTabText,
                  ]}
                >
                  Recent
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.listContainer}>
              {activeTab === "contacts"
                ? renderContacts()
                : renderRecentTransactions()}
            </View>
          </View>

          <View style={styles.formSection}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Recipient</Text>
              <TextInput
                style={styles.inputField}
                placeholder="Enter recipient name"
                value={recipient}
                onChangeText={setRecipient}
                autoCapitalize="words"
                editable={!isProcessing}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Amount</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                editable={!isProcessing}
              />
              <View style={styles.quickAmountContainer}>
                {quickAmounts.map((quickAmount) => (
                  <TouchableOpacity
                    key={quickAmount}
                    style={styles.quickAmountButton}
                    onPress={() => setAmount(quickAmount.toString())}
                  >
                    <Text style={styles.quickAmountText}>RM{quickAmount}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Note (Optional)</Text>
              <TextInput
                style={[styles.inputField, styles.noteInput]}
                placeholder="Add a note..."
                value={note}
                onChangeText={setNote}
                multiline
                editable={!isProcessing}
              />
            </View>
          </View>

          <View style={styles.securitySection}>
            {biometricAvailable && biometricTypes.length > 0 && (
              <View style={styles.securityInfo}>
                <Text style={styles.securityIcon}>🔒</Text>
                <Text style={styles.securityText}>
                  {biometricTypes.join(" / ")} authentication enabled
                </Text>
              </View>
            )}

            {!biometricAvailable && (
              <View style={styles.securityWarning}>
                <Text style={styles.warningIcon}>⚠️</Text>
                <Text style={styles.warningText}>
                  Biometric authentication not available. Transactions will
                  require manual confirmation.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[
              styles.sendButton,
              isProcessing && styles.sendButtonDisabled,
            ]}
            onPress={handleTransfer}
            disabled={isProcessing}
            activeOpacity={0.8}
          >
            {isProcessing ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.sendButtonText}>Send Money</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* PIN Validation Modal */}
        <Modal
          visible={showPinModal}
          transparent={true}
          animationType="fade"
          onRequestClose={handlePinCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.pinModal}>
              <Text style={styles.pinModalTitle}>Enter PIN</Text>
              <Text style={styles.pinModalSubtitle}>
                Please enter your PIN to confirm the transaction
              </Text>

              <TextInput
                style={styles.pinInput}
                value={pin}
                onChangeText={setPin}
                placeholder="Enter PIN"
                keyboardType="number-pad"
                secureTextEntry={true}
                maxLength={6}
                autoFocus={true}
              />

              <View style={styles.pinModalButtons}>
                <TouchableOpacity
                  style={[styles.pinModalButton, styles.pinModalCancelButton]}
                  onPress={handlePinCancel}
                >
                  <Text style={styles.pinModalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.pinModalButton, styles.pinModalConfirmButton]}
                  onPress={handlePinSubmit}
                >
                  <Text style={styles.pinModalConfirmText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1a365d",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#1a365d",
    padding: 20,
    paddingTop: 40,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "600",
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  balanceCard: {
    backgroundColor: "#ffffff",
    margin: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  balanceLabel: {
    color: "#64748b",
    fontSize: 14,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
  },
  recipientSection: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tabContainer: {
    flexDirection: "row",
    padding: 4,
    margin: 16,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  activeTabText: {
    color: "#1e293b",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  horizontalScrollContainer: {
    minHeight: 100,
  },
  transactionsList: {
    maxHeight: 160,
  },
  contactItem: {
    alignItems: "center",
    marginRight: 16,
    width: 70,
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  contactInitial: {
    fontSize: 18,
    fontWeight: "600",
    color: "#475569",
  },
  contactName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#475569",
    textAlign: "center",
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionIconText: {
    fontSize: 16,
    color: "#3b82f6",
  },
  transactionDetails: {
    flex: 1,
  },
  transactionName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1e293b",
    marginBottom: 2,
  },
  transactionAmount: {
    fontSize: 14,
    color: "#64748b",
  },
  emptyText: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 14,
    fontStyle: "italic",
    paddingVertical: 20,
  },
  formSection: {
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  inputField: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1e293b",
  },
  amountInput: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 12,
  },
  quickAmountContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickAmountButton: {
    backgroundColor: "#f1f5f9",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 4,
    alignItems: "center",
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
  },
  noteInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  securitySection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  securityInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#22c55e",
  },
  securityIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  securityText: {
    fontSize: 14,
    color: "#16a34a",
    flex: 1,
  },
  securityWarning: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },
  warningIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  warningText: {
    fontSize: 14,
    color: "#d97706",
    flex: 1,
  },
  bottomSection: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 50,
  },
  sendButton: {
    backgroundColor: "#1a365d",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },
  sendButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
  sendButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  pinModal: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    width: "80%",
    maxWidth: 320,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pinModalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 8,
  },
  pinModalSubtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 24,
  },
  pinInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    textAlign: "center",
    letterSpacing: 8,
    marginBottom: 24,
  },
  pinModalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  pinModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  pinModalCancelButton: {
    backgroundColor: "#f1f5f9",
  },
  pinModalConfirmButton: {
    backgroundColor: "#1a365d",
  },
  pinModalCancelText: {
    color: "#64748b",
    fontSize: 16,
    fontWeight: "500",
  },
  pinModalConfirmText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
});
