import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("message", (message) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === message.id ? { ...msg, status: "sent" } : msg))
      );
    });

    return () => socket.off("message");
  }, []);

  const sendMessage = () => {
    if (!input.trim() && !file) return;

    const newMessage = {
      id: Date.now(), // Unique identifier
      text: input,
      sender: "me",
      time: new Date().toLocaleTimeString(),
      type: file ? "media" : "text",
      status: "sending", // Initially set to sending
    };

    setMessages((prev) => [...prev, newMessage]);

    if (file) {
      const chunkSize = 1024 * 32; // 32KB chunks
      let offset = 0;
      const reader = new FileReader();
      const files = file;
      reader.onload = (event) => {
        const chunk = event.target.result;
        socket.emit("file-chunk", {
          id: newMessage.id,
          fileName: files.name,
          fileType: files.type,
          chunk,
          offset,
          isLastChunk: offset + chunkSize >= files.size,
        });
        offset += chunkSize;

        if (offset < files.size) {
          readNextChunk();
        } else {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === newMessage.id ? { ...msg, status: "sent" } : msg
            )
          );
          setFile(null);
        }
      };
      const readNextChunk = () => {
        const slice = files.slice(offset, offset + chunkSize);
        reader.readAsDataURL(slice);
      };
      readNextChunk();
    } else {
      socket.emit("message", newMessage);
    }
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-100">
      <div className="bg-green-600 p-4 text-white font-bold">Chat</div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
            <div className={`p-2 rounded-lg max-w-xs text-white ${msg.sender === "me" ? "bg-green-500" : "bg-gray-500"}`}>
              {msg.type === "text" && <p>{msg.text}</p>}
              {msg.type === "media" && msg.fileType.startsWith("image") && (
                <img src={msg.file} alt="Uploaded" className="w-48 h-auto rounded-lg" />
              )}
              {msg.type === "media" && msg.fileType.startsWith("video") && (
                <video controls className="w-48 h-auto rounded-lg">
                  <source src={msg.file} type={msg.fileType} />
                  Your browser does not support the video tag.
                </video>
              )}
              <span className="text-xs block text-right text-gray-200">
                {msg.time} {msg.status === "sending" && " (Sending...)"}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-white flex items-center border-t">
        <input
          type="text"
          className="flex-1 border p-2 rounded-lg focus:outline-none"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <input
          type="file"
          accept="image/*, video/*"
          className="ml-2"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button className="ml-2 bg-green-500 text-white p-2 rounded-lg" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}
