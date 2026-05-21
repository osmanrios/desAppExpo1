import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { auth, db } from "../screens/firebase/firebaseConfig";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function PerfilClienteScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [image, setImage] = useState(null);
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
    label: modoOscuro ? "#ffffff" : "#181B3A",
    navBg: modoOscuro ? "#2E3038" : "#ffffff",
    navBorder: modoOscuro ? "#3A3D46" : "#ddd",
    iconoNav: modoOscuro ? "#ffffff" : "#181B3A",
  };

  // 🔹 CARGAR DATOS USUARIO
  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const ref = doc(db, "Usuarios", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setUserData(data);
          setImage(data.photoURL || null);
        }
      } catch (error) {
        console.error("Error al cargar usuario:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // 🔹 SELECCIONAR IMAGEN
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setImage(base64Img);
      try {
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, "Usuarios", user.uid);
          await updateDoc(userRef, { photoURL: base64Img, updatedAt: serverTimestamp() });
          setTimeout(async () => {
            const snap = await getDoc(userRef);
            if (snap.exists()) {
              setUserData(snap.data());
              Alert.alert("✅ Imagen actualizada correctamente");
            }
          }, 1000);
        }
      } catch (error) {
        Alert.alert("❌ Error al guardar imagen", error.message);
      }
    }
  };

  // 🔹 FORMATEAR FECHA
  const obtenerFechaFormateada = (timestamp) => {
    if (!timestamp) return "Sin fecha registrada";
    try {
      if (timestamp.toDate) return timestamp.toDate().toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
      if (timestamp instanceof Date) return timestamp.toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
      const fecha = new Date(timestamp);
      return isNaN(fecha) ? "Sin fecha válida" : fecha.toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });
    } catch { return "Sin fecha válida"; }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: tema.fondo }]}>
        <ActivityIndicator size="large" color="#FF9045" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: tema.fondo }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* TÍTULO */}
        <Text style={[styles.title, { color: tema.texto }]}>Mi Perfil</Text>

        {/* FOTO */}
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={{ uri: image || "https://cdn-icons-png.flaticon.com/512/847/847969.png" }}
            style={styles.profileImage}
          />
        </TouchableOpacity>

        {/* DATOS */}
        {userData && (
          <View style={[styles.infoContainer, { backgroundColor: tema.cardBg, borderColor: tema.cardBorder }]}>
            <Text style={styles.name}>{userData.nombre || "Sin nombre"}</Text>

            {[
              { label: "Correo", value: userData.email || "No registrado" },
              { label: "Teléfono", value: userData.telefono || "No registrado" },
              { label: "Edad", value: userData.edad || "N/A" },
              { label: "Sexo", value: userData.sexo || "N/A" },
              { label: "Altura", value: userData.altura ? `${userData.altura} cm` : "N/A" },
              { label: "Peso", value: userData.peso ? `${userData.peso} kg` : "N/A" },
            ].map((item) => (
              <View key={item.label}>
                <Text style={[styles.label, { color: tema.label }]}>{item.label}</Text>
                <Text style={styles.value}>{item.value}</Text>
              </View>
            ))}

            <Text style={[styles.updated, { color: tema.subtexto }]}>
              Última actualización: {obtenerFechaFormateada(userData.updatedAt)}
            </Text>
          </View>
        )}

        {/* BOTÓN EDITAR */}
        <TouchableOpacity onPress={() => navigation.navigate("EditarPerfil")} style={styles.editButton}>
          <Text style={styles.editText}>Editar perfil</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* BARRA INFERIOR */}
      <View style={[styles.bottomNav, { backgroundColor: tema.navBg, borderTopColor: tema.navBorder }]}>
        <TouchableOpacity onPress={() => navigation.navigate("PanelClientes")}>
          <Icon name="home-outline" size={28} color={tema.iconoNav} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Membresia")}>
          <Icon name="card-account-details" size={28} color={tema.iconoNav} />
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
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 15, marginTop: 40 },
  profileImage: { width: 140, height: 140, borderRadius: 70, alignSelf: "center", borderWidth: 3, borderColor: "#FF9045", marginBottom: 20 },
  infoContainer: { padding: 15, borderRadius: 10, borderWidth: 1, elevation: 1 },
  name: { color: "#FF9045", fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  label: { fontSize: 14, marginTop: 8 },
  value: { color: "#FF9045", fontSize: 16, fontWeight: "bold" },
  updated: { fontSize: 12, marginTop: 10, textAlign: "center", fontStyle: "italic" },
  editButton: { backgroundColor: "#FF9045", padding: 12, borderRadius: 10, marginTop: 25, alignItems: "center", alignSelf: "center", width: "70%" },
  editText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  bottomNav: {
    flexDirection: "row", justifyContent: "space-around", alignItems: "center",
    paddingVertical: 12, borderTopWidth: 1, position: "absolute",
    bottom: 20, alignSelf: "center", width: "90%", borderRadius: 12, elevation: 6,
  },
});