# Sistema de inventario con API REST

Aplicación web y API REST para administrar productos de inventario. Permite registrar usuarios, iniciar sesión, gestionar productos, subir imágenes y comunicarse en tiempo real.

## Datos del estudiante

- **Estudiante:** CHILA PALOMO KEVIN FRANCISCO
- **Materia:** Aplicaciones Web
- **Universidad:** Universidad Politécnica Salesiana

## Funcionalidades

- Registro e inicio de sesión de usuarios.
- Contraseñas guardadas con hash bcrypt.
- Autenticación JWT para las rutas protegidas de la API.
- Sesiones para la interfaz web.
- CRUD de productos con persistencia en MongoDB.
- Validación de datos, identificadores y respuestas de error uniformes.
- Carga de imágenes JPG y PNG de hasta 2 MB desde la interfaz web.
- Chat con Socket.IO para usuarios autenticados.
- Eventos en tiempo real cuando la API crea, actualiza o elimina productos.

## Tecnologías y requisitos

- Node.js 20.19 o superior
- Express
- MongoDB y Mongoose
- bcrypt
- JWT con la biblioteca criptográfica de Node.js
- express-session
- Socket.IO
- Multer y Handlebars

MongoDB debe estar instalado y en ejecución, localmente o en un servidor accesible.

## Instalación y configuración

Abre PowerShell en la carpeta del proyecto e instala las dependencias:

```powershell
npm.cmd install
```

Copia el archivo de ejemplo para crear `.env`:

```powershell
Copy-Item .env.example .env
```

En `.env`, configura la URI de MongoDB y dos secretos distintos de al menos 32 caracteres. El puerto utilizado por esta configuración es `32123`:

```env
PORT=32123
MONGODB_URI=mongodb://127.0.0.1:27017/inventario
SESSION_SECRET=escribe_aqui_un_secreto_aleatorio_de_32_caracteres_o_mas
JWT_SECRET=escribe_aqui_otro_secreto_aleatorio_distinto
NODE_ENV=development
```

No compartas ni subas `.env` al repositorio. Contiene secretos y está excluido mediante `.gitignore`.

## Iniciar la aplicación

Con MongoDB activo, ejecuta:

```powershell
npm.cmd start
```

Para desarrollo con reinicio automático:

```powershell
npm.cmd run dev
```

Abre la interfaz web en:

```text
http://localhost:32123
```

Si cambias `PORT` en `.env`, usa ese mismo puerto en la dirección del navegador y en la colección de Postman.

## API REST

La dirección base de la API es:

```text
http://localhost:32123/api
```

### Registro

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "email": "alumno@example.com",
  "password": "ClaveSegura123"
}
```

El correo debe tener un formato válido y la contraseña debe tener entre 8 y 72 caracteres. Si el correo ya existe, la API responde `409 Conflict`.

### Inicio de sesión

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "alumno@example.com",
  "password": "ClaveSegura123"
}
```

La respuesta incluye un token JWT válido durante una hora. Envíalo en las rutas protegidas usando este encabezado:

```http
Authorization: Bearer <token>
```

### Rutas de productos

Todas las rutas de productos requieren un token JWT.

| Método | Ruta | Descripción | Respuesta habitual |
|---|---|---|---|
| `GET` | `/api/products?page=1&limit=20` | Lista productos con paginación | `200 OK` |
| `GET` | `/api/products/:id` | Consulta un producto | `200 OK` |
| `POST` | `/api/products` | Crea un producto | `201 Created` |
| `PATCH` | `/api/products/:id` | Actualiza uno o más campos | `200 OK` |
| `DELETE` | `/api/products/:id` | Elimina un producto | `204 No Content` |

Ejemplo para crear un producto:

```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "nombre": "Teclado",
  "precio": 25.5,
  "descripcion": "Teclado USB"
}
```

Los campos `nombre`, `precio` y `descripcion` son obligatorios. El precio debe ser mayor o igual a cero. El nombre admite hasta 120 caracteres y la descripción hasta 1000. La lista devuelve los registros en `data` y la paginación en `meta`.

## Formato de errores

Los errores de la API usan un formato uniforme:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Descripción del error"
  }
}
```

Estados principales:

- `400 Bad Request`: datos o identificador inválidos.
- `401 Unauthorized`: falta el token o no es válido.
- `404 Not Found`: no se encontró la ruta o el producto.
- `409 Conflict`: el correo ya está registrado.
- `500 Internal Server Error`: ocurrió un error inesperado.

## Sesiones, imágenes y Socket.IO

La interfaz web utiliza sesiones con cookies `HttpOnly` y `SameSite=Lax`, con una duración de hasta ocho horas. Las sesiones usan el almacén predeterminado de Express, apropiado para desarrollo. Para producción se recomienda un almacén persistente y HTTPS.

La interfaz permite subir imágenes JPG o PNG de hasta 2 MB. Los archivos se guardan en `uploads`.

Socket.IO requiere una sesión web o un JWT válido. El chat utiliza el evento `mensaje`. La API emite estos eventos al modificar productos:

- `product:created`
- `product:updated`
- `product:deleted`

## Pruebas con Postman

La colección está en `docs/postman-collection.json`. Para ejecutarla:

1. Inicia MongoDB.
2. Inicia el servidor con `npm.cmd start`.
3. Importa la colección en Postman.
4. Ejecuta las solicitudes en orden: registro, inicio de sesión y operaciones CRUD.

La colección guarda el token y el identificador del producto para las solicitudes siguientes. Si el puerto configurado en `.env` es distinto, actualiza la variable `baseUrl` de la colección.

## Estructura del proyecto

```text
Tarea_U2/
├── app.js
├── controllers/       # Lógica de la interfaz web
├── middleware/        # Verificación de JWT
├── models/            # Esquemas de usuarios y productos
├── routes/            # Rutas web y de la API
├── utils/             # Configuración y funciones auxiliares
├── views/             # Vistas Handlebars
├── public/            # Archivos estáticos
├── uploads/           # Imágenes cargadas
└── docs/
    ├── informe-tecnico.md
    └── postman-collection.json
```
