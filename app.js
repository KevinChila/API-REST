require('./utils/env');
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const hbs = require('hbs');
const http = require('http');
const { Server } = require('socket.io');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const apiAuthRoutes = require('./routes/apiAuthRoutes');
const apiProductRoutes = require('./routes/apiProductRoutes');
const { verifyToken } = require('./utils/jwt');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret || sessionSecret.length < 32) throw new Error('Define SESSION_SECRET con al menos 32 caracteres en .env');
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error('Define JWT_SECRET con al menos 32 caracteres en .env');
app.set('io', io);
app.disable('x-powered-by');
app.use(express.urlencoded({ extended: false, limit: '20kb' }));
app.use(express.json({ limit: '20kb' }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
hbs.registerPartials(path.join(__dirname, 'views/partials'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const sessionMiddleware = session({ name:'inventario.sid', secret:sessionSecret, resave:false, saveUninitialized:false, cookie:{ httpOnly:true, sameSite:'lax', secure:process.env.NODE_ENV==='production', maxAge:8*60*60*1000 } });
app.use(sessionMiddleware);
function auth(req,res,next){ if(req.session?.user)return next(); return res.redirect('/login'); }
app.use('/api/auth',apiAuthRoutes);
app.use('/api/products',apiProductRoutes);
app.use('/',authRoutes);
app.use('/productos',auth,productRoutes);
app.get('/',(req,res)=>res.redirect('/login'));
io.use((socket,next)=>sessionMiddleware(socket.request,{},()=>{
  if(socket.request.session?.user){ socket.user={email:socket.request.session.user.email}; return next(); }
  try { const raw=socket.handshake.auth?.token; if(raw){socket.user=verifyToken(raw);return next();} } catch {}
  next(new Error('No autorizado'));
}));
io.on('connection',(socket)=>{
  socket.on('mensaje',(input)=>{
    if(typeof input!=='string' || !input.trim() || input.length>1000) return;
    io.emit('mensaje',{autor:socket.user.email,texto:input.trim(),fecha:new Date().toISOString()});
  });
});
app.use((req,res)=>res.status(404).json({error:{code:'NOT_FOUND',message:'Ruta no encontrada.'}}));
app.use((err,req,res,next)=>{
  console.error(err);
  const status=err.name==='ValidationError'?400:err.name==='CastError'?400:500;
  res.status(status).json({error:{code:status===500?'INTERNAL_ERROR':'VALIDATION_ERROR',message:status===500?'Error interno del servidor.':err.message}});
});
const port=Number(process.env.PORT)||3000;
const mongoUri=process.env.MONGODB_URI||'mongodb://127.0.0.1:27017/inventario';
mongoose.connect(mongoUri).then(()=>server.listen(port,()=>console.log(`Servidor activo en http://localhost:${port}`))).catch(err=>{console.error('No se pudo conectar a MongoDB:',err.message);process.exit(1);});


