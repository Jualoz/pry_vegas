// 1. Entra a https://console.firebase.google.com → tu proyecto → ⚙️ Configuración del proyecto
// 2. En "Tus apps" crea (o abre) una app Web y copia aquí los valores de firebaseConfig.
// Mientras apiKey esté vacío, el sitio funciona en "modo demostración":
// el panel guarda los cambios solo en este navegador.
export const firebaseConfig = {
  apiKey: "AIzaSyBuZ6zjKORXQHhOrB-Hb66-z6Wl9ybpNEM",
  authDomain: "restaurante-las-vegas.firebaseapp.com",
  projectId: "restaurante-las-vegas",
  storageBucket: "restaurante-las-vegas.firebasestorage.app",
  messagingSenderId: "599960507171",
  appId: "1:599960507171:web:cf6cc4254fadd4f0a37296",
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey);
