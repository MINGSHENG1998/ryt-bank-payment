import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Transaction } from '../types';
import HomeScreen from '../screens/HomeScreen';
import PaymentScreen from '../screens/PaymentScreen';
import TransactionHistoryScreen from '../screens/TransactionHistoryScreen';
import ConfirmationScreen from '../screens/ConfirmationScreen';
import { BalanceProvider } from '../context/BalanceContext';

export type RootStackParamList = {
  Home: undefined;
  Payment: undefined;
  TransactionHistory: undefined;
  Confirmation: { transaction: Transaction & { status: string } };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <BalanceProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Payment"
            component={PaymentScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="TransactionHistory"
            component={TransactionHistoryScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Confirmation"
            component={ConfirmationScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </BalanceProvider>
  );
}