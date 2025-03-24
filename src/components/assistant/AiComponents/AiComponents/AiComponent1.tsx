// src/pages/AppointmentsPage.tsx
import { useEffect, useRef, useState, useCallback } from "react";
import { RealtimeClient } from "@openai/realtime-api-beta";
import { AgentConfig } from "./AutomotiveAgent"; // Import the agent config
import { InvoiceServiceTool } from "../../services/InvoiceService";
import { CustomerDataTool } from "../../services/CustomerDataTool";
import { LogService } from "../../services/LogService";
import { ImageSearchResults } from "../../ImageSearchResults";
import { Imagemodal } from "../../Imagemodal";
import { Button } from "../../components/Button/Button";
import { toast } from "react-hot-toast";

export function AiComponent() {
  const clientRef = useRef<RealtimeClient | null>(null);
  const invoiceServiceToolRef = useRef<InvoiceServiceTool>(new InvoiceServiceTool());
  const customerDataToolRef = useRef<CustomerDataTool>(new CustomerDataTool());
  const [selectedDiagram, setSelectedDiagram] = useState<{
    url: string;
    title: string;
    thumbnail?: string;
    sourceUrl?: string;
    fileType: string;
  } | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // Initialize Realtime Client & AI Agent
  useEffect(() => {
    clientRef.current = new RealtimeClient({
      url: process.env.VITE_LOCAL_RELAY_SERVER_URL || "http://localhost:8081",
      apiKey: process.env.VITE_OPENAI_API_KEY
    });

    clientRef.current.on("error", (event) => console.error(event));
    clientRef.current.on("conversation.updated", (event) => {
      console.log("Conversation Updated:", event);
    });

    // Register the agent tools dynamically
    clientRef.current.updateSession({ instructions: AutomotiveAgent[0].instructions });

    AutomotiveAgent[0].tools.forEach((tool) => {
      clientRef.current?.addTool(tool, async (params) => {
        if (tool.name === "invoice_service") {
          return invoiceServiceToolRef.current._call(params);
        }
        if (tool.name === "customer_data") {
          return customerDataToolRef.current._call(params);
        }
        return { error: "Tool not implemented" };
      });
    });

    return () => {
      clientRef.current?.reset();
    };
  }, []);

  // Connect/disconnect logic
  const handleConnect = useCallback(async () => {
    try {
      if (isConnected) {
        setIsConnected(false);
        clientRef.current?.disconnect();
      } else {
        setIsConnected(true);
        await clientRef.current?.connect();
      }
    } catch (error) {
      console.error("Connection error:", error);
      toast.error("Failed to connect.");
    }
  }, [isConnected]);

  return (
    <div>
      <Button label={isConnected ? "Disconnect" : "Connect"} onClick={handleConnect} />
      <ImageSearchResults searchResults={searchResults} />
      <Imagemodal isOpen={false} onClose={() => {}} />
    </div>
  );
}

export default AiComponent;
