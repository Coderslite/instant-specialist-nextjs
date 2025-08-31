// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBABnO_FKoHf6spc7H46AzVLi__0fDAx8g",
  authDomain: "instant-doctor-a4e4c.firebaseapp.com",
  projectId: "instant-doctor-a4e4c",
  storageBucket: "instant-doctor-a4e4c.appspot.com",
  messagingSenderId: "127248616649",
  appId: "1:127248616649:web:7a9a63d31274ce79651118",
  measurementId: "G-8STYCQ8RPF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper function to fetch data from a collection
async function getCollectionData(collectionName: any) {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

const storage = getStorage(app); // Initialize storage


export { db, getCollectionData, storage };
export default app;