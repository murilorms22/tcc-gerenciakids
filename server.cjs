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

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 JSON Server + Auth rodando em http://localhost:${PORT}`);
  console.log(`📧 Login: POST http://localhost:${PORT}/login`);
  console.log(`📝 Register: POST http://localhost:${PORT}/register`);
  console.log(`👥 Users: GET http://localhost:${PORT}/users`);
});
