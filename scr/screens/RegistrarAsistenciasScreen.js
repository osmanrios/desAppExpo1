import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, ScrollView, Modal, FlatList } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
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
    texto: modoOscuro ? "#fff" : "#181B3A",
    subtexto: modoOscuro ? "#aaa" : "#666",
    inputBg: modoOscuro ? "#2E3038" : "#fff",
    inputBorder: modoOscuro ? "#3A3D46" : "#ddd",
    inputTexto: modoOscuro ? "#fff" : "#000",
    placeholder: modoOscuro ? "#888" : "#999",
    navBg: modoOscuro ? "#2E3038" : "#fff",
    navBorder: modoOscuro ? "#3A3D46" : "#ddd",
    icono: modoOscuro ? "#fff" : "#181B3A",
  };

  // 🔹 CARGAR CLIENTES
  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const q = query(collection(db, "Usuarios"), where("role", "==", "cliente"));
        const snap = await getDocs(q);
        setClientes(snap.docs.map((doc) => ({ id: doc.id, nombre: doc.data().nombre })));
      } catch (error) { console.error(error); }
    };
    cargarClientes();
  }, []);

  // 🔹 BUSCAR MEMBRESÍA
  useEffect(() => {
    const buscarMembresia = async () => {
      if (!clienteID) return;
      try {
        const q = query(collection(db, "Membresias"), where("clienteID", "==", clienteID));
        const snap = await getDocs(q);
        if (snap.empty) { setMembresiaActiva(null); Alert.alert("Aviso", "El cliente no tiene membresía."); return; }
        setMembresiaActiva(snap.docs[0].data());
      } catch (error) { console.error(error); }
    };
    buscarMembresia();
  }, [clienteID]);

  const formatDate = (date) => {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const registrarAsistencia = async () => {
    if (!clienteID || !cliente || !rutina || !fecha || !entrenador) {
      Alert.alert("Error", "Completa todos los campos."); return;
    }
    try {
      await addDoc(collection(db, "Asistencias"), {
        clienteID, nombreCliente: cliente, rutina, fecha, entrenador, createdAt: new Date(),
      });
      Alert.alert("✅ Éxito", "Asistencia registrada.");
      setCliente(""); setClienteID(null); setRutina(""); setFecha(""); setEntrenador("");
      navigation.replace("PanelAdmin");
    } catch (error) { console.error(error); Alert.alert("Error", "No se pudo registrar."); }
  };

  const clientesFiltrados = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: tema.fondo }]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={tema.icono} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: tema.texto }]}>Registrar Asistencias</Text>
          <TouchableOpacity onPress={toggleTema}>
            <Icon name={modoOscuro ? "weather-night" : "white-balance-sunny"} size={24} color={modoOscuro ? "#FF9045" : "#181B3A"} />
          </TouchableOpacity>
        </View>

        {/* ICONO */}
        <View style={styles.iconContainer}>
          <Icon name="clipboard-list" size={70} color="#FF9045" />
        </View>

        {/* CLIENTE */}
        <Text style={[styles.label, { color: tema.texto }]}>Nombre Cliente</Text>
        <TouchableOpacity style={[styles.inputIcon, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]} onPress={() => setModalVisible(true)}>
          <Text style={{ flex: 1, color: cliente ? tema.inputTexto : tema.placeholder }}>
            {cliente || "Seleccionar cliente..."}
          </Text>
          <Icon name="magnify" size={22} color="#FF9045" />
        </TouchableOpacity>

        {/* MODAL */}
        <Modal visible={modalVisible} animationType="slide">
          <View style={[styles.modalContainer, { backgroundColor: tema.fondo }]}>
            <TextInput
              style={[styles.modalInput, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder, color: tema.inputTexto }]}
              placeholder="Buscar cliente..." placeholderTextColor={tema.placeholder}
              value={searchText} onChangeText={setSearchText}
            />
            <FlatList
              data={clientesFiltrados} keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={[styles.modalItem, { borderBottomColor: tema.inputBorder }]}
                  onPress={() => { setCliente(item.nombre); setClienteID(item.id); setModalVisible(false); setSearchText(""); }}>
                  <Text style={{ color: tema.texto }}>{item.nombre}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* RUTINA */}
        <Text style={[styles.label, { color: tema.texto }]}>Rutina</Text>
        <View style={[styles.pickerContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
          <Picker selectedValue={rutina} onValueChange={setRutina} style={{ color: tema.inputTexto }} dropdownIconColor={tema.icono}>
            <Picker.Item label="Seleccionar..." value="" />
            <Picker.Item label="Cardio" value="Cardio" />
            <Picker.Item label="Fuerza" value="Fuerza" />
            <Picker.Item label="HIIT" value="HIIT" />
            <Picker.Item label="Yoga" value="Yoga" />
          </Picker>
        </View>

        {/* FECHA */}
        <Text style={[styles.label, { color: tema.texto }]}>Fecha Asistencia</Text>
        <View style={[styles.inputIcon, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
          <TextInput style={[styles.inputFlex, { color: tema.inputTexto }]} placeholder="dd/mm/aaaa" placeholderTextColor={tema.placeholder} value={fecha} editable={false} />
          <TouchableOpacity onPress={() => setShowPicker(true)}>
            <Icon name="calendar" size={22} color="#FF9045" />
          </TouchableOpacity>
        </View>
        {showPicker && (
          <DateTimePicker value={new Date()} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => { setShowPicker(false); if (selectedDate) setFecha(formatDate(selectedDate)); }} />
        )}

        {/* ENTRENADOR */}
        <Text style={[styles.label, { color: tema.texto }]}>Entrenador</Text>
        <View style={[styles.pickerContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
          <Picker selectedValue={entrenador} onValueChange={setEntrenador} style={{ color: tema.inputTexto }} dropdownIconColor={tema.icono}>
            <Picker.Item label="Seleccionar..." value="" />
            <Picker.Item label="Carlos Gómez" value="Carlos Gómez" />
            <Picker.Item label="Ana Torres" value="Ana Torres" />
            <Picker.Item label="Luis Ramírez" value="Luis Ramírez" />
          </Picker>
        </View>

        {/* BOTONES */}
        <TouchableOpacity style={styles.registerBtn} onPress={registrarAsistencia}>
          <Text style={styles.registerText}>Registrar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* NAVBAR */}
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
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15, marginTop: 30, paddingHorizontal: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  iconContainer: { alignItems: "center", marginVertical: 10 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6, marginTop: 8 },
  inputIcon: { flexDirection: "row", alignItems: "center", borderRadius: 8, paddingHorizontal: 10, marginBottom: 10, height: 50, borderWidth: 1, elevation: 1 },
  inputFlex: { flex: 1, padding: 10 },
  pickerContainer: { borderRadius: 8, marginBottom: 10, borderWidth: 1, elevation: 1 },
  registerBtn: { backgroundColor: "#181B3A", paddingVertical: 14, borderRadius: 8, alignItems: "center", marginTop: 15, marginBottom: 10 },
  registerText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  cancelBtn: { backgroundColor: "#FF3333", paddingVertical: 14, borderRadius: 8, alignItems: "center", marginBottom: 10 },
  cancelText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  modalContainer: { flex: 1, padding: 20 },
  modalInput: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 15, fontSize: 16 },
  modalItem: { padding: 15, borderBottomWidth: 1 },
  bottomNav: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingVertical: 12, borderTopWidth: 1, borderRadius: 16, position: "absolute", bottom: 15, width: "90%", alignSelf: "center", elevation: 6 },
});