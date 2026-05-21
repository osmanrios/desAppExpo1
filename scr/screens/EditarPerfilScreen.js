import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../screens/firebase/firebaseConfig";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export default function EditarPerfilScreen({ navigation }) {
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [telefono, setTelefono] = useState("");
  const [sexo, setSexo] = useState("");
  const [direccion, setDireccion] = useState("");
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

  // 🎨 TEMA
  const tema = {
    fondo: modoOscuro ? "#23252E" : "#f4f4f4",
    texto: modoOscuro ? "#ffffff" : "#181B3A",
    inputBg: modoOscuro ? "#2E3038" : "#ffffff",
    inputBorder: modoOscuro ? "#3A3D46" : "#ccc",
    inputTexto: modoOscuro ? "#ffffff" : "#000000",
    placeholder: modoOscuro ? "#888" : "#999",
  };

  // 🔹 CARGAR DATOS
  useEffect(() => {
    const cargarDatos = async () => {
      const usuario = auth.currentUser;
      if (!usuario) return;
      try {
        const docSnap = await getDoc(doc(db, "Usuarios", usuario.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setNombre(data.nombre || "");
          setEdad(data.edad ? data.edad.toString() : "");
          setPeso(data.peso ? data.peso.toString() : "");
          setAltura(data.altura ? data.altura.toString() : "");
          setTelefono(data.telefono || "");
          setSexo(data.sexo || "");
          setDireccion(data.direccion || "");
        }
      } catch (error) { console.error("Error al cargar los datos:", error); }
    };
    cargarDatos();
  }, []);

  // 🔹 GUARDAR
  const handleGuardar = async () => {
    if (!nombre || !edad || !peso || !altura) {
      Alert.alert("Error", "Por favor completa todos los campos obligatorios.");
      return;
    }
    try {
      const usuario = auth.currentUser;
      if (!usuario) { Alert.alert("Error", "No hay usuario autenticado."); return; }
      await setDoc(
        doc(db, "Usuarios", usuario.uid),
        { nombre, edad: parseInt(edad), peso: parseFloat(peso), altura: parseFloat(altura), telefono, sexo, direccion, updatedAt: serverTimestamp() },
        { merge: true }
      );
      Alert.alert("✅ Éxito", "Perfil actualizado correctamente");
      navigation.navigate("Perfil");
    } catch (error) {
      console.error("Error al guardar:", error);
      Alert.alert("Error", "No se pudo guardar el perfil.");
    }
  };

  const campos = [
    { label: "Nombre", value: nombre, onChange: setNombre, placeholder: "Ingresa tu nombre", keyboard: "default" },
    { label: "Edad", value: edad, onChange: setEdad, placeholder: "Ingresa tu edad", keyboard: "numeric" },
    { label: "Peso (kg)", value: peso, onChange: setPeso, placeholder: "Ingresa tu peso", keyboard: "numeric" },
    { label: "Altura (cm)", value: altura, onChange: setAltura, placeholder: "Ingresa tu altura", keyboard: "numeric" },
    { label: "Teléfono", value: telefono, onChange: setTelefono, placeholder: "Ingresa tu teléfono", keyboard: "phone-pad" },
    { label: "Dirección", value: direccion, onChange: setDireccion, placeholder: "Ingresa tu dirección", keyboard: "default" },
  ];

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: tema.fondo }]}>
      <Text style={[styles.title, { color: tema.texto }]}>Editar Perfil</Text>

      {campos.map((campo) => (
        <View key={campo.label}>
          <Text style={[styles.label, { color: tema.texto }]}>{campo.label}:</Text>
          <TextInput
            style={[styles.input, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder, color: tema.inputTexto }]}
            value={campo.value}
            onChangeText={campo.onChange}
            placeholder={campo.placeholder}
            placeholderTextColor={tema.placeholder}
            keyboardType={campo.keyboard}
          />
        </View>
      ))}

      {/* SEXO */}
      <Text style={[styles.label, { color: tema.texto }]}>Sexo:</Text>
      <View style={[styles.pickerContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
        <Picker
          selectedValue={sexo}
          onValueChange={setSexo}
          style={{ color: tema.inputTexto }}
          dropdownIconColor="#FF9045"
        >
          <Picker.Item label="Selecciona..." value="" />
          <Picker.Item label="Masculino" value="M" />
          <Picker.Item label="Femenino" value="F" />
        </Picker>
      </View>

      {/* BOTÓN GUARDAR */}
      <TouchableOpacity style={styles.saveButton} onPress={handleGuardar}>
        <Text style={styles.saveText}>Guardar</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, paddingTop: 70 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center", marginTop: 40 },
  label: { fontSize: 16, fontWeight: "bold", marginTop: 20 },
  input: { borderWidth: 1, borderRadius: 10, padding: 10, marginTop: 5, elevation: 1 },
  pickerContainer: { borderWidth: 1, borderRadius: 10, marginTop: 5, elevation: 1 },
  saveButton: { backgroundColor: "#FF9045", borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 50, marginBottom: 30 },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});