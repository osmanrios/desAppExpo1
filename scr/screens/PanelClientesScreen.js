import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { auth, db } from "../screens/firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

export default function PanelClientes({ navigation }) {
  const [cliente, setCliente] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const fetchUserData = async () => {
        try {
          const docRef = doc(db, "Usuarios", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setCliente(docSnap.data());
          } else {
            console.log("❌ No existe el usuario en la colección users");
          }
        } catch (error) {
          console.error("⚠️ Error obteniendo usuario:", error);
        }
      };
      fetchUserData();
    }
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Deseas cerrar tu sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
              navigation.replace("Login");
            } catch (error) {
              console.error("Error al cerrar sesión:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // --- Cálculo IMC (corregido con conversión de cm a m) ---
  const peso = cliente?.peso ?? 0;
  const altura = cliente?.altura ?? 0;
  const alturaMetros = altura > 3 ? altura / 100 : altura; // si es mayor a 3, asumimos cm
  const imc = peso > 0 && alturaMetros > 0 ? peso / (alturaMetros * alturaMetros) : 0;

  const getIMCCategory = (imc) => {
    if (imc === 0) return { label: "No disponible", color: "#999999", icon: null };
    if (imc < 18.5) return { label: "Bajo peso", color: "#3498db", icon: "arrow-down" };
    if (imc < 25) return { label: "Peso ideal", color: "#27ae60", icon: "check" };
    if (imc < 30) return { label: "Sobrepeso", color: "#e67e22", icon: "arrow-up" };
    return { label: "Obesidad", color: "#e74c3c", icon: "alert" };
  };

  const imcCategory = getIMCCategory(imc);

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : "?");

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            {cliente ? `¡Bienvenido, ${cliente.nombre}!` : "¡Bienvenido!"}
          </Text>

          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => navigation.navigate("Perfil")}>
              {cliente?.photoURL ? (
                <Image
                  source={{ uri: cliente.photoURL }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.initialCircle}>
                  <Text style={styles.initialText}>{getInitial(cliente?.nombre)}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={handleLogout}>
              <Icon name="logout" size={26} color="#FF9045" style={{ marginLeft: 12 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* IMAGEN PRINCIPAL */}
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/cliente.jpg")}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* TÍTULO */}
        <Text style={styles.panelTitle}>Panel Cliente</Text>

        {/* DATOS PERSONALES */}
        <Text style={styles.infoTitle}>Datos Personales</Text>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Edad: </Text>
            {cliente?.edad ?? "No disponible"}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Sexo: </Text>
            {cliente?.sexo ?? "No disponible"}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Teléfono: </Text>
            {cliente?.telefono ?? "No disponible"}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Dirección: </Text>
            {cliente?.direccion ?? "No disponible"}
          </Text>
        </View>

        {/* INFORMACIÓN FÍSICA */}
        <Text style={styles.infoTitle}>Información Física</Text>
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Peso (kg): </Text>
            {peso > 0 ? peso : "No disponible"}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Altura: </Text>
            {altura > 0
              ? `${alturaMetros === altura ? altura + " m" : altura + " cm"}`
              : "No disponible"}
          </Text>

          <View style={styles.imcContainer}>
            <Text style={[styles.infoText, { color: imcCategory.color }]}>
              <Text style={styles.label}>IMC: </Text>
              {imc > 0 ? imc.toFixed(1) : "No disponible"} ({imcCategory.label})
            </Text>
            {imcCategory.icon && (
              <Icon
                name={imcCategory.icon}
                size={20}
                color={imcCategory.color}
                style={{ marginLeft: 6 }}
              />
            )}
          </View>
        </View>
      </ScrollView>

      {/* BARRA INFERIOR */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate("PanelClientes")}>
          <Icon name="home-outline" size={28} color="#FF9045" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Membresia")}>
          <Icon name="card-account-details" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Asistencia")}>
          <Icon name="clipboard-list" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#23252E", paddingHorizontal: 15, paddingTop: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f6f6f7",
    padding: 12,
    borderRadius: 8,
    marginTop: 40,
  },
  welcomeText: { color: "#090909", fontSize: 20, fontWeight: "bold" },
  headerRight: { flexDirection: "row", alignItems: "center" },
  profileImage: { width: 40, height: 40, borderRadius: 20 },
  initialCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF9045",
    justifyContent: "center",
    alignItems: "center",
  },
  initialText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  imageContainer: {
    width: "90%",
    height: 230,
    alignSelf: "center",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#23252E",
    marginTop: 30,
    marginBottom: 15,
    elevation: 8,
  },
  image: { width: "100%", height: "100%", borderRadius: 16 },
  panelTitle: { fontSize: 20, fontWeight: "bold", color: "#fff", textAlign: "center", marginBottom: 5 },
  infoTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 8 },
  infoContainer: { backgroundColor: "#2E3038", padding: 15, borderRadius: 10, marginBottom: 15 },
  infoText: { color: "#fff", fontSize: 16, marginBottom: 6 },
  label: { fontWeight: "bold", color: "#FF9045" },
  imcContainer: { flexDirection: "row", alignItems: "center" },
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
