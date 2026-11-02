const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const multer = require('multer');

// Configuración de Multer para carga de archivos

// Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Filtro de archivos (solo imágenes)
const fileFilter = (req, file, cb) => {
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg'];

    if (tiposPermitidos.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes JPG o PNG'), false);
    }
};

// Multer final
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB
    }
});

// Middleware para manejo de errores de Multer
const manejarErrorMulter = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.render('products', {
            productos: [],
            errores: [{ msg: 'Archivo demasiado grande (máx 2MB)' }]
        });
    } else if (err) {
        return res.render('products', {
            productos: [],
            errores: [{ msg: err.message }]
        });
    }
    next();
};

// Aplicar middleware de error
router.use(manejarErrorMulter);

// Rutas de formulario de producto
router.get('/nuevo', productController.mostrarFormularioCrear);
router.get('/editar/:id', productController.mostrarFormularioEditar);

// Ruta para listar productos
router.get('/', productController.listarProductos);

// Ruta para crear producto con validación y carga de archivo
router.post('/crear', upload.single('imagen'), productController.crearProducto);

// Ruta para actualizar producto
router.post('/editar/:id', upload.single('imagen'), productController.editarProducto);
router.put('/editar/:id', productController.editarProducto);

// Ruta para eliminar producto
router.delete('/eliminar/:id', productController.eliminarProducto);

module.exports = router;
