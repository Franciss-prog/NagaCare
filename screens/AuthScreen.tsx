// ============================================================================
// AUTH SCREEN - Modern Login & Sign Up
// Single screen with animated tabs
// ============================================================================

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Phone,
  MapPin,
  Calendar,
  Droplets,
  Bot,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react-native';
import { authService } from '../services/authService';

// ============================================================================
// STANDALONE INPUT COMPONENT - Must be outside to prevent keyboard dismiss
// ============================================================================
interface FormInputProps {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  onTogglePassword?: () => void;
  showPasswordToggle?: boolean;
  keyboardType?: 'default' | 'phone-pad' | 'email-address';
  autoCapitalize?: 'none' | 'words' | 'sentences';
}

const FormInput = ({
  icon,
  placeholder,
  value,
  onChangeText,
  error,
  secureTextEntry,
  onTogglePassword,
  showPasswordToggle,
  keyboardType = 'default',
  autoCapitalize = 'none',
}: FormInputProps) => (
  <View className="mb-4">
    <View
      className={`flex-row items-center bg-slate-800/50 rounded-2xl px-4 py-3 border ${
        error ? 'border-red-500' : 'border-slate-700'
      }`}
    >
      <View className="mr-3">{icon}</View>
      <TextInput
        className="flex-1 text-white text-base"
        placeholder={placeholder}
        placeholderTextColor="#64748b"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
      {showPasswordToggle && (
        <TouchableOpacity onPress={onTogglePassword}>
          {secureTextEntry ? (
            <EyeOff size={20} {...{ color: '#64748b' }} />
          ) : (
            <Eye size={20} {...{ color: '#64748b' }} />
          )}
        </TouchableOpacity>
      )}
    </View>
    {error && <Text className="text-red-400 text-xs mt-1 ml-2">{error}</Text>}
  </View>
);

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

type AuthMode = 'login' | 'signup';

