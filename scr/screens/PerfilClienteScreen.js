import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as ImagePicker from "expo-image-picker";
import { auth, db } from "../screens/firebase/firebaseConfig";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function PerfilClienteScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Cargar datos del usuario
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

  // 🔹 Seleccionar imagen y actualizar Firestore
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

          // 🔥 Actualiza imagen y marca de tiempo
          await updateDoc(userRef, {
            photoURL: base64Img,
            updatedAt: serverTimestamp(),
          });

          // Espera 1 segundo para que Firestore guarde el timestamp real
          setTimeout(async () => {
            const snap = await getDoc(userRef);
            if (snap.exists()) {
              const data = snap.data();
              setUserData(data);
              Alert.alert("✅ Imagen actualizada correctamente");
            }
          }, 1000);
        }
      } catch (error) {
        Alert.alert("❌ Error al guardar imagen", error.message);
      }
    }
  };

  // 🔹 Mostrar carga
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF9045" />
      </View>
    );
  }

  // 🔹 Función para formatear la fecha correctamente
  const obtenerFechaFormateada = (timestamp) => {
    if (!timestamp) return "Sin fecha registrada";

    try {
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleString("es-CO", {
          dateStyle: "short",
          timeStyle: "short",
        });
      } else if (timestamp instanceof Date) {
        return timestamp.toLocaleString("es-CO", {
          dateStyle: "short",
          timeStyle: "short",
        });
      } else {
        const fecha = new Date(timestamp);
        return isNaN(fecha)
          ? "Sin fecha válida"
          : fecha.toLocaleString("es-CO", {
              dateStyle: "short",
              timeStyle: "short",
            });
      }
    } catch {
      return "Sin fecha válida";
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Mi Perfil</Text>

        <TouchableOpacity onPress={pickImage}>
          <Image
            source={{
              uri:
                image ||
                "https://cdn-icons-png.flaticon.com/512/847/847969.png",
            }}
            style={styles.profileImage}
          />
        </TouchableOpacity>

        {userData && (
          <View style={styles.infoContainer}>
            <Text style={styles.name}>{userData.nombre || "Sin nombre"}</Text>

            <Text style={styles.label}>Correo</Text>
            <Text style={styles.value}>{userData.email || "No registrado"}</Text>

            <Text style={styles.label}>Teléfono</Text>
            <Text style={styles.value}>
              {userData.telefono || "No registrado"}
            </Text>

            <Text style={styles.label}>Edad</Text>
            <Text style={styles.value}>{userData.edad || "N/A"}</Text>

            <Text style={styles.label}>Sexo</Text>
            <Text style={styles.value}>{userData.sexo || "N/A"}</Text>

            <Text style={styles.label}>Altura</Text>
            <Text style={styles.value}>
              {userData.altura ? `${userData.altura} cm` : "N/A"}
            </Text>

            <Text style={styles.label}>Peso</Text>
            <Text style={styles.value}>
              {userData.peso ? `${userData.peso} kg` : "N/A"}
            </Text>

            {/* 🔥 Fecha de última actualización segura */}
            <Text style={styles.updated}>
              Última actualización: {obtenerFechaFormateada(userData.updatedAt)}
            </Text>
          </View>
        )}

        <TouchableOpacity
          onPress={() => navigation.navigate("EditarPerfil")}
          style={styles.editButton}
        >
          <Text style={styles.editText}>Editar perfil</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Barra inferior */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate("PanelClientes")}>
          <Icon name="home-outline" size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Membresia")}>
          <Icon name="card-account-details" size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("Asistencia")}
        >
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
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    marginTop: 40,
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignSelf: "center",
    borderWidth: 3,
    borderColor: "#FF9045",
    marginBottom: 20,
  },
  infoContainer: { backgroundColor: "#2E3038", padding: 15, borderRadius: 10 },
  name: {
    color: "#FF9045",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  label: {
    color: "#fff",
    fontSize: 14,
    marginTop: 8,
  },
  value: {
    color: "#FF9045",
    fontSize: 16,
    fontWeight: "bold",
  },
  updated: {
    color: "#FFf",
    fontSize: 12,
    marginTop: 10,
    textAlign: "center",
    fontStyle: "italic",
  },
  editButton: {
    backgroundColor: "#FF9045",
    padding: 12,
    borderRadius: 10,
    marginTop: 25,
    alignItems: "center",
    alignSelf: "center",
    width: "70%",
  },
  editText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
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