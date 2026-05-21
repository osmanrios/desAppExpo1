import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, ScrollView, Alert, Modal, FlatList } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
  };

  // 🔹 CARGAR CLIENTES
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const q = query(collection(db, "Usuarios"), where("role", "==", "cliente"));
        const snapshot = await getDocs(q);
        setClientes(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) { console.error("Error cargando clientes:", error); }
    };
    fetchClientes();
  }, []);

  // 🔹 CALCULAR FECHA FIN
  useEffect(() => {
    if (!fechaInicio || !tipoMembresia) return;
    const inicio = new Date(fechaInicio.split("/").reverse().join("-"));
    let fin = new Date(inicio);
    if (tipoMembresia === "Mensual") fin.setMonth(inicio.getMonth() + 1);
    if (tipoMembresia === "Trimestral") fin.setMonth(inicio.getMonth() + 3);
    if (tipoMembresia === "Anual") fin.setFullYear(inicio.getFullYear() + 1);
    setFechaFin(formatDate(fin));
  }, [fechaInicio, tipoMembresia]);

  // 🔹 REGISTRAR
  const registrarMembresia = async () => {
    if (!clienteID || !nombreCliente || !tipoMembresia || !fechaInicio || !fechaFin || !estado) {
      Alert.alert("Error", "Por favor completa todos los campos."); return;
    }
    try {
      await addDoc(collection(db, "Membresias"), { clienteID, nombreCliente, tipoMembresia, fechaInicio, fechaFin, estado });
      Alert.alert("✅ Éxito", "Membresía registrada correctamente.");
      setNombreCliente(""); setClienteID(null); setTipoMembresia(""); setFechaInicio(""); setFechaFin(""); setEstado("Activa");
      navigation.replace("RegistrarPagos");
    } catch (error) {
      console.error("Error al registrar membresía:", error);
      Alert.alert("Error", "No se pudo registrar la membresía.");
    }
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
          <Text style={[styles.headerTitle, { color: tema.texto }]}>Registrar Membresías</Text>
          <TouchableOpacity onPress={toggleTema}>
            <Icon name={modoOscuro ? "weather-night" : "white-balance-sunny"} size={24} color={modoOscuro ? "#FF9045" : "#181B3A"} />
          </TouchableOpacity>
        </View>

        {/* ICONO */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Icon name="card-plus" size={60} color="#FF9045" />
        </View>

        {/* CLIENTE */}
        <Text style={[styles.label, { color: tema.texto }]}>Nombre Cliente</Text>
        <TouchableOpacity style={[styles.inputIcon, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]} onPress={() => setModalVisible(true)}>
          <Text style={{ flex: 1, color: nombreCliente ? tema.inputTexto : tema.placeholder }}>
            {nombreCliente || "Seleccionar cliente..."}
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
                  onPress={() => { setClienteID(item.id); setNombreCliente(item.nombre); setModalVisible(false); setSearchText(""); }}>
                  <Text style={{ color: tema.texto }}>{item.nombre}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* TIPO MEMBRESÍA */}
        <Text style={[styles.label, { color: tema.texto }]}>Tipo Membresía</Text>
        <View style={[styles.pickerContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
          <Picker selectedValue={tipoMembresia} onValueChange={setTipoMembresia} style={{ color: tema.inputTexto }} dropdownIconColor={tema.icono}>
            <Picker.Item label="Seleccionar..." value="" />
            <Picker.Item label="Mensual" value="Mensual" />
            <Picker.Item label="Trimestral" value="Trimestral" />
            <Picker.Item label="Anual" value="Anual" />
          </Picker>
        </View>

        {/* FECHA INICIO */}
        <Text style={[styles.label, { color: tema.texto }]}>Fecha Inicio</Text>
        <View style={[styles.inputIcon, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
          <TextInput style={[styles.inputFlex, { color: tema.inputTexto }]} placeholder="dd/mm/aaaa" placeholderTextColor={tema.placeholder} value={fechaInicio} editable={false} />
          <TouchableOpacity onPress={() => setShowInicio(true)}>
            <Icon name="calendar" size={22} color="#FF9045" />
          </TouchableOpacity>
        </View>
        {showInicio && (
          <DateTimePicker value={new Date()} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => { setShowInicio(false); if (selectedDate) setFechaInicio(formatDate(selectedDate)); }} />
        )}

        {/* FECHA FIN */}
        <Text style={[styles.label, { color: tema.texto }]}>Fecha Fin</Text>
        <View style={[styles.inputIcon, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
          <TextInput style={[styles.inputFlex, { color: tema.inputTexto }]} placeholder="dd/mm/aaaa" placeholderTextColor={tema.placeholder} value={fechaFin} editable={false} />
          <TouchableOpacity disabled>
            <Icon name="calendar" size={22} color={tema.subtexto} />
          </TouchableOpacity>
        </View>

        {/* ESTADO */}
        <Text style={[styles.label, { color: tema.texto }]}>Estado</Text>
        <View style={[styles.pickerContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
          <Picker selectedValue={estado} onValueChange={setEstado} style={{ color: tema.inputTexto }} dropdownIconColor={tema.icono}>
            <Picker.Item label="Activa" value="Activa" />
            <Picker.Item label="Vencida" value="Vencida" />
            <Picker.Item label="Cancelada" value="Cancelada" />
          </Picker>
        </View>

        {/* BOTONES */}
        <TouchableOpacity style={styles.registerButton} onPress={registrarMembresia}>
          <Text style={styles.registerButtonText}>Registrar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
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
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6, marginTop: 8 },
  inputIcon: { flexDirection: "row", alignItems: "center", borderRadius: 8, paddingHorizontal: 10, marginBottom: 6, height: 50, borderWidth: 1, elevation: 1 },
  inputFlex: { flex: 1, padding: 10 },
  pickerContainer: { borderRadius: 8, marginBottom: 6, borderWidth: 1, elevation: 1 },
  registerButton: { backgroundColor: "#181B3A", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 10, marginBottom: 10 },
  registerButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  cancelButton: { backgroundColor: "#FF3B30", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 5 },
  cancelButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  modalContainer: { flex: 1, padding: 20 },
  modalInput: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 15, fontSize: 16 },
  modalItem: { padding: 15, borderBottomWidth: 1 },
  bottomNav: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingVertical: 12, borderTopWidth: 1, borderRadius: 16, position: "absolute", bottom: 15, width: "90%", alignSelf: "center", elevation: 6 },
});