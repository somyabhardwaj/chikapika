import { parentPort, workerData } from "worker_threads";
import fs from "fs";

const { filePath, chunk } = workerData;

try {
    const buffer = Buffer.from(chunk.split(",")[1], "base64");
    fs.appendFileSync(filePath, buffer);
    parentPort.postMessage({ success: true });
} catch (error) {
    parentPort.postMessage({ error: error.message });
}
