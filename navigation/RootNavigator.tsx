// ============================================================================
// ROOT NAVIGATOR - Simplified for AI-First Experience
// HomeScreen (Aramon AI Chat) is now the main and only screen
// ============================================================================

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AccountScreen from '../screens/AccountScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Main AI Chat Screen */}
      <Stack.Screen name="Home" component={HomeScreen} />
      
      {/* Account/Profile Screen (accessible via header) */}
      <Stack.Screen 
        name="Account" 
        component={AccountScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
}
