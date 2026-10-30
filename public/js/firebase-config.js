// 1. Entra a https://console.firebase.google.com → tu proyecto → ⚙️ Configuración del proyecto
// 2. En "Tus apps" crea (o abre) una app Web y copia aquí los valores de firebaseConfig.
// Mientras apiKey esté vacío, el sitio funciona en "modo demostración":
// el panel guarda los cambios solo en este navegador.
export const firebaseConfig = {
  apiKey: "",
  authDomain: "restaurante-las-vegas.firebaseapp.com",
  projectId: "restaurante-las-vegas",
  storageBucket: "restaurante-las-vegas.appspot.com",
  messagingSenderId: "",
  appId: "",
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey);
