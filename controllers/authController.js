const User = require('../models/User');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');

// Mostrar la vista de inicio de sesión
const mostrarLogin = (req, res) => {
    res.render('login');
};

// Mostrar la vista de registro
const mostrarRegistro = (req, res) => {
    res.render('register');
};

// Registrar un nuevo usuario
const registrarUsuario = [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('Mínimo 6 caracteres'),
    async (req, res) => {
        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            return res.render('register', {
                errores: errores.array()
            });
        }

        try {
            const { email, password } = req.body;
            const hash = await bcrypt.hash(password, 10);
            const usuario = new User({ email, password: hash });
            await usuario.save();
            res.redirect('/login');
        } catch (error) {
            console.log(error);
            res.render('register', {
                errores: [{ msg: 'Error al registrar usuario' }]
            });
        }
    }
];

// Validar credenciales e iniciar sesión
const iniciarSesion = [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Contraseña obligatoria'),
    async (req, res) => {
        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            return res.render('login', {
                errores: errores.array()
            });
        }

        try {
            const { email, password } = req.body;
            const usuario = await User.findOne({ email }).select('+password');

            if (!usuario) {
                return res.render('login', {
                    errores: [{ msg: 'Usuario no existe' }]
                });
            }

            const valido = await bcrypt.compare(password, usuario.password);

            if (!valido) {
                return res.render('login', {
                    errores: [{ msg: 'Contraseña incorrecta' }]
                });
            }

            req.session.user = { id: usuario.id, email: usuario.email };
            res.redirect('/productos');
        } catch (error) {
            console.log(error);
            res.render('login', {
                errores: [{ msg: 'Error al iniciar sesión' }]
            });
        }
    }
];

// Cerrar la sesión de usuario
const cerrarSesion = (req, res) => {
    req.session.destroy();
    res.redirect('/login');
};

// Renderizar la vista de chat
const mostrarChat = (req, res) => {
    res.render('chat');
};

module.exports = {
    mostrarLogin,
    mostrarRegistro,
    registrarUsuario,
    iniciarSesion,
    cerrarSesion,
    mostrarChat
};
