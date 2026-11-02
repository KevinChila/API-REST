const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Middleware de autenticación para rutas protegidas
function auth(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/login');
}

// Ruta de login
router.get('/login', authController.mostrarLogin);

// Ruta de registro
router.get('/register', authController.mostrarRegistro);

// Acción de registro de usuario
router.post('/register', authController.registrarUsuario);

// Acción de inicio de sesión
router.post('/login', authController.iniciarSesion);

// Acción de cierre de sesión
router.get('/logout', authController.cerrarSesion);

// Ruta de chat protegida
router.get('/chat', auth, authController.mostrarChat);

module.exports = router;