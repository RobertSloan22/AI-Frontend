import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { TranscriptProvider } from './contexts/TranscriptContext';
import { EventProvider } from './contexts/EventContext';
import Transcript from './Transcript';

type SessionStatus = "DISCONNECTED" | "CONNECTING" | "CONNECTED";

//


export const ChatInterface: React.FC = () => {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("DISCONNECTED");
  const [userText, setUserText] = useState("");
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);

  const handleSendMessage = () => {
    if (!userText.trim()) return;

    const id = uuidv4().slice(0, 32);
    const message = {
      type: "conversation.item.create",
      item: {
        id,
        type: "message",
        role: "user",
        content: [{ type: "input_text", text: userText }],
      },
    };

    if (dcRef.current && dcRef.current.readyState === "open") {
      dcRef.current.send(JSON.stringify(message));
      setUserText("");
    } else {
      console.error("Failed to send message - no data channel available");
    }
  };

  const connectToServer = async () => {
    if (sessionStatus !== "DISCONNECTED") return;
    setSessionStatus("CONNECTING");

    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      const dc = pc.createDataChannel("chat");
      dcRef.current = dc;

      dc.addEventListener("open", () => {
        setSessionStatus("CONNECTED");
      });

      dc.addEventListener("close", () => {
        setSessionStatus("DISCONNECTED");
      });

      dc.addEventListener("message", (e: MessageEvent) => {
        const data = JSON.parse(e.data);
        console.log("Received message:", data);
      });

      setDataChannel(dc);
      
      // Create and set local description
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      pcRef.current = pc;
    } catch (err) {
      console.error("Error connecting to server:", err);
      setSessionStatus("DISCONNECTED");
    }
  };

  const disconnectFromServer = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    setDataChannel(null);
    setSessionStatus("DISCONNECTED");
  };

  const handleConnect = async () => {
    if (sessionStatus === "DISCONNECTED") {
      setSessionStatus("CONNECTING");
      try {
        await connectToServer();
      } catch (error) {
        console.error("Connection failed:", error);
        setSessionStatus("DISCONNECTED");
      }
    }
  };

  return (
    <TranscriptProvider>
      <EventProvider>
        <div className="flex flex-col h-[50vh] bg-gray-600">
          <div className="p-4 bg-white shadow-sm">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">Chat Interface</h1>
              <button
                onClick={handleConnect}
                className={`px-4 py-2 rounded-md ${
                  sessionStatus === "CONNECTED"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                } text-white`}
              >
                {sessionStatus === "CONNECTED" ? "Disconnect" : "Connect"}
              </button>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Status: {sessionStatus}
            </div>
          </div>

          <div className="flex-1 overflow-hidden p-4">
            <Transcript
              userText={userText}
              setUserText={setUserText}
              onSendMessage={handleSendMessage}
              canSend={sessionStatus === "CONNECTED"}
            />
          </div>
        </div>
      </EventProvider>
    </TranscriptProvider>
  );
}

