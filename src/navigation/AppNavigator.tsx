import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import { Transaction } from "../types";
import HomeScreen from "../screens/HomeScreen";
import PaymentScreen from "../screens/PaymentScreen";

export type RootStackParamList = {
  Home: undefined;
  Payment: undefined;
  Confirmation: { transaction: Transaction }; //todo: add confirmation screen later
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Ryt Bank' }} />
        <Stack.Screen
          name="Payment"
          component={PaymentScreen}
          options={{ title: "Transfer Money" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
