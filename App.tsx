import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import RootNavigator from './navigation/RootNavigator';
import FloatingChatBubble from './components/FloatingChatBubble';

import './global.css';

export default function App() {
  return (
    <NavigationContainer>
      <View style={{ flex: 1 }}>
        <RootNavigator />
        <FloatingChatBubble />
        <StatusBar style="light" />
      </View>
    </NavigationContainer>
  );
}
