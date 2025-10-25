import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Picker } from "@react-native-picker/picker";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../screens/firebase/firebaseConfig";
import DateTimePicker from "@react-native-community/datetimepicker";

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

  useEffect(() => {
    const fetchMembresias = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Membresias"));
        const data = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          // 🔽 Invertimos el orden para que el último quede primero
          .reverse();

        setMembresias(data);
      } catch (error) {
        console.error("Error al obtener membresías:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembresias();
  }, []);

  const total = membresias.length;
  const activas = membresias.filter(
    (m) => m.estado?.toLowerCase() === "activa"
  ).length;
  const inactivas = membresias.filter(
    (m) => m.estado?.toLowerCase() === "inactiva"
  ).length;

  const abrirModalEdicion = (membresia) => {
    setMembresiaSeleccionada(membresia);
    setFechaInicio(membresia.fechaInicio || "");
    setFechaFin(membresia.fechaFin || "");
    setTipoMembresia(membresia.tipoMembresia || "");
    setModalVisible(true);
  };

  const actualizarMembresia = async () => {
    try {
      const ref = doc(db, "Membresias", membresiaSeleccionada.id);
      await updateDoc(ref, {
        tipoMembresia,
        fechaFin,
      });
      setMembresias((prev) =>
        prev.map((m) =>
          m.id === membresiaSeleccionada.id
            ? { ...m, tipoMembresia, fechaFin }
            : m
        )
      );
      setModalVisible(false);
    } catch (error) {
      console.error("Error al actualizar membresía:", error);
    }
  };

  const onChangeFechaFin = (event, selectedDate) => {
    setMostrarCalendario(false);
    if (selectedDate) {
      const fechaFormateada = selectedDate.toISOString().split("T")[0];
      setFechaFin(fechaFormateada);
    }
  };

  const membresiasFiltradas = membresias.filter((m) =>
    m.nombreCliente?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <Text style={styles.header}>Gestión Membresías</Text>

        {/* Tarjetas resumen */}
        <View style={styles.row}>
          <View style={styles.card}>
            <Text style={styles.cardNumber}>{total}</Text>
            <Text style={styles.cardLabel}>Total</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardNumber}>{activas}</Text>
            <Text style={styles.cardLabel}>Activas</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardNumber}>{inactivas}</Text>
            <Text style={styles.cardLabel}>Inactivas</Text>
          </View>
        </View>

        {/* Botones */}
        <View style={styles.separatorContainer}>
          <View style={styles.line} />
          <Text style={styles.separatorText}>O</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.registerBtn}
            onPress={() => navigation.navigate("RegistrarMembresias")}
          >
            <Text style={styles.registerText}>Registrar Membresía</Text>
          </TouchableOpacity>

          <View style={styles.listBtn}>
            <Text style={styles.listText}>Listar Membresías</Text>
          </View>
        </View>

        {/* Buscador */}
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={22} color="#aaa" style={{ marginHorizontal: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre..."
            placeholderTextColor="#aaa"
            value={busqueda}
            onChangeText={setBusqueda}
          />
        </View>

        {/* Lista */}
        {loading ? (
          <ActivityIndicator size="large" color="#FF9045" style={{ marginTop: 20 }} />
        ) : (
          membresiasFiltradas.map((m) => (
            <TouchableOpacity
              key={m.id}
              style={styles.itemBox}
              onPress={() => abrirModalEdicion(m)}
            >
              <Text style={styles.itemText}>
                {m.nombreCliente} - {m.tipoMembresia}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* ===== MODAL ===== */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Editar Membresía</Text>

            <Text style={styles.modalLabel}>Tipo de Membresía</Text>
            <Picker
              selectedValue={tipoMembresia}
              onValueChange={(itemValue) => setTipoMembresia(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Seleccione..." value="" />
              <Picker.Item label="Mensual" value="Mensual" />
              <Picker.Item label="Trimestral" value="Trimestral" />
              <Picker.Item label="Anual" value="Anual" />
            </Picker>

            <Text style={styles.modalLabel}>Fecha de Inicio</Text>
            <View style={[styles.input, { backgroundColor: "#ddd" }]}>
              <Text style={{ color: "#555" }}>
                {fechaInicio || "Sin fecha registrada"}
              </Text>
            </View>

            <Text style={styles.modalLabel}>Fecha de Fin</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setMostrarCalendario(true)}
            >
              <Text>{fechaFin || "Seleccionar fecha"}</Text>
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
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#FF9045" }]}
                onPress={actualizarMembresia}
              >
                <Text style={styles.modalBtnText}>Guardar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#555" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalBtnText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Barra inferior */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate("PanelAdmin")}>
          <Icon name="home-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("GestionClientes")}>
          <Icon name="account-group" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("GestionMembresias")}>
          <Icon name="card-account-details" size={28} color="#FF9045" />
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

/* ==== ESTILOS ==== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#23252E", padding: 20 },
  header: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    marginTop: 30,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#23252E",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#FF9045",
  },
  cardNumber: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  cardLabel: { color: "#aaa", fontSize: 14, marginTop: 5 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 5,
    marginBottom: 15,
    backgroundColor: "#fff",
    marginTop: 10,
  },
  searchInput: { flex: 1, color: "#000", paddingVertical: 8, fontSize: 15 },
  itemBox: {
    backgroundColor: "#e0e0e0",
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },
  itemText: { fontSize: 16, color: "#23252E", textAlign: "center" },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "85%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: "#23252E",
  },
  modalLabel: { fontWeight: "bold", marginTop: 10 },
  picker: { backgroundColor: "#f2f2f2", borderRadius: 8 },
  input: {
    backgroundColor: "#f2f2f2",
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  modalBtn: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 8,
    paddingVertical: 10,
  },
  modalBtnText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  line: { flex: 1, height: 1, backgroundColor: "#fff", marginHorizontal: 10 },
  separatorText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
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
