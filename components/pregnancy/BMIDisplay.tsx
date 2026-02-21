// ============================================================================
// BMI DISPLAY - Auto-calculated BMI indicator
// Shows BMI value with color-coded status
// ============================================================================

import React from 'react';
import { View, Text } from 'react-native';

interface BMIDisplayProps {
  heightCm: number | null;
  weightKg: number | null;
}

function calculateBMI(heightCm: number | null, weightKg: number | null): number | null {
  if (!heightCm || !weightKg || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(2));
}

function getBMICategory(bmi: number): { label: string; color: string; bgColor: string } {
  if (bmi < 18.5)
    return { label: 'Underweight', color: 'text-amber-400', bgColor: 'bg-amber-600/20' };
  if (bmi < 25) return { label: 'Normal', color: 'text-green-400', bgColor: 'bg-green-600/20' };
  if (bmi < 30)
    return { label: 'Overweight', color: 'text-orange-400', bgColor: 'bg-orange-600/20' };
  return { label: 'Obese', color: 'text-red-400', bgColor: 'bg-red-600/20' };
}

export const BMIDisplay = ({ heightCm, weightKg }: BMIDisplayProps) => {
  const bmi = calculateBMI(heightCm, weightKg);

  if (bmi === null) {
    return (
      <View className="mb-4 rounded-xl border border-slate-700 bg-slate-800/30 p-3">
        <Text className="text-center text-sm text-slate-500">
          Enter height and weight to calculate BMI
        </Text>
      </View>
    );
  }

  const category = getBMICategory(bmi);

  return (
    <View className={`${category.bgColor} mb-4 rounded-xl border border-slate-700 p-3`}>
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-xs text-slate-400">BMI (Auto-calculated)</Text>
          <Text className={`text-2xl font-bold ${category.color}`}>{bmi}</Text>
        </View>
        <View className="items-end">
          <Text className={`font-semibold ${category.color}`}>{category.label}</Text>
          <Text className="text-xs text-slate-500">kg/m²</Text>
        </View>
      </View>
    </View>
  );
};

/** Utility: calculate BMI for service layer */
export { calculateBMI };
