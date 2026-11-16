require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { initializeSockets } = require('./sockets/socketHandler');

const PORT = process.env.PORT || 5001;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

app.set('io', io);
initializeSockets(io);

server.listen(PORT, () => {
  console.log(`KaamNow Server running on http://localhost:${PORT}`);
});
