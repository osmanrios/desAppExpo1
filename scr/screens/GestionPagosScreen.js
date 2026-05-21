import React, { useState, useEffect } from "react";
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Modal, TextInput, ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../screens/firebase/firebaseConfig";

export default function GestionPagos({ navigation }) {
  const [pagos, setPagos] = useState([]);
  const [totalMonto, setTotalMonto] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [pagoSeleccionado, setPagoSeleccionado] = useState(null);
  const [nuevoMonto, setNuevoMonto] = useState("");
  const [nuevoMetodo, setNuevoMetodo] = useState("");
  const [nuevoDetalle, setNuevoDetalle] = useState("");
  const [filtroMetodo, setFiltroMetodo] = useState("Todos");
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
    inputDisabled: modoOscuro ? "#3a3d46" : "#eee",
  };

  const metodos = [
    "Todos", "Efectivo", "Tarjeta", "Transferencia", "Visa", "Mastercard",
    "Davivienda", "Banco de Bogotá", "BBVA", "Nequi", "Daviplata", "Bancolombia",
  ];

  const subMetodos = [
    "Efectivo", "Visa", "Mastercard", "BBVA", "Davivienda",
    "Banco de Bogotá", "Nequi", "Daviplata", "Bancolombia",
  ];

  // 🔹 CARGAR PAGOS
  useEffect(() => {
    const fetchPagos = async () => {
      try {
        const pagosSnapshot = await getDocs(collection(db, "Pagos"));
        const pagosConInfo = await Promise.all(
          pagosSnapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            let monto = data.monto || 0;
            let subMetodoPago = (data.subMetodoPago || data.metodoPago || "Sin método").trim();
            let detalle = data.detalle || "Sin detalle";
            let tipoMembresia = "Sin tipo";
            let nombreCliente = "Sin nombre";
            let fechaPago = "Sin fecha";
            let fechaTimestamp = 0;

            if (data.fechaPago) {
              const fecha = new Date(data.fechaPago.seconds * 1000);
              const dia = String(fecha.getDate()).padStart(2, "0");
              const mes = String(fecha.getMonth() + 1).padStart(2, "0");
              const anio = fecha.getFullYear();
              fechaPago = `${dia}/${mes}/${anio}`;
              fechaTimestamp = fecha.getTime();
            }

            if (data.membresiaID) {
              const memSnap = await getDoc(doc(db, "Membresias", data.membresiaID));
              if (memSnap.exists()) {
                tipoMembresia = memSnap.data().tipoMembresia || "Sin tipo";
                const clienteID = memSnap.data().clienteID;
                if (clienteID) {
                  const clienteSnap = await getDoc(doc(db, "Usuarios", clienteID));
                  if (clienteSnap.exists()) nombreCliente = clienteSnap.data().nombre || "Sin nombre";
                }
              }
            }

            return { id: docSnap.id, monto, subMetodoPago, tipoMembresia, nombreCliente, detalle, fechaPago, fechaTimestamp };
          })
        );

        // ✅ SORT: más reciente primero, sin fecha al final
        const pagosOrdenados = pagosConInfo.sort((a, b) => {
          if (a.fechaTimestamp === 0 && b.fechaTimestamp === 0) return 0;
          if (a.fechaTimestamp === 0) return 1;
          if (b.fechaTimestamp === 0) return -1;
          return b.fechaTimestamp - a.fechaTimestamp;
        });

        setPagos(pagosOrdenados);
        setTotalMonto(pagosOrdenados.reduce((sum, p) => sum + p.monto, 0));
      } catch (error) {
        console.error("❌ Error al cargar pagos:", error);
      }
    };
    fetchPagos();
  }, []);

  // 🔹 CALCULAR TOTAL SEGÚN FILTRO
  useEffect(() => {
    const filtrados = filtroMetodo === "Todos" ? pagos : pagos.filter((p) => {
      const metodo = (p.subMetodoPago || "").toLowerCase();
      if (filtroMetodo === "Tarjeta") return ["visa", "mastercard", "bbva", "davivienda", "banco de bogotá"].includes(metodo);
      if (filtroMetodo === "Transferencia") return ["nequi", "daviplata", "bancolombia"].includes(metodo);
      return metodo === filtroMetodo.toLowerCase();
    });
    setTotalMonto(filtrados.reduce((sum, p) => sum + p.monto, 0));
  }, [filtroMetodo, pagos]);

  const abrirModal = (pago) => {
    setPagoSeleccionado(pago);
    setNuevoMonto(String(pago.monto));
    setNuevoMetodo(pago.subMetodoPago);
    setNuevoDetalle(pago.detalle || "");
    setModalVisible(true);
  };

  // 🔹 GUARDAR CAMBIOS + ACTUALIZAR ESTADO LOCAL
  const guardarCambios = async () => {
    if (!pagoSeleccionado) return;
    try {
      const nuevoMontoNum = parseFloat(nuevoMonto) || 0;
      await updateDoc(doc(db, "Pagos", pagoSeleccionado.id), {
        monto: nuevoMontoNum,
        metodoPago: nuevoMetodo,
        subMetodoPago: nuevoMetodo,
        detalle: nuevoDetalle,
      });
      // ✅ Actualiza el estado local sin recargar
      setPagos((prev) =>
        prev.map((p) =>
          p.id === pagoSeleccionado.id
            ? { ...p, monto: nuevoMontoNum, subMetodoPago: nuevoMetodo, detalle: nuevoDetalle }
            : p
        )
      );
      setModalVisible(false);
    } catch (error) {
      console.error("❌ Error al actualizar el pago:", error);
    }
  };

  const pagosFiltrados = pagos
    .filter((p) => {
      const metodo = (p.subMetodoPago || "").toLowerCase();
      if (filtroMetodo === "Todos") return true;
      if (filtroMetodo === "Tarjeta") return ["visa", "mastercard", "bbva", "davivienda", "banco de bogotá"].includes(metodo);
      if (filtroMetodo === "Transferencia") return ["nequi", "daviplata", "bancolombia"].includes(metodo);
      return metodo === filtroMetodo.toLowerCase();
    })
    .sort((a, b) => {
      if (a.fechaTimestamp === 0 && b.fechaTimestamp === 0) return 0;
      if (a.fechaTimestamp === 0) return 1;
      if (b.fechaTimestamp === 0) return -1;
      return b.fechaTimestamp - a.fechaTimestamp;
    });

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.itemBox, { backgroundColor: tema.item, borderColor: tema.border }]}
      onPress={() => abrirModal(item)}
    >
      <Text style={[styles.itemText, { color: tema.texto }]}>
        ${item.monto.toLocaleString("es-CO")} - {item.subMetodoPago}
      </Text>
      <Text style={[styles.fechaText, { color: tema.subtexto }]}>{item.fechaPago}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: tema.fondo }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* HEADER */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={tema.texto} />
          </TouchableOpacity>
          <Text style={[styles.header, { color: tema.texto }]}>Gestión Pagos</Text>
          <TouchableOpacity onPress={toggleTema}>
            <Icon
              name={modoOscuro ? "weather-night" : "white-balance-sunny"}
              size={24}
              color={modoOscuro ? "#FF9045" : "#181B3A"}
            />
          </TouchableOpacity>
        </View>

        {/* TARJETA TOTAL RECAUDADO */}
        <View style={[styles.totalContainer, { backgroundColor: tema.card, borderColor: "#FF9045" }]}>
          <Text style={[styles.totalTitle, { color: tema.subtexto }]}>Total Recaudado</Text>
          <Text style={styles.totalAmount}>${totalMonto.toLocaleString("es-CO")}</Text>
          <View style={[styles.filterContainer, { backgroundColor: tema.input, borderColor: tema.border, marginTop: 10 }]}>
            <Picker
              selectedValue={filtroMetodo}
              onValueChange={setFiltroMetodo}
              style={{ color: tema.inputText }}
              dropdownIconColor={tema.texto}
            >
              {metodos.map((m) => <Picker.Item key={m} label={m} value={m} />)}
            </Picker>
          </View>
        </View>

        {/* SEPARADOR */}
        <View style={styles.separatorContainer}>
          <View style={[styles.line, { backgroundColor: modoOscuro ? "#555" : "#ffffff" }]} />
          <Text style={[styles.separatorText, { color: tema.texto }]}>O</Text>
          <View style={[styles.line, { backgroundColor: modoOscuro ? "#555" : "#ffffff" }]} />
        </View>

        {/* BOTONES */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.registerBtn} onPress={() => navigation.navigate("RegistrarPagos")}>
            <Text style={styles.registerText}>Registrar Pagos</Text>
          </TouchableOpacity>
          <View style={[styles.listBtn, { backgroundColor: tema.card, borderColor: "#FF9045" }]}>
            <Text style={[styles.listText, { color: tema.texto }]}>Listar Pagos</Text>
          </View>
        </View>

        {/* LISTA */}
        <FlatList
          data={pagosFiltrados}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          scrollEnabled={false}
        />
      </ScrollView>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: tema.modal }]}>
            <Text style={[styles.modalTitle, { color: tema.texto }]}>Editar Pago</Text>

            {[
              { label: "Nombre Cliente", value: pagoSeleccionado?.nombreCliente },
              { label: "Membresía", value: pagoSeleccionado?.tipoMembresia },
              { label: "Fecha de Pago", value: pagoSeleccionado?.fechaPago },
            ].map(({ label, value }) => (
              <View key={label}>
                <Text style={[styles.modalLabel, { color: tema.texto }]}>{label}</Text>
                <View style={[styles.input, { backgroundColor: tema.inputDisabled, borderColor: tema.border }]}>
                  <Text style={{ color: tema.subtexto }}>{value}</Text>
                </View>
              </View>
            ))}

            <Text style={[styles.modalLabel, { color: tema.texto }]}>Monto</Text>
            <TextInput
              value={nuevoMonto}
              onChangeText={setNuevoMonto}
              keyboardType="numeric"
              style={[styles.input, { backgroundColor: tema.input, borderColor: tema.border, color: tema.inputText }]}
            />

            <Text style={[styles.modalLabel, { color: tema.texto }]}>Submétodo de Pago</Text>
            <View style={[styles.modalPicker, { backgroundColor: tema.input, borderColor: tema.border }]}>
              <Picker
                selectedValue={nuevoMetodo}
                onValueChange={setNuevoMetodo}
                style={{ color: tema.inputText }}
                dropdownIconColor={tema.texto}
              >
                {subMetodos.map((m) => <Picker.Item key={m} label={m} value={m} />)}
              </Picker>
            </View>

            <Text style={[styles.modalLabel, { color: tema.texto }]}>Detalle</Text>
            <TextInput
              value={nuevoDetalle}
              onChangeText={setNuevoDetalle}
              multiline
              numberOfLines={3}
              style={[styles.input, { height: 70, textAlignVertical: "top", backgroundColor: tema.input, borderColor: tema.border, color: tema.inputText }]}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#FF9045" }]} onPress={guardarCambios}>
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
          { icon: "card-account-details", screen: "GestionMembresias" },
          { icon: "currency-usd", screen: null },
          { icon: "clipboard-list", screen: "GestionAsistencias" },
        ].map((item, index) => (
          <TouchableOpacity key={index} onPress={() => item.screen && navigation.navigate(item.screen)}>
            <Icon name={item.icon} size={28} color={index === 3 ? "#FF9045" : tema.texto} />
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
  totalContainer: { borderRadius: 16, padding: 15, alignItems: "center", borderWidth: 1, elevation: 3, marginBottom: 20 },
  totalTitle: { fontSize: 16 },
  totalAmount: { color: "#4CAF50", fontSize: 24, fontWeight: "bold", marginTop: 5 },
  separatorContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginVertical: 15 },
  line: { flex: 1, height: 1, marginHorizontal: 10 },
  separatorText: { fontSize: 18, fontWeight: "bold" },
  buttonsContainer: { alignItems: "center", marginBottom: 20 },
  registerBtn: { backgroundColor: "#FF9045", paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12, marginBottom: 15, elevation: 3 },
  registerText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  listBtn: { borderWidth: 1, paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12 },
  listText: { fontSize: 16, fontWeight: "bold" },
  filterContainer: { borderRadius: 12, borderWidth: 1, overflow: "hidden", width: "100%" },
  itemBox: { padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, elevation: 2, alignItems: "center" },
  itemText: { fontSize: 15, fontWeight: "500" },
  fechaText: { fontSize: 13, marginTop: 3 },
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