// ============================================================================
// SECTION ACCORDION - Collapsible section for multi-section forms
// ============================================================================

import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

interface SectionAccordionProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  /** Visual badge/status indicator */
  badge?: string;
  badgeColor?: string;
}

export const SectionAccordion = ({
  title,
  subtitle,
  icon,
  children,
  defaultOpen = false,
  badge,
  badgeColor = 'bg-cyan-600',
}: SectionAccordionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <View className="mb-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
      <TouchableOpacity
        onPress={() => setIsOpen(!isOpen)}
        className="flex-row items-center justify-between px-4 py-4"
        activeOpacity={0.7}>
        <View className="flex-1 flex-row items-center">
          {icon && <View className="mr-3">{icon}</View>}
          <View className="flex-1">
            <Text className="text-base font-semibold text-white">{title}</Text>
            {subtitle && <Text className="mt-0.5 text-xs text-slate-400">{subtitle}</Text>}
          </View>
          {badge && (
            <View className={`${badgeColor} mr-3 rounded-full px-2 py-1`}>
              <Text className="text-xs font-medium text-white">{badge}</Text>
            </View>
          )}
        </View>
        <View
          style={{
            transform: [{ rotate: isOpen ? '180deg' : '0deg' }],
          }}>
          <ChevronDown size={20} {...{ color: '#64748b' }} />
        </View>
      </TouchableOpacity>

      {isOpen && <View className="border-t border-slate-800/50 px-4 pb-4">{children}</View>}
    </View>
  );
};
