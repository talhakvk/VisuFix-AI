import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CameraScreen from './src/screens/CameraScreen';
import SimulationScreen from './src/screens/SimulationScreen';

const COLORS = {
  bgPrimary: '#0a0a0a',
  bgSecondary: '#111111',
  bgCard: '#1a1a1a',
  border: '#2a2a2a',
  textPrimary: '#ffffff',
  textSecondary: '#a0a0a0',
  accent: '#FF3B30',
  accentHover: '#ff5247',
  success: '#30D158',
  warning: '#FFD60A',
  error: '#FF3B30',
};

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Camera"
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.bgSecondary },
          headerTintColor: COLORS.textPrimary,
          headerTitleStyle: { fontWeight: '600', color: COLORS.textPrimary },
        }}
      >
        <Stack.Screen
          name="Camera"
          component={CameraScreen}
          options={{ title: 'VisuFix AI' }}
        />
        <Stack.Screen
          name="Simulation"
          component={SimulationScreen}
          options={{ title: 'Analiz Sonucu' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
