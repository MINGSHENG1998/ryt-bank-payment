import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useBalance } from '../context/BalanceContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getRecentTransactions } from '../services/api';
import { Transaction } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { balance } = useBalance();
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    loadRecentTransactions();
  }, []);

  const loadRecentTransactions = async () => {
    try {
      const transactions = await getRecentTransactions();
      setRecentTransactions(transactions.slice(0, 3));
    } catch (error) {
      console.error('Error loading recent transactions:', error);
    }
  };

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const quickActions = [
    {
      title: 'Transfer',
      icon: '→',
      action: () => navigation.navigate('Payment'),
    },
    {
      title: 'History',
      icon: '📋',
      action: () => navigation.navigate('TransactionHistory'),
    },
  ];

  const toggleBalanceVisibility = () => {
    setShowBalance(!showBalance);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1a365d" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Good day!</Text>
            <Text style={styles.userName}>Welcome back</Text>
          </View>
          <TouchableOpacity
            style={styles.profileIcon}
          >
            <Text style={styles.profileText}>👤</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <TouchableOpacity style={styles.eyeIcon} onPress={toggleBalanceVisibility}>
              <Text style={styles.eyeText}>{showBalance ? '👁' : '🙈'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>
            {showBalance ? formatBalance(balance) : '••••••'}
          </Text>
          <Text style={styles.accountNumber}>Account: •••• 1234</Text>
        </View>

        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionButton}
                onPress={action.action}
                activeOpacity={0.7}
              >
                <View style={styles.actionIcon}>
                  <Text style={styles.actionIconText}>{action.icon}</Text>
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <FlatList
            data={recentTransactions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.transactionItem}>
                <View style={styles.transactionIcon}>
                  <Text style={styles.transactionIconText}>↗</Text>
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionTitle}>{item.recipient.name}</Text>
                  <Text style={styles.transactionDate}>
                    {new Date(item.date).toLocaleString('en-MY', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    { color: item.amount < 0 ? '#dc2626' : '#16a34a' },
                  ]}
                >
                  {formatBalance(item.amount)}
                </Text>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No recent transactions</Text>
            }
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a365d',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#1a365d',
    padding: 20,
    paddingVertical: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    color: '#cbd5e0',
    fontSize: 16,
    marginBottom: 4,
  },
  userName: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '600',
  },
  profileIcon: {
    width: 44,
    height: 44,
    backgroundColor: '#2d3748',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    fontSize: 20,
  },
  balanceCard: {
    backgroundColor: '#ffffff',
    margin: 20,
    marginTop: -20,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 4,
  },
  eyeText: {
    fontSize: 16,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  accountNumber: {
    color: '#64748b',
    fontSize: 14,
  },
  quickActionsSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
  },
  actionButton: {
    backgroundColor: '#ffffff',
    width: '22%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginRight: 20
  },
  actionIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#e2e8f0',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIconText: {
    fontSize: 16,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
    textAlign: 'center',
  },
  recentSection: {
    padding: 20,
    paddingTop: 0,
    flex: 1,
  },
  transactionItem: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#fef3c7',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionIconText: {
    fontSize: 18,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 14,
    color: '#64748b',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    paddingVertical: 20,
  },
  viewAllButton: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  viewAllText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '500',
  },
});