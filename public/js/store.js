// Lectura/escritura del contenido editable. Usa Firestore si Firebase está
// configurado; si no, usa localStorage (modo demostración).
import { DEFAULT_CONTENT } from "./default-content.js";
import { firebaseConfig, isFirebaseConfigured } from "./firebase-config.js";

const SDK = "https://www.gstatic.com/firebasejs/10.12.2";
const DEMO_KEY = "lv-content-demo";

let fb = null;
async function firebase() {
  if (fb) return fb;
  const [{ initializeApp }, fs, auth] = await Promise.all([
    import(`${SDK}/firebase-app.js`),
    import(`${SDK}/firebase-firestore.js`),
    import(`${SDK}/firebase-auth.js`),
  ]);
  const app = initializeApp(firebaseConfig);
  fb = { fs, auth, db: fs.getFirestore(app), authInstance: auth.getAuth(app) };
  return fb;
}

const withDefaults = (data) => ({ ...structuredClone(DEFAULT_CONTENT), ...(data || {}) });

export const demoMode = !isFirebaseConfigured;

export async function loadContent() {
  try {
    if (demoMode) {
      const raw = localStorage.getItem(DEMO_KEY);
      return withDefaults(raw ? JSON.parse(raw) : null);
    }
    const { fs, db } = await firebase();
    const snap = await fs.getDoc(fs.doc(db, "site", "content"));
    return withDefaults(snap.exists() ? snap.data() : null);
  } catch (err) {
    console.warn("No se pudo cargar el contenido, usando valores por defecto.", err);
    return withDefaults(null);
  }
}

export async function saveContent(data) {
  if (demoMode) {
    localStorage.setItem(DEMO_KEY, JSON.stringify(data));
    return;
  }
  const { fs, db } = await firebase();
  await fs.setDoc(fs.doc(db, "site", "content"), { ...data, actualizado: fs.serverTimestamp() });
}

export function resetDemo() {
  localStorage.removeItem(DEMO_KEY);
}

export async function login(email, password) {
  const { auth, authInstance } = await firebase();
  return auth.signInWithEmailAndPassword(authInstance, email, password);
}

export async function logout() {
  const { auth, authInstance } = await firebase();
  return auth.signOut(authInstance);
}

export async function onUser(cb) {
  const { auth, authInstance } = await firebase();
  return auth.onAuthStateChanged(authInstance, cb);
}

export async function resetPassword(email) {
  const { auth, authInstance } = await firebase();
  return auth.sendPasswordResetEmail(authInstance, email);
}

export const money = (n) =>
  "$" + Number(n || 0).toLocaleString("es-CO", { maximumFractionDigits: 0 });
