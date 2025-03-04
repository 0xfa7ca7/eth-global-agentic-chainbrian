"use client";

import React, { useState, useEffect, useRef } from "react";

interface ChatBoxProps {
  ngrokUrl: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ ngrokUrl }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isWaitingForResponse, setIsWaitingForResponse] =
    useState<boolean>(false);
  const ws = useRef<WebSocket | null>(null);

  const connectWebSocket = () => {
    const websocketURL = ngrokUrl || "ws://localhost:3005"; //
    ws.current = new WebSocket(websocketURL);

    ws.current.onopen = () => {
      setIsConnected(true);
      console.log("WebSocket connected");
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "response") {
          setMessages((prevMessages) => [
            ...prevMessages,
            `Brian: ${data.content}`,
          ]);
          setIsWaitingForResponse(false);
        } else if (data.type === "error") {
          setMessages((prevMessages) => [
            ...prevMessages,
            `Error: ${data.message}`,
          ]);
          setIsWaitingForResponse(false);
        } else {
          setMessages((prevMessages) => [
            ...prevMessages,
            `Received: ${event.data}`,
          ]);
        }
      } catch (e) {
        console.error("Failed to parse message", e);
        setMessages((prevMessages) => [
          ...prevMessages,
          `Received: ${event.data}`,
        ]);
        setIsWaitingForResponse(false);
      }
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      console.log("WebSocket disconnected. Reconnecting...");

      setTimeout(() => connectWebSocket(), 2000);
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      ws.current?.close();
    };
  }, [ngrokUrl]);

  const sendMessage = (command: string) => {
    if (ws.current && input) {
      const message = {
        command: command,
        message: input,
      };
      ws.current.send(JSON.stringify(message));
      setMessages((prevMessages) => [...prevMessages, `You: ${input}`]);
      setInput("");
      setIsWaitingForResponse(true);
    }
  };

  return (
    <div className="chat-box border border-gray-300 p-4 rounded">
      {!isConnected && (
        <div className="text-yellow-600 mb-4">Waiting for connection...</div>
      )}
      <div className="messages mb-4">
        {messages.map((message, index) => (
          <div key={index} className="message mb-2">
            {message}
          </div>
        ))}
        {isWaitingForResponse && (
          <div className="loading-dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </div>
        )}
      </div>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyUp={(e) => e.key === "Enter" && sendMessage("eliza")}
          className="flex-1 p-2 border border-gray-300 rounded"
          placeholder="Type a message..."
        />
        <button
          onClick={() => sendMessage("eliza")}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Send
        </button>
      </div>
      {/* <div className="flex gap-2">
        <button
          onClick={() => sendMessage("lit1")}
          className="flex-1 bg-green-500 text-white p-2 rounded"
        >
          Lit Action 1
        </button>
        <button
          onClick={() => sendMessage("lit2")}
          className="flex-1 bg-green-500 text-white p-2 rounded"
        >
          Lit Action 2
        </button>
        <button
          onClick={() => sendMessage("lit3")}
          className="flex-1 bg-green-500 text-white p-2 rounded"
        >
          Lit Action 3
        </button>
      </div> */}
    </div>
  );
};

export default ChatBox;
