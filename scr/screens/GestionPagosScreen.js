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
  const [filtroMetodo, setFiltroMetodo] = useState("Todos");

  const metodos = [
    "Todos",
    "Efectivo",
    "Visa",
    "Mastercard",
    "Davivienda",
    "Banco de Bogotá",
    "BBVA",
    "Nequi",
    "Daviplata",
    "Bancolombia",
  ];

  useEffect(() => {
    const fetchPagos = async () => {
      try {
        const pagosSnapshot = await getDocs(collection(db, "Pagos"));

        const pagosConInfo = await Promise.all(
          pagosSnapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            let monto = data.monto || 0;
            let subMetodoPago = (data.subMetodoPago || data.metodoPago || "Sin método").trim();

            let tipoMembresia = "Sin tipo";
            let nombreCliente = "Sin nombre";

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
            };
          })
        );

        setPagos(pagosConInfo);

        const totalGeneral = pagosConInfo.reduce((sum, p) => sum + p.monto, 0);
        setTotalMonto(totalGeneral);
      } catch (error) {
        console.error("❌ Error al cargar pagos:", error);
      }
    };

    fetchPagos();
  }, []);

  useEffect(() => {
    if (filtroMetodo === "Todos") {
      const totalGeneral = pagos.reduce((sum, p) => sum + p.monto, 0);
      setTotalMonto(totalGeneral);
    } else {
      const totalFiltrado = pagos
        .filter((p) => (p.subMetodoPago || "").toLowerCase() === filtroMetodo.toLowerCase())
        .reduce((sum, p) => sum + p.monto, 0);
      setTotalMonto(totalFiltrado);
    }
  }, [filtroMetodo, pagos]);

  const abrirModal = (pago) => {
    setPagoSeleccionado(pago);
    setNuevoMonto(String(pago.monto));
    setNuevoMetodo(pago.subMetodoPago);
    setModalVisible(true);
  };

  const guardarCambios = async () => {
    if (!pagoSeleccionado) return;

    try {
      const ref = doc(db, "Pagos", pagoSeleccionado.id);
      await updateDoc(ref, {
        monto: parseFloat(nuevoMonto) || 0,
        metodoPago: nuevoMetodo,
      });
      setModalVisible(false);
    } catch (error) {
      console.error("❌ Error al actualizar el pago:", error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.pagoItem} onPress={() => abrirModal(item)}>
      <Text style={styles.pagoText}>
        ${item.monto} - {item.subMetodoPago}
      </Text>
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
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gestión Pagos</Text>
          <Icon name="currency-usd" size={24} color="#fff" />
        </View>

        {/* TOTAL GENERAL CON FILTRO */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalTitle}>Total Recaudado</Text>
          <Text style={styles.totalAmount}>${totalMonto.toLocaleString("es-CO")}</Text>

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

        {/* LISTA DE PAGOS */}
        <FlatList
          data={pagos.filter((p) =>
            filtroMetodo === "Todos" || (p.subMetodoPago || "").toLowerCase() === filtroMetodo.toLowerCase()
          )}
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
        <TouchableOpacity onPress={() => navigation.navigate("GestionMembresias")}>
          <Icon name="card-account-details" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("GestionPagos")}>
          <Icon name="currency-usd" size={28} color="#FF9045" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("GestionAsistencias")}>
          <Icon name="clipboard-list" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* MODAL PARA EDITAR PAGOS */}
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

            <Text>SubMétodo de Pago:</Text>
            <TextInput
              value={nuevoMetodo}
              onChangeText={setNuevoMetodo}
              style={styles.input}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={guardarCambios} style={styles.modalButtonSave}>
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

// Estilos
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#23252E", padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20, marginTop: 30 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  totalContainer: { backgroundColor: "#23252E", padding: 15, borderRadius: 10, alignItems: "center", marginBottom: 20, borderColor: "#FF9045", borderWidth: 1 },
  totalTitle: { color: "#fff", fontSize: 16 },
  totalAmount: { color: "green", fontSize: 22, fontWeight: "bold", marginTop: 5 },

  // 🔥 Picker blanco con texto negro
  picker: {
    height: 50,
    width: 200,
    color: "#000",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginTop: 10,
  },

  pagoItem: { backgroundColor: "#D9D9D9", padding: 12, borderRadius: 8, marginBottom: 10, alignItems: "center" },
  pagoText: { color: "#23252E", fontSize: 14 },
  bottomNav: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", backgroundColor: "#23252E", paddingVertical: 10, borderRadius: 12, position: "absolute", bottom: 15, width: "90%", alignSelf: "center" },
  modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContainer: { width: "80%", backgroundColor: "#fff", borderRadius: 10, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 8, marginBottom: 10 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  modalButtonSave: { backgroundColor: "#e7861fff", padding: 10, borderRadius: 8, width: "45%", alignItems: "center" },
  modalButtonCancel: { backgroundColor: "#f44336", padding: 10, borderRadius: 8, width: "45%", alignItems: "center" },
  modalButtonText: { color: "#fff", fontWeight: "bold" },
});
