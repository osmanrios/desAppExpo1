import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import PanelAdminScreen from '../screens/PanelAdminScreen';
import RegisterScreen from '../screens/RegisterScreen';
import RecuperarScreen from '../screens/RecuperarScreen';
import RegistrarClientesScreen from '../screens/RegistrarClientesScreen';
import RegistrarMembresiasScreen from '../screens/RegistrarMembresiasScreen';
import RegistrarPagosScreen from '../screens/RegistrarPagosScreen';
import RegistrarAsistenciasScreen from '../screens/RegistrarAsistenciasScreen';
import PanelClientesScreen from '../screens/PanelClientesScreen';
import GestionPagosScreen from '../screens/GestionPagosScreen';
import GestionAsistenciasScreen from '../screens/GestionAsistenciasScreen';
import GestionClientesScreen from '../screens/GestionClientesScreen';
import GestionMembresiasScreen from '../screens/GestionMembresiasScreen';
import MembresiaScreen from '../screens/MembresiaScreen';
import AsistenciaScreen from '../screens/AsistenciaScreen';
import EditarPerfilScreen from '../screens/EditarPerfilScreen';
import PerfilClienteScreen from '../screens/PerfilClienteScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      {/* 🔹 Ocultamos todos los headers */}
      <Stack.Navigator
        initialRouteName="Bienvenido"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Bienvenido" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="PanelAdmin" component={PanelAdminScreen} />
        <Stack.Screen name="Registrarse" component={RegisterScreen} />
        <Stack.Screen name="Recuperar" component={RecuperarScreen} />
        <Stack.Screen name="RegistrarClientes" component={RegistrarClientesScreen} />
        <Stack.Screen name="RegistrarMembresias" component={RegistrarMembresiasScreen} />
        <Stack.Screen name="RegistrarPagos" component={RegistrarPagosScreen} />
        <Stack.Screen name="RegistrarAsistencias" component={RegistrarAsistenciasScreen} />
        <Stack.Screen name="PanelClientes" component={PanelClientesScreen} />
        <Stack.Screen name="GestionPagos" component={GestionPagosScreen} />
        <Stack.Screen name="GestionAsistencias" component={GestionAsistenciasScreen} />
        <Stack.Screen name="GestionClientes" component={GestionClientesScreen} />
        <Stack.Screen name="GestionMembresias" component={GestionMembresiasScreen} />
        <Stack.Screen name="Membresia" component={MembresiaScreen} />
        <Stack.Screen name="Asistencia" component={AsistenciaScreen} />
        <Stack.Screen name="EditarPerfil" component={EditarPerfilScreen} />
        <Stack.Screen name="Perfil" component={PerfilClienteScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
