import React from 'react';
import { View, Text, Button, StyleSheet, Image } from 'react-native';

export default function WelcomeScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <View style={styles.img}>
                <Image
                    source={require('../../assets/logoappclima.png')}
                    style={styles.logoImage}
                />
            </View>
            <View>
                <Text style={styles.title}>¡Bienvenido a la App de Clima!</Text>
            </View>
            <View style={styles.logi}>
                <Button title="Iniciar sesión" onPress={() => navigation.navigate('Login')} />
            </View>
            <View style={styles.reg}>
                <Button title="Registrarse" onPress={() => navigation.navigate('Registrarse')} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1,justifyContent: 'center',alignItems: 'center',backgroundColor: 'rgb(12, 234, 237)',
    },title: {fontSize: 24,fontWeight: 'bold',marginBottom: 20},img: {marginBottom: 20,},logoImage: {width: 300,height: 300,},
    logi: {marginBottom: 5,marginTop: 15,width: '100%',},reg: { marginTop: 5,width: '100%',},
});
