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

export default function HistorialAsistencias({ navigation }) {
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(true);

  const parseFecha = (fechaStr) => {
    if (!fechaStr) return null;
    const [dia, mes, anio] = fechaStr.split("/");
    return new Date(`${anio}-${mes}-${dia}`);
  };

  useEffect(() => {
    const user = auth.currentUser;

    if (user) {
      console.log("UID del usuario autenticado:", user.uid);

      const fetchAsistencias = async () => {
        try {
          const q = query(
            collection(db, "Asistencias"), // 👈 nombre exacto de tu colección
            where("clienteID", "==", user.uid)
          );

          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const registros = querySnapshot.docs.map((doc) => {
              const data = doc.data();
              console.log("Asistencia encontrada:", data); // 👈 para revisar coincidencia

              return {
                id: doc.id,
                ...data,
                fechaObj: parseFecha(data.fecha),
              };
            });

            registros.sort((a, b) => b.fechaObj - a.fechaObj);
            setAsistencias(registros);
          } else {
            console.log("No se encontraron asistencias para este usuario.");
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
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF9045" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#23252E" }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <Text style={styles.title}>Mis Asistencias</Text>
        
        <Text style={styles.subtitle}>
          Consulta tu historial de asistencias al gimnasio.{"\n"}
          Revisa tu frecuencia de entrenamiento y mantén tu motivación
        </Text>

        {/* Contador */}
        <View style={styles.counterBox}>
          <Text style={styles.counterText}>
            Has asistido{" "}
            <Text style={{ color: "#FF9045", fontWeight: "bold" }}>
              {asistencias.length}
            </Text>{" "}
            veces
          </Text>
        </View>

        {/* Historial */}
        <View style={styles.section}>
          <View style={styles.accesos}>
            <Icon
              name="view-grid"
              size={18}
              color="#FF9045"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.sectionTitle}>Historial</Text>
          </View>

          {asistencias.length > 0 ? (
            asistencias.map((item) => (
              <View key={item.id} style={styles.card}>
                <Text style={styles.cardText}>{item.fecha}</Text>
                <Text style={{ textAlign: "center" }}>
                  Entrenador: {item.entrenador}
                </Text>
                <Text style={{ textAlign: "center" }}>
                  Rutina: {item.rutina}
                </Text>
              </View>
            ))
          ) : (
            <Text style={{ color: "#fff", textAlign: "center" }}>
              No tienes asistencias registradas
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Barra inferior */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate("PanelClientes")}>
          <Icon name="home-outline" size={28} color="#FFf" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Membresia")}>
          <Icon name="card-account-details" size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("HistorialAsistencias")}
        >
          <Icon name="clipboard-list" size={28} color="#FF9045" />
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
    marginBottom: 15,
  },
  counterBox: {
    backgroundColor: "#2E3038",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  counterText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  section: { marginTop: 10 },
  accesos: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  sectionTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 6,
    marginBottom: 10,
  },
  cardText: {
    color: "#000",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "bold",
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
