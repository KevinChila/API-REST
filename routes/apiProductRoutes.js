const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const requireJwt = require('../middleware/requireJwt');
const router = express.Router();
router.use(requireJwt);
function validate(body, partial = false) {
  const out = {};
  for (const key of ['nombre', 'descripcion']) if (body[key] !== undefined) {
    if (typeof body[key] !== 'string' || !body[key].trim() || body[key].trim().length > (key === 'nombre' ? 120 : 1000)) return `Campo ${key} inválido.`;
    out[key] = body[key].trim();
  }
  if (body.precio !== undefined) {
    const value = Number(body.precio);
    if (!Number.isFinite(value) || value < 0) return 'El precio debe ser un número mayor o igual a cero.';
    out.precio = value;
  }
  if (!partial && (!out.nombre || !out.descripcion || out.precio === undefined)) return 'nombre, descripcion y precio son obligatorios.';
  if (Object.keys(out).length === 0) return 'Debe enviar al menos un campo modificable.';
  return out;
}
function validId(id) { return mongoose.Types.ObjectId.isValid(id); }
router.get('/', async (req, res, next) => {
  try { const page = Math.max(1, parseInt(req.query.page, 10) || 1); const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20)); const [items,total] = await Promise.all([Product.find().sort({ _id:-1 }).skip((page-1)*limit).limit(limit).lean(), Product.countDocuments()]); res.json({ data: items, meta:{ page, limit, total, pages: Math.ceil(total/limit) } }); } catch(e) { next(e); }
});
router.get('/:id', async (req,res,next)=>{ if(!validId(req.params.id)) return res.status(400).json({error:{code:'INVALID_ID',message:'ID inválido.'}}); try { const item=await Product.findById(req.params.id).lean(); return item?res.json({data:item}):res.status(404).json({error:{code:'NOT_FOUND',message:'Producto no encontrado.'}}); }catch(e){next(e);} });
router.post('/', async (req,res,next)=>{ const data=validate(req.body); if(typeof data==='string') return res.status(400).json({error:{code:'VALIDATION_ERROR',message:data}}); try { const item=await Product.create(data); req.app.get('io').emit('product:created',{id:item.id, nombre:item.nombre}); res.status(201).location(`/api/products/${item.id}`).json({data:item}); }catch(e){next(e);} });
router.patch('/:id', async (req,res,next)=>{ if(!validId(req.params.id)) return res.status(400).json({error:{code:'INVALID_ID',message:'ID inválido.'}}); const data=validate(req.body,true); if(typeof data==='string') return res.status(400).json({error:{code:'VALIDATION_ERROR',message:data}}); try { const item=await Product.findByIdAndUpdate(req.params.id,{$set:data},{returnDocument:'after',runValidators:true}); if(!item)return res.status(404).json({error:{code:'NOT_FOUND',message:'Producto no encontrado.'}}); req.app.get('io').emit('product:updated',{id:item.id,nombre:item.nombre}); res.json({data:item}); }catch(e){next(e);} });
router.delete('/:id', async (req,res,next)=>{ if(!validId(req.params.id)) return res.status(400).json({error:{code:'INVALID_ID',message:'ID inválido.'}}); try { const item=await Product.findByIdAndDelete(req.params.id); if(!item)return res.status(404).json({error:{code:'NOT_FOUND',message:'Producto no encontrado.'}}); req.app.get('io').emit('product:deleted',{id:req.params.id}); res.status(204).end(); }catch(e){next(e);} });
module.exports=router;

