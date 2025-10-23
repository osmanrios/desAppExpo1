import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
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

  useEffect(() => {
    const fetchMembresias = async () => {
      try {
        const snapshot = await getDocs(collection(db, "Membresias"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMembresias(data);
      } catch (error) {
        console.error("Error al cargar membresías:", error);
      }
    };
    fetchMembresias();
  }, []);

  const membresiasFiltradas = membresias.filter((m) =>
    (m.nombreCliente || "").toLowerCase().includes(searchText.toLowerCase())
  );

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleMembresiaSeleccionada = (item) => {
    setMembresia(item.id);
    setNombreCliente(item.nombreCliente);
    let montoCalculado = "";
    switch (item.tipoMembresia) {
      case "Mensual":
        montoCalculado = "60000";
        break;
      case "Trimestral":
        montoCalculado = "180000";
        break;
      case "Anual":
        montoCalculado = "720000";
        break;
      default:
        montoCalculado = "";
    }
    setMonto(montoCalculado);
    setModalVisible(false);
    setSearchText("");
  };

  const registrarPago = async () => {
    if (
      !membresia ||
      !monto ||
      !fechaPago ||
      !metodoPago ||
      (metodoPago !== "efectivo" && !subMetodoPago)
    ) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    try {
      const [day, month, year] = fechaPago.split("/");
      const fechaObj = new Date(`${year}-${month}-${day}`);

      await addDoc(collection(db, "Pagos"), {
        membresiaID: membresia,
        nombreCliente,
        monto: parseFloat(monto),
        fechaPago: Timestamp.fromDate(fechaObj),
        metodoPago,
        subMetodoPago: metodoPago === "efectivo" ? "Efectivo" : subMetodoPago,
        detalle,
        createdAt: Timestamp.now(),
      });

      Alert.alert("Éxito", "Pago registrado correctamente");
      setMembresia("");
      setNombreCliente("");
      setMonto("");
      setFechaPago("");
      setMetodoPago("");
      setSubMetodoPago("");
      setDetalle("");
      navigation.replace("RegistrarAsistencias");
    } catch (error) {
      console.error("Error al registrar pago:", error);
      Alert.alert("Error", "No se pudo registrar el pago");
    }
  };

  const parseFechaToDate = (fechaStr) => {
    if (!fechaStr) return new Date();
    const [d, m, y] = fechaStr.split("/");
    const nd = new Date(`${y}-${m}-${d}`);
    return isNaN(nd.getTime()) ? new Date() : nd;
  };

  // ✅ Submétodos actualizados con los mismos nombres del HistorialPagos
  const getSubMetodos = () => {
    if (metodoPago === "tarjeta") {
      return [
        { label: "Visa", value: "Visa" },
        { label: "Mastercard", value: "Mastercard" },
        { label: "Davivienda", value: "Davivienda" },
        { label: "Banco de Bogotá", value: "Banco de Bogotá" },
        { label: "BBVA", value: "BBVA" },
      ];
    }
    if (metodoPago === "transferencia") {
      return [
        { label: "Nequi", value: "Nequi" },
        { label: "Daviplata", value: "Daviplata" },
        { label: "Bancolombia", value: "Bancolombia" },
      ];
    }
    return [];
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Registrar Pagos</Text>
          <Icon name="bell-outline" size={24} color="#fff" />
        </View>

        {/* Icono */}
        <View style={styles.iconContainer}>
          <Icon name="currency-usd" size={70} color="#FF9045" />
        </View>

        {/* Membresía */}
        <Text style={styles.label}>Membresía</Text>
        <TouchableOpacity
          style={styles.inputIcon}
          onPress={() => setModalVisible(true)}
        >
          <Text style={{ flex: 1, color: nombreCliente ? "#000" : "#aaa" }}>
            {nombreCliente || "Seleccionar membresía..."}
          </Text>
          <Icon name="magnify" size={22} color="#FF9045" />
        </TouchableOpacity>

        {/* Modal Membresía */}
        <Modal visible={modalVisible} animationType="slide">
          <View style={{ flex: 1, padding: 20, backgroundColor: "#fff" }}>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 8,
                padding: 10,
                marginBottom: 15,
              }}
              placeholder="Buscar membresía..."
              value={searchText}
              onChangeText={setSearchText}
            />
            <FlatList
              data={membresiasFiltradas}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    padding: 15,
                    borderBottomWidth: 1,
                    borderBottomColor: "#eee",
                  }}
                  onPress={() => handleMembresiaSeleccionada(item)}
                >
                  <Text>{`${item.tipoMembresia} - ${item.nombreCliente}`}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={{
                padding: 15,
                backgroundColor: "#FF3B30",
                borderRadius: 8,
                alignItems: "center",
                marginTop: 10,
              }}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Monto */}
        <Text style={styles.label}>Monto</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingrese monto a pagar"
          placeholderTextColor="#aaa"
          keyboardType="numeric"
          value={monto}
          onChangeText={setMonto}
        />

        {/* Fecha Pago */}
        <Text style={styles.label}>Fecha Pago</Text>
        <View style={styles.inputIcon}>
          <TextInput
            style={styles.inputFlex}
            placeholder="dd/mm/aaaa"
            placeholderTextColor="#aaa"
            value={fechaPago}
            editable={false}
          />
          <TouchableOpacity onPress={() => setShowPicker(true)}>
            <Icon name="calendar" size={22} color="#FF9045" />
          </TouchableOpacity>
        </View>
        {showPicker && (
          <DateTimePicker
            value={parseFechaToDate(fechaPago)}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) setFechaPago(formatDate(selectedDate));
            }}
          />
        )}

        {/* Método de pago */}
        <Text style={styles.label}>Método Pago</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={metodoPago}
            onValueChange={(itemValue) => {
              setMetodoPago(itemValue);
              setSubMetodoPago("");
            }}
            style={styles.picker}
          >
            <Picker.Item label="Seleccionar..." value="" />
            <Picker.Item label="Efectivo" value="efectivo" />
            <Picker.Item label="Tarjeta" value="tarjeta" />
            <Picker.Item label="Transferencia" value="transferencia" />
          </Picker>
        </View>

        {/* Submétodo de pago */}
        {metodoPago !== "efectivo" && metodoPago ? (
          <View style={styles.pickerContainer}>
            <Picker
              key={`${metodoPago}-sub`}
              selectedValue={subMetodoPago}
              onValueChange={(itemValue) => setSubMetodoPago(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Seleccionar submétodo..." value="" />
              {getSubMetodos().map((opcion) => (
                <Picker.Item
                  key={opcion.value}
                  label={opcion.label}
                  value={opcion.value}
                />
              ))}
            </Picker>
          </View>
        ) : null}

        {/* Detalle */}
        <Text style={styles.label}>Detalle</Text>
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: "top" }]}
          placeholder="Escriba el detalle del pago"
          placeholderTextColor="#aaa"
          multiline
          value={detalle}
          onChangeText={setDetalle}
        />

        {/* Botones */}
        <TouchableOpacity style={styles.registerBtn} onPress={registrarPago}>
          <Text style={styles.registerText}>Registrar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Navegación inferior */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate("PanelAdmin")}>
          <Icon name="home-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("GestionClientes")}
        >
          <Icon name="account-group" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("GestionMembresias")}
        >
          <Icon name="card-account-details" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("GestionPagos")}
        >
          <Icon name="currency-usd" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("GestionAsistencias")}
        >
          <Icon name="clipboard-list" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#23252E", padding: 20 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    marginTop: 30,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  iconContainer: { alignItems: "center", marginVertical: 20 },
  label: { color: "#fff", fontSize: 14, marginBottom: 5 },
  input: {
    backgroundColor: "#fff",
    color: "#000",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
  },
  inputIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    height: 50,
  },
  inputFlex: { flex: 1, padding: 10, color: "#000" },
  pickerContainer: { backgroundColor: "#fff", borderRadius: 8, marginBottom: 20 },
  picker: { color: "#000", height: 50 },
  registerBtn: {
    backgroundColor: "#FF9045",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  registerText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  cancelBtn: {
    backgroundColor: "#FF3333",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  cancelText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#2E2E38",
    paddingVertical: 10,
    borderRadius: 12,
    position: "absolute",
    bottom: 15,
    width: "90%",
    alignSelf: "center",
  },
});
