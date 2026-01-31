// ============================================================================
// DATE PICKER - Inline date selection in chat
// ============================================================================

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar, ChevronRight } from 'lucide-react-native';
import { DateOption } from '../../types/aramon';

interface DatePickerProps {
  dates: DateOption[];
  onSelect: (date: string) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({ dates, onSelect }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleSelect = (date: DateOption) => {
    if (!date.available) return;
    setSelectedDate(date.date);
  };

  const handleConfirm = () => {
    if (selectedDate) {
      onSelect(selectedDate);
    }
  };

  const isToday = (dateStr: string) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return dateStr === tomorrow.toISOString().split('T')[0];
  };

  return (
    <View className="my-2">
      <View className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
        {/* Header */}
        <View className="flex-row items-center mb-4">
          <Calendar size={20} {...{ color: "#06b6d4" }} />
          <Text className="text-white font-semibold ml-2 text-base">
            Select a Date
          </Text>
        </View>

        {/* Date Grid */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 8 }}
        >
          {dates.map((date) => {
            const isSelected = selectedDate === date.date;
            const isTomorrow = isToday(date.date);

            return (
              <TouchableOpacity
                key={date.date}
                onPress={() => handleSelect(date)}
                disabled={!date.available}
                activeOpacity={0.7}
                className={`mr-2 w-16 rounded-xl py-3 items-center ${
                  isSelected
                    ? 'bg-cyan-600 border-2 border-cyan-400'
                    : date.available
                      ? 'bg-slate-700 border border-slate-600'
                      : 'bg-slate-800 border border-slate-700 opacity-50'
                }`}
              >
                {isTomorrow && (
                  <View className="absolute -top-2 bg-amber-500 rounded-full px-1.5">
                    <Text className="text-[10px] text-black font-bold">
                      TMRW
                    </Text>
                  </View>
                )}
                <Text
                  className={`text-xs font-medium ${
                    isSelected ? 'text-cyan-100' : 'text-slate-400'
                  }`}
                >
                  {date.dayName}
                </Text>
                <Text
                  className={`text-xl font-bold mt-1 ${
                    isSelected ? 'text-white' : date.available ? 'text-white' : 'text-slate-500'
                  }`}
                >
                  {date.dayNumber}
                </Text>
                <Text
                  className={`text-xs ${
                    isSelected ? 'text-cyan-100' : 'text-slate-500'
                  }`}
                >
                  {date.monthName}
                </Text>
                {!date.available && (
                  <Text className="text-[10px] text-red-400 mt-1">Closed</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Confirm Button */}
        {selectedDate && (
          <TouchableOpacity
            onPress={handleConfirm}
            activeOpacity={0.8}
            className="flex-row items-center justify-center bg-cyan-600 rounded-xl py-3 mt-4"
          >
            <Text className="text-white font-semibold mr-1">
              Continue with{' '}
              {dates.find((d) => d.date === selectedDate)?.dayName},{' '}
              {dates.find((d) => d.date === selectedDate)?.monthName}{' '}
              {dates.find((d) => d.date === selectedDate)?.dayNumber}
            </Text>
            <ChevronRight size={18} {...{ color: "white" }} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default DatePicker;
