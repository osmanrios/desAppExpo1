import React, { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  ActivityIndicator, Modal, TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../screens/firebase/firebaseConfig";
import DateTimePicker from "@react-native-community/datetimepicker";

const parseToTimestamp = (value) => {
  if (!value) return 0;
  if (typeof value === "object" && typeof value.toDate === "function") return value.toDate().getTime();
  if (value instanceof Date && !isNaN(value.getTime())) return value.getTime();
  if (typeof value === "string") {
    const m = value.trim().match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (m) return new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1])).getTime();
    const iso = new Date(value);
    if (!isNaN(iso.getTime())) return iso.getTime();
  }
  return 0;
};

export default function GestionMembresias({ navigation }) {
  const [membresias, setMembresias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [membresiaSeleccionada, setMembresiaSeleccionada] = useState(null);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [tipoMembresia, setTipoMembresia] = useState("");
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
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
    card: modoOscuro ? "#2e3038" : "#fff",
    border: modoOscuro ? "#3a3d46" : "#ddd",
    input: modoOscuro ? "#2e3038" : "#fff",
    inputText: modoOscuro ? "#fff" : "#000",
    nav: modoOscuro ? "#2e3038" : "#fff",
    item: modoOscuro ? "#2e3038" : "#fff",
    modal: modoOscuro ? "#2e3038" : "#fff",
  };

  // 🔹 CARGAR MEMBRESÍAS — orden más reciente primero
  useEffect(() => {
    const fetchMembresias = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Membresias"));
        const data = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => {
            const ta = parseToTimestamp(a.fechaInicio);
            const tb = parseToTimestamp(b.fechaInicio);
            if (ta === 0 && tb === 0) return 0;
            if (ta === 0) return 1;
            if (tb === 0) return -1;
            return tb - ta;
          });
        setMembresias(data);
      } catch (error) {
        console.error("Error al obtener membresías:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMembresias();
  }, []);

  const abrirModalEdicion = (membresia) => {
    setMembresiaSeleccionada(membresia);
    setFechaInicio(membresia.fechaInicio || "");
    setFechaFin(membresia.fechaFin || "");
    setTipoMembresia(membresia.tipoMembresia || "");
    setModalVisible(true);
  };

  const actualizarMembresia = async () => {
    try {
      await updateDoc(doc(db, "Membresias", membresiaSeleccionada.id), { tipoMembresia, fechaFin });
      setMembresias((prev) =>
        prev.map((m) => m.id === membresiaSeleccionada.id ? { ...m, tipoMembresia, fechaFin } : m)
      );
      setModalVisible(false);
    } catch (error) {
      console.error("Error al actualizar membresía:", error);
    }
  };

  const onChangeFechaFin = (event, selectedDate) => {
    setMostrarCalendario(false);
    if (selectedDate) setFechaFin(selectedDate.toISOString().split("T")[0]);
  };

  const membresiasFiltradas = membresias.filter((m) => {
    const coincideNombre = m.nombreCliente?.toLowerCase().includes(busqueda.toLowerCase());
    const coincideTipo = filtroTipo ? m.tipoMembresia === filtroTipo : true;
    return coincideNombre && coincideTipo;
  });

  const total = membresiasFiltradas.length;
  const activas = membresiasFiltradas.filter((m) => m.estado?.toLowerCase() === "activa").length;
  const inactivas = membresiasFiltradas.filter((m) => m.estado?.toLowerCase() === "inactiva").length;

  return (
    <View style={[styles.container, { backgroundColor: tema.fondo }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>

        {/* HEADER */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={tema.texto} />
          </TouchableOpacity>
          <Text style={[styles.header, { color: tema.texto }]}>Gestión Membresías</Text>
          <TouchableOpacity onPress={toggleTema}>
            <Icon
              name={modoOscuro ? "weather-night" : "white-balance-sunny"}
              size={24}
              color={modoOscuro ? "#FF9045" : "#181B3A"}
            />
          </TouchableOpacity>
        </View>

        {/* TARJETAS */}
        <View style={styles.row}>
          {[
            { label: "Total", value: total, color: "#FF9045" },
            { label: "Activas", value: activas, color: "#4CAF50" },
            { label: "Inactivas", value: inactivas, color: "#F44336" },
          ].map((item) => (
            <View key={item.label} style={[styles.card, { backgroundColor: tema.card, borderColor: item.color }]}>
              <Text style={[styles.cardNumber, { color: tema.texto }]}>{item.value}</Text>
              <Text style={[styles.cardLabel, { color: tema.subtexto }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* SEPARADOR */}
        <View style={styles.separatorContainer}>
          <View style={[styles.line, { backgroundColor: modoOscuro ? "#555" : "#ccc" }]} />
          <Text style={[styles.separatorText, { color: tema.texto }]}>O</Text>
          <View style={[styles.line, { backgroundColor: modoOscuro ? "#555" : "#ccc" }]} />
        </View>

        {/* BOTONES */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.registerBtn} onPress={() => navigation.navigate("RegistrarMembresias")}>
            <Text style={styles.registerText}>Registrar Membresía</Text>
          </TouchableOpacity>
          <View style={[styles.listBtn, { backgroundColor: tema.card, borderColor: "#FF9045" }]}>
            <Text style={[styles.listText, { color: tema.texto }]}>Listar Membresías</Text>
          </View>
        </View>

        {/* FILTRO */}
        <View style={[styles.filterContainer, { backgroundColor: tema.input, borderColor: tema.border }]}>
          <Picker
            selectedValue={filtroTipo}
            onValueChange={setFiltroTipo}
            style={{ color: tema.inputText }}
            dropdownIconColor={tema.texto}
          >
            <Picker.Item label="Tipo Membresía" value="" />
            <Picker.Item label="Mensual" value="Mensual" />
            <Picker.Item label="Trimestral" value="Trimestral" />
            <Picker.Item label="Anual" value="Anual" />
          </Picker>
        </View>

        {/* BUSCADOR */}
        <View style={[styles.searchContainer, { backgroundColor: tema.input, borderColor: tema.border }]}>
          <Icon name="magnify" size={22} color={tema.subtexto} style={{ marginHorizontal: 6 }} />
          <TextInput
            style={[styles.searchInput, { color: tema.inputText }]}
            placeholder="Buscar por nombre..."
            placeholderTextColor={tema.subtexto}
            value={busqueda}
            onChangeText={setBusqueda}
          />
        </View>

        {/* LISTA */}
        {loading ? (
          <ActivityIndicator size="large" color="#FF9045" style={{ marginTop: 20 }} />
        ) : (
          membresiasFiltradas.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[styles.itemBox, { backgroundColor: tema.item, borderColor: tema.border }]}
              onPress={() => abrirModalEdicion(m)}
            >
              <Text style={[styles.itemText, { color: tema.texto }]}>
                {m.nombreCliente} - {m.tipoMembresia}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: tema.modal }]}>
            <Text style={[styles.modalTitle, { color: tema.texto }]}>Editar Membresía</Text>

            <Text style={[styles.modalLabel, { color: tema.texto }]}>Tipo de Membresía</Text>
            <View style={[styles.modalPicker, { backgroundColor: tema.input, borderColor: tema.border }]}>
              <Picker
                selectedValue={tipoMembresia}
                onValueChange={setTipoMembresia}
                style={{ color: tema.inputText }}
                dropdownIconColor={tema.texto}
              >
                <Picker.Item label="Seleccione..." value="" />
                <Picker.Item label="Mensual" value="Mensual" />
                <Picker.Item label="Trimestral" value="Trimestral" />
                <Picker.Item label="Anual" value="Anual" />
              </Picker>
            </View>

            <Text style={[styles.modalLabel, { color: tema.texto }]}>Fecha Inicio</Text>
            <View style={[styles.input, { backgroundColor: tema.input, borderColor: tema.border }]}>
              <Text style={{ color: tema.inputText }}>{fechaInicio || "Sin fecha"}</Text>
            </View>

            <Text style={[styles.modalLabel, { color: tema.texto }]}>Fecha Fin</Text>
            <TouchableOpacity
              style={[styles.input, { backgroundColor: tema.input, borderColor: tema.border }]}
              onPress={() => setMostrarCalendario(true)}
            >
              <Text style={{ color: tema.inputText }}>{fechaFin || "Seleccionar fecha"}</Text>
            </TouchableOpacity>

            {mostrarCalendario && (
              <DateTimePicker
                value={fechaFin ? new Date(fechaFin) : new Date()}
                mode="date"
                display="default"
                onChange={onChangeFechaFin}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#FF9045" }]} onPress={actualizarMembresia}>
                <Text style={styles.modalBtnText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#777" }]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* NAVBAR */}
      <View style={[styles.bottomNav, { backgroundColor: tema.nav, borderColor: tema.border }]}>
        {[
          { icon: "home-outline", screen: "PanelAdmin" },
          { icon: "account-group", screen: "GestionClientes" },
          { icon: "card-account-details", screen: null },
          { icon: "currency-usd", screen: "GestionPagos" },
          { icon: "clipboard-list", screen: "GestionAsistencias" },
        ].map((item, index) => (
          <TouchableOpacity key={index} onPress={() => item.screen && navigation.navigate(item.screen)}>
            <Icon name={item.icon} size={28} color={index === 2 ? "#FF9045" : tema.texto} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  headerContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 30, marginBottom: 20 },
  header: { fontSize: 20, fontWeight: "bold" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  card: { borderRadius: 16, padding: 15, alignItems: "center", flex: 1, marginHorizontal: 5, borderWidth: 1, elevation: 3 },
  cardNumber: { fontSize: 24, fontWeight: "bold" },
  cardLabel: { fontSize: 14, marginTop: 5 },
  separatorContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginVertical: 15 },
  line: { flex: 1, height: 1, marginHorizontal: 10 },
  separatorText: { fontSize: 18, fontWeight: "bold" },
  buttonsContainer: { alignItems: "center", marginBottom: 20 },
  registerBtn: { backgroundColor: "#FF9045", paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12, marginBottom: 15, elevation: 3 },
  registerText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  listBtn: { borderWidth: 1, paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12 },
  listText: { fontSize: 16, fontWeight: "bold" },
  filterContainer: { borderRadius: 12, marginBottom: 12, borderWidth: 1, overflow: "hidden" },
  searchContainer: { flexDirection: "row", alignItems: "center", borderRadius: 12, paddingHorizontal: 10, marginBottom: 15, borderWidth: 1 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15 },
  itemBox: { padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, elevation: 2 },
  itemText: { fontSize: 15, fontWeight: "500", textAlign: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "90%", borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  modalLabel: { fontSize: 14, fontWeight: "600", marginBottom: 6, marginTop: 10 },
  modalPicker: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  input: { padding: 14, borderRadius: 12, borderWidth: 1, marginTop: 5 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 25 },
  modalBtn: { flex: 1, marginHorizontal: 5, borderRadius: 12, paddingVertical: 12 },
  modalBtnText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 15 },
  bottomNav: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingVertical: 12, borderRadius: 18, position: "absolute", bottom: 15, width: "90%", alignSelf: "center", borderWidth: 1, elevation: 6 },
});