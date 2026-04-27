import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CameraScreen from './src/screens/CameraScreen';
import SimulationScreen from './src/screens/SimulationScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Camera"
        screenOptions={{
          headerStyle: { backgroundColor: '#4A90D9' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
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
