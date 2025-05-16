import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image } from 'react-native';
export default function RecuperarScreen({ navigation }) {
  const [correo, setCorreo] = useState('');
  const manejarRecuperacion = () => {
    if (!correo) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico.');
      return;
    }
    // Aquí va la lógica para enviar el correo de recuperación
    Alert.alert(
      'Correo enviado',
      'Hemos enviado un enlace para restablecer tu contraseña a tu correo.'
    );
    navigation.navigate('Login'); // Opcional, vuelve a la pantalla de inicio de sesión
  };
  return (
    <View style={styles.contenedor}>
      <View style={styles.img}>
        <Image
          source={require('../../assets/logoappclima.png')}
          style={styles.logoImage}
        />
      </View>
      <Text style={styles.titulo}>Recuperar Contraseña</Text>
      <Text style={styles.instruccion}>
        Ingresa el correo electrónico asociado a tu cuenta para enviar un enlace de recuperación.
      </Text>
      <TextInput
        style={styles.entrada}
        placeholder="Correo electrónico"
        keyboardType="email-address"
        autoCapitalize="none"
        value={correo}
        onChangeText={setCorreo}
      />
      <View style={styles.botonContenedor}>
        <Button title="Enviar enlace" onPress={manejarRecuperacion} />
      </View>
      <Text style={styles.volver} onPress={() => navigation.navigate('Login')}>
        Volver al inicio de sesión
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  contenedor: {flex: 1,padding: 20,justifyContent: 'center',backgroundColor: 'rgb(12, 234, 237)',},
  titulo: {fontSize: 28,fontWeight: 'bold',marginBottom: 20,textAlign: 'center',},
  instruccion: {fontSize: 16,marginBottom: 20,textAlign: 'center',color: '#333',},entrada: {height: 50,backgroundColor: '#fff',
  borderRadius: 5,paddingHorizontal: 15,marginBottom: 20,fontSize: 16,},botonContenedor: {marginBottom: 20,},
  volver: {textAlign: 'center',color: 'blue',textDecorationLine: 'underline',fontSize: 16,},img: {
marginBottom: 5,justifyContent: 'center',alignItems: 'center',},logoImage: {width: 300,height: 300,},
});
