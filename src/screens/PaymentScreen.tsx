import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useBalance } from "../context/BalanceContext";
import { RootStackParamList } from "../navigation/AppNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Payment">;

export default function PaymentScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const { balance, updateBalance } = useBalance();

  //todo: update mock api to simulate network issue etc
  const processPayment = async (paymentData: any) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return {
      success: true,
      transactionId: `TXN_${Date.now()}`,
      ...paymentData,
    };
  };

  //todo: add real biometric auth
  const validateBiometric = async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 800);
    });
  };

  const handleTransfer = async () => {
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

    try {
      const biometricResult = await validateBiometric();
      if (!biometricResult) {
        Alert.alert("Error", "Authentication failed");
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

      if (result.success) {
        Alert.alert("Success", "Transfer completed successfully");
        updateBalance(Number(amount));
        navigation.navigate("Confirmation", { transaction: result }); //todo: rmb to add confirmation screen
      }
    } catch (err) {
      console.error("Transfer failed:", err);
      Alert.alert("Error", "Transfer failed. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.balanceLabel}>
        Available Balance: RM{balance.toFixed(2)}
      </Text>

      {/* todo: update to be able to select receipient from contact list */}
      <TextInput
        style={styles.inputField}
        placeholder="Enter recipient name"
        value={recipient}
        onChangeText={setRecipient}
        autoCapitalize="words"
      />

      <TextInput
        style={styles.inputField}
        placeholder="Enter amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
      />

      <TextInput
        style={styles.inputField}
        placeholder="Add a note (optional)"
        value={note}
        onChangeText={setNote}
        multiline
      />

      <Button title="Send Money" onPress={handleTransfer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  balanceLabel: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    color: "#333",
  },
  inputField: {
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
  },
});
