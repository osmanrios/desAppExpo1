import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Button,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Picker } from "@react-native-picker/picker";
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../screens/firebase/firebaseConfig";

// --- Convierte distintos tipos a Date
const parseToDate = (value) => {
  try {
    if (!value) return null;
    if (typeof value === "object" && typeof value.toDate === "function") return value.toDate();
    if (value instanceof Date && !isNaN(value.getTime())) return value;
    if (!isNaN(value) && typeof value !== "object") return new Date(Number(value));
    if (typeof value === "string") {
      const s = value.trim();
      const reDMY = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/;
      const m = s.match(reDMY);
      if (m) return new Date(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10));
      const iso = new Date(s);
      if (!isNaN(iso.getTime())) return iso;
    }
    return null;
  } catch {
    return null;
  }
};

// --- Formatea a "DD/MM/YYYY"
const formatDate = (date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) return "Sin fecha";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export default function GestionAsistencias({ navigation }) {
  const [asistencias, setAsistencias] = useState([]);
  const [totalAsistencias, setTotalAsistencias] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAsistencia, setSelectedAsistencia] = useState(null);
  const [formData, setFormData] = useState({ rutina: "", entrenador: "", fecha: new Date() });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // 👇 Ajustado a tu base de datos real
  const rutinasDisponibles = ["Cardio", "Fuerza", "Yoga"];
  const entrenadoresDisponibles = ["Carlos Gómez", "Ana Torres", "Luis Ramírez"];

  useEffect(() => {
    const fetchAsistencias = async () => {
      try {
        const snapshot = await getDocs(collection(db, "Asistencias"));
        let asistenciasConInfo = [];

        for (const asistenciaDoc of snapshot.docs) {
          const asistenciaData = asistenciaDoc.data();
          const fechaRaw =
            asistenciaData.fecha ||
            asistenciaData.fechaAsistencia ||
            asistenciaData.dia ||
            asistenciaData.date ||
            null;
          const fechaParsed = parseToDate(fechaRaw);
          const fechaFinal = fechaParsed || null;

          let nombreCliente = asistenciaData.nombreCliente || "Sin nombre";
          const clienteID =
            asistenciaData.clienteID || asistenciaData.userId || asistenciaData.uid;
          if (clienteID && !asistenciaData.nombreCliente) {
            try {
              const clienteRef = doc(db, "Usuarios", clienteID);
              const clienteSnap = await getDoc(clienteRef);
              if (clienteSnap.exists()) {
                const clienteData = clienteSnap.data();
                nombreCliente =
                  clienteData.nombre ||
                  clienteData.name ||
                  clienteData.fullName ||
                  nombreCliente;
              }
            } catch (err) {
              console.log("⚠️ Error obteniendo cliente:", err);
            }
          }

          asistenciasConInfo.push({
            id: asistenciaDoc.id,
            ...asistenciaData,
            nombreCliente,
            fecha: fechaFinal,
          });
        }

        asistenciasConInfo.sort((a, b) => {
          if (!a.fecha && !b.fecha) return 0;
          if (!a.fecha) return 1;
          if (!b.fecha) return -1;
          return b.fecha - a.fecha;
        });

        setAsistencias(asistenciasConInfo);
        setTotalAsistencias(asistenciasConInfo.length);
        setLoading(false);
      } catch (error) {
        console.error("❌ Error al cargar asistencias:", error);
        setLoading(false);
      }
    };

    fetchAsistencias();
  }, []);

  // 🔧 Corregido con normalización
  const abrirModal = (asistencia) => {
    if (!asistencia) return;

    const fechaValida =
      asistencia.fecha instanceof Date
        ? asistencia.fecha
        : parseToDate(asistencia.fecha) || new Date();

    const rutinaNormalizada = (() => {
      if (!asistencia.rutina) return "";
      const r = asistencia.rutina.trim().toLowerCase();
      const encontrada = rutinasDisponibles.find(
        (opt) => opt.trim().toLowerCase() === r
      );
      return encontrada || "";
    })();

    setSelectedAsistencia(asistencia);
    setFormData({
      rutina: rutinaNormalizada,
      entrenador: asistencia.entrenador || "",
      fecha: fechaValida,
    });
    setModalVisible(true);
  };

  const guardarCambios = async () => {
    if (!selectedAsistencia) return;
    try {
      const asistenciaRef = doc(db, "Asistencias", selectedAsistencia.id);
      const fechaString = formatDate(formData.fecha);
      await updateDoc(asistenciaRef, {
        rutina: formData.rutina,
        entrenador: formData.entrenador,
        fecha: fechaString,
      });

      alert("✅ Asistencia actualizada correctamente");
      setModalVisible(false);

      setAsistencias((prev) =>
        prev.map((a) =>
          a.id === selectedAsistencia.id
            ? {
                ...a,
                rutina: formData.rutina,
                entrenador: formData.entrenador,
                fecha: parseToDate(fechaString),
              }
            : a
        )
      );
    } catch (error) {
      console.error("❌ Error al actualizar asistencia:", error);
      alert("Error al actualizar asistencia. Revisa la consola.");
    }
  };

  const asistenciasFiltradas = asistencias.filter((item) =>
    item.nombreCliente.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#FF9045" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gestión Asistencias</Text>
          <Icon name="" size={24} color="#fff" />
        </View>

        <View style={styles.totalContainer}>
          <Text style={styles.totalTitle}>Total Asistencias</Text>
          <Text style={styles.totalAmount}>{totalAsistencias}</Text>
        </View>

        <View style={styles.separatorContainer}>
          <View style={styles.line} />
          <Text style={styles.separatorText}>O</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.registerBtn}
            onPress={() => navigation.navigate("RegistrarAsistencias")}
          >
            <Text style={styles.registerText}>Registrar Asistencia</Text>
          </TouchableOpacity>

          <View style={styles.listBtn}>
            <Text style={styles.listText}>Listar Asistencias</Text>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Icon name="magnify" size={24} color="#aaa" style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar cliente..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
          />
        </View>

        {asistenciasFiltradas.map((item) => (
          <TouchableOpacity key={item.id} onPress={() => abrirModal(item)}>
            <View style={styles.asistenciaItem}>
              <Text style={styles.asistenciaText}>{item.nombreCliente}</Text>
              <Text style={styles.asistenciaFecha}>
                {item.fecha ? formatDate(item.fecha) : "Sin fecha"}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Asistencia</Text>

            <Text style={styles.modalLabel}>Rutina</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.rutina}
                onValueChange={(val) => setFormData({ ...formData, rutina: val })}
              >
                <Picker.Item label="Seleccionar rutina" value="" />
                {rutinasDisponibles.map((r, i) => (
                  <Picker.Item key={i} label={r} value={r} />
                ))}
              </Picker>
            </View>

            <Text style={styles.modalLabel}>Entrenador</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.entrenador}
                onValueChange={(val) => setFormData({ ...formData, entrenador: val })}
              >
                <Picker.Item label="Seleccionar entrenador" value="" />
                {entrenadoresDisponibles.map((e, i) => (
                  <Picker.Item key={i} label={e} value={e} />
                ))}
              </Picker>
            </View>

            <Text style={styles.modalLabel}>Fecha</Text>
            <View style={styles.dateContainer}>
              <TextInput
                style={[styles.modalInput, { flex: 1 }]}
                value={formatDate(formData.fecha)}
                editable={false}
              />
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.calendarButton}
              >
                <Icon name="calendar" size={24} color="#FF9045" />
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={formData.fecha instanceof Date ? formData.fecha : new Date()}
                mode="date"
                display="calendar"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) setFormData({ ...formData, fecha: date });
                }}
              />
            )}

            <View style={styles.modalButtons}>
              <Button title="Guardar" onPress={guardarCambios} color="#FF9045" />
              <Button
                title="Cancelar"
                color="gray"
                onPress={() => setModalVisible(false)}
              />
            </View>
          </View>
        </View>
      </Modal>

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
          <Icon name="currency-usd" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="clipboard-list" size={28} color="#FF9045" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- ESTILOS
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#23252E", padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20, marginTop: 30 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  totalContainer: { backgroundColor: "#23252E", padding: 15, borderRadius: 10, alignItems: "center", marginBottom: 20, borderWidth: 1, borderColor: "#FF9045" },
  totalTitle: { color: "#fff", fontSize: 16 },
  totalAmount: { color: "#fff", fontSize: 22, fontWeight: "bold", marginTop: 5 },
  separatorContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginVertical: 10 },
  line: { flex: 1, height: 1, backgroundColor: "#fff", marginHorizontal: 10 },
  separatorText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  buttonsContainer: { alignItems: "center", marginBottom: 20 },
  registerBtn: { backgroundColor: "#FF9045", borderWidth: 1, borderColor: "#FF9045", paddingVertical: 12, paddingHorizontal: 40, borderRadius: 8, marginBottom: 15 },
  registerText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  listBtn: { backgroundColor: "#23252E", borderWidth: 1, borderColor: "#FF9045", paddingVertical: 12, paddingHorizontal: 40, borderRadius: 8 },
  listText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#f0f0f0", paddingHorizontal: 10, borderRadius: 8, marginBottom: 15 },
  searchInput: { flex: 1, height: 40, color: "#23252E" },
  asistenciaItem: { backgroundColor: "#D9D9D9", padding: 12, borderRadius: 8, marginBottom: 10, alignItems: "center" },
  asistenciaText: { color: "#23252E", fontSize: 14, fontWeight: "bold" },
  asistenciaFecha: { color: "#555", fontSize: 12, marginTop: 3 },
  modalContainer: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "85%" },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15, color: "#23252E", textAlign: "center" },
  modalLabel: { color: "#23252E", marginBottom: 5, fontWeight: "600" },
  pickerContainer: { backgroundColor: "#f0f0f0", borderRadius: 8, marginBottom: 10 },
  modalInput: { backgroundColor: "#f0f0f0", borderRadius: 8, padding: 10, marginBottom: 10 },
  dateContainer: { flexDirection: "row", alignItems: "center" },
  calendarButton: { marginLeft: 10, backgroundColor: "#fff", padding: 8, borderRadius: 8, borderWidth: 1, borderColor: "#FF9045" },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  bottomNav: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", backgroundColor: "#23252E", paddingVertical: 10, borderRadius: 12, position: "absolute", bottom: 15, width: "90%", alignSelf: "center" },
});
