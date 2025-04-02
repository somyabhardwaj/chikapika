// import { Kafka } from "kafkajs";
// import path from "path";
// import fs from "fs";
// import MessageModel from "../../model/message-model.js"
// // const kafka = new Kafka({
// //     vhbrokers: [""],
// //     bnkjssl: {
// //         // ca: [fs.readFileSync(path.resolve("./socket/services/ca.pem"), "utf-8")],
// //     },
// //     bhjbsasl: {
// //         username: "avnadmin",
// //        bjhbpassword: "",
// //         mechanism: "plain",
// //     },
// // });

// let producer = null;

// export async function createProducer() {
//     if (producer) return producer;

//     const _producer = kafka.producer();
//     await _producer.connect();
//     producer = _producer;
//     return producer;
// }
// export async function deleteMessage(messageKey) {
//     try {
//         console.log(`Deleting message with key: ${messageKey}`);

//         // 1. Delete from MongoDB
//         const result = await MessageModel.deleteOne({ key: messageKey });
//         if (result.deletedCount === 0) {
//             console.log(`Message with key "${messageKey}" not found in MongoDB.`);
//         } else {
//             console.log(`Message with key "${messageKey}" deleted from MongoDB.`);
//         }

//         // 2. Produce a tombstone message to Kafka (null value deletes it)
//         const producer = kafka.producer();
//         await producer.connect();
//         await producer.send({
//             topic: "MESSAGES",
//             messages: [{ key: messageKey, value: null }],
//         });
//         await producer.disconnect();

//         console.log(`Tombstone message sent to Kafka for key "${messageKey}"`);
//         return true;
//     } catch (error) {
//         console.error("Error deleting message:", error);
//         return false;
//     }
// }
// export const produceMessage = async (message) => {
//     const producer = await createProducer();
//     console.log("producing message")
//     await producer.send({
//         messages: [{ key: `message-${Date.now()}`, value: message }],
//         topic: "MESSAGES",
//     });
//     return true;
// }
// export async function startMessageConsumer() {
//     console.log("Consumer is running..");
//     const consumer = kafka.consumer({ groupId: "message-group" }); // Use a fixed group ID

//     await consumer.connect();
//     await consumer.subscribe({ topic: "MESSAGES", fromBeginning: true });

//     await consumer.run({
//         eachMessage: async ({ message, pause }) => {
//             if (!message.value) {
//                 console.log("Skipping null message.");
//                 return;
//             }
//             try {
//                 const messageValue = message.value.toString();
//                 console.log(`📩 Received Message: ${messageValue}`);
    
//                 const parsedMessage = JSON.parse(messageValue);
//                 await MessageModel.create(parsedMessage);
//             } catch (err) {
//                 console.error("❌ Error processing message:", err);
//                 pause();
//                 setTimeout(() => {
//                     consumer.resume([{ topic: "MESSAGES" }]);
//                 }, 60000);
//             }
//         },
//     });
    
// }
// const admin = kafka.admin();
// // export async function deleteMessage(messageKey) {
// //     try {
// //         console.log(`Deleting message with key: ${messageKey}`);

// //         // 1. Delete from MongoDB
// //         const result = await MessageModel.deleteOne({ key: messageKey });
// //         if (result.deletedCount === 0) {
// //             console.log(`Message with key "${messageKey}" not found in MongoDB.`);
// //         } else {
// //             console.log(`Message with key "${messageKey}" deleted from MongoDB.`);
// //         }

// //         // 2. Produce a tombstone message to Kafka (null value deletes it)
// //         const producer = kafka.producer();
// //         await producer.connect();
// //         await producer.send({
// //             topic: "MESSAGES",
// //             messages: [{ key: messageKey, value: null }],
// //         });
// //         await producer.disconnect();

// //         console.log(`Tombstone message sent to Kafka for key "${messageKey}"`);
// //         return true;
// //     } catch (error) {
// //         console.error("Error deleting message:", error);
// //         return false;
// //     }
// // }
// export const createTopic = async (topicName) => {
//     try {
//         await admin.connect();
//         console.log(`Creating topic: ${topicName}...`);

//         // Get the list of existing topics
//         const existingTopics = await admin.listTopics();

//         // Check if the topic already exists
//         if (existingTopics.includes(topicName)) {
//             console.log(`Topic "${topicName}" already exists.`);
//             return;
//         }
//         await admin.createTopics({
//             topics: [
//                 {
//                     topic: topicName,
//                     numPartitions: 3, // Change as needed
//                     replicationFactor: 1, // Change based on your setup
//                 },
//             ],
//         });

//         console.log(`Topic "${topicName}" created successfully!`);
//     } catch (error) {
//         console.error('Error creating topic:', error);
//     } finally {
//         await admin.disconnect();
//     }
// };
// // Example: Create a topic dynamically
// // async function checkTopics() {
// //     await admin.connect();
// //     const topics = await admin.listTopics();
// //     console.log("✅ Available Topics:", topics);

// //     const topicMetadata = await admin.fetchTopicMetadata({ topics: ["MESSAGES"] });
// //     console.log("📌 Topic Metadata:", JSON.stringify(topicMetadata, null, 2));

// //     await admin.disconnect();
// // }
// // checkTopics();

// export default kafka;