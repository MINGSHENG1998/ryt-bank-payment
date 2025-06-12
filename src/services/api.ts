import * as Contacts from "expo-contacts";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { Contact, Transaction } from "../types";

export async function getContacts(): Promise<Contact[]> {
  try {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== "granted") {
      console.log("Contact permission denied");
      return [];
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.Name],
    });

    return data.map((contact) => ({
      id: contact.id || Math.random().toString(36).substr(2, 9),
      name: contact.name || "Unknown",
    }));
  } catch (error) {
    console.log("Error fetching contacts:", error);
    return [];
  }
}

export async function processTransaction(
  transaction: Transaction
): Promise<Transaction> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.1) {
        reject(new Error("Network error"));
      } else {
        resolve(transaction);
      }
    }, 1000);
  });
}

export async function saveTransaction(transaction: Transaction): Promise<void> {
  try {
    const existing = await AsyncStorage.getItem("transactions");
    const transactions: Transaction[] = existing ? JSON.parse(existing) : [];
    transactions.unshift(transaction);
    await AsyncStorage.setItem(
      "transactions",
      JSON.stringify(transactions.slice(0, 10))
    );
  } catch (error) {
    console.log("Error saving transaction:", error);
  }
}

export async function getRecentTransactions(): Promise<Transaction[]> {
  try {
    const transactions = await AsyncStorage.getItem("transactions");
    return transactions ? JSON.parse(transactions) : [];
  } catch (error) {
    console.log("Error fetching transactions:", error);
    return [];
  }
}
