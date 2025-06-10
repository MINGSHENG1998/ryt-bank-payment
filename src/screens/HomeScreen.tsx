import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useBalance } from "../context/BalanceContext";
import { RootStackParamList } from "../navigation/AppNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { balance } = useBalance();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Ryt Bank</Text>
      <Text style={styles.balance}>
        Account Balance: RM{balance.toFixed(2)}
      </Text>
      <Button
        title="Make a Payment"
        onPress={() => navigation.navigate("Payment")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  balance: {
    fontSize: 18,
    marginBottom: 20,
  },
});
