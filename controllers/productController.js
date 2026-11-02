const Producto = require('../models/Product');
const { body, validationResult } = require('express-validator');

// Mostrar formulario para crear un producto
const mostrarFormularioCrear = (req, res) => {
    res.render('form');
};

// Mostrar formulario para editar un producto
const mostrarFormularioEditar = async (req, res) => {
    try {
        const producto = await Producto.findById(req.params.id);
        if (!producto) {
            return res.redirect('/productos');
        }
        res.render('edit', { producto });
    } catch (error) {
        console.log(error);
        res.redirect('/productos');
    }
};

// Obtener y renderizar la lista de productos
const listarProductos = async (req, res) => {
    try {
        const productos = await Producto.find();
        res.render('products', { productos });
    } catch (error) {
        console.log(error);
        res.status(500).send('Error al obtener productos');
    }
};

// Validar datos y crear un nuevo producto
const crearProducto = [
    // Validación de campos del formulario
    body('nombre').notEmpty().withMessage('Nombre obligatorio'),
    body('precio').isNumeric().withMessage('Precio debe ser numérico'),
    body('descripcion').notEmpty().withMessage('Descripción obligatoria'),

    async (req, res) => {
        const errores = validationResult(req);

        if (!errores.isEmpty()) {
            const productos = await Producto.find();
            return res.render('products', {
                productos,
                errores: errores.array()
            });
        }

        try {
            const producto = new Producto({
                nombre: req.body.nombre,
                precio: req.body.precio,
                descripcion: req.body.descripcion,
                imagen: req.file ? req.file.filename : ''
            });

            await producto.save();
            res.redirect('/productos');
        } catch (error) {
            console.log(error);
            const productos = await Producto.find();
            res.render('products', {
                productos,
                errores: [{ msg: 'Error al crear producto' }]
            });
        }
    }
];

// Validar datos y actualizar un producto
const editarProducto = [
    body('nombre').notEmpty().withMessage('Nombre obligatorio'),
    body('precio').isNumeric().withMessage('Precio debe ser numérico'),
    body('descripcion').notEmpty().withMessage('Descripción obligatoria'),

    async (req, res) => {
        const errores = validationResult(req);

        try {
            const productoExistente = await Producto.findById(req.params.id);
            if (!productoExistente) {
                return res.redirect('/productos');
            }

            if (!errores.isEmpty()) {
                const producto = {
                    _id: req.params.id,
                    nombre: req.body.nombre,
                    precio: req.body.precio,
                    descripcion: req.body.descripcion,
                    imagen: productoExistente.imagen
                };
                return res.render('edit', {
                    producto,
                    errores: errores.array()
                });
            }

            const datosActualizados = {
                nombre: req.body.nombre,
                precio: req.body.precio,
                descripcion: req.body.descripcion
            };

            if (req.file) {
                datosActualizados.imagen = req.file.filename;
            }

            await Producto.findByIdAndUpdate(req.params.id, datosActualizados);
            res.redirect('/productos');
        } catch (error) {
            console.log(error);
            res.status(500).send('Error al actualizar producto');
        }
    }
];

// Eliminar un producto existente
const eliminarProducto = async (req, res) => {
    try {
        await Producto.findByIdAndDelete(req.params.id);
        res.send('Producto eliminado');
    } catch (error) {
        console.log(error);
        res.status(500).send('Error al eliminar producto');
    }
};

module.exports = {
    mostrarFormularioCrear,
    mostrarFormularioEditar,
    listarProductos,
    crearProducto,
    editarProducto,
    eliminarProducto
};