# Informe técnico — API de inventario (Unidad 2)

**Estudiante:** CHILA PALOMO KEVIN FRANCISCO · **Materia:** Aplicaciones Web · **Universidad:** Universidad Politécnica Salesiana

## Diseño e implementación

Se amplió el sistema de inventario recibido para exponer una API REST consumible por clientes externos, manteniendo la interfaz web. Express organiza rutas por recurso y separa la autenticación JWT en `routes/apiAuthRoutes.js`, el CRUD en `routes/apiProductRoutes.js` y la verificación Bearer en `middleware/requireJwt.js`. Mongoose persiste usuarios y productos en MongoDB; las contraseñas se guardan con bcrypt y los tokens HS256 se generan/verifican con `node:crypto`. Los secretos y la URI se configuran por entorno, nunca se incluyen en el código.

El contrato de productos ofrece GET colección paginada, GET por ID, POST, PATCH y DELETE. Los recursos usan estados HTTP explícitos: 201 al crear, 204 al eliminar, 400 ante entrada/ID inválidos, 401 para credenciales o token, 404 cuando no existe y 409 para correo duplicado. Las respuestas mantienen `{data, meta}` o `{error:{code,message}}`. El esquema valida campos y la API limita nombre (120), descripción (1000), precio no negativo, tamaño de cuerpo y paginación. Las búsquedas se realizan con Mongoose y los identificadores se verifican antes de consultar.

## Persistencia, sesiones y eventos

MongoDB conserva usuarios y productos. La interfaz web mantiene sesiones con cookie HttpOnly, SameSite=Lax y caducidad; las imágenes JPG/PNG se guardan localmente con límite de 2 MB. Socket.IO admite clientes con sesión web o JWT verificado en el handshake, valida mensajes y difunde el chat. Además, emite `product:created`, `product:updated` y `product:deleted` al completar operaciones CRUD de la API.

## Ejecución y verificación

Con Node.js 18+ y MongoDB: copiar `.env.example` a `.env`, crear dos secretos aleatorios diferentes de al menos 32 caracteres, ejecutar `npm install` y `npm start`; consultar `/` para la interfaz o `/api/auth/register` y `/api/auth/login` para obtener credenciales de API. Se verificó sintaxis de los 12 archivos JavaScript y se ejecutó contra MongoDB temporal: registro, login, token, crear/listar/consultar/actualizar/eliminar, acceso sin token (401), validación (400) y recurso eliminado (404). La colección Postman permite repetir el flujo. La API requiere MongoDB activo para iniciar. El almacén de sesiones predeterminado es de desarrollo; para producción debe sustituirse por un almacén persistente y habilitar HTTPS. Las imágenes se almacenan en disco local.

