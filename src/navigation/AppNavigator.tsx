import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import { Transaction } from "../types";
import HomeScreen from "../screens/HomeScreen";
import PaymentScreen from "../screens/PaymentScreen";
import { BalanceProvider } from "../context/BalanceContext";
import ConfirmationScreen from "../screens/ConfirmationScreen";

export type RootStackParamList = {
  Home: undefined;
  Payment: undefined;
  Confirmation: { transaction: Transaction }; //todo: add confirmation screen later
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
            options={{ title: "Ryt Bank" }}
          />
          <Stack.Screen
            name="Payment"
            component={PaymentScreen}
            options={{ title: "Transfer Money" }}
          />
          <Stack.Screen
            name="Confirmation"
            component={ConfirmationScreen}
            options={{ title: "Transaction Confirmation" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </BalanceProvider>
  );
}
