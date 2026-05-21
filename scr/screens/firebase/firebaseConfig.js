import { initializeApp } from 'firebase/app';

import {
  initializeAuth,
  getReactNativePersistence
} from 'firebase/auth';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {

  apiKey: "AIzaSyCUNYSUcqcLDoNPAB5-VxbFxuy5pJjrLEo",

  authDomain: "wo-fitgestor-x.firebaseapp.com",

  projectId: "wo-fitgestor-x",

  storageBucket: "wo-fitgestor-x.appspot.com",

  messagingSenderId: "964449843202",

  appId: "1:964449843202:web:0bba5d202aa72c91880f1b",

  measurementId: "G-VWSR5Q2Y4T"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);