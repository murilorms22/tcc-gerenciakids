const jsonServer = require('json-server');
const auth = require('json-server-auth');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'src', 'db.json'));
const middlewares = jsonServer.defaults();

// Bind router db to the app
server.db = router.db;

// Middlewares padrão (cors, static, etc)
server.use(middlewares);

// Middleware de autenticação (json-server-auth)
server.use(auth);

// Router do json-server
server.use(router);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 JSON Server + Auth rodando em ${PORT}`);
  console.log(`📧 Login: POST ${PORT}/login`);
  console.log(`📝 Register: POST ${PORT}/register`);
  console.log(`👥 Users: GET ${PORT}/users`);
});
