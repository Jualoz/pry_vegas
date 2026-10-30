# Restaurante Las Vegas · Landing page

Sitio estático (HTML, CSS y JS sin compilación) con un panel de administrador en `/admin`,
pensado para publicarse en **Firebase Hosting** (el mismo proyecto `restaurante-las-vegas`).

```
pry_vegas/
├─ firebase.json          Configuración de Hosting y Firestore
├─ firestore.rules        Quién puede leer y editar el menú
├─ .firebaserc            Proyecto por defecto: restaurante-las-vegas
└─ public/
   ├─ index.html          La landing page
   ├─ admin.html          Panel de administrador
   ├─ assets/logo.png
   ├─ css/                styles.css (sitio) · admin.css (panel)
   └─ js/
      ├─ firebase-config.js   ← AQUÍ pegas tus claves de Firebase
      ├─ default-content.js   Menú, precios, planes y horarios iniciales
      ├─ store.js             Lectura/guardado (Firestore o modo demo)
      ├─ app.js               Lógica de la landing
      └─ admin.js             Lógica del panel
```

## Qué puedes editar desde el panel

- Platos especiales y corrientes: nombre, descripción, precio, foto (URL) y **"Disponible hoy"** (si lo desmarcas, el plato aparece como *Agotado hoy* y no se puede pedir).
- Adicionales y la lista de "Cada almuerzo incluye".
- Planes (y cuál se muestra como *Recomendado*) y beneficios extra.
- Horarios: el sitio muestra automáticamente **"Abierto ahora"** o **"Cerrado"** con la hora de Colombia.
- **Aviso destacado**: una franja verde arriba de la página (p. ej. "Hoy tenemos sancocho 🍲").

Mientras Firebase no esté configurado, el panel funciona en **modo demostración** y guarda los cambios solo en tu navegador.

---

## Puesta en marcha (una sola vez)

### 1. Conectar la app web de Firebase
1. Entra a <https://console.firebase.google.com> → proyecto **restaurante-las-vegas**.
2. ⚙️ **Configuración del proyecto** → **Tus apps** → si no hay una app web, pulsa `</>` para crearla.
3. Copia los valores de `firebaseConfig` en `public/js/firebase-config.js`.
   *(La `apiKey` web de Firebase no es secreta; la seguridad la dan las reglas del paso 3).*

### 2. Activar el inicio de sesión y crear tu usuario
1. **Authentication** → **Comenzar** → **Correo electrónico/contraseña** → Habilitar.
2. Pestaña **Usuarios** → **Agregar usuario** → escribe tu correo y una contraseña segura.

### 3. Crear la base de datos y proteger la edición
1. **Firestore Database** → **Crear base de datos** → modo producción → ubicación `southamerica-east1` (o la más cercana).
2. Abre `firestore.rules` y reemplaza `CAMBIA_ESTE_CORREO@gmail.com` por el correo del usuario del paso 2
   (puedes poner varios: `["uno@gmail.com", "otro@gmail.com"]`).
   Así, aunque alguien cree una cuenta, **solo esos correos pueden modificar el menú**.

### 4. Publicar
Necesitas Node.js instalado. En una terminal, en la raíz del repositorio:

```bash
npm install -g firebase-tools
```
```bash
firebase login
```
```bash
firebase deploy
```

El sitio queda en <https://restaurante-las-vegas.web.app> y el panel en <https://restaurante-las-vegas.web.app/admin>.
La primera vez que guardes desde el panel se crea el menú en la base de datos.

> ⚠️ `firebase deploy` reemplaza la página actual. Si quieres conservar la versión anterior, haz una copia antes
> o publica primero en un canal de prueba: `firebase hosting:channel:deploy prueba`.

---

## Probar en tu computador

```bash
python -m http.server 5500 --directory public
```
Abre <http://localhost:5500> (no funciona abriendo el archivo con doble clic porque usa módulos JS).

## Fotos

Las fotos de los platos son **imágenes de referencia de Unsplash** (licencia libre, uso comercial permitido).
Te recomiendo reemplazarlas por fotos reales de tus platos: súbelas a cualquier lugar público
(por ejemplo, a `public/assets/` y vuelve a publicar, o a Google Drive/Imgur) y pega la URL en el panel.
Una foto cuadrada, tomada desde arriba y con buena luz natural se ve mejor en los círculos del menú.

## Datos de contacto

El número de WhatsApp (`573223552844`) está en `public/js/app.js` (constante `WHATSAPP`) y en `index.html`
(enlace `tel:`). La dirección y el mapa están en `index.html`, sección `#contacto`.
