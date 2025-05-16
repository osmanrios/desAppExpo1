import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RecuperarScreen from '../screens/RecuperarScreen';


const Stack = createStackNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Bienvenido">
                <Stack.Screen name="Bienvenido" component={WelcomeScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Registrarse" component={RegisterScreen} />
                 <Stack.Screen name="Recuperar" component={RecuperarScreen} />

            </Stack.Navigator>
        </NavigationContainer>
    );
}