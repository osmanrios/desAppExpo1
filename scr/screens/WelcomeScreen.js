import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';

export default function WelcomeScreen({ navigation }) {

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Login");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>

      {/* Logo centrado */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/logofit.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        
      </View>

      {/* Texto inferior */}
      <View style={styles.footer}>
        <Text style={styles.byText}>By</Text>
        <Text style={styles.companyText}>WO Devs</Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 250,
    height: 250,
  },
  footer: {
    marginBottom: 50,
    alignItems: 'center',
  },
  byText: {
    fontSize: 16,
    color: '#181B3A',
  },
  companyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
});

