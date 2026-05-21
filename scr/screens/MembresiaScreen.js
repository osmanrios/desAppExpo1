import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../screens/firebase/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function Membresia({ navigation }) {
  const [membresia, setMembresia] = useState(null);
  const [loading, setLoading] = useState(true);
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

  // 🎨 TEMA
  const tema = {
    fondo: modoOscuro ? "#23252E" : "#f4f4f4",
    texto: modoOscuro ? "#ffffff" : "#181B3A",
    subtexto: modoOscuro ? "#aaa" : "#666",
    cardBg: modoOscuro ? "#2E3038" : "#ffffff",
    cardBorder: modoOscuro ? "#3A3D46" : "#e0e0e0",
    navBg: modoOscuro ? "#2E3038" : "#ffffff",
    navBorder: modoOscuro ? "#3A3D46" : "#ddd",
    linea: modoOscuro ? "#fff" : "#ccc",
    separadorTexto: modoOscuro ? "#fff" : "#181B3A",
    iconoNav: modoOscuro ? "#ffffff" : "#181B3A",
  };

  // 🔹 PARSEAR FECHA
  const parseFecha = (fechaInput, endOfDay = false) => {
    if (!fechaInput) return null;
    try {
      if (typeof fechaInput === "object" && typeof fechaInput.toDate === "function") {
        const d = fechaInput.toDate();
        if (endOfDay) d.setHours(23, 59, 59, 999);
        return d;
      }
      if (typeof fechaInput === "string" && fechaInput.includes("/")) {
        const parts = fechaInput.split("/");
        if (parts.length >= 3) {
          const d = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
          if (endOfDay) d.setHours(23, 59, 59, 999);
          return d;
        }
      }
      const d2 = new Date(fechaInput);
      if (!isNaN(d2)) { if (endOfDay) d2.setHours(23, 59, 59, 999); return d2; }
    } catch (err) { console.warn("parseFecha fallo:", err); }
    return null;
  };

  // 🔹 CARGAR MEMBRESÍA
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const fetchMembresiaData = async () => {
        try {
          const q = query(collection(db, "Membresias"), where("clienteID", "==", user.uid));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const membresias = querySnapshot.docs.map((docRef) => {
              const data = docRef.data();
              return { id: docRef.id, ...data, fechaInicio: parseFecha(data.fechaInicio, false), fechaFin: parseFecha(data.fechaFin, true) };
            });
            membresias.sort((a, b) => (b.fechaFin?.getTime() ?? 0) - (a.fechaFin?.getTime() ?? 0));
            setMembresia(membresias[0]);
          } else { setMembresia(null); }
        } catch (error) { console.error("Error cargando membresía:", error); }
        finally { setLoading(false); }
      };
      fetchMembresiaData();
    } else { setLoading(false); }
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: tema.fondo }]}>
        <ActivityIndicator size="large" color="#FF9045" />
      </View>
    );
  }

  const ahora = new Date();
  let estadoMembresia = "No registrada";
  if (membresia) {
    if (membresia.fechaFin && membresia.fechaFin < ahora) estadoMembresia = "Expirada";
    else estadoMembresia = membresia.estado || "Activa";
  }

  const formatLocalDate = (d) => {
    if (!d) return "N/A";
    try { return d.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" }); }
    catch { return d.toLocaleDateString(); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: tema.fondo }}>
      <ScrollView style={[styles.container, { backgroundColor: tema.fondo }]} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* HEADER */}
        <Text style={[styles.title, { color: "#FF9045" }]}>Mi Membresía</Text>
        <Text style={[styles.subtitle, { color: tema.subtexto }]}>
          Consulte el estado actual de su membresía
        </Text>

        {/* ESTADO */}
        <View style={[styles.cardEstado, { backgroundColor: tema.cardBg, borderColor: tema.cardBorder }]}>
          <Text style={[
            styles.estado,
            estadoMembresia.toLowerCase() === "activa" ? styles.activa
            : estadoMembresia.toLowerCase() === "expirada" ? styles.expirada
            : styles.inactiva,
          ]}>
            Membresía {estadoMembresia}
          </Text>
          <Text style={[styles.tipo, { color: tema.texto }]}>{membresia?.tipoMembresia || "Sin membresía"}</Text>
          <Text style={[styles.fecha, { color: tema.subtexto }]}>
            Inicio: {membresia?.fechaInicio ? formatLocalDate(membresia.fechaInicio) : "N/A"}
          </Text>
          <Text style={[styles.fecha, { color: tema.subtexto }]}>
            Fin: {membresia?.fechaFin ? formatLocalDate(membresia.fechaFin) : "N/A"}
          </Text>
        </View>

        {/* SEPARADOR */}
        <View style={styles.separatorContainer}>
          <View style={[styles.line, { backgroundColor: tema.linea }]} />
          <Text style={[styles.separatorText, { color: tema.separadorTexto }]}>O</Text>
          <View style={[styles.line, { backgroundColor: tema.linea }]} />
        </View>

        {/* MEMBRESÍAS DISPONIBLES */}
        <View style={styles.section}>
          <View style={styles.accesos}>
            <Icon name="view-grid" size={18} color="#FF9045" style={{ marginRight: 6 }} />
            <Text style={[styles.sectionTitle, { color: tema.texto }]}>Membresías Existentes</Text>
          </View>

          <View style={styles.grid}>
            {[
              { titulo: "Mensual", texto: "Tienes acceso a 30 días" },
              { titulo: "Trimestral", texto: "Tienes acceso a 90 días" },
              { titulo: "Anual", texto: "Tienes acceso a 365 días" },
            ].map((item) => (
              <View key={item.titulo} style={[styles.card, { backgroundColor: tema.cardBg, borderColor: tema.cardBorder }]}>
                <Text style={styles.cardTitle}>{item.titulo}</Text>
                <Text style={[styles.cardText, { color: tema.subtexto }]}>{item.texto}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>

      {/* BARRA INFERIOR */}
      <View style={[styles.bottomNav, { backgroundColor: tema.navBg, borderTopColor: tema.navBorder }]}>
        <TouchableOpacity onPress={() => navigation.navigate("PanelClientes")}>
          <Icon name="home-outline" size={28} color={tema.iconoNav} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Membresia")}>
          <Icon name="card-account-details" size={28} color="#FF9045" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Asistencia")}>
          <Icon name="clipboard-list" size={28} color={tema.iconoNav} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 10, marginTop: 40 },
  subtitle: { fontSize: 14, textAlign: "center", marginBottom: 20 },
  cardEstado: { padding: 20, borderRadius: 12, alignItems: "center", marginBottom: 20, borderWidth: 1, elevation: 2 },
  estado: { fontSize: 16, fontWeight: "bold" },
  activa: { color: "green" },
  inactiva: { color: "red" },
  expirada: { color: "orange" },
  tipo: { fontSize: 18, marginTop: 10, fontWeight: "bold" },
  fecha: { fontSize: 14, marginTop: 5 },
  section: { marginTop: 20 },
  accesos: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: "bold" },
  grid: { flexDirection: "column", marginTop: 10 },
  card: { width: "100%", padding: 15, borderRadius: 8, marginBottom: 15, alignItems: "center", borderWidth: 1, elevation: 1 },
  cardTitle: { color: "#FF9045", fontWeight: "bold", marginBottom: 6, fontSize: 20 },
  cardText: { fontSize: 12, textAlign: "center" },
  separatorContainer: { flexDirection: "row", alignItems: "center", marginBottom: 10, paddingHorizontal: 5 },
  separatorText: { marginHorizontal: 10, fontSize: 16, fontWeight: "bold" },
  line: { flex: 1, height: 1 },
  bottomNav: {
    flexDirection: "row", justifyContent: "space-around", alignItems: "center",
    paddingVertical: 12, borderTopWidth: 1, position: "absolute", bottom: 20,
    alignSelf: "center", width: "90%", borderRadius: 12, elevation: 6,
  },
});