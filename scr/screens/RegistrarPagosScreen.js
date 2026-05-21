import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, ScrollView, Alert, Modal, FlatList } from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../screens/firebase/firebaseConfig";

export default function RegistrarPagos({ navigation }) {
  const [membresia, setMembresia] = useState("");
  const [nombreCliente, setNombreCliente] = useState("");
  const [monto, setMonto] = useState("");
  const [fechaPago, setFechaPago] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [metodoPago, setMetodoPago] = useState("");
  const [subMetodoPago, setSubMetodoPago] = useState("");
  const [detalle, setDetalle] = useState("");
  const [membresias, setMembresias] = useState([]);
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
    subtexto: modoOscuro ? "#aaa" : "#888",
    icono: modoOscuro ? "#fff" : "#181B3A",
    inputBg: modoOscuro ? "#2e3038" : "#fff",
    inputBorder: modoOscuro ? "#3a3d46" : "#eee",
    inputTexto: modoOscuro ? "#fff" : "#000",
    placeholder: modoOscuro ? "#aaa" : "#999",
    navBg: modoOscuro ? "#2e3038" : "#fff",
    navBorder: modoOscuro ? "#3a3d46" : "#eee",
  };

  // 🔹 CARGAR MEMBRESÍAS
  useEffect(() => {
    const fetchMembresias = async () => {
      try {
        const snapshot = await getDocs(collection(db, "Membresias"));
        setMembresias(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) { console.error("Error al cargar membresías:", error); }
    };
    fetchMembresias();
  }, []);

  const membresiasFiltradas = membresias.filter((m) =>
    (m.nombreCliente || "").toLowerCase().includes(searchText.toLowerCase())
  );

  const formatDate = (date) => {
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const parseFechaToDate = (fechaStr) => {
    if (!fechaStr) return new Date();
    const [d, m, y] = fechaStr.split("/");
    const nd = new Date(`${y}-${m}-${d}`);
    return isNaN(nd.getTime()) ? new Date() : nd;
  };

  const handleMembresiaSeleccionada = (item) => {
    setMembresia(item.id);
    setNombreCliente(item.nombreCliente);
    const montos = { Mensual: "60000", Trimestral: "180000", Anual: "720000" };
    setMonto(montos[item.tipoMembresia] || "");
    setModalVisible(false);
    setSearchText("");
  };

  const registrarPago = async () => {
    if (!membresia || !monto || !fechaPago || !metodoPago || (metodoPago !== "efectivo" && !subMetodoPago)) {
      Alert.alert("Error", "Por favor completa todos los campos"); return;
    }
    try {
      const [day, month, year] = fechaPago.split("/");
      await addDoc(collection(db, "Pagos"), {
        membresiaID: membresia, nombreCliente, monto: parseFloat(monto),
        fechaPago: Timestamp.fromDate(new Date(`${year}-${month}-${day}`)),
        metodoPago, subMetodoPago: metodoPago === "efectivo" ? "Efectivo" : subMetodoPago,
        detalle, createdAt: Timestamp.now(),
      });
      Alert.alert("✅ Éxito", "Pago registrado correctamente");
      setMembresia(""); setNombreCliente(""); setMonto(""); setFechaPago(""); setMetodoPago(""); setSubMetodoPago(""); setDetalle("");
      navigation.replace("RegistrarAsistencias");
    } catch (error) {
      console.error("Error al registrar pago:", error);
      Alert.alert("Error", "No se pudo registrar el pago");
    }
  };

  const getSubMetodos = () => {
    if (metodoPago === "tarjeta") return [
      { label: "Visa", value: "Visa" }, { label: "Mastercard", value: "Mastercard" },
      { label: "Davivienda", value: "Davivienda" }, { label: "Banco de Bogotá", value: "Banco de Bogotá" }, { label: "BBVA", value: "BBVA" },
    ];
    if (metodoPago === "transferencia") return [
      { label: "Nequi", value: "Nequi" }, { label: "Daviplata", value: "Daviplata" }, { label: "Bancolombia", value: "Bancolombia" },
    ];
    return [];
  };

  return (
    <View style={[styles.container, { backgroundColor: tema.fondo }]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={tema.icono} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: tema.texto }]}>Registrar Pagos</Text>
          <TouchableOpacity onPress={toggleTema}>
            <Icon name={modoOscuro ? "weather-night" : "white-balance-sunny"} size={24} color={modoOscuro ? "#FF9045" : "#181B3A"} />
          </TouchableOpacity>
        </View>

        {/* ICONO */}
        <View style={styles.iconContainer}>
          <Icon name="currency-usd" size={70} color="#FF9045" />
        </View>

        {/* MEMBRESÍA */}
        <Text style={[styles.label, { color: tema.texto }]}>Membresía</Text>
        <TouchableOpacity style={[styles.inputIcon, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]} onPress={() => setModalVisible(true)}>
          <Text style={{ flex: 1, color: nombreCliente ? tema.inputTexto : tema.placeholder }}>
            {nombreCliente || "Seleccionar membresía..."}
          </Text>
          <Icon name="magnify" size={22} color="#FF9045" />
        </TouchableOpacity>

        {/* MODAL */}
        <Modal visible={modalVisible} animationType="slide">
          <View style={[styles.modalContainer, { backgroundColor: tema.fondo }]}>
            <TextInput
              style={[styles.modalInput, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder, color: tema.inputTexto }]}
              placeholder="Buscar membresía..." placeholderTextColor={tema.placeholder}
              value={searchText} onChangeText={setSearchText}
            />
            <FlatList
              data={membresiasFiltradas} keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={[styles.modalItem, { borderBottomColor: tema.inputBorder }]} onPress={() => handleMembresiaSeleccionada(item)}>
                  <Text style={{ color: tema.texto }}>{`${item.tipoMembresia} - ${item.nombreCliente}`}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* MONTO */}
        <Text style={[styles.label, { color: tema.texto }]}>Monto</Text>
        <TextInput style={[styles.input, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder, color: tema.inputTexto }]} placeholder="Ingrese monto a pagar" placeholderTextColor={tema.placeholder} keyboardType="numeric" value={monto} onChangeText={setMonto} />

        {/* FECHA PAGO */}
        <Text style={[styles.label, { color: tema.texto }]}>Fecha Pago</Text>
        <View style={[styles.inputIcon, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
          <TextInput style={[styles.inputFlex, { color: tema.inputTexto }]} placeholder="dd/mm/aaaa" placeholderTextColor={tema.placeholder} value={fechaPago} editable={false} />
          <TouchableOpacity onPress={() => setShowPicker(true)}>
            <Icon name="calendar" size={22} color="#FF9045" />
          </TouchableOpacity>
        </View>
        {showPicker && (
          <DateTimePicker value={parseFechaToDate(fechaPago)} mode="date" display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => { setShowPicker(false); if (selectedDate) setFechaPago(formatDate(selectedDate)); }} />
        )}

        {/* MÉTODO PAGO */}
        <Text style={[styles.label, { color: tema.texto }]}>Método Pago</Text>
        <View style={[styles.pickerContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
          <Picker selectedValue={metodoPago} onValueChange={(v) => { setMetodoPago(v); setSubMetodoPago(""); }} style={{ color: tema.inputTexto }} dropdownIconColor={tema.icono}>
            <Picker.Item label="Seleccionar..." value="" />
            <Picker.Item label="Efectivo" value="efectivo" />
            <Picker.Item label="Tarjeta" value="tarjeta" />
            <Picker.Item label="Transferencia" value="transferencia" />
          </Picker>
        </View>

        {/* SUBMÉTODO */}
        {metodoPago !== "efectivo" && metodoPago ? (
          <View style={[styles.pickerContainer, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder }]}>
            <Picker key={`${metodoPago}-sub`} selectedValue={subMetodoPago} onValueChange={setSubMetodoPago} style={{ color: tema.inputTexto }} dropdownIconColor={tema.icono}>
              <Picker.Item label="Seleccionar submétodo..." value="" />
              {getSubMetodos().map((op) => <Picker.Item key={op.value} label={op.label} value={op.value} />)}
            </Picker>
          </View>
        ) : null}

        {/* DETALLE */}
        <Text style={[styles.label, { color: tema.texto }]}>Detalle</Text>
        <TextInput style={[styles.input, { backgroundColor: tema.inputBg, borderColor: tema.inputBorder, color: tema.inputTexto, height: 100, textAlignVertical: "top" }]} placeholder="Escriba el detalle del pago" placeholderTextColor={tema.placeholder} multiline value={detalle} onChangeText={setDetalle} />

        {/* BOTONES */}
        <TouchableOpacity style={styles.registerBtn} onPress={registrarPago}>
          <Text style={styles.registerText}>Registrar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
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
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15, marginTop: 30, paddingHorizontal: 4 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  iconContainer: { alignItems: "center", marginVertical: 10 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6, marginTop: 8 },
  input: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 6, borderWidth: 1, elevation: 1 },
  inputIcon: { flexDirection: "row", alignItems: "center", borderRadius: 8, paddingHorizontal: 10, marginBottom: 6, height: 50, borderWidth: 1, elevation: 1 },
  inputFlex: { flex: 1, padding: 10 },
  pickerContainer: { borderRadius: 8, marginBottom: 6, borderWidth: 1, elevation: 1 },
  registerBtn: { backgroundColor: "#181B3A", paddingVertical: 14, borderRadius: 8, alignItems: "center", marginTop: 10, marginBottom: 10 },
  registerText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  cancelBtn: { backgroundColor: "#FF3333", paddingVertical: 14, borderRadius: 8, alignItems: "center", marginBottom: 10 },
  cancelText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  modalContainer: { flex: 1, padding: 20 },
  modalInput: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 15, fontSize: 16 },
  modalItem: { padding: 15, borderBottomWidth: 1 },
  bottomNav: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingVertical: 12, borderTopWidth: 1, borderRadius: 16, position: "absolute", bottom: 15, width: "90%", alignSelf: "center", elevation: 6 },
});