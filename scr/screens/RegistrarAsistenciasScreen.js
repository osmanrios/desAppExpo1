// --- IMPORTS ---
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
  Modal,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { db } from "../screens/firebase/firebaseConfig";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

export default function RegistrarAsistencias({ navigation }) {
  const [clientes, setClientes] = useState([]);
  const [cliente, setCliente] = useState("");
  const [clienteID, setClienteID] = useState(null);
  const [rutina, setRutina] = useState("");
  const [fecha, setFecha] = useState("");
  const [entrenador, setEntrenador] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [membresiaActiva, setMembresiaActiva] = useState(null);

  // 🔍 Modal y búsqueda
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");

  // 🔹 Cargar lista de clientes desde Firestore
  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const q = query(collection(db, "Usuarios"), where("role", "==", "cliente"));
        const querySnapshot = await getDocs(q);
        const listaClientes = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          nombre: doc.data().nombre,
        }));
        setClientes(listaClientes);
      } catch (error) {
        console.error("❌ Error cargando clientes:", error);
      }
    };
    cargarClientes();
  }, []);

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // ✅ Buscar membresía activa automáticamente al seleccionar cliente
  useEffect(() => {
    const buscarMembresiaActiva = async () => {
      if (!clienteID) return;
      try {
        const membresiaQ = query(
          collection(db, "Membresias"),
          where("clienteID", "==", clienteID)
        );
        const membresiaSnap = await getDocs(membresiaQ);
        if (membresiaSnap.empty) {
          setMembresiaActiva(null);
          Alert.alert("Aviso", "El cliente no tiene una membresía registrada.");
          return;
        }

        const data = membresiaSnap.docs[0].data();
        setMembresiaActiva(data);
      } catch (error) {
        console.error("❌ Error al buscar membresía:", error);
      }
    };
    buscarMembresiaActiva();
  }, [clienteID]);

  // ✅ Función para registrar asistencia
  const registrarAsistencia = async () => {
    if (!clienteID || !cliente || !rutina || !fecha || !entrenador) {
      Alert.alert("Error", "Por favor completa todos los campos.");
      return;
    }

    try {
      // ✅ Validar membresía
      if (!membresiaActiva) {
        Alert.alert("Error", "El cliente no tiene una membresía activa.");
        return;
      }

      const data = membresiaActiva;
      const [diaInicio, mesInicio, anioInicio] = data.fechaInicio.split("/");
      const fechaInicio = new Date(`${anioInicio}-${mesInicio}-${diaInicio}`);

      // 🔹 Calcular fecha fin según tipo de membresía
      let fechaFin = new Date(fechaInicio);
      if (data.tipoMembresia === "Mensual") {
        fechaFin.setMonth(fechaFin.getMonth() + 1);
      } else if (data.tipoMembresia === "Trimestral") {
        fechaFin.setMonth(fechaFin.getMonth() + 3);
      } else if (data.tipoMembresia === "Anual") {
        fechaFin.setFullYear(fechaFin.getFullYear() + 1);
      }

      const hoy = new Date();

      if (hoy < fechaInicio || hoy > fechaFin) {
        Alert.alert("Membresía caducada", "La membresía del cliente ha caducado.");
        return;
      }

      // ✅ Registrar asistencia
      await addDoc(collection(db, "Asistencias"), {
        clienteID,
        nombreCliente: cliente,
        rutina,
        fecha,
        entrenador,
        createdAt: new Date(),
      });

      Alert.alert("Éxito", "Asistencia registrada correctamente.");
      setCliente("");
      setClienteID(null);
      setRutina("");
      setFecha("");
      setEntrenador("");
      setMembresiaActiva(null);
      navigation.replace("PanelAdmin");
    } catch (error) {
      console.error("❌ Error al registrar asistencia:", error);
      Alert.alert("Error", "Hubo un problema al registrar la asistencia.");
    }
  };

  const clientesFiltrados = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registrar Asistencias</Text>
        <Icon name="bell-outline" size={24} color="#fff" />
      </View>

      {/* Contenido Scrollable */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.iconContainer}>
          <Icon name="clipboard-list" size={70} color="#FF9045" />
        </View>

        {/* Nombre Cliente */}
        <Text style={styles.label}>Nombre Cliente</Text>
        <TouchableOpacity style={styles.inputIcon} onPress={() => setModalVisible(true)}>
          <Text style={[styles.inputFlex, { color: cliente ? "#000" : "#aaa" }]}>
            {cliente || "Seleccionar cliente..."}
          </Text>
          <Icon name="magnify" size={22} color="#FF9045" />
        </TouchableOpacity>

        {/* Modal búsqueda */}
        <Modal visible={modalVisible} animationType="slide">
          <View style={{ flex: 1, backgroundColor: "#fff", padding: 20 }}>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 10,
                marginBottom: 15,
              }}
              placeholder="Buscar cliente..."
              value={searchText}
              onChangeText={setSearchText}
            />
            <FlatList
              data={clientesFiltrados}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    padding: 15,
                    borderBottomWidth: 1,
                    borderBottomColor: "#eee",
                  }}
                  onPress={() => {
                    setCliente(item.nombre);
                    setClienteID(item.id);
                    setModalVisible(false);
                    setSearchText("");
                  }}
                >
                  <Text>{item.nombre}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={{
                padding: 15,
                backgroundColor: "#FF3B30",
                borderRadius: 8,
                alignItems: "center",
                marginTop: 10,
              }}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </Modal>

       

        {/* Rutina */}
        <Text style={styles.label}>Rutina</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={rutina}
            onValueChange={(itemValue) => setRutina(itemValue)}
            style={styles.picker}
            dropdownIconColor="#000"
          >
            <Picker.Item label="Seleccionar..." value="" />
            <Picker.Item label="Cardio" value="Cardio" />
            <Picker.Item label="Fuerza" value="Fuerza" />
            <Picker.Item label="HIIT" value="HIIT" />
            <Picker.Item label="Yoga" value="Yoga" />
          </Picker>
        </View>

        {/* Fecha */}
        <Text style={styles.label}>Fecha Asistencia</Text>
        <View style={styles.inputIcon}>
          <TextInput
            style={styles.inputFlex}
            placeholder="dd/mm/aaaa"
            placeholderTextColor="#aaa"
            value={fecha}
            editable={false}
          />
          <TouchableOpacity onPress={() => setShowPicker(true)}>
            <Icon name="calendar" size={22} color="#FF9045" />
          </TouchableOpacity>
        </View>

        {showPicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) setFecha(formatDate(selectedDate));
            }}
          />
        )}

        {/* Entrenador */}
        <Text style={styles.label}>Entrenador</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={entrenador}
            onValueChange={(itemValue) => setEntrenador(itemValue)}
            style={styles.picker}
            dropdownIconColor="#fff"
          >
            <Picker.Item label="Seleccionar..." value="" />
            <Picker.Item label="Carlos Gómez" value="Carlos Gómez" />
            <Picker.Item label="Ana Torres" value="Ana Torres" />
            <Picker.Item label="Luis Ramírez" value="Luis Ramírez" />
          </Picker>
        </View>

        {/* Botones */}
        <TouchableOpacity style={styles.registerBtn} onPress={registrarAsistencia}>
          <Text style={styles.registerText}>Registrar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Barra inferior */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate("PanelAdmin")}>
          <Icon name="home-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("GestionClientes")}>
          <Icon name="account-group" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("GestionMembresias")}>
          <Icon name="card-account-details" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("GestionPagos")}>
          <Icon name="currency-usd" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("GestionAsistencias")}>
          <Icon name="clipboard-list" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#23252E", padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    marginTop: 30,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  iconContainer: { alignItems: "center", marginVertical: 20 },
  label: { color: "#fff", fontSize: 14, marginBottom: 5 },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 25,
  },
  picker: { color: "#000", height: 50 },
  inputIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  inputFlex: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: "#000",
  },
  registerBtn: {
    backgroundColor: "#FF9045",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  registerText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  cancelBtn: {
    backgroundColor: "#FF3333",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  cancelText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
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
