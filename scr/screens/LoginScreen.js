import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../screens/firebase/firebaseConfig";  // Ajusta la ruta si es diferente

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 🔥 Login con Firebase + Firestore
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor ingresa correo y contraseña");
      return;
    }

    try {
      // 1. Iniciar sesión
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Buscar el rol en Firestore
      const docRef = doc(db, "Usuarios", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        if (data.role === "admin") {
          navigation.replace("PanelAdmin");
        } else if (data.role === "cliente") {
          navigation.replace("PanelClientes");
        } else {
          Alert.alert("⚠️ Error", "Rol no reconocido");
        }
      } else {
        if (user.email === "vitalsport@gmail.com") {
          await setDoc(doc(db, "Usuarios", user.uid), {
            email: user.email,
            role: "admin",
            nombre: "Administrador"
          });
          Alert.alert("✅ Admin registrado en Firestore");
          navigation.replace("PanelAdmin");
        } else {
          Alert.alert("⚠️ Error", "El usuario no tiene rol definido en la base de datos");
        }
      }

    } catch (error) {
      console.error("Error Firebase:", error.message);
      Alert.alert("❌ Error", "Correo o contraseña incorrectos");
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require('../../assets/LogoWOFitGestorX.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.separatorContainer}>
        <View style={styles.line} />
        <Text style={styles.separatorText}>O</Text>
        <View style={styles.line} />
      </View>

      {/* Subtítulo */}
      <Text style={styles.subtitle}>¡Ingresa ahora mismo!</Text>

      {/* Input Usuario */}
      <View style={styles.inputContainer}>
        <Icon name="email" size={22} color="#000" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          value={email}
          onChangeText={(text) => setEmail(text.toLowerCase())} // ✅ FORZAR MINÚSCULAS
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      {/* Input Contraseña */}
      <View style={styles.inputContainer}>
        <Icon name="lock" size={22} color="#000" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon
            name={showPassword ? 'visibility' : 'visibility-off'}
            size={22}
            color="#000"
          />
        </TouchableOpacity>
      </View>

      {/* Botón Login */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>

      {/* Recuperar contraseña */}
      <TouchableOpacity onPress={() => navigation.navigate("Recuperar")}>
        <Text style={styles.forgotPassword}>Olvidó su Contraseña</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23252E',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 10,
    marginTop: -60,
  },
  subtitle: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 25,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    width: '100%',
    height: 50,
  },
  icon: { marginRight: 5 },
  input: { flex: 1, fontSize: 16 },
  button: {
    backgroundColor: '#ff6600',
    borderRadius: 8,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  forgotPassword: {
    color: '#FF9045',
    marginTop: 15,
    textDecorationLine: 'underline',
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  separatorText: {
    marginHorizontal: 10,
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#fff",
  },
});
