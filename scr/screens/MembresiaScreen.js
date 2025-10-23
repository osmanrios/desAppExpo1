import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { auth, db } from "../screens/firebase/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function Membresia({ navigation }) {
  const [membresia, setMembresia] = useState(null);
  const [loading, setLoading] = useState(true);

  // Parsear fecha segura:
  // - acepta Firestore Timestamp (objeto con toDate)
  // - acepta string "dd/mm/yyyy"
  // - por defecto crea Date en zona local usando new Date(año, mesIndex, dia)
  // Si endOfDay = true -> devuelve la fecha con hora 23:59:59.999 (útil para fechaFin)
  const parseFecha = (fechaInput, endOfDay = false) => {
    if (!fechaInput) return null;

    try {
      // Firestore Timestamp
      if (typeof fechaInput === "object" && typeof fechaInput.toDate === "function") {
        const d = fechaInput.toDate();
        if (endOfDay) d.setHours(23, 59, 59, 999);
        return d;
      }

      // String dd/mm/yyyy
      if (typeof fechaInput === "string" && fechaInput.includes("/")) {
        const parts = fechaInput.split("/");
        if (parts.length >= 3) {
          const dia = parseInt(parts[0], 10);
          const mes = parseInt(parts[1], 10) - 1; // monthIndex
          const anio = parseInt(parts[2], 10);
          const d = new Date(anio, mes, dia);
          if (endOfDay) d.setHours(23, 59, 59, 999);
          return d;
        }
      }

      // Fallback: intentar parsear cualquier otro formato
      const d2 = new Date(fechaInput);
      if (!isNaN(d2)) {
        if (endOfDay) d2.setHours(23, 59, 59, 999);
        return d2;
      }
    } catch (err) {
      console.warn("parseFecha fallo:", err);
    }

    return null;
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const fetchMembresiaData = async () => {
        try {
          const q = query(
            collection(db, "Membresias"),
            where("clienteID", "==", user.uid)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const membresias = querySnapshot.docs.map((docRef) => {
              const data = docRef.data();
              return {
                id: docRef.id,
                ...data,
                // fechaInicio -> inicio del día (00:00:00)
                fechaInicio: parseFecha(data.fechaInicio, false),
                // fechaFin -> final del día (23:59:59.999) para que incluya todo ese día
                fechaFin: parseFecha(data.fechaFin, true),
              };
            });

            // Ordenar por fechaFin (más reciente primero). Manejar nulls.
            membresias.sort((a, b) => {
              const aTime = a.fechaFin ? a.fechaFin.getTime() : 0;
              const bTime = b.fechaFin ? b.fechaFin.getTime() : 0;
              return bTime - aTime;
            });

            setMembresia(membresias[0]);
          } else {
            setMembresia(null);
          }
        } catch (error) {
          console.error("Error cargando membresía:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchMembresiaData();
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF9045" />
      </View>
    );
  }

  // Estado actual
  const ahora = new Date();
  let estadoMembresia = "No registrada";
  if (membresia) {
    if (membresia.fechaFin && membresia.fechaFin < ahora) {
      estadoMembresia = "Expirada";
    } else {
      estadoMembresia = membresia.estado || "Activa";
    }
  }

  // Función para formatear fecha en formato local Colombia (solo fecha)
  const formatLocalDate = (d) => {
    if (!d) return "N/A";
    try {
      return d.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch {
      return d.toLocaleDateString();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#23252E" }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <Text style={styles.title}>Mi Membresía</Text>
        <Text style={styles.subtitle}>
          Consulte el estado actual de su membresía
        </Text>

        {/* Estado actual */}
        <View style={styles.cardEstado}>
          <Text
            style={[
              styles.estado,
              estadoMembresia.toLowerCase() === "activa"
                ? styles.activa
                : estadoMembresia.toLowerCase() === "expirada"
                ? styles.expirada
                : styles.inactiva,
            ]}
          >
            Membresía {estadoMembresia}
          </Text>

          <Text style={styles.tipo}>
            {membresia?.tipoMembresia || "Sin membresía"}
          </Text>

          {/* Fechas */}
          <Text style={styles.fecha}>
            Inicio:{" "}
            {membresia?.fechaInicio
              ? formatLocalDate(membresia.fechaInicio)
              : "N/A"}
          </Text>
          <Text style={styles.fecha}>
            Fin:{" "}
            {membresia?.fechaFin ? formatLocalDate(membresia.fechaFin) : "N/A"}
          </Text>
        </View>

        {/* Separador */}
        <View style={styles.separatorContainer}>
          <View style={styles.line} />
          <Text style={styles.separatorText}>O</Text>
          <View style={styles.line} />
        </View>

        {/* Membresías disponibles */}
        <View style={styles.section}>
          <View style={styles.accesos}>
            <Icon
              name="view-grid"
              size={18}
              color="#FF9045"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.sectionTitle}>Membresías Existentes</Text>
          </View>

          <View style={styles.grid}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Mensual</Text>
              <Text style={styles.cardText}>Tienes acceso a 30 días</Text>
            </View>
            <View style={styles.cardmedi}>
              <Text style={styles.cardTitle}>Trimestral</Text>
              <Text style={styles.cardText}>Tienes acceso a 90 días</Text>
            </View>
            <View style={styles.cardFull}>
              <Text style={styles.cardTitle}>Anual</Text>
              <Text style={styles.cardText}>Tienes acceso a 365 días</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Barra inferior fija */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate("PanelClientes")}>
          <Icon name="home-outline" size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Membresia")}>
          <Icon name="card-account-details" size={28} color="#FF9045" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Asistencia")}>
          <Icon name="clipboard-list" size={28} color="#fff" />
        </TouchableOpacity>
        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#23252E", padding: 20 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#23252E",
  },
  title: {
    color: "#FF9045",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    marginTop: 40,
  },
  subtitle: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  cardEstado: {
    backgroundColor: "#2E3038",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  estado: { fontSize: 16, fontWeight: "bold" },
  activa: { color: "green" },
  inactiva: { color: "red" },
  expirada: { color: "orange" },
  tipo: { fontSize: 18, color: "#fff", marginTop: 10, fontWeight: "bold" },
  fecha: { fontSize: 14, color: "#fff", marginTop: 5 },
  section: { marginTop: 20 },
  accesos: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  sectionTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20,
  },
  card: {
    backgroundColor: "#2E3038",
    width: "100%",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
  },
  cardTitle: {
    color: "#FF9045",
    fontWeight: "bold",
    marginBottom: 6,
    fontSize: 20,
  },
  cardText: { color: "#fff", fontSize: 12, textAlign: "center" },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  separatorText: { marginHorizontal: 10, color: "#FFF", fontSize: 16, fontWeight: "bold" },
  line: { flex: 1, height: 1, backgroundColor: "#fff" },
  cardFull: {
    backgroundColor: "#2E3038",
    width: "100%",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
    marginTop: 20,
  },
  cardmedi: {
    backgroundColor: "#2E3038",
    width: "100%",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
    marginTop: 20,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#2E3038",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#3A3D46",
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    width: "90%",
    borderRadius: 12,
  },
});
