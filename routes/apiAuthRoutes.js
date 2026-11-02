const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { signToken } = require('../utils/jwt');
const router = express.Router();
router.post('/register', async (req, res, next) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = req.body.password;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof password !== 'string' || password.length < 8 || password.length > 72)
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Correo válido y contraseña de 8 a 72 caracteres requeridos.' } });
    const user = await User.create({ email, password: await bcrypt.hash(password, 12) });
    return res.status(201).json({ data: { id: user.id, email: user.email } });
  } catch (err) { if (err.code === 11000) return res.status(409).json({ error: { code: 'EMAIL_EXISTS', message: 'El correo ya está registrado.' } }); next(err); }
});
router.post('/login', async (req, res, next) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await bcrypt.compare(req.body.password || '', user.password))) return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Credenciales incorrectas.' } });
    return res.json({ data: { token: signToken(user), tokenType: 'Bearer', expiresIn: 3600, user: { id: user.id, email: user.email } } });
  } catch (err) { next(err); }
});
module.exports = router;

