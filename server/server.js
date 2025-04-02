import cluster from "cluster";
import os from "os";
import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import { connectToDb } from "./database/connectToDb.js";
import { Server } from "socket.io";
import URL from "url";
import PATH from "path";
import expressStatusMonitor from "express-status-monitor";
import { handleSocket } from "./socket/index.js";
import { startMessageConsumer } from "./socket/services/kafka.js";
dotenv.config();
startMessageConsumer();
const numCPUs = os.cpus().length;

if (cluster.isPrimary) {

    // console.log(`Primary ${process.pid} is running`);
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    cluster.on("exit", (worker) => {
        // console.log(`Worker ${worker.process.pid} died, spawning a new one...`);
        cluster.fork();
    });
} else {
    const app = express();
    const server = http.createServer(app);
    app.use(express.json());
    app.use(expressStatusMonitor({ 
      path: "/status",
      websocket: true,
      spans: [
          { interval: 1, retention: 60 },
          { interval: 5, retention: 60 },
          { interval: 15, retention: 60 }
      ],
      chartVisibility: {
          cpu: true,
          mem: true,
          load: true,
          responseTime: true,
          requests: true,
          statusCodes: true
      }
    }));

    app.use(cors({ origin: "http://localhost:5173", methods: ["GET", "POST"], maxHttpBufferSize: 1e8 }));
    
    const socketServer = new Server(server, {
      cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
      }
    });
    handleSocket(socketServer);

    connectToDb().then(() => {
        server.listen(5000, () => {
            // console.log(`Worker ${process.pid} listening on port 5000`);
        });
    }).catch((error) => {
        console.log({ error });
    });

    const __dirname = PATH.dirname(URL.fileURLToPath(import.meta.url));
    app.get('/', (req, res) => {
      res.sendFile(PATH.join(__dirname, 'public/index.html'));
    });

    app.use((err, req, res, next) => {
        // console.error(err.stack);
        res.status(500).json({ message: "Something went wrong!" });
    });
}
