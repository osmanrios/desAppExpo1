import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../screens/firebase/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function HistorialAsistencias({ navigation }) {
  const [asistencias, setAsistencias] = useState([]);
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
    cardTexto: modoOscuro ? "#ffffff" : "#181B3A",
    counterBg: modoOscuro ? "#2E3038" : "#ffffff",
    navBg: modoOscuro ? "#2E3038" : "#ffffff",
    navBorder: modoOscuro ? "#3A3D46" : "#ddd",
    iconoNav: modoOscuro ? "#ffffff" : "#181B3A",
  };

  // 🔹 PARSEAR FECHA
  const parseFecha = (fechaStr) => {
    if (!fechaStr) return null;
    const [dia, mes, anio] = fechaStr.split("/");
    return new Date(`${anio}-${mes}-${dia}`);
  };

  // 🔹 CARGAR ASISTENCIAS
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const fetchAsistencias = async () => {
        try {
          const q = query(collection(db, "Asistencias"), where("clienteID", "==", user.uid));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const registros = querySnapshot.docs.map((doc) => {
              const data = doc.data();
              return { id: doc.id, ...data, fechaObj: parseFecha(data.fecha) };
            });
            registros.sort((a, b) => b.fechaObj - a.fechaObj);
            setAsistencias(registros);
          } else {
            setAsistencias([]);
          }
        } catch (error) {
          console.error("Error cargando asistencias:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchAsistencias();
    }
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: tema.fondo }]}>
        <ActivityIndicator size="large" color="#FF9045" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: tema.fondo }}>
      <ScrollView style={[styles.container, { backgroundColor: tema.fondo }]} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* HEADER */}
        <Text style={styles.title}>Mis Asistencias</Text>
        <Text style={[styles.subtitle, { color: tema.subtexto }]}>
          Consulta tu historial de asistencias al gimnasio.{"\n"}
          Revisa tu frecuencia de entrenamiento y mantén tu motivación
        </Text>

        {/* CONTADOR */}
        <View style={[styles.counterBox, { backgroundColor: tema.counterBg, borderColor: tema.cardBorder }]}>
          <Text style={[styles.counterText, { color: tema.texto }]}>
            Has asistido{" "}
            <Text style={{ color: "#FF9045", fontWeight: "bold" }}>{asistencias.length}</Text>{" "}
            veces
          </Text>
        </View>

        {/* HISTORIAL */}
        <View style={styles.section}>
          <View style={styles.accesos}>
            <Icon name="view-grid" size={18} color="#FF9045" style={{ marginRight: 6 }} />
            <Text style={[styles.sectionTitle, { color: tema.texto }]}>Historial</Text>
          </View>

          {asistencias.length > 0 ? (
            asistencias.map((item) => (
              <View key={item.id} style={[styles.card, { backgroundColor: tema.cardBg, borderColor: tema.cardBorder }]}>
                <Text style={[styles.cardText, { color: "#FF9045" }]}>{item.fecha}</Text>
                <Text style={[styles.cardDetail, { color: tema.cardTexto }]}>Entrenador: {item.entrenador}</Text>
                <Text style={[styles.cardDetail, { color: tema.cardTexto }]}>Rutina: {item.rutina}</Text>
              </View>
            ))
          ) : (
            <Text style={{ color: tema.subtexto, textAlign: "center" }}>
              No tienes asistencias registradas
            </Text>
          )}
        </View>

      </ScrollView>

      {/* BARRA INFERIOR */}
      <View style={[styles.bottomNav, { backgroundColor: tema.navBg, borderTopColor: tema.navBorder }]}>
        <TouchableOpacity onPress={() => navigation.navigate("PanelClientes")}>
          <Icon name="home-outline" size={28} color={tema.iconoNav} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Membresia")}>
          <Icon name="card-account-details" size={28} color={tema.iconoNav} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("HistorialAsistencias")}>
          <Icon name="clipboard-list" size={28} color="#FF9045" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { color: "#FF9045", fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 10, marginTop: 40 },
  subtitle: { fontSize: 14, textAlign: "center", marginBottom: 15 },
  counterBox: { padding: 12, borderRadius: 8, alignItems: "center", marginBottom: 20, borderWidth: 1, elevation: 1 },
  counterText: { fontSize: 16, fontWeight: "bold" },
  section: { marginTop: 10 },
  accesos: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: "bold" },
  card: { padding: 15, borderRadius: 6, marginBottom: 10, borderWidth: 1, elevation: 1 },
  cardText: { fontSize: 14, textAlign: "center", fontWeight: "bold", marginBottom: 4 },
  cardDetail: { fontSize: 13, textAlign: "center" },
  bottomNav: {
    flexDirection: "row", justifyContent: "space-around", alignItems: "center",
    paddingVertical: 12, borderTopWidth: 1, position: "absolute",
    bottom: 20, alignSelf: "center", width: "90%", borderRadius: 12, elevation: 6,
  },
});