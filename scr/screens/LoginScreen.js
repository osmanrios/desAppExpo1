import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (username === 'osman' && password === '1234') {
      navigation.navigate('Home');
    } else {
      Alert.alert('Error', 'Credenciales incorrectas');
    }
  };
  return (
    <View style={styles.container}>
      {/* Imagen arriba del título */}
      <View style={styles.img}>
        <Image
          source={require('../../assets/logoappclima.png')} // Ajusta la ruta según tu estructura
          style={styles.logoImage}
        />
      </View>
      <Text style={styles.title}>Iniciar Sesión</Text>
      <TextInput
        style={styles.input}
        placeholder="Usuario"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />
      <View style={styles.ing} >
        <Button title="Ingresar" onPress={handleLogin} />
      </View>
      <View style={styles.reg}>
        <Button title="Registrarse" onPress={() => navigation.navigate('Registrarse')} />
      </View>
      <View style={styles.rec}>
        <Button title="Recuperar contraseña" onPress={() => navigation.navigate('Recuperar')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ container: {flex: 1,justifyContent: 'center',alignItems: 'center',
padding: 20, backgroundColor: 'rgb(12, 234, 237)'},title: {fontSize: 22,fontWeight: 'bold',
marginBottom: 20,textAlign: 'center'},input: {height: 40,width: '100%',borderWidth: 1,marginBottom: 10,
paddingHorizontal: 10,borderRadius: 5,backgroundColor: '#fff'},img: {marginBottom: 20,},
logoImage: {width: 250,height: 250,resizeMode: 'contain',},rec: {marginTop: 15,width: '100%'},
ing: {marginTop: 15,  width: '100%' },reg: {marginTop: 15, width: '100%'},
});
