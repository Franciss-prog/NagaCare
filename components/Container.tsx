import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';

export const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="m-6 flex-1">{children}</View>
    </SafeAreaView>
  );
};
