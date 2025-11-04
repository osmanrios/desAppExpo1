import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Picker } from "@react-native-picker/picker";
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

  const metodos = [
    "Todos",
    "Efectivo",
    "Tarjeta",
    "Transferencia",
    "Visa",
    "Mastercard",
    "Davivienda",
    "Banco de Bogotá",
    "BBVA",
    "Nequi",
    "Daviplata",
    "Bancolombia",
  ];

  const subMetodos = [
    "Efectivo",
    "Visa",
    "Mastercard",
    "BBVA",
    "Davivienda",
    "Banco de Bogotá",
    "Nequi",
    "Daviplata",
    "Bancolombia",
  ];

  // 🔹 Cargar pagos desde Firebase
  useEffect(() => {
    const fetchPagos = async () => {
      try {
        const pagosSnapshot = await getDocs(collection(db, "Pagos"));

        const pagosConInfo = await Promise.all(
          pagosSnapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            let monto = data.monto || 0;
            let subMetodoPago =
              (data.subMetodoPago || data.metodoPago || "Sin método").trim();
            let detalle = data.detalle || "Sin detalle";

            let tipoMembresia = "Sin tipo";
            let nombreCliente = "Sin nombre";

            // 🔸 Fecha como DD/MM/YYYY
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
              const memRef = doc(db, "Membresias", data.membresiaID);
              const memSnap = await getDoc(memRef);
              if (memSnap.exists()) {
                tipoMembresia = memSnap.data().tipoMembresia || "Sin tipo";
                const clienteID = memSnap.data().clienteID;
                if (clienteID) {
                  const clienteRef = doc(db, "Usuarios", clienteID);
                  const clienteSnap = await getDoc(clienteRef);
                  if (clienteSnap.exists()) {
                    nombreCliente = clienteSnap.data().nombre || "Sin nombre";
                  }
                }
              }
            }

            return {
              id: docSnap.id,
              monto,
              subMetodoPago,
              tipoMembresia,
              nombreCliente,
              detalle,
              fechaPago,
              fechaTimestamp,
            };
          })
        );

        // 🔹 Ordenar por fecha (más recientes primero)
        const pagosOrdenados = pagosConInfo.sort(
          (a, b) => b.fechaTimestamp - a.fechaTimestamp
        );

        setPagos(pagosOrdenados);
        const totalGeneral = pagosOrdenados.reduce(
          (sum, p) => sum + p.monto,
          0
        );
        setTotalMonto(totalGeneral);
      } catch (error) {
        console.error("❌ Error al cargar pagos:", error);
      }
    };

    fetchPagos();
  }, []);

  // 🔹 Calcular total según filtro
  useEffect(() => {
    let filtrados = pagos;

    if (filtroMetodo !== "Todos") {
      filtrados = pagos.filter((p) => {
        const metodo = (p.subMetodoPago || "").toLowerCase();

        if (filtroMetodo === "Tarjeta") {
          return [
            "visa",
            "mastercard",
            "bbva",
            "davivienda",
            "banco de bogotá",
          ].includes(metodo);
        } else if (filtroMetodo === "Transferencia") {
          return ["nequi", "daviplata", "bancolombia"].includes(metodo);
        } else {
          return metodo === filtroMetodo.toLowerCase();
        }
      });
    }

    const total = filtrados.reduce((sum, p) => sum + p.monto, 0);
    setTotalMonto(total);
  }, [filtroMetodo, pagos]);

  // 🔹 Abrir modal
  const abrirModal = (pago) => {
    setPagoSeleccionado(pago);
    setNuevoMonto(String(pago.monto));
    setNuevoMetodo(pago.subMetodoPago);
    setNuevoDetalle(pago.detalle || "");
    setModalVisible(true);
  };

  // 🔹 Guardar cambios
  const guardarCambios = async () => {
    if (!pagoSeleccionado) return;

    try {
      const ref = doc(db, "Pagos", pagoSeleccionado.id);
      await updateDoc(ref, {
        monto: parseFloat(nuevoMonto) || 0,
        metodoPago: nuevoMetodo,
        subMetodoPago: nuevoMetodo,
        detalle: nuevoDetalle,
      });
      setModalVisible(false);
    } catch (error) {
      console.error("❌ Error al actualizar el pago:", error);
    }
  };

  // 🔹 Render item lista
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.pagoItem} onPress={() => abrirModal(item)}>
      <Text style={styles.pagoText}>
        ${item.monto.toLocaleString("es-CO")} - {item.subMetodoPago}
      </Text>
      <Text style={styles.fechaText}> {item.fechaPago}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        {/* ENCABEZADO */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gestión Pagos</Text>
          <Icon name="" size={24} color="#fff" />
        </View>

        {/* TOTAL GENERAL CON FILTRO */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalTitle}>Total Recaudado</Text>
          <Text style={styles.totalAmount}>
            ${totalMonto.toLocaleString("es-CO")}
          </Text>

          <Picker
            selectedValue={filtroMetodo}
            style={styles.picker}
            dropdownIconColor="#000"
            onValueChange={(itemValue) => setFiltroMetodo(itemValue)}
          >
            {metodos.map((m) => (
              <Picker.Item key={m} label={m} value={m} />
            ))}
          </Picker>
        </View>

        {/* BOTONES */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.registerBtn}
            onPress={() => navigation.navigate("RegistrarPagos")}
          >
            <Text style={styles.registerText}>Registrar Pagos</Text>
          </TouchableOpacity>

          <View style={styles.listBtn}>
            <Text style={styles.listText}>Listar Pagos</Text>
          </View>
        </View>

        {/* LISTA */}
        <FlatList
          data={pagos
            .filter((p) => {
              const metodo = (p.subMetodoPago || "").toLowerCase();

              if (filtroMetodo === "Todos") return true;
              if (filtroMetodo === "Tarjeta")
                return [
                  "visa",
                  "mastercard",
                  "bbva",
                  "davivienda",
                  "banco de bogotá",
                ].includes(metodo);
              if (filtroMetodo === "Transferencia")
                return ["nequi", "daviplata", "bancolombia"].includes(metodo);

              return metodo === filtroMetodo.toLowerCase();
            })
            .sort((a, b) => b.fechaTimestamp - a.fechaTimestamp)}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          scrollEnabled={false}
        />
      </ScrollView>

      {/* NAV INFERIOR */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate("PanelAdmin")}>
          <Icon name="home-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("GestionClientes")}>
          <Icon name="account-group" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("GestionMembresias")}
        >
          <Icon name="card-account-details" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("GestionPagos")}>
          <Icon name="currency-usd" size={28} color="#FF9045" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("GestionAsistencias")}
        >
          <Icon name="clipboard-list" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Editar Pago</Text>

            <Text>Nombre Cliente:</Text>
            <TextInput
              value={pagoSeleccionado?.nombreCliente}
              editable={false}
              style={[styles.input, { backgroundColor: "#eee" }]}
            />

            <Text>Membresía:</Text>
            <TextInput
              value={pagoSeleccionado?.tipoMembresia}
              editable={false}
              style={[styles.input, { backgroundColor: "#eee" }]}
            />

            <Text>Monto:</Text>
            <TextInput
              value={nuevoMonto}
              onChangeText={setNuevoMonto}
              keyboardType="numeric"
              style={styles.input}
            />

            <Text>Fecha de Pago:</Text>
            <TextInput
              value={pagoSeleccionado?.fechaPago}
              editable={false}
              style={[styles.input, { backgroundColor: "#eee" }]}
            />

            <Text>Submétodo de Pago:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={nuevoMetodo}
                style={styles.picker}
                dropdownIconColor="#000"
                onValueChange={(value) => setNuevoMetodo(value)}
              >
                {subMetodos.map((m) => (
                  <Picker.Item key={m} label={m} value={m} />
                ))}
              </Picker>
            </View>

            <Text>Detalle:</Text>
            <TextInput
              value={nuevoDetalle}
              onChangeText={setNuevoDetalle}
              multiline
              numberOfLines={3}
              style={[styles.input, { height: 70, textAlignVertical: "top" }]}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={guardarCambios}
                style={styles.modalButtonSave}
              >
                <Text style={styles.modalButtonText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalButtonCancel}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// 🎨 ESTILOS
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
  totalContainer: {
    backgroundColor: "#23252E",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    borderColor: "#FF9045",
    borderWidth: 1,
  },
  totalTitle: { color: "#fff", fontSize: 16 },
  totalAmount: {
    color: "green",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 5,
  },
  picker: {
    height: 50,
    width: "100%",
    color: "#000",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginTop: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
    overflow: "hidden",
  },
  pagoItem: {
    backgroundColor: "#D9D9D9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  pagoText: { color: "#23252E", fontSize: 15, fontWeight: "600" },
  fechaText: { color: "#555", fontSize: 13, marginTop: 3 },
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
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButtonSave: {
    backgroundColor: "#FF9045",
    padding: 10,
    borderRadius: 8,
    width: "45%",
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: "#f44336",
    padding: 10,
    borderRadius: 8,
    width: "45%",
    alignItems: "center",
  },
  modalButtonText: { color: "#fff", fontWeight: "bold" },
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
});
