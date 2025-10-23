import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
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
  const [password, setPassword] = useState("123456"); // 🔹 Contraseña fija

  const handleRegistrar = async () => {
    if (!nombre || !telefono || !direccion || !sexo || !email) {
      Alert.alert("⚠️ Campos incompletos", "Por favor llena todos los campos");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "Usuarios", user.uid), {
        nombre,
        telefono,
        direccion,
        sexo,
        email,
        role: "cliente",
        createdAt: new Date(),
      });

      Alert.alert("✅ Éxito", "Cliente registrado correctamente");

      setNombre("");
      setTelefono("");
      setDireccion("");
      setSexo("");
      setEmail("");
      setPassword("123456");

      navigation.replace("RegistrarMembresias");
    } catch (error) {
      console.error("Error al registrar cliente:", error.message);
      Alert.alert("❌ Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registrar Clientes</Text>
        <Icon name="bell-outline" size={24} color="#fff" />
      </View>

      {/* Icono principal */}
      <View style={styles.iconContainer}>
        <Icon name="account-plus" size={56} color="#FF9045" />
      </View>

      {/* Formulario */}
      <ScrollView
        contentContainerStyle={styles.formContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          placeholder="Ejemplo: Juan Perez"
          placeholderTextColor="#999"
          value={nombre}
          onChangeText={setNombre}
        />

        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={styles.input}
          placeholder="Ejemplo: 1234567890"
          placeholderTextColor="#999"
          value={telefono}
          onChangeText={setTelefono}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Dirección de Residencia</Text>
        <TextInput
          style={styles.input}
          placeholder="Ejemplo: Kr 14 12-47"
          placeholderTextColor="#999"
          value={direccion}
          onChangeText={setDireccion}
        />

        {/* Selector de Sexo */}
        <Text style={styles.label}>Sexo</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={sexo}
            onValueChange={(itemValue) => setSexo(itemValue)}
            dropdownIconColor="#000"
          >
            <Picker.Item label="Seleccionar..." value="" />
            <Picker.Item label="M" value="M" />
            <Picker.Item label="F" value="F" />
          </Picker>
        </View>

        <Text style={styles.label}>Correo Electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="Ejemplo@gmail.com"
          placeholderTextColor="#999"
          value={email}
          onChangeText={(text) => setEmail(text.toLowerCase())} // ✅ CORREGIDO
          autoCapitalize="none"
          keyboardType="email-address"
        />

        {/* 🔹 Contraseña fija */}
        <Text style={styles.label}>Contraseña </Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            value="123456"
            editable={false} // 🔒 No editable
            secureTextEntry={true} // Siempre oculta
          />
        </View>

        {/* 📝 Mensaje informativo */}
        <Text style={styles.infoText}>
          Contraseña por defecto: 123456 {"\n"}
        </Text>

        {/* 🔹 Botón Registrar */}
        <TouchableOpacity style={styles.button} onPress={handleRegistrar}>
          <Text style={styles.buttonText}>Registrar</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Barra inferior */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate("PanelAdmin")}>
          <Icon name="home-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("GestionClientes")}
        >
          <Icon name="account-group" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("GestionMembresias")}
        >
          <Icon name="card-account-details" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("GestionPagos")}
        >
          <Icon name="currency-usd" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("GestionAsistencias")}
        >
          <Icon name="clipboard-list" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#23252E",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 30,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 10,
    marginTop: 6,
  },
  formContainer: {
    paddingBottom: 130,
  },
  label: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 6,
    height: 50,
    fontSize: 16,
    color: "#000",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 6,
    height: 50,
    justifyContent: "center",
  },
  passwordContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    paddingHorizontal: 15,
    marginBottom: 6,
  },
  passwordInput: {
    fontSize: 16,
    color: "#000",
  },
  infoText: {
    color: "#fff",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#FF9045",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#2E2E38",
    paddingVertical: 10,
    borderRadius: 12,
    position: "absolute",
    bottom: 15,
    width: "90%",
    alignSelf: "center",
  },
});
