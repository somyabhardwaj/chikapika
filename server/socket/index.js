import Redis from "ioredis";
import { produceMessage,createTopic } from "./services/kafka.js";

const pub = new Redis({
    username: "default",
    password: "ahGy1kuXpsimvn29G343CriNkaCNovkn",
    host: "redis-11659.c330.asia-south1-1.gce.redns.redis-cloud.com",
    port: 11659,
});

const sub = new Redis({
    username: "default",
    password: "ahGy1kuXpsimvn29G343CriNkaCNovkn",
    host: "redis-11659.c330.asia-south1-1.gce.redns.redis-cloud.com",
    port: 11659,
});

// ✅ Subscribe to the MESSAGES channel
sub.subscribe("MESSAGES", (err, count) => {
    if (err) {
        // console.error("Failed to subscribe:", err);
    } else {
        // console.log(`Subscribed to ${count} channel(s).`);
    }
});

// ✅ Handle incoming messages from Redis
sub.on("message", async (channel, message) => {
    if (channel === "MESSAGES") {
      await  createTopic("MESSAGES")
        await produceMessage(JSON.stringify(message));
        // console.log("Received from Redis:", JSON.parse(message)); // ✅ Correctly parse JSON
    }
});

// ✅ Socket.io logic
export const handleSocket = (socketServer) => {
    socketServer.on("connection", (socket) => {
        // console.log(`A user connected: ${socket.id}`);

        socket.on("message", async (message) => {
            // console.log(`Received text message:`, message);
            await pub.publish("MESSAGES", JSON.stringify(message)); // ✅ Send as JSON string
        });

        socket.on("disconnect", () => {
            // console.log(`User disconnected: ${socket.id}`);
        });
    });
};
