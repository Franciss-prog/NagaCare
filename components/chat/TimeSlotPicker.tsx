// ============================================================================
// TIME SLOT PICKER - Inline time selection in chat
// ============================================================================

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Clock, ChevronRight, Check } from 'lucide-react-native';
import { TimeSlot } from '../../types/aramon';

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  date: string;
  onSelect: (time: string) => void;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  slots,
  date,
  onSelect,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Separate morning and afternoon slots
  const morningSlots = slots.filter((slot) => slot.time.includes('AM'));
  const afternoonSlots = slots.filter((slot) => slot.time.includes('PM'));

  const handleSelect = (slot: TimeSlot) => {
    if (!slot.available) return;
    setSelectedSlot(slot.time);
  };

  const handleConfirm = () => {
    if (selectedSlot) {
      onSelect(selectedSlot);
    }
  };

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const renderSlots = (slotsToRender: TimeSlot[], label: string, icon: string) => (
    <View className="mb-3">
      <Text className="text-slate-400 text-xs font-medium mb-2 ml-1">
        {icon} {label}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {slotsToRender.map((slot) => {
          const isSelected = selectedSlot === slot.time;

          return (
            <TouchableOpacity
              key={slot.id}
              onPress={() => handleSelect(slot)}
              disabled={!slot.available}
              activeOpacity={0.7}
              className={`rounded-xl px-4 py-2.5 ${
                isSelected
                  ? 'bg-cyan-600 border-2 border-cyan-400'
                  : slot.available
                    ? 'bg-slate-700 border border-slate-600'
                    : 'bg-slate-800/50 border border-slate-700'
              }`}
            >
              <View className="flex-row items-center">
                {isSelected && (
                  <Check size={14} color="white" className="mr-1" />
                )}
                <Text
                  className={`text-sm font-medium ${
                    isSelected
                      ? 'text-white'
                      : slot.available
                        ? 'text-white'
                        : 'text-slate-500 line-through'
                  }`}
                >
                  {slot.time}
                </Text>
              </View>
              {!slot.available && (
                <Text className="text-[10px] text-red-400 text-center">
                  Full
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <View className="my-2">
      <View className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Clock size={20} color="#06b6d4" />
            <Text className="text-white font-semibold ml-2 text-base">
              Select a Time
            </Text>
          </View>
          <View className="bg-slate-700 rounded-full px-3 py-1">
            <Text className="text-slate-300 text-xs">{formattedDate}</Text>
          </View>
        </View>

        {/* Time Slots */}
        {morningSlots.length > 0 && renderSlots(morningSlots, 'Morning', '🌅')}
        {afternoonSlots.length > 0 && renderSlots(afternoonSlots, 'Afternoon', '☀️')}

        {/* No slots available message */}
        {slots.filter((s) => s.available).length === 0 && (
          <View className="items-center py-6">
            <Text className="text-slate-400 text-center">
              No time slots available for this date.
            </Text>
            <Text className="text-slate-500 text-sm text-center mt-1">
              Please select a different date.
            </Text>
          </View>
        )}

        {/* Confirm Button */}
        {selectedSlot && (
          <TouchableOpacity
            onPress={handleConfirm}
            activeOpacity={0.8}
            className="flex-row items-center justify-center bg-cyan-600 rounded-xl py-3 mt-4"
          >
            <Text className="text-white font-semibold mr-1">
              Continue with {selectedSlot}
            </Text>
            <ChevronRight size={18} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default TimeSlotPicker;
