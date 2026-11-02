const crypto = require('node:crypto');
const secret = process.env.JWT_SECRET;
const b64 = value => Buffer.from(JSON.stringify(value)).toString('base64url');
function signToken(user) {
  if (!secret || secret.length < 32) throw new Error('JWT_SECRET debe tener al menos 32 caracteres');
  const now = Math.floor(Date.now() / 1000);
  const head = b64({ alg: 'HS256', typ: 'JWT' });
  const payload = b64({ sub: String(user._id), email: user.email, iat: now, exp: now + 3600 });
  const data = `${head}.${payload}`;
  return `${data}.${crypto.createHmac('sha256', secret).update(data).digest('base64url')}`;
}
function verifyToken(token) {
  if (!secret || secret.length < 32) throw new Error('JWT_SECRET no configurado');
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Token inválido');
  const data = `${parts[0]}.${parts[1]}`;
  const expected = crypto.createHmac('sha256', secret).update(data).digest();
  const actual = Buffer.from(parts[2], 'base64url');
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) throw new Error('Firma inválida');
  const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
  if (header.alg !== 'HS256' || !payload.sub || payload.exp <= Date.now() / 1000) throw new Error('Token expirado o inválido');
  return payload;
}
module.exports = { signToken, verifyToken };
