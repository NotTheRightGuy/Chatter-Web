import "../styles/chatroom.css";
import { useEffect, useRef, useState } from "react";
import SendImage from "../assets/Right-arrow.png";

import OtherChats from "../components/fromChats";
import MyChats from "../components/toChats";

import { io } from "socket.io-client";

const socket = io("https://chatter-server-pd76.onrender.com/");
const initSocket = () => {
    socket.on("connect", () => {
        console.log("Connected to server with ID : ", socket.id);
        socket.emit("join", "Dummy User From PC");
    });
    socket.on("disconnect", () => {
        console.log("Disconnected from server");
    });
};

function ChatRoom() {
    const userName = "Dummy User From PC";
    const [bubbles, setBubbles] = useState([]);
    const chatRef = useRef(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        initSocket();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [bubbles]);

    const submitChatClick = () => {
        const chatText = chatRef.current.value;
        if (chatText === "") {
            return;
        }
        const newBubble = {
            message: chatText,
            sender: userName,
            time: new Date().toLocaleString("en-US", {
                hour: "numeric",
                minute: "numeric",
                hour12: true,
            }),
        };
        socket.emit("message", newBubble); //Emitting the new message to the server

        setBubbles([...bubbles, newBubble]); //Adding the new message to the bubbles array
        chatRef.current.value = ""; //Clearing the input field
    };

    socket.on("message", (message) => {
        //Receiving the new message from the server
        setBubbles([...bubbles, message]); // Adding the new message to the bubbles array
    });

    return (
        <div className="chatroom">
            <div className="chat-container">
                {bubbles.map((bubble, index) => {
                    if (bubble.sender == userName) {
                        return (
                            <MyChats
                                key={index}
                                message={bubble.message}
                                user={bubble.sender}
                                time={bubble.time}
                            />
                        );
                    } else {
                        return (
                            <OtherChats
                                key={index}
                                message={bubble.message}
                                user={bubble.sender}
                                time={bubble.time}
                            />
                        );
                    }
                })}
                <div ref={messagesEndRef}></div>
                <div style={{ height: "0.1rem" }}></div>
            </div>
            <div className="chat-input">
                <input
                    type="text"
                    ref={chatRef}
                    placeholder="Start Typing"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            console.log(bubbles);
                            submitChatClick();
                        }
                    }}
                />
                <button onClick={submitChatClick}>
                    <img src={SendImage} className="send-image" />
                </button>
            </div>
        </div>
    );
}
export default ChatRoom;
