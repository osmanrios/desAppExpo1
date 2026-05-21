import React, { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, TextInput, ScrollView,
  StyleSheet, ActivityIndicator, Modal, Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../screens/firebase/firebaseConfig";

export default function GestionClientes({ navigation }) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({ nombre: "", correo: "", telefono: "", sexo: "" });
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

  // 🔹 TOGGLE CON PERSISTENCIA
  const toggleTema = async () => {
    try {
      const nuevo = !modoOscuro;
      setModoOscuro(nuevo);
      await AsyncStorage.setItem("modoOscuro", JSON.stringify(nuevo));
    } catch (e) { console.error(e); }
  };

  const tema = {
    fondo: modoOscuro ? "#23252E" : "#f4f4f4",
    texto: modoOscuro ? "#fff" : "#181B3A",
    subtexto: modoOscuro ? "#aaa" : "#666",
    cardBg: modoOscuro ? "#2E3038" : "#fff",
    cardBorder: modoOscuro ? "#FF9045" : "#181B3A",
    inputBg: modoOscuro ? "#2E3038" : "#fff",
    inputBorder: modoOscuro ? "#3A3D46" : "#ddd",
    inputTexto: modoOscuro ? "#fff" : "#000",
    placeholder: modoOscuro ? "#888" : "#999",
    navBg: modoOscuro ? "#2E3038" : "#fff",
    navBorder: modoOscuro ? "#3A3D46" : "#ddd",
    modalBg: modoOscuro ? "#2E3038" : "#fff",
    itemBg: modoOscuro ? "#2E3038" : "#fff",
    itemBorder: modoOscuro ? "#3A3D46" : "#ddd",
    icono: modoOscuro ? "#fff" : "#181B3A",
  };

  // 🔹 CARGAR CLIENTES — orden alfabético A→Z
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Usuarios"));
        const data = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((user) => (user.role || "").toString().trim().toLowerCase() === "cliente")
          .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "", "es", { sensitivity: "base" }));
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
      const dataToUpdate = {
        nombre: formData.nombre.trim(),
        telefono: formData.telefono.trim(),
        sexo: formData.sexo.toString().trim().toUpperCase(),
      };
      await updateDoc(doc(db, "Usuarios", selectedCliente.id), dataToUpdate);
      setClientes((prev) =>
        prev
          .map((c) => c.id === selectedCliente.id ? { ...c, ...dataToUpdate } : c)
          .sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "", "es", { sensitivity: "base" }))
      );
      setModalVisible(false);
      Alert.alert("✅ Éxito", "Información actualizada correctamente");
    } catch (error) {
      console.error(error);
      Alert.alert("❌ Error", "No se pudo actualizar el cliente");
    }
  };

  const total = clientes.length;
  const hombres = clientes.filter((c) => (c.sexo || "").toString().trim().toUpperCase() === "M").length;
  const mujeres = clientes.filter((c) => (c.sexo || "").toString().trim().toUpperCase() === "F").length;

  const clientesFiltrados = clientes.filter((c) =>
    (c.nombre || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: tema.fondo }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={tema.icono} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: tema.texto }]}>Gestión Clientes</Text>
          <TouchableOpacity onPress={toggleTema}>
            <Icon name={modoOscuro ? "weather-night" : "white-balance-sunny"} size={24} color={modoOscuro ? "#FF9045" : "#181B3A"} />
          </TouchableOpacity>
        </View>

        {/* TARJETAS */}
        <View style={styles.row}>
          {[{ label: "Total", value: total }, { label: "Hombres", value: hombres }, { label: "Mujeres", value: mujeres }].map((item) => (
            <View key={item.label} style={[styles.card, { backgroundColor: tema.cardBg, borderColor: tema.cardBorder }]}>
              <Text style={[styles.cardNumber, { color: tema.texto }]}>{item.value}</Text>
              <Text style={[styles.cardLabel, { color: tema.texto }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* SEPARADOR */}
        <View style={styles.separatorContainer}>
          <View style={[styles.line, { backgroundColor: tema.texto }]} />
          <Text style={[styles.separatorText, { color: tema.texto }]}>O</Text>
          <View style={[styles.line, { backgroundColor: tema.texto }]} />
        </View>

        {/* BOTONES */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.registerBtn} onPress={() => navigation.navigate("RegistrarClientes")}>
            <Text style={styles.registerText}>Registrar Cliente</Text>
          </TouchableOpacity>
          <View style={[styles.listBtn, { borderColor: tema.cardBorder }]}>
            <Text style={[styles.listText, { color: tema.texto }]}>Listar Clientes</Text>
          </View>
        </View>

        {/* BUSCADOR */}
        <View style={[styles.searchContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
          <Icon name="magnify" size={24} color={tema.placeholder} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: tema.inputTexto }]}
            placeholder="Buscar cliente..." placeholderTextColor={tema.placeholder}
            value={search} onChangeText={setSearch}
          />
        </View>

        {/* LISTA */}
        {loading ? (
          <ActivityIndicator size="large" color="#FF9045" style={{ marginTop: 20 }} />
        ) : (
          clientesFiltrados.map((cliente) => (
            <TouchableOpacity key={cliente.id} onPress={() => abrirModal(cliente)}>
              <View style={[styles.pagoItem, { backgroundColor: tema.itemBg, borderColor: tema.itemBorder }]}>
                <Text style={[styles.pagoText, { color: tema.texto }]}>{cliente.nombre}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: tema.modalBg }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: tema.texto }]}>Editar Cliente</Text>

              {[
                { label: "Nombre", key: "nombre", editable: true, keyboardType: "default" },
                { label: "Correo", key: "correo", editable: false, keyboardType: "default" },
                { label: "Teléfono", key: "telefono", editable: true, keyboardType: "phone-pad" },
              ].map(({ label, key, editable, keyboardType }) => (
                <View key={key}>
                  <Text style={[styles.modalLabel, { color: tema.texto }]}>{label}</Text>
                  <TextInput
                    editable={editable}
                    style={[styles.modalInput, {
                      backgroundColor: editable ? tema.inputBg : "#ccc",
                      color: editable ? tema.inputTexto : "#555",
                      borderColor: tema.inputBorder,
                    }]}
                    keyboardType={keyboardType}
                    value={formData[key]}
                    onChangeText={(text) => setFormData({ ...formData, [key]: text })}
                  />
                </View>
              ))}

              <Text style={[styles.modalLabel, { color: tema.texto }]}>Sexo</Text>
              <View style={[styles.modalPickerContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
                <Picker
                  selectedValue={formData.sexo}
                  onValueChange={(val) => setFormData({ ...formData, sexo: val })}
                  style={{ color: tema.inputTexto }}
                  dropdownIconColor={tema.icono}
                >
                  <Picker.Item label="Seleccionar..." value="" />
                  <Picker.Item label="M" value="M" />
                  <Picker.Item label="F" value="F" />
                </Picker>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#FF9045" }]} onPress={guardarCambios}>
                  <Text style={styles.modalBtnText}>Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#777" }]} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalBtnText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* NAVBAR */}
      <View style={[styles.bottomNav, { backgroundColor: tema.navBg, borderTopColor: tema.navBorder }]}>
        {[
          { icon: "home-outline", screen: "PanelAdmin" },
          { icon: "account-group", screen: null },
          { icon: "card-account-details", screen: "GestionMembresias" },
          { icon: "currency-usd", screen: "GestionPagos" },
          { icon: "clipboard-list", screen: "GestionAsistencias" },
        ].map((item, index) => (
          <TouchableOpacity key={index} onPress={() => item.screen && navigation.navigate(item.screen)}>
            <Icon name={item.icon} size={28} color={index === 1 ? "#FF9045" : tema.icono} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20, marginTop: 30, paddingHorizontal: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  card: { borderWidth: 1, borderRadius: 12, padding: 15, alignItems: "center", flex: 1, marginHorizontal: 5, elevation: 2 },
  cardNumber: { fontSize: 22, fontWeight: "bold" },
  cardLabel: { fontSize: 14, marginTop: 5 },
  buttonsContainer: { alignItems: "center", marginBottom: 20 },
  registerBtn: { backgroundColor: "#FF9045", paddingVertical: 14, paddingHorizontal: 40, borderRadius: 10, marginBottom: 15, elevation: 2 },
  registerText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  listBtn: { borderWidth: 1, paddingVertical: 14, paddingHorizontal: 40, borderRadius: 10 },
  listText: { fontSize: 16, fontWeight: "bold" },
  searchContainer: { flexDirection: "row", alignItems: "center", borderRadius: 10, marginBottom: 15, paddingHorizontal: 10, borderWidth: 1, elevation: 1 },
  searchIcon: { marginRight: 6 },
  searchInput: { flex: 1, paddingVertical: 12 },
  pagoItem: { padding: 14, borderRadius: 10, marginBottom: 10, borderWidth: 1, alignItems: "center", justifyContent: "center", elevation: 1 },
  pagoText: { fontSize: 15, fontWeight: "500" },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContainer: { borderRadius: 16, padding: 20, width: "88%", maxHeight: "80%" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  modalLabel: { fontWeight: "600", marginBottom: 6 },
  modalInput: { borderRadius: 8, padding: 12, marginBottom: 12, borderWidth: 1 },
  modalPickerContainer: { borderRadius: 8, marginBottom: 12, borderWidth: 1 },
  modalButtons: { flexDirection: "row", justifyContent: "space-around", marginTop: 15 },
  modalBtn: { borderRadius: 10, padding: 12, width: "40%", alignItems: "center" },
  modalBtnText: { color: "#fff", fontWeight: "bold" },
  bottomNav: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingVertical: 12, borderTopWidth: 1, borderRadius: 16, position: "absolute", bottom: 15, width: "90%", alignSelf: "center", elevation: 6 },
  separatorContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginVertical: 10 },
  line: { flex: 1, height: 1, marginHorizontal: 10 },
  separatorText: { fontSize: 20, fontWeight: "bold" },
});