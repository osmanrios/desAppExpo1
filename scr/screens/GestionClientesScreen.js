import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Picker } from "@react-native-picker/picker";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../screens/firebase/firebaseConfig";

export default function GestionClientes({ navigation }) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    sexo: "",
  });
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Usuarios"));
        const data = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter(
            (user) =>
              (user.role || "").toString().trim().toLowerCase() === "cliente"
          );

        setClientes(data);
      } catch (error) {
        console.error("Error al obtener clientes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, []);

  const abrirModal = (cliente) => {
    setSelectedCliente(cliente);
    setFormData({
      nombre: cliente.nombre || "",
      correo: cliente.email || "",
      telefono: cliente.telefono || "",
      sexo: cliente.sexo || "",
    });
    setModalVisible(true);
  };

  const guardarCambios = async () => {
    if (!selectedCliente) return;

    try {
      const ref = doc(db, "Usuarios", selectedCliente.id);
      const dataToUpdate = {
        nombre: formData.nombre,
        telefono: formData.telefono,
        sexo: (formData.sexo || "").toString().trim().toUpperCase(),
      };

      await updateDoc(ref, dataToUpdate);

      setClientes((prev) =>
        prev.map((c) =>
          c.id === selectedCliente.id ? { ...c, ...dataToUpdate } : c
        )
      );

      Alert.alert("✅ Éxito", "Información actualizada correctamente");
      setModalVisible(false);
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
      Alert.alert("❌ Error", "No se pudo actualizar el cliente");
    }
  };

  const total = clientes.length;
  const hombres = clientes.filter(
    (c) => (c.sexo || "").toString().trim().toUpperCase() === "M"
  ).length;
  const mujeres = clientes.filter(
    (c) => (c.sexo || "").toString().trim().toUpperCase() === "F"
  ).length;

  const clientesFiltrados = clientes.filter((c) =>
    (c.nombre || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* ENCABEZADO */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gestión Clientes</Text>
          <Icon size={24} color="#fff" />
        </View>

        {/* TARJETAS DE CONTEO */}
        <View style={styles.row}>
          <View style={styles.card}>
            <Text style={styles.cardNumber}>{total}</Text>
            <Text style={styles.cardLabel}>Total</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardNumber}>{hombres}</Text>
            <Text style={styles.cardLabel}>Hombres</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardNumber}>{mujeres}</Text>
            <Text style={styles.cardLabel}>Mujeres</Text>
          </View>
        </View>

        {/* SEPARADOR */}
        <View style={styles.separatorContainer}>
          <View style={styles.line} />
          <Text style={styles.separatorText}>O</Text>
          <View style={styles.line} />
        </View>

        {/* BOTONES */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.registerBtn}
            onPress={() => navigation.navigate("RegistrarClientes")}
          >
            <Text style={styles.registerText}>Registrar Cliente</Text>
          </TouchableOpacity>

          <View style={styles.listBtn}>
            <Text style={styles.listText}>Listar Clientes</Text>
          </View>
        </View>

        {/* BUSCADOR */}
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={24} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar cliente..."
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* LISTA */}
        {loading ? (
          <ActivityIndicator size="large" color="#FF9045" style={{ marginTop: 20 }} />
        ) : (
          clientesFiltrados.map((cliente) => (
            <TouchableOpacity key={cliente.id} onPress={() => abrirModal(cliente)}>
              <View style={styles.pagoItem}>
                <Text style={styles.pagoText}>{cliente.nombre}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

      </ScrollView>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Editar Información del Cliente</Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Nombre"
                value={formData.nombre}
                onChangeText={(text) =>
                  setFormData({ ...formData, nombre: text })
                }
              />

              <TextInput
                style={[
                  styles.modalInput,
                  { backgroundColor: "#e0e0e0", color: "#555" },
                ]}
                placeholder="Correo"
                value={formData.correo}
                editable={false}
              />

              <TextInput
                style={styles.modalInput}
                placeholder="Teléfono"
                keyboardType="phone-pad"
                value={formData.telefono}
                onChangeText={(text) =>
                  setFormData({ ...formData, telefono: text })
                }
              />

              <Text style={{ marginBottom: 6, fontWeight: "600" }}>Sexo</Text>
              <View style={styles.modalPickerContainer}>
                <Picker
                  selectedValue={formData.sexo}
                  onValueChange={(val) =>
                    setFormData({ ...formData, sexo: val })
                  }
                >
                  <Picker.Item label="Seleccionar..." value="" />
                  <Picker.Item label="M" value="M" />
                  <Picker.Item label="F" value="F" />
                </Picker>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: "#FF9045" }]}
                  onPress={guardarCambios}
                >
                  <Text style={styles.modalBtnText}>Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: "#777" }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalBtnText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* NAV INFERIOR */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate("PanelAdmin")}>
          <Icon name="home-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="account-group" size={28} color="#FF9045" />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#23252E", padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 30,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  card: {
    backgroundColor: "#23252E",
    borderWidth: 1,
    borderColor: "#FF9045",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  cardNumber: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  cardLabel: { color: "#fff", fontSize: 14, marginTop: 5 },
  buttonsContainer: { alignItems: "center", marginBottom: 20 },
  registerBtn: {
    backgroundColor: "#FF9045",
    borderWidth: 1,
    borderColor: "#FF9045",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginBottom: 15,
  },
  registerText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  listBtn: {
    backgroundColor: "#23252E",
    borderWidth: 1,
    borderColor: "#FF9045",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  listText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  searchIcon: { marginRight: 6 },
  searchInput: { flex: 1, paddingVertical: 8, color: "#000" },
  pagoItem: {
    backgroundColor: "#D9D9D9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  pagoText: { color: "#23252E", fontSize: 14 },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "85%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  modalInput: {
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  modalPickerContainer: {
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  modalBtn: {
    borderRadius: 8,
    padding: 10,
    width: "40%",
    alignItems: "center",
  },
  modalBtnText: { color: "#fff", fontWeight: "bold" },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#23252E",
    paddingVertical: 10,
    borderRadius: 12,
    position: "absolute",
    bottom: 15,
    width: "90%",
    alignSelf: "center",
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  line: { flex: 1, height: 1, backgroundColor: "#fff", marginHorizontal: 10 },
  separatorText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
});