// Barangays in Naga City
const BARANGAYS = [
  'Abella', 'Bagumbayan Norte', 'Bagumbayan Sur', 'Balatas', 'Calauag',
  'Cararayan', 'Carolina', 'Concepcion Grande', 'Concepcion Pequeña', 'Dayangdang',
  'Del Rosario', 'Dinaga', 'Igualdad Interior', 'Lerma', 'Liboton',
  'Mabolo', 'Pacol', 'Panicuason', 'Peñafrancia', 'Sabang',
  'San Felipe', 'San Francisco', 'San Isidro', 'Santa Cruz', 'Tabuco',
  'Tinago', 'Triangulo',
];

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showBarangayPicker, setShowBarangayPicker] = useState(false);

  // Login form
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
  });

  // Sign up form
  const [signupForm, setSignupForm] = useState({
    fullName: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    barangay: '',
    birthdate: '',
    bloodType: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Animation
  const tabIndicatorPosition = useRef(new Animated.Value(0)).current;

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setErrors({});
    Animated.spring(tabIndicatorPosition, {
      toValue: newMode === 'login' ? 0 : 1,
      useNativeDriver: true,
      friction: 10,
    }).start();
  };

  // Validation
  const validateLogin = () => {
    const newErrors: Record<string, string> = {};
    if (!loginForm.username.trim()) newErrors.username = 'Username is required';
    if (!loginForm.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignup = () => {
    const newErrors: Record<string, string> = {};
    
    if (!signupForm.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!signupForm.username.trim()) newErrors.username = 'Username is required';
    else if (signupForm.username.length < 4) newErrors.username = 'Username must be at least 4 characters';
    
    if (!signupForm.password) newErrors.password = 'Password is required';
    else if (signupForm.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    else if (!/\d/.test(signupForm.password)) newErrors.password = 'Password must contain a number';
    
    if (signupForm.password !== signupForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!signupForm.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^(09|\+639)\d{9}$/.test(signupForm.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Enter a valid PH mobile number';
    }
    
    if (!signupForm.barangay) newErrors.barangay = 'Barangay is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Login
  const handleLogin = async () => {
    if (!validateLogin()) return;

    setIsLoading(true);
    try {
      const result = await authService.login({
        username: loginForm.username,
        password: loginForm.password,
      });

      if (result.success) {
        onAuthSuccess();
      } else {
        Alert.alert('Login Failed', result.error || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sign Up
  const handleSignup = async () => {
    if (!validateSignup()) return;

    setIsLoading(true);
    try {
      const result = await authService.register({
        username: signupForm.username,
        password: signupForm.password,
        fullName: signupForm.fullName,
        barangay: signupForm.barangay,
        purok: 'N/A', // Can be added later
        birthDate: signupForm.birthdate || undefined,
        contactNumber: signupForm.phone,
      });

      if (result.success) {
        Alert.alert(
          'Welcome to Aramon AI! 🎉',
          'Your account has been created successfully. You can now explore health services in Naga City.',
          [{ text: 'Get Started', onPress: onAuthSuccess }]
        );
      } else {
        Alert.alert('Registration Failed', result.error || 'Could not create account');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Barangay Picker
  const BarangayPicker = () => (
    <View className="mb-4">
      <TouchableOpacity
        onPress={() => setShowBarangayPicker(!showBarangayPicker)}
        className={`flex-row items-center bg-slate-800/50 rounded-2xl px-4 py-3 border ${
          errors.barangay ? 'border-red-500' : 'border-slate-700'
        }`}
      >
        <MapPin size={20} {...{ color: '#06b6d4' }} />
        <Text className={`flex-1 ml-3 text-base ${signupForm.barangay ? 'text-white' : 'text-slate-500'}`}>
          {signupForm.barangay || 'Select Barangay'}
        </Text>
        <ChevronRight size={20} {...{ color: '#64748b' }} />
      </TouchableOpacity>
      {errors.barangay && <Text className="text-red-400 text-xs mt-1 ml-2">{errors.barangay}</Text>}
      
      {showBarangayPicker && (
        <View className="mt-2 bg-slate-800 rounded-2xl border border-slate-700 max-h-48">
          <ScrollView nestedScrollEnabled>
            {BARANGAYS.map((brgy) => (
              <TouchableOpacity
                key={brgy}
                onPress={() => {
                  setSignupForm({ ...signupForm, barangay: brgy });
                  setShowBarangayPicker(false);
                }}
                className={`px-4 py-3 border-b border-slate-700/50 ${
                  signupForm.barangay === brgy ? 'bg-cyan-600/20' : ''
                }`}
              >
                <Text className={signupForm.barangay === brgy ? 'text-cyan-400' : 'text-white'}>
                  {brgy}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-[#0b1220]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with Logo */}
          <View className="items-center pt-16 pb-8">
            {/* Logo */}
            <View 
              className="w-20 h-20 rounded-full items-center justify-center mb-4"
              style={{
                backgroundColor: 'rgba(6, 182, 212, 0.15)',
                borderWidth: 2,
                borderColor: 'rgba(6, 182, 212, 0.3)',
              }}
            >
              <Bot size={40} {...{ color: '#06b6d4' }} strokeWidth={1.5} />
            </View>
            
            <Text className="text-3xl font-bold text-white">
              Aramon<Text className="text-cyan-400"> AI</Text>
            </Text>
            <Text className="text-slate-400 text-sm mt-1">
              Your Naga City Health Companion
            </Text>
          </View>

          {/* Auth Card */}
          <View className="mx-6 bg-slate-900/50 rounded-3xl border border-slate-800 overflow-hidden">
            {/* Tab Switcher */}
            <View className="flex-row bg-slate-800/50 p-1 m-4 rounded-2xl">
              <TouchableOpacity
                onPress={() => switchMode('login')}
                className={`flex-1 py-3 rounded-xl ${mode === 'login' ? 'bg-cyan-600' : ''}`}
              >
                <Text className={`text-center font-semibold ${mode === 'login' ? 'text-white' : 'text-slate-400'}`}>
                  Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => switchMode('signup')}
                className={`flex-1 py-3 rounded-xl ${mode === 'signup' ? 'bg-cyan-600' : ''}`}
              >
                <Text className={`text-center font-semibold ${mode === 'signup' ? 'text-white' : 'text-slate-400'}`}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form Content */}
            <View className="px-4 pb-6">
              {mode === 'login' ? (
                // LOGIN FORM
                <>
                  <Text className="text-slate-400 text-sm mb-6 text-center">
                    Welcome back! Sign in to continue
                  </Text>

                  <FormInput
                    icon={<User size={20} {...{ color: '#06b6d4' }} />}
                    placeholder="Username"
                    value={loginForm.username}
                    onChangeText={(text) => setLoginForm({ ...loginForm, username: text })}
                    error={errors.username}
                  />

                  <FormInput
                    icon={<Lock size={20} {...{ color: '#06b6d4' }} />}
                    placeholder="Password"
                    value={loginForm.password}
                    onChangeText={(text) => setLoginForm({ ...loginForm, password: text })}
                    error={errors.password}
                    secureTextEntry={!showPassword}
                    showPasswordToggle
                    onTogglePassword={() => setShowPassword(!showPassword)}
                  />

                  <TouchableOpacity className="self-end mb-6">
                    <Text className="text-cyan-400 text-sm">Forgot Password?</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleLogin}
                    disabled={isLoading}
                    className="bg-cyan-600 rounded-2xl py-4 flex-row items-center justify-center"
                    style={{ opacity: isLoading ? 0.7 : 1 }}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <Text className="text-white font-bold text-lg mr-2">Login</Text>
                        <ChevronRight size={20} {...{ color: 'white' }} />
                      </>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                // SIGNUP FORM
                <>
                  <Text className="text-slate-400 text-sm mb-6 text-center">
                    Create your account to get started
                  </Text>

                  <FormInput
                    icon={<User size={20} {...{ color: '#06b6d4' }} />}
                    placeholder="Full Name"
                    value={signupForm.fullName}
                    onChangeText={(text) => setSignupForm({ ...signupForm, fullName: text })}
                    error={errors.fullName}
                    autoCapitalize="words"
                  />

                  <FormInput
                    icon={<User size={20} {...{ color: '#06b6d4' }} />}
                    placeholder="Username"
                    value={signupForm.username}
                    onChangeText={(text) => setSignupForm({ ...signupForm, username: text })}
                    error={errors.username}
                  />

                  <FormInput
                    icon={<Lock size={20} {...{ color: '#06b6d4' }} />}
                    placeholder="Password"
                    value={signupForm.password}
                    onChangeText={(text) => setSignupForm({ ...signupForm, password: text })}
                    error={errors.password}
                    secureTextEntry={!showPassword}
                    showPasswordToggle
                    onTogglePassword={() => setShowPassword(!showPassword)}
                  />

                  <FormInput
                    icon={<Lock size={20} {...{ color: '#06b6d4' }} />}
                    placeholder="Confirm Password"
                    value={signupForm.confirmPassword}
                    onChangeText={(text) => setSignupForm({ ...signupForm, confirmPassword: text })}
                    error={errors.confirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    showPasswordToggle
                    onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                  />

                  <FormInput
                    icon={<Phone size={20} {...{ color: '#06b6d4' }} />}
                    placeholder="Phone (e.g., 09171234567)"
                    value={signupForm.phone}
                    onChangeText={(text) => setSignupForm({ ...signupForm, phone: text })}
                    error={errors.phone}
                    keyboardType="phone-pad"
                  />

                  <BarangayPicker />

                  <FormInput
                    icon={<Calendar size={20} {...{ color: '#06b6d4' }} />}
                    placeholder="Birthdate (YYYY-MM-DD)"
                    value={signupForm.birthdate}
                    onChangeText={(text) => setSignupForm({ ...signupForm, birthdate: text })}
                    error={errors.birthdate}
                  />

                  <FormInput
                    icon={<Droplets size={20} {...{ color: '#06b6d4' }} />}
                    placeholder="Blood Type (e.g., O+)"
                    value={signupForm.bloodType}
                    onChangeText={(text) => setSignupForm({ ...signupForm, bloodType: text.toUpperCase() })}
                    error={errors.bloodType}
                    autoCapitalize="none"
                  />

                  <TouchableOpacity
                    onPress={handleSignup}
                    disabled={isLoading}
                    className="bg-cyan-600 rounded-2xl py-4 flex-row items-center justify-center mt-2"
                    style={{ opacity: isLoading ? 0.7 : 1 }}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <Text className="text-white font-bold text-lg mr-2">Create Account</Text>
                        <ChevronRight size={20} {...{ color: 'white' }} />
                      </>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* Terms */}
          <View className="mt-6 px-6">
            <Text className="text-slate-500 text-xs text-center">
              By continuing, you agree to our{' '}
              <Text className="text-cyan-400">Terms of Service</Text> and{' '}
              <Text className="text-cyan-400">Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
