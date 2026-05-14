import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore, doc, getDocFromServer } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD5A-YcKOP_g4Lb1RsVzoAT8CNqXxhXu8w",
  authDomain: "elitecricket-31af2.firebaseapp.com",
  projectId: "elitecricket-31af2",
  storageBucket: "elitecricket-31af2.firebasestorage.app",
  messagingSenderId: "513877924100",
  appId: "1:513877924100:web:cdd85fb214b0ff69f1d851",
  measurementId: "G-ZCH0TSSCVH"
};

const app = initializeApp(firebaseConfig);

// Initialize with long-polling to fix potential websocket connectivity issues in sandboxed environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

// CRITICAL: Test the connection on boot as per guidelines
async function testConnection() {
  try {
    // Attempt to fetch a non-existent doc to test connectivity
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connected successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Firestore connection failed: client is offline. Please check your Firebase configuration or network.");
    } else {
      console.error("Firestore connectivity test error:", error);
    }
  }
}

testConnection();
