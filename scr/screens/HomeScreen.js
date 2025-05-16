import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, TextInput, Keyboard, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as Location from 'expo-location';

export default function App() {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [city, setCity] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);

  const API_KEY = '7949c55380404d677bfd6ba7752331d5';
  const fetchCurrentWeather = async (lat, lon) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`
      );
      setCurrentWeather(response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(`Error al obtener el clima actual: ${errorMessage}`);
    }
  };
  const fetchForecast = async (lat, lon) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`
      );
      const dailyData = response.data.list.filter((item) =>
        item.dt_txt.includes('12:00:00')
      );
      setForecast(dailyData.slice(0, 5));
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(`Error al obtener el pronóstico: ${errorMessage}`);
    }
  };
  const getDepartamento = async (lat, lon) => {
    try {
      const result = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
      if (result.length > 0) {
        setDepartamento(result[0].region);
      }
    } catch (err) {
      console.log('Error al obtener el departamento:', err);
      setDepartamento('Desconocido');
    }
  };
  const fetchWeatherByLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permiso de ubicación denegado');
        setLoading(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);
      await fetchCurrentWeather(location.coords.latitude, location.coords.longitude);
      await fetchForecast(location.coords.latitude, location.coords.longitude);
      await getDepartamento(location.coords.latitude, location.coords.longitude);
      setLastUpdate(new Date()); // guardar hora de actualización
      setError(null);
    } catch (err) {
      setError('Error al obtener la ubicación');
    } finally {
      setLoading(false);
    }
  };
  const fetchWeatherByCity = async () => {
    if (!city.trim()) return;
    Keyboard.dismiss();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=es`
      );

      const data = response.data
      setCurrentWeather(data);
      setLocation(null);
      await fetchForecast(data.coord.lat, data.coord.lon);
      await getDepartamento(data.coord.lat, data.coord.lon);
      setLastUpdate(new Date()); // guardar hora de actualización
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(`Ciudad no encontrada: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherByLocation();

    const interval = setInterval(() => {
      fetchWeatherByLocation();
    }, 0.50 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>Cargando datos del clima...</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={fetchWeatherByLocation}>
          <Text style={styles.buttonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="cloud-outline" size={30} color="white" />
        <Text style={styles.headerText}>App De Clima</Text>
        <Ionicons name="location-outline" size={30} color="white" />
      </View>

      <View style={styles.currentWeather}>
        <Text style={styles.location}>{currentWeather?.name?.toUpperCase()}</Text>
        <Text style={styles.region}>{departamento?.toUpperCase()}</Text>
        <Text style={styles.temperature}>
          {Math.round(currentWeather?.main?.temp)}°C
        </Text>
        <Text style={styles.description}>
          {currentWeather?.weather[0]?.description.toUpperCase()}
        </Text>
        <View style={styles.details}>
          <Text style={styles.detailText}>
            HUMEDAD {Math.round(currentWeather?.main?.humidity)}%
          </Text>
          <Text style={styles.detailText}>
            VIENTO {Math.round(currentWeather?.wind?.speed * 3.6)} km/h
          </Text>
        </View>
        {lastUpdate && (
          <Text style={styles.lastUpdate}>
            Última actualización: {lastUpdate.toLocaleTimeString()}
          </Text>
        )}
        <Text style={styles.source}>Condiciones Climáticas Usando OpenWeatherMap</Text>
      </View>
      <View style={styles.forecast}>
        <Text style={styles.sectionTitle}>PRONÓSTICO EXTENDIDO</Text>
        <View style={styles.forecastRow}>
          {forecast.map((day, index) => (
            <View key={index} style={styles.forecastDay}>
              <Text style={styles.dayText}>
                {new Date(day.dt * 1000).toLocaleDateString('es-ES', {
                  weekday: 'short'
                }).toUpperCase()}
              </Text>
              <Image
                source={{
                  uri: `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`
                }}
                style={styles.weatherIcon}/>
              <Text style={styles.tempText}>{Math.round(day.main.temp)}°</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.buttons}>
        <TextInput
          style={styles.input}
          placeholder="Buscar ciudad..."
          placeholderTextColor="white"
          value={city}
          onChangeText={setCity}
          onSubmitEditing={fetchWeatherByCity}
        />
        <TouchableOpacity style={styles.button} onPress={fetchWeatherByCity}>
          <Ionicons name="search-outline" size={20} color="white" />
          <Text style={styles.buttonText}>BUSCAR UBICACIÓN</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={fetchWeatherByLocation}>
          <Ionicons name="locate-outline" size={20} color="white" />
          <Text style={styles.buttonText}>USAR MI UBICACIÓN</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={fetchWeatherByLocation}>
          <Ionicons name="cloud-offline" size={20} color="white" />
          <Text style={styles.buttonText}>Modo Sin Conexion</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({container: {flex: 1,backgroundColor: 'rgb(9, 178, 181)',padding: 20},header: {
flexDirection: 'row',justifyContent: 'space-between',alignItems: 'center',marginBottom: 20},headerText: {
color: 'white',fontSize: 24,fontWeight: 'bold'},currentWeather: {alignItems: 'center',backgroundColor: 'rgba(255,255,255,0.2)',
padding: 20,borderRadius: 10,marginBottom: 20},location: {color: 'white',fontSize: 18,fontWeight: 'bold'},region: {
color: 'white',fontSize: 16,marginBottom: 10},temperature: {fontSize: 64,fontWeight: 'bold',color: 'white'},
description: {color: 'white',fontSize: 16},details: {flexDirection: 'row',justifyContent: 'space-between',width: '60%',
marginVertical: 10},detailText: {color: 'white',fontSize: 14},source: {color: 'white',fontSize: 12,opacity: 0.8},
lastUpdate: {color: 'white',fontSize: 12,marginTop: 5},forecast: {backgroundColor: 'rgba(255,255,255,0.2)',
padding: 20,borderRadius: 10,marginBottom: 20},sectionTitle: {color: 'white',fontSize: 18,fontWeight: 'bold',
marginBottom: 10},forecastRow: {flexDirection: 'row',justifyContent: 'space-between'},forecastDay: {alignItems: 'center',
marginRight: 15},dayText: {color: 'white',fontSize: 14},tempText: {color: 'white',fontSize: 16,fontWeight: 'bold'},
weatherIcon: {width: 50,height: 50,marginVertical: 5},buttons: {alignItems: 'center'},input: {width: '100%',
borderColor: 'white',borderWidth: 1,borderRadius: 10,padding: 10,color: 'white',marginBottom: 10},
button: {flexDirection: 'row',backgroundColor: 'rgba(255,255,255,0.3)',padding: 15,borderRadius: 10,
alignItems: 'center',justifyContent: 'center',width: '100%',marginBottom: 10},buttonText: {
color: 'white',fontSize: 16,marginLeft: 10},errorText: {color: 'white',fontSize: 18,textAlign: 'center',
marginBottom: 20},loadingText: {color: 'white',fontSize: 16,marginTop: 10}
});