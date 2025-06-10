import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { RouteProp } from "@react-navigation/native";

import { RootStackParamList } from "../navigation/AppNavigator";

type ConfirmationScreenRouteProp = RouteProp<
  RootStackParamList,
  "Confirmation"
>;

interface Props {
  route: ConfirmationScreenRouteProp;
}

export default function ConfirmationScreen({ route }: Props) {
  const { transaction } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transaction Successful</Text>
      <Text>Recipient: {transaction.recipient.name}</Text>
      <Text>Amount: RM{transaction.amount.toFixed(2)}</Text>
      <Text>Note: {transaction.note || "N/A"}</Text>
      <Text>Date: {new Date(transaction.date).toLocaleString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
});
