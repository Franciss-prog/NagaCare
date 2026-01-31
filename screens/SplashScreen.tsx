// ============================================================================
// SPLASH SCREEN - Aramon AI Loading Screen
// Modern animated splash with gradient background
// ============================================================================

import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StatusBar, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, Shield } from 'lucide-react-native';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const subtitleFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo fade in and scale
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();

    // Text fade in with delay
    setTimeout(() => {
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 400);

    // Subtitle fade in with more delay
    setTimeout(() => {
      Animated.timing(subtitleFadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 700);

    // Navigate after splash duration
    const timer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1">
      <StatusBar barStyle="light-content" backgroundColor="#0b1220" />
      <LinearGradient
        colors={['#0b1220', '#0f172a', '#0b1220']}
        className="flex-1 items-center justify-center"
      >
        {/* Background decoration */}
        <View className="absolute inset-0 overflow-hidden">
          {/* Gradient orbs */}
          <View 
            className="absolute w-96 h-96 rounded-full opacity-20"
            style={{
              backgroundColor: '#06b6d4',
              top: -100,
              right: -100,
              transform: [{ scale: 1.5 }],
              shadowColor: '#06b6d4',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5,
              shadowRadius: 100,
            }}
          />
          <View 
            className="absolute w-72 h-72 rounded-full opacity-10"
            style={{
              backgroundColor: '#8b5cf6',
              bottom: -50,
              left: -50,
              transform: [{ scale: 1.5 }],
            }}
          />
        </View>

        {/* Main Content */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
          className="items-center"
        >
          {/* Logo Container */}
          <Animated.View
            style={{
              transform: [{ scale: pulseAnim }],
            }}
            className="mb-8"
          >
            {/* Glowing background */}
            <View 
              className="absolute inset-0 rounded-full"
              style={{
                backgroundColor: '#06b6d4',
                opacity: 0.2,
                transform: [{ scale: 1.3 }],
              }}
            />
            
            {/* Logo circle */}
            <View 
              className="w-32 h-32 rounded-full items-center justify-center overflow-hidden"
              style={{
                backgroundColor: 'rgba(249, 115, 22, 0.15)',
                borderWidth: 2,
                borderColor: 'rgba(249, 115, 22, 0.5)',
              }}
            >
              {/* Logo fills the circle */}
              <Image
                source={require('../assets/images/aramonAI.jpg')}
                style={{ width: 128, height: 128 }}
                resizeMode="cover"
              />
            </View>

            {/* Floating icons */}
            <View className="absolute -top-2 -right-2">
              <View className="bg-cyan-500/20 rounded-full p-2">
                <Heart size={16} {...{ color: '#ef4444' }} fill="#ef4444" />
              </View>
            </View>
            <View className="absolute -bottom-2 -left-2">
              <View className="bg-green-500/20 rounded-full p-2">
                <Shield size={16} {...{ color: '#22c55e' }} />
              </View>
            </View>
          </Animated.View>

          {/* App Name */}
          <Animated.View style={{ opacity: textFadeAnim }}>
            <Text className="text-4xl font-bold text-white tracking-wider">
              Aramon
              <Text className="text-cyan-400"> AI</Text>
            </Text>
          </Animated.View>

          {/* Tagline */}
          <Animated.View style={{ opacity: subtitleFadeAnim }} className="mt-3">
            <Text className="text-slate-400 text-base tracking-wide">
              Your Naga City Health Companion
            </Text>
          </Animated.View>
        </Animated.View>

        {/* Loading indicator */}
        <Animated.View 
          style={{ opacity: subtitleFadeAnim }}
          className="absolute bottom-20"
        >
          <View className="flex-row items-center gap-1">
            {[0, 1, 2].map((i) => (
              <LoadingDot key={i} delay={i * 200} />
            ))}
          </View>
        </Animated.View>

        {/* Footer */}
        <Animated.View 
          style={{ opacity: subtitleFadeAnim }}
          className="absolute bottom-8"
        >
          <Text className="text-slate-600 text-xs">
            Part of NagaCare Health System
          </Text>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

// Animated loading dot component
function LoadingDot({ delay }: { delay: number }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 400,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={{ opacity }}
      className="w-2 h-2 rounded-full bg-cyan-400"
    />
  );
}
