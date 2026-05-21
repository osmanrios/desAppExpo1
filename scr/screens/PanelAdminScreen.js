import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../screens/firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function PanelAdminScreen({ navigation }) {
  const [nombreAdmin, setNombreAdmin] = useState("Admin");
  const [modoOscuro, setModoOscuro] = useState(false);
  const [tabActiva, setTabActiva] = useState("PanelAdmin");

  const tema = {
    fondo: modoOscuro ? "#23252E" : "#f4f4f4",
    card: modoOscuro ? "#2e3038" : "#fff",
    texto: modoOscuro ? "#fff" : "#181B3A",
    icono: modoOscuro ? "#fff" : "#181B3A",
    separador: modoOscuro ? "#555" : "#ccc",
    navBg: modoOscuro ? "#2e3038" : "#fff",
    navBorder: modoOscuro ? "#3a3d46" : "#eee",
    subtexto: modoOscuro ? "#aaa" : "#888",
  };

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

  // 🔹 GUARDAR TEMA AL CAMBIAR
  const toggleTema = async () => {
    try {
      const nuevo = !modoOscuro;
      setModoOscuro(nuevo);
      await AsyncStorage.setItem("modoOscuro", JSON.stringify(nuevo));
    } catch (e) { console.error(e); }
  };

  // 🔹 CARGAR NOMBRE ADMIN
  useEffect(() => {
    const obtenerNombre = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const docSnap = await getDoc(doc(db, "Usuarios", user.uid));
          if (docSnap.exists()) setNombreAdmin(docSnap.data().nombre || "Admin");
        }
      } catch (error) { console.error("Error al obtener nombre:", error); }
    };
    obtenerNombre();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Cerrar sesión", "¿Deseas cerrar tu sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Cerrar sesión", style: "destructive", onPress: () => navigation.replace("Login") },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: tema.fondo }]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={[styles.header, { backgroundColor: tema.card }]}>
          <View style={styles.headerLeft}>
            <Image source={require("../../assets/logog.jpg")} style={styles.avatar} />
            <View>
              <Text style={[styles.welcomeText, { color: tema.subtexto }]}>¡Bienvenido!</Text>
              <Text style={[styles.nombreText, { color: tema.texto }]} numberOfLines={1}>{nombreAdmin}</Text>
            </View>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.headerIcon} onPress={toggleTema}>
              <Icon name={modoOscuro ? "weather-night" : "white-balance-sunny"} size={22} color={modoOscuro ? "#FF9045" : "#181B3A"} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}>
              <Icon name="bell-outline" size={22} color={tema.icono} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.headerIcon}>
              <Icon name="logout" size={22} color="#FF9045" />
            </TouchableOpacity>
          </View>
        </View>

        {/* IMAGEN */}
        <View style={styles.imageContainer}>
          <Image source={require("../../assets/logog.jpg")} style={styles.image} resizeMode="contain" />
        </View>

        {/* TÍTULO */}
        <Text style={[styles.panelTitle, { color: tema.texto }]}>Panel Administrativo</Text>

        {/* SEPARADOR */}
        <View style={styles.separatorContainer}>
          <View style={[styles.line, { backgroundColor: tema.separador }]} />
          <Text style={[styles.separatorText, { color: tema.texto }]}>0</Text>
          <View style={[styles.line, { backgroundColor: tema.separador }]} />
        </View>

        {/* SUGERIDOS */}
        <View style={styles.seccionHeader}>
          <Icon name="view-grid" size={20} color={tema.icono} style={{ marginRight: 6 }} />
          <Text style={[styles.seccionTitle, { color: tema.texto }]}>Sugeridos FitControl</Text>
        </View>
        <View style={styles.grid}>
          {[
            { icon: "account-tie", label: "Registrar\nEntrenador", screen: "RegistrarEntrenador" },
            { icon: "card-account-details", label: "Tipos\nMembresías", screen: "TiposMembresias" },
            { icon: "clipboard-list", label: "Control\nRutinas", screen: "ControlRutinas" },
          ].map((item) => (
            <TouchableOpacity key={item.screen} style={[styles.cardLight, { backgroundColor: tema.card }]} onPress={() => navigation.navigate(item.screen)}>
              <Icon name={item.icon} size={36} color={tema.icono} />
              <Text style={[styles.cardTextLight, { color: tema.texto }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ACCESOS RÁPIDOS */}
        <View style={styles.seccionHeader}>
          <Icon name="view-grid" size={20} color={tema.icono} style={{ marginRight: 6 }} />
          <Text style={[styles.seccionTitle, { color: tema.texto }]}>Accesos Rápidos</Text>
        </View>
        <View style={styles.grid}>
          {[
            { icon: "account-plus", label: "Registrar\nClientes", screen: "RegistrarClientes" },
            { icon: "card-plus", label: "Registrar\nMembresías", screen: "RegistrarMembresias" },
            { icon: "currency-usd", label: "Registrar\nPagos", screen: "RegistrarPagos" },
            { icon: "clipboard-check", label: "Control de\nAsistencias", screen: "RegistrarAsistencias" },
          ].map((item) => (
            <TouchableOpacity key={item.screen} style={[styles.cardLightBig, { backgroundColor: tema.card }]} onPress={() => navigation.navigate(item.screen)}>
              <Icon name={item.icon} size={36} color={tema.icono} />
              <Text style={[styles.cardTextLight, { color: tema.texto }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={[styles.bottomNav, { backgroundColor: tema.navBg, borderTopColor: tema.navBorder }]}>
        {[
          { icon: "home", screen: "PanelAdmin" },
          { icon: "account-group", screen: "GestionClientes" },
          { icon: "card-account-details", screen: "GestionMembresias" },
          { icon: "currency-usd", screen: "GestionPagos" },
          { icon: "clipboard-list", screen: "GestionAsistencias" },
        ].map((item) => (
          <TouchableOpacity key={item.screen} onPress={() => { setTabActiva(item.screen); navigation.navigate(item.screen); }}>
            <Icon name={item.icon} size={28} color={tabActiva === item.screen ? "#FF9045" : tema.icono} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 15, paddingTop: 40 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, borderRadius: 12, marginBottom: 15, marginTop: 10, elevation: 2 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1, marginRight: 10 },
  avatar: { width: 38, height: 38, borderRadius: 19, flexShrink: 0 },
  welcomeText: { fontSize: 12, flexShrink: 1 },
  nombreText: { fontSize: 15, fontWeight: "bold", flexShrink: 1, maxWidth: 160 },
  headerIcons: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 0 },
  headerIcon: { padding: 4 },
  imageContainer: { width: "100%", alignSelf: "center", marginBottom: 12, backgroundColor: "transparent" },
  image: { width: "100%", height: 150, resizeMode: "contain" },
  panelTitle: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 8 },
  separatorContainer: { flexDirection: "row", alignItems: "center", marginVertical: 10 },
  line: { flex: 1, height: 1 },
  separatorText: { marginHorizontal: 10, fontSize: 16, fontWeight: "bold" },
  seccionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12, marginTop: 6 },
  seccionTitle: { fontSize: 16, fontWeight: "bold" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 10 },
  cardLight: { width: "31%", paddingVertical: 18, alignItems: "center", borderRadius: 12, marginBottom: 12, elevation: 2 },
  cardLightBig: { width: "48%", paddingVertical: 18, alignItems: "center", borderRadius: 12, marginBottom: 12, elevation: 2 },
  cardTextLight: { fontSize: 12, marginTop: 8, textAlign: "center", fontWeight: "500" },
  bottomNav: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingVertical: 12, borderTopWidth: 1, position: "absolute", bottom: 20, alignSelf: "center", width: "90%", borderRadius: 16, elevation: 6 },
});