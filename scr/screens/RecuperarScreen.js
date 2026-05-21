import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialIcons';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../screens/firebase/firebaseConfig';

export default function Recuperar({ navigation }) {
  const [correo, setCorreo] = useState('');
  const [loading, setLoading] = useState(false);

  const manejarRecuperacion = async () => {

    if (!correo.trim()) {
      Alert.alert(
        'Error',
        'Por favor ingresa tu correo electrónico.'
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(correo)) {
      Alert.alert(
        'Correo inválido',
        'Ingresa un correo electrónico válido.'
      );
      return;
    }

    try {
      setLoading(true);

      await sendPasswordResetEmail(auth, correo.trim().toLowerCase());

      Alert.alert(
        '✅ Correo enviado',
        'Revisa tu bandeja de entrada o la carpeta Spam.'
      );

      navigation.navigate('Login');

    } catch (error) {

      console.log('ERROR FIREBASE:', error);
      console.log('ERROR CODE:', error.code);

      switch (error.code) {

        case 'auth/user-not-found':
          Alert.alert(
            'Usuario no encontrado',
            'No existe una cuenta registrada con ese correo.'
          );
          break;

        case 'auth/invalid-email':
          Alert.alert(
            'Correo inválido',
            'El correo ingresado no es válido.'
          );
          break;

        case 'auth/too-many-requests':
          Alert.alert(
            'Demasiados intentos',
            'Intenta nuevamente más tarde.'
          );
          break;

        default:
          Alert.alert(
            'Error',
            'Ocurrió un problema al enviar el correo.'
          );
          break;
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.contenedor}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >

      {/* Logo */}
      <Image
        source={require('../../assets/logof.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />

      {/* Separador */}
      <View style={styles.separatorContainer}>
        <View style={styles.line} />
        <Text style={styles.separatorText}>0</Text>
        <View style={styles.line} />
      </View>

      {/* Título */}
      <Text style={styles.titulo}>
        Recupera tu contraseña
      </Text>

      {/* Texto */}
      <Text style={styles.instruccion}>
        Ingresa el correo asociado a tu cuenta
        para enviarte un enlace de recuperación.
      </Text>

      {/* Input */}
      <View style={styles.inputContainer}>
        <Icon
          name="email"
          size={22}
          color="#000"
          style={styles.icon}
        />

        <TextInput
          style={styles.entrada}
          placeholder="Correo Electrónico"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={correo}
          onChangeText={(texto) =>
            setCorreo(texto.toLowerCase())
          }
        />
      </View>

      <Text style={styles.inputHint}>
        Ejemplo: nombre@gmail.com
      </Text>

      {/* Botón */}
      <TouchableOpacity
        style={[
          styles.boton,
          loading && { opacity: 0.7 }
        ]}
        onPress={manejarRecuperacion}
        disabled={loading}
      >

        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.botonTexto}>
            Enviar Enlace
          </Text>
        )}

      </TouchableOpacity>

      {/* Volver */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.volver}>
          Volver al Inicio de Sesión
        </Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.byText}>By</Text>
        <Text style={styles.companyText}>
          WO Devs
        </Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  scroll: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  contenedor: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 40,
    backgroundColor: '#ffffff',
  },

  logoImage: {
    width: 160,
    height: 160,
    marginBottom: 10,
  },

  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },

  separatorText: {
    marginHorizontal: 10,
    color: '#181B3A',
    fontSize: 16,
    fontWeight: 'bold',
  },

  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#181B3A',
    textAlign: 'center',
    marginBottom: 12,
  },

  instruccion: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    width: '100%',
    height: 50,
    marginBottom: 4,
  },

  icon: {
    marginRight: 8,
  },

  entrada: {
    flex: 1,
    fontSize: 16,
  },

  inputHint: {
    fontSize: 12,
    color: '#888',
    alignSelf: 'flex-start',
    marginBottom: 20,
    marginLeft: 4,
  },

  boton: {
    backgroundColor: '#181B3A',
    borderRadius: 8,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },

  botonTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  volver: {
    color: '#FF9045',
    fontSize: 15,
    textDecorationLine: 'underline',
    marginBottom: 20,
  },

  footer: {
    marginTop: 30,
    alignItems: 'center',
  },

  byText: {
    fontSize: 14,
    color: '#181B3A',
  },

  companyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#181B3A',
  },

});