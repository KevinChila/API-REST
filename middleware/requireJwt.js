const { verifyToken } = require('../utils/jwt');
module.exports = function requireJwt(req, res, next) {
  const header = req.get('authorization') || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Se requiere un token Bearer.' } });
  try { req.auth = verifyToken(match[1]); next(); }
  catch { return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Token inválido o expirado.' } }); }
};
