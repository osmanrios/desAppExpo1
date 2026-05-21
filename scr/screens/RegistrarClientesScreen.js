import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../screens/firebase/firebaseConfig";

export default function RegistrarCliente({ navigation }) {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [sexo, setSexo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("123456");
  const [modoOscuro, setModoOscuro] = useState(false);

  // 🔹 CARGAR TEMA GUARDADO
  useEffect(() => {
    const cargarTema = async () => {
      try {
        const temaGuardado = await AsyncStorage.getItem("modoOscuro");
        if (temaGuardado !== null) setModoOscuro(JSON.parse(temaGuardado));
      } catch (e) { console.error(e); }
    };
    cargarTema();
  }, []);

  // 🔹 GUARDAR TEMA AL CAMBIAR
  const toggleTema = async () => {
    try {
      const nuevo = !modoOscuro;
      setModoOscuro(nuevo);
      await AsyncStorage.setItem("modoOscuro", JSON.stringify(nuevo));
    } catch (e) { console.error(e); }
  };

  const tema = {
    fondo: modoOscuro ? "#23252E" : "#f4f4f4",
    card: modoOscuro ? "#2e3038" : "#fff",
    texto: modoOscuro ? "#fff" : "#181B3A",
    subtexto: modoOscuro ? "#aaa" : "#888",
    icono: modoOscuro ? "#fff" : "#181B3A",
    inputBg: modoOscuro ? "#2e3038" : "#fff",
    inputBorder: modoOscuro ? "#3a3d46" : "#eee",
    inputTexto: modoOscuro ? "#fff" : "#000",
    placeholder: modoOscuro ? "#aaa" : "#999",
    navBg: modoOscuro ? "#2e3038" : "#fff",
    navBorder: modoOscuro ? "#3a3d46" : "#eee",
  };

  const handleRegistrar = async () => {
    if (!nombre || !telefono || !direccion || !sexo || !email) {
      Alert.alert("⚠️ Campos incompletos", "Por favor llena todos los campos");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "Usuarios", user.uid), {
        nombre, telefono, direccion, sexo, email, role: "cliente", createdAt: new Date(),
      });
      Alert.alert("✅ Éxito", "Cliente registrado correctamente");
      setNombre(""); setTelefono(""); setDireccion(""); setSexo(""); setEmail(""); setPassword("123456");
      navigation.replace("RegistrarMembresias");
    } catch (error) {
      console.error("Error al registrar cliente:", error.message);
      Alert.alert("❌ Error", error.message);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: tema.fondo }]}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={tema.icono} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: tema.texto }]}>Registrar Clientes</Text>
        <TouchableOpacity onPress={toggleTema}>
          <Icon name={modoOscuro ? "weather-night" : "white-balance-sunny"} size={24} color={modoOscuro ? "#FF9045" : "#181B3A"} />
        </TouchableOpacity>
      </View>

      {/* ICONO */}
      <View style={styles.iconContainer}>
        <Icon name="account-plus" size={56} color="#FF9045" />
      </View>

      {/* FORMULARIO */}
      <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <Text style={[styles.label, { color: tema.texto }]}>Nombre</Text>
        <TextInput style={[styles.input, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder, color: tema.inputTexto }]} placeholder="Ejemplo: Juan Perez" placeholderTextColor={tema.placeholder} value={nombre} onChangeText={setNombre} />

        <Text style={[styles.label, { color: tema.texto }]}>Teléfono</Text>
        <TextInput style={[styles.input, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder, color: tema.inputTexto }]} placeholder="Ejemplo: 1234567890" placeholderTextColor={tema.placeholder} value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />

        <Text style={[styles.label, { color: tema.texto }]}>Dirección de Residencia</Text>
        <TextInput style={[styles.input, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder, color: tema.inputTexto }]} placeholder="Ejemplo: Kr 14 12-47" placeholderTextColor={tema.placeholder} value={direccion} onChangeText={setDireccion} />

        <Text style={[styles.label, { color: tema.texto }]}>Sexo</Text>
        <View style={[styles.pickerContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
          <Picker selectedValue={sexo} onValueChange={setSexo} dropdownIconColor={tema.icono} style={{ color: tema.inputTexto }}>
            <Picker.Item label="Seleccionar..." value="" />
            <Picker.Item label="M" value="M" />
            <Picker.Item label="F" value="F" />
          </Picker>
        </View>

        <Text style={[styles.label, { color: tema.texto }]}>Correo Electrónico</Text>
        <TextInput style={[styles.input, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder, color: tema.inputTexto }]} placeholder="Ejemplo@gmail.com" placeholderTextColor={tema.placeholder} value={email} onChangeText={(text) => setEmail(text.toLowerCase())} autoCapitalize="none" keyboardType="email-address" />

        <Text style={[styles.label, { color: tema.texto }]}>Contraseña</Text>
        <View style={[styles.passwordContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
          <TextInput style={[styles.passwordInput, { color: tema.inputTexto }]} value="123456" editable={false} secureTextEntry={true} />
        </View>
        <Text style={[styles.infoText, { color: tema.subtexto }]}>Contraseña por defecto: 123456</Text>

        <TouchableOpacity style={styles.button} onPress={handleRegistrar}>
          <Text style={styles.buttonText}>Registrar</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* BARRA INFERIOR */}
      <View style={[styles.bottomNav, { backgroundColor: tema.navBg, borderTopColor: tema.navBorder }]}>
        {[
          { icon: "home-outline", screen: "PanelAdmin" },
          { icon: "account-group", screen: "GestionClientes" },
          { icon: "card-account-details", screen: "GestionMembresias" },
          { icon: "currency-usd", screen: "GestionPagos" },
          { icon: "clipboard-list", screen: "GestionAsistencias" },
        ].map((item) => (
          <TouchableOpacity key={item.screen} onPress={() => navigation.navigate(item.screen)}>
            <Icon name={item.icon} size={28} color={tema.icono} />
          </TouchableOpacity>
        ))}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: 30, paddingHorizontal: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  iconContainer: { alignItems: "center", marginBottom: 10, marginTop: 6 },
  formContainer: { paddingBottom: 130 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6, marginTop: 8 },
  input: { borderRadius: 8, paddingHorizontal: 15, marginBottom: 6, height: 50, fontSize: 16, borderWidth: 1, elevation: 1 },
  pickerContainer: { borderRadius: 8, marginBottom: 6, height: 50, justifyContent: "center", borderWidth: 1, elevation: 1 },
  passwordContainer: { borderRadius: 8, height: 50, justifyContent: "center", paddingHorizontal: 15, marginBottom: 6, borderWidth: 1, elevation: 1 },
  passwordInput: { fontSize: 16 },
  infoText: { fontSize: 13, textAlign: "center", marginBottom: 10, marginTop: 4 },
  button: { backgroundColor: "#181B3A", borderRadius: 8, paddingVertical: 14, alignItems: "center", marginTop: 12 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  bottomNav: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingVertical: 12, borderTopWidth: 1, borderRadius: 16, position: "absolute", bottom: 15, width: "90%", alignSelf: "center", elevation: 6 },
});