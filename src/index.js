import express from 'express';
import { Server } from 'socket.io';
// Setup Express App, MongoDB connection, etc.
const app = express();
const httpServer = createServer(app); // Annahme: createServer wird von 'http' importiert
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
// ... weiterer Code ...
//# sourceMappingURL=index.js.map