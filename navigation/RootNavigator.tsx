// ============================================================================
// ROOT NAVIGATOR - Auth Flow with Splash Screen
// Handles authentication state and navigation
// ============================================================================

import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AccountScreen from '../screens/AccountScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SplashScreen from '../screens/SplashScreen';
import AuthScreen from '../screens/AuthScreen';
import YakapFormScreen from '../screens/YakapFormScreen';
import PregnancyProfileListScreen from '../screens/PregnancyProfileListScreen';
import PregnancyProfileDetailScreen from '../screens/PregnancyProfileDetailScreen';
import PregnancyProfileFormScreen from '../screens/PregnancyProfileFormScreen';
import CityHealthSearchScreen from '../screens/CityHealthSearchScreen';
import { authService } from '../services/authService';

export type RootStackParamList = {
  Home: undefined;
  Account: undefined;
  Profile: undefined;
  YakapForm: undefined;
  PregnancyProfiles: undefined;
  PregnancyProfileDetail: { profileId: string };
  PregnancyProfileForm: {
    profileId?: string;
    residentId?: string;
    mode?: 'create' | 'edit';
  };
  CityHealthSearch: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type AppState = 'loading' | 'authenticated' | 'unauthenticated';

export default function RootNavigator() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const isAuthenticated = await authService.initialize();
      setAppState(isAuthenticated ? 'authenticated' : 'unauthenticated');
    } catch (error) {
      console.error('Auth initialization error:', error);
      setAppState('unauthenticated');
    }
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  const handleAuthSuccess = () => {
    setAppState('authenticated');
  };

  const handleLogout = async () => {
    await authService.logout();
    setAppState('unauthenticated');
  };

  // Show splash screen during initial load
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // Show auth screen if not authenticated
  if (appState === 'unauthenticated') {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  // Show loading while checking auth (shouldn't happen often due to splash)
  if (appState === 'loading') {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // Main app navigator when authenticated
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      {/* Main AI Chat Screen */}
      <Stack.Screen name="Home" component={HomeScreen} />

      {/* Account/Profile Screen */}
      <Stack.Screen
        name="Account"
        component={AccountScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />

      {/* Profile Screen with Logout */}
      <Stack.Screen
        name="Profile"
        options={{
          presentation: 'modal',
          animation: 'slide_from_right',
        }}>
        {() => <ProfileScreen onLogout={handleLogout} />}
      </Stack.Screen>

      {/* Yakap Application Form */}
      <Stack.Screen
        name="YakapForm"
        component={YakapFormScreen}
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
        }}
      />

      {/* Pregnancy Profile Screens */}
      <Stack.Screen
        name="PregnancyProfiles"
        component={PregnancyProfileListScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="PregnancyProfileDetail"
        component={PregnancyProfileDetailScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="PregnancyProfileForm"
        component={PregnancyProfileFormScreen}
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
        }}
      />

      {/* City Health Staff Search */}
      <Stack.Screen
        name="CityHealthSearch"
        component={CityHealthSearchScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
}

// Export logout handler for use in other screens
export { authService };
