import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { db } from "../screens/firebase/firebaseConfig";

export default function RegistrarMembresiasScreen({ navigation }) {
  const [nombreCliente, setNombreCliente] = useState("");
  const [clienteID, setClienteID] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const [tipoMembresia, setTipoMembresia] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [estado, setEstado] = useState("Activa");

  const [showInicio, setShowInicio] = useState(false);

  // Formatear fecha
  const formatDate = (date) => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, "0");
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Cargar clientes
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const q = query(collection(db, "Usuarios"), where("role", "==", "cliente"));
        const snapshot = await getDocs(q);
        const lista = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setClientes(lista);
      } catch (error) {
        console.error("Error cargando clientes:", error);
      }
    };
    fetchClientes();
  }, []);

  // Calcular fecha fin automáticamente
  useEffect(() => {
    if (!fechaInicio || !tipoMembresia) return;

    const inicio = new Date(fechaInicio.split("/").reverse().join("-"));
    let fin = new Date(inicio);

    if (tipoMembresia === "Mensual") fin.setMonth(inicio.getMonth() + 1);
    if (tipoMembresia === "Trimestral") fin.setMonth(inicio.getMonth() + 3);
    if (tipoMembresia === "Anual") fin.setFullYear(inicio.getFullYear() + 1);

    setFechaFin(formatDate(fin));
  }, [fechaInicio, tipoMembresia]);

  // Función para registrar membresía
  const registrarMembresia = async () => {
    if (!clienteID || !nombreCliente || !tipoMembresia || !fechaInicio || !fechaFin || !estado) {
      Alert.alert("Error", "Por favor completa todos los campos.");
      return;
    }

    try {
      await addDoc(collection(db, "Membresias"), {
        clienteID,
        nombreCliente,
        tipoMembresia,
        fechaInicio,
        fechaFin,
        estado,
      });

      Alert.alert("Éxito", "Membresía registrada correctamente.");
      // Limpiar formulario
      setNombreCliente("");
      setClienteID(null);
      setTipoMembresia("");
      setFechaInicio("");
      setFechaFin("");
      setEstado("Activa");
      navigation.replace("RegistrarPagos");
    } catch (error) {
      console.error("Error al registrar membresía:", error);
      Alert.alert("Error", "No se pudo registrar la membresía.");
    }
  };

  // Filtrar clientes por búsqueda
  const clientesFiltrados = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Registrar Membresías</Text>
          <Icon name="bell-outline" size={24} color="#fff" />
        </View>

        {/* Icono */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Icon name="card-plus" size={60} color="#FF9045" />
        </View>

        {/* Cliente */}
        <Text style={styles.label}>Nombre Cliente</Text>
        <TouchableOpacity
          style={styles.inputIcon}
          onPress={() => setModalVisible(true)}
        >
          <Text style={{ flex: 1, color: nombreCliente ? "#000" : "#aaa" }}>
            {nombreCliente || "Seleccionar cliente..."}
          </Text>
          <Icon name="magnify" size={22} color="#FF9045" />
        </TouchableOpacity>

        {/* Modal de búsqueda */}
        <Modal visible={modalVisible} animationType="slide">
          <View style={{ flex: 1, padding: 20, backgroundColor: "#fff" }}>
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
                    setClienteID(item.id);
                    setNombreCliente(item.nombre);
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
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Tipo Membresía */}
        <Text style={styles.label}>Tipo Membresía</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={tipoMembresia}
            onValueChange={(itemValue) => setTipoMembresia(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Seleccionar..." value="" />
            <Picker.Item label="Mensual" value="Mensual" />
            <Picker.Item label="Trimestral" value="Trimestral" />
            <Picker.Item label="Anual" value="Anual" />
          </Picker>
        </View>

        {/* Fecha Inicio */}
        <Text style={styles.label}>Fecha Inicio</Text>
        <View style={styles.inputIcon}>
          <TextInput
            style={styles.inputFlex}
            placeholder="dd/mm/aaaa"
            placeholderTextColor="#aaa"
            value={fechaInicio}
            editable={false}
          />
          <TouchableOpacity onPress={() => setShowInicio(true)}>
            <Icon name="calendar" size={22} color="#FF9045" />
          </TouchableOpacity>
        </View>
        {showInicio && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              setShowInicio(false);
              if (selectedDate) setFechaInicio(formatDate(selectedDate));
            }}
          />
        )}

        {/* Fecha Fin */}
        <Text style={styles.label}>Fecha Fin</Text>
        <View style={styles.inputIcon}>
          <TextInput
            style={styles.inputFlex}
            placeholder="dd/mm/aaaa"
            placeholderTextColor="#aaa"
            value={fechaFin}
            editable={false}
          />
          <TouchableOpacity disabled>
            <Icon name="calendar" size={22} color="#888" />
          </TouchableOpacity>
        </View>

        {/* Estado */}
        <Text style={styles.label}>Estado</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={estado}
            onValueChange={(itemValue) => setEstado(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Activa" value="Activa" />
            <Picker.Item label="Vencida" value="Vencida" />
            <Picker.Item label="Cancelada" value="Cancelada" />
          </Picker>
        </View>

        {/* Botón Registrar */}
        <TouchableOpacity style={styles.registerButton} onPress={registrarMembresia}>
          <Text style={styles.registerButtonText}>Registrar</Text>
        </TouchableOpacity>

        {/* Botón Cancelar */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>

        <View style={{ height: 80 }} />
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
  label: { color: "#fff", marginBottom: 5, fontWeight: "bold" },
  inputIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d9d9d9",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    height: 50,
  },
  inputFlex: { flex: 1, padding: 10, color: "#000" },
  pickerContainer: {
    backgroundColor: "#d9d9d9",
    borderRadius: 8,
    marginBottom: 15,
  },
  picker: { height: 50, color: "#000" },
  registerButton: {
    backgroundColor: "#FF9045",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 15,
  },
  registerButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  cancelButton: {
    backgroundColor: "#FF3B30",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  cancelButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 30,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
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
