const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
  precio: { type: Number, required: true, min: 0 },
  descripcion: { type: String, required: true, trim: true, minlength: 1, maxlength: 1000 },
  imagen: { type: String, default: '' }
}, { timestamps: true });
module.exports = mongoose.model('Producto', productSchema);

