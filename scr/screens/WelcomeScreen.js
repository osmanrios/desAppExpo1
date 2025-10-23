import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';

export default function WelcomeScreen({ navigation }) {

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Login"); // Usa replace para que no pueda volver atrás
    }, 5000);

    return () => clearTimeout(timer); // Limpia el timer si el componente se desmonta
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/LogoWOFitGestorX.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,                // Ocupa toda la pantalla
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#23252E', // Fondo blanco (puedes cambiarlo)
  },
  logoImage: {
    width: '100%',   // Ocupa todo el ancho del celular
    height: '100%',  // Ocupa todo el alto del celular
  },
});

