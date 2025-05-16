import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, Image } from 'react-native';
export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const handleRegister = () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }
    // Aquí iría la lógica para registrar el usuario (API, base de datos, etc.)
    Alert.alert('Éxito', 'Registro completado correctamente.');
    navigation.navigate('Login'); // Navega a login tras registro exitoso
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.img}>
        <Image
          source={require('../../assets/logoappclima.png')}
          style={styles.logoImage}
        />
      </View>
      <Text style={styles.title}>Crear Cuenta</Text>
      <TextInput
        style={styles.input}
        placeholder="Usuario"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"/>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"/>
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry/>
      <TextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry/>
      <View style={styles.button}>
        <Button title="Registrarse" onPress={handleRegister} />
      </View><View style={styles.loginRedirect}>
        <Text>¿Ya tienes cuenta? </Text>
        <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
          Inicia sesión
        </Text></View>
    </ScrollView>);}
const styles = StyleSheet.create({
  container: { padding: 20, justifyContent: 'center', flexGrow: 1, backgroundColor: 'rgb(12, 234, 237)', },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 25, textAlign: 'center', }, input: {
    height: 50, backgroundColor: '#fff',
    borderRadius: 5, paddingHorizontal: 15, marginBottom: 15, fontSize: 16,
  }, button: { marginTop: 10, marginBottom: 20, },
  loginRedirect: { flexDirection: 'row', justifyContent: 'center', }, link: {
    color: 'blue', textDecorationLine: 'underline',
  }, img: { marginBottom: 5, justifyContent: 'center', alignItems: 'center', }, logoImage: { width: 300, height: 300, },
});
