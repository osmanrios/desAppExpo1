import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
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

  useEffect(() => {
    const cargarDatos = async () => {
      const usuario = auth.currentUser;
      if (!usuario) return;

      try {
        const docRef = doc(db, "Usuarios", usuario.uid);
        const docSnap = await getDoc(docRef);

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
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };

    cargarDatos();
  }, []);

  const handleGuardar = async () => {
    if (!nombre || !edad || !peso || !altura) {
      Alert.alert("Error", "Por favor completa todos los campos obligatorios.");
      return;
    }

    try {
      const usuario = auth.currentUser;
      if (!usuario) {
        Alert.alert("Error", "No hay usuario autenticado.");
        return;
      }

      await setDoc(
        doc(db, "Usuarios", usuario.uid),
        {
          nombre,
          edad: parseInt(edad),
          peso: parseFloat(peso),
          altura: parseFloat(altura),
          telefono,
          sexo,
          direccion,
          updatedAt: serverTimestamp(), // ✅ Se sigue guardando en Firestore
        },
        { merge: true }
      );

      Alert.alert("✅ Éxito", "Perfil actualizado correctamente");
      navigation.navigate("Perfil");
    } catch (error) {
      console.error("Error al guardar:", error);
      Alert.alert("Error", "No se pudo guardar el perfil.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar Perfil</Text>

      <Text style={styles.label}>Nombre:</Text>
      <TextInput
        style={styles.input}
        value={nombre}
        onChangeText={setNombre}
        placeholder="Ingresa tu nombre"
      />

      <Text style={styles.label}>Edad:</Text>
      <TextInput
        style={styles.input}
        value={edad}
        onChangeText={setEdad}
        placeholder="Ingresa tu edad"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Peso (kg):</Text>
      <TextInput
        style={styles.input}
        value={peso}
        onChangeText={setPeso}
        placeholder="Ingresa tu peso"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Altura (cm):</Text>
      <TextInput
        style={styles.input}
        value={altura}
        onChangeText={setAltura}
        placeholder="Ingresa tu altura"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Teléfono:</Text>
      <TextInput
        style={styles.input}
        value={telefono}
        onChangeText={setTelefono}
        placeholder="Ingresa tu teléfono"
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Sexo:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={sexo}
          onValueChange={(itemValue) => setSexo(itemValue)}
          style={styles.picker}
          dropdownIconColor="#FF9045"
        >
          <Picker.Item label="Selecciona..." value="" />
          <Picker.Item label="Masculino" value="M" />
          <Picker.Item label="Femenino" value="F" />
        </Picker>
      </View>

      <Text style={styles.label}>Dirección:</Text>
      <TextInput
        style={styles.input}
        value={direccion}
        onChangeText={setDireccion}
        placeholder="Ingresa tu dirección"
      />

      {/* 🔸 Se eliminó el campo visual de "Última actualización" */}

      <View style={styles.buttonContainer}>
        <Button title="Guardar" onPress={handleGuardar} color="#FF9045" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 70,
    backgroundColor: "#23252E",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#fff",
    marginTop: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 20,
    color: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginTop: 5,
    backgroundColor: "#fff",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginTop: 5,
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  buttonContainer: {
    marginTop: 50,
  },
});
