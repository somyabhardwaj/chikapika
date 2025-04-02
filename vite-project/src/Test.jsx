import React, { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
export default function Test() {
    const socket = io("http://localhost:5000");
    const [file, setFile] = useState([]);
    useEffect(() => {
        socket.on("connect", () => {
            console.log("Connected to server");
        });
        socket.on("message", (message) => {
            setMessages((prev) =>
                prev.map((msg) => (msg.id === message.id ? { ...msg, status: "sent" } : msg))
            );
        });
        socket.on("test_file",(data)=>{
            console.log("test_response",data)
               console.log({data})
        })
    }, []);
    const handleSubmit = () => {
        console.log({ file })
        socket.emit("test_file",file)
    }
    return (
        <div>
            <input type="file" onChange={(e) => { setFile(e.target.value) }} />
            <button className='bg-red-' onClick={handleSubmit}>Submit</button>
        </div>
    )
}

