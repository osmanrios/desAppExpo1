import React from "react";
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

export default function PanelAdminScreen({ navigation }) {
  const handleLogout = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Deseas cerrar tu sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: () => navigation.replace("Login"),
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Bienvenida */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>¡Bienvenido,Admin Vital Sport!</Text>

          <TouchableOpacity
            onPress={() => {
              console.log("🔸 Botón presionado");
              handleLogout();
            }}
          >
            <Icon name="logout" size={26} color="#FF9045" />
          </TouchableOpacity>
        </View>

        {/* Imagen tipo card */}
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/admin.jpg")}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        {/* Título */}
        <Text style={styles.panelTitle}>Panel Administrativo</Text>

        {/* Separador */}
        <View style={styles.separatorContainer}>
          <View style={styles.line} />
          <Text style={styles.separatorText}>O</Text>
          <View style={styles.line} />
        </View>

        {/* Accesos Rápidos */}
        <View style={styles.accesos}>
          <Icon
            name="view-grid"
            size={20}
            color="#FF9045"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.accesosText}>Accesos Rápidos</Text>
        </View>

        {/* Tarjetas */}
        <View style={styles.grid}>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("RegistrarClientes")}
          >
            <Icon name="account-plus" size={40} color="#FF9045" />
            <Text style={styles.cardText}>Registrar{"\n"}Clientes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("RegistrarMembresias")}
          >
            <Icon name="card-plus" size={40} color="#FF9045" />
            <Text style={styles.cardText}>Registrar{"\n"}Membresías</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("RegistrarPagos")}
          >
            <Icon name="currency-usd" size={40} color="#FF9045" />
            <Text style={styles.cardText}>Registrar{"\n"}Pagos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("RegistrarAsistencias")}
          >
            <Icon name="clipboard-list" size={40} color="#FF9045" />
            <Text style={styles.cardText}>Registrar{"\n"}Asistencias</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate("PanelAdmin")}>
          <Icon name="home-outline" size={28} color="#FF9045" />
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
        <TouchableOpacity onPress={() => navigation.navigate("GestionPagos")}>
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
  container: {
    flex: 1,
    backgroundColor: "#23252E",
    paddingHorizontal: 15,
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f6f6f7ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    marginTop: 30,
  },
  accesos: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  accesosText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  welcomeText: {
    color: "#090909ff",
    fontSize: 16,
    fontWeight: "bold",
  },
  panelTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#fff",
  },
  separatorText: {
    marginHorizontal: 10,
    color: "#FF9045",
    fontSize: 16,
    fontWeight: "bold",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#2e3038",
    width: "48%",
    paddingVertical: 20,
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 15,
  },
  cardText: {
    color: "#FF9045",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#2e3038",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#3a3d46",
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    width: "90%",
    borderRadius: 12,
  },
  imageContainer: {
    width: "90%",
    height: 230,
    alignSelf: "center",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#23252E",
    marginTop: 30,
    marginBottom: 15,
    shadowColor: "#23252E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
});
