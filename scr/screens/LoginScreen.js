import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../screens/firebase/firebaseConfig";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [modoOscuro, setModoOscuro] = useState(false);

  useEffect(() => {
    const cargarTema = async () => {
      try {
        const temaGuardado = await AsyncStorage.getItem('modoOscuro');
        if (temaGuardado !== null) setModoOscuro(JSON.parse(temaGuardado));
      } catch (e) { console.error(e); }
    };
    cargarTema();
  }, []);

  const toggleTema = async () => {
    try {
      const nuevo = !modoOscuro;
      setModoOscuro(nuevo);
      await AsyncStorage.setItem('modoOscuro', JSON.stringify(nuevo));
    } catch (e) { console.error(e); }
  };

  const tema = {
    fondo: modoOscuro ? "#23252E" : "#ffffff",
    texto: modoOscuro ? "#ffffff" : "#181B3A",
    subtexto: modoOscuro ? "#aaa" : "#888",
    inputBg: modoOscuro ? "#2E3038" : "#fff",
    inputBorder: modoOscuro ? "#3A3D46" : "#ccc",
    inputTexto: modoOscuro ? "#fff" : "#000",
    placeholder: modoOscuro ? "#888" : "#999",
    icono: modoOscuro ? "#fff" : "#000",
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor ingresa correo y contraseña");
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
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
          navigation.replace("PanelAdmin");
        } else {
          Alert.alert("⚠️ Error", "El usuario no tiene rol definido");
        }
      }
    } catch (error) {
      console.error("Error Firebase:", error.message);
      Alert.alert("❌ Error", "Correo o contraseña incorrectos");
    }
  };

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: tema.fondo }]}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >

      {/* TOGGLE TEMA */}
      <TouchableOpacity style={styles.temaBtn} onPress={toggleTema}>
        <Icon
          name={modoOscuro ? "wb-sunny" : "nightlight-round"}
          size={26}
          color={modoOscuro ? "#FF9045" : "#181B3A"}
        />
      </TouchableOpacity>

      {/* Logo — cambia según el tema */}
      <Image
        source={modoOscuro ? require('../../assets/logoo.png') : require('../../assets/logof.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Título */}
      <Text style={[styles.subtitle, { color: tema.texto }]}>¡Ingresa ahora mismo!</Text>

      {/* Input Correo */}
      <View style={[styles.inputContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
        <Icon name="email" size={22} color={tema.icono} style={styles.icon} />
        <TextInput
          style={[styles.input, { color: tema.inputTexto }]}
          placeholder="Correo Electrónico"
          placeholderTextColor={tema.placeholder}
          value={email}
          onChangeText={(text) => setEmail(text.toLowerCase())}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>
      <Text style={[styles.inputHint, { color: tema.subtexto }]}>Ejemplo: nombre@gmail.com</Text>

      {/* Input Contraseña */}
      <View style={[styles.inputContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
        <Icon name="lock" size={22} color={tema.icono} style={styles.icon} />
        <TextInput
          style={[styles.input, { color: tema.inputTexto }]}
          placeholder="Contraseña"
          placeholderTextColor={tema.placeholder}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon name={showPassword ? 'visibility' : 'visibility-off'} size={22} color={tema.icono} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.inputHint, { color: tema.subtexto }]}>Debe tener al menos 6 caracteres</Text>

      {/* Botón Iniciar Sesión */}
      <TouchableOpacity style={styles.buttonLogin} onPress={handleLogin}>
        <Text style={styles.buttonLoginText}>Iniciar Sesión</Text>
      </TouchableOpacity>

      {/* Botón Crear Cuenta */}
      <TouchableOpacity
        style={[styles.buttonRegister, { borderColor: tema.inputBorder }]}
        onPress={() => navigation.navigate("Register")}
      >
        <Text style={[styles.buttonRegisterText, { color: tema.texto }]}>Crear Cuenta</Text>
      </TouchableOpacity>

      {/* Olvidé contraseña */}
      <TouchableOpacity onPress={() => navigation.navigate("Recuperar")}>
        <Text style={styles.forgotPassword}>Olvidé mi contraseña</Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.byText, { color: tema.texto }]}>By</Text>
        <Text style={[styles.companyText, { color: tema.texto }]}>WO Devs</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 40,
  },
  temaBtn: { position: 'absolute', top: 50, right: 20 },
  logo: { width: 160, height: 160, marginBottom: 10 },
  subtitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 25 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    width: '100%',
    height: 50,
    marginBottom: 4,
  },
  icon: { marginRight: 8 },
  input: { flex: 1, fontSize: 16 },
  inputHint: { fontSize: 12, alignSelf: 'flex-start', marginBottom: 14, marginLeft: 4 },
  buttonLogin: {
    backgroundColor: '#181B3A',
    borderRadius: 8,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  buttonLoginText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  buttonRegister: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 16,
  },
  buttonRegisterText: { fontSize: 18, fontWeight: 'bold' },
  forgotPassword: { color: '#FF9045', fontSize: 14, textDecorationLine: 'underline', marginBottom: 20 },
  footer: { marginTop: 30, alignItems: 'center' },
  byText: { fontSize: 14 },
  companyText: { fontSize: 16, fontWeight: 'bold' },
});