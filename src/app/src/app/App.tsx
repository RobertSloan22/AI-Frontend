import React, { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import axiosInstance from "./../../../utils/axiosConfig";
import { toast } from "react-hot-toast";
import { useCustomer } from "../../../context/CustomerContext";
import Transcript from "./components/Transcript";
import Events from "./components/Events";
import BottomToolbar from "./components/BottomToolbar";
import { SendCustomerInfoButton } from "./components/SendCustomerInfoButton";
import { allAgentSets, defaultAgentSetKey } from "./agentConfigs";
import { createRealtimeConnection } from "./lib/realtimeConnection";
import { useTranscript } from "./contexts/TranscriptContext";
import { useEvent } from "./contexts/EventContext";
import { useHandleServerEvent } from "./hooks/useHandleServerEvent";
import { AgentConfig, SessionStatus } from "./types";
import ElizaChat from "../../../components/ElizaChat";
import { ForumDTCAnalyzer } from "../../../components/dtc/ForumDTCAnalyzer";
import { useResearch } from '../../../context/ResearchContext';
import { DiagnosticProvider } from '../../../context/DiagnosticContext';


interface MemoryKV {
  customerData?: {
    id: string;
    firstName: string;
    lastName: string;
    vehicleVin: string;
    vehicleMake: string;
    email: string;
    phoneNumber: string;
    workphoneNumber?: string;
    address: string;
    city: string;
    zipCode: string;
    notes: string;
    preferredContact: string;
    vehicles: Vehicle[];
  };
  vehicleData?: Vehicle;
  customerFullName?: string;
  customerContact?: string;
  [key: string]: any;
}

interface Vehicle {
  id: string;
  year: string;
  make: string;
  model: string;
  trim?: string;
  vin?: string;
  engine?: string;
  transmission?: string;
  fuelType?: string;
  mileage?: number;
}

function App() {
  const { selectedCustomer, selectedVehicle } = useCustomer();
  const { transcriptItems, addTranscriptMessage, addTranscriptBreadcrumb } = useTranscript();
  const { logClientEvent, logServerEvent } = useEvent();
  const [agentSetKey, setAgentSetKey] = useState<string>(defaultAgentSetKey);
  const [selectedAgentConfigSet, setSelectedAgentConfigSet] = useState<AgentConfig[] | null>(null);
  const [selectedAgentName, setSelectedAgentName] = useState<string>("");
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("DISCONNECTED");
  const [isEventsPaneExpanded, setIsEventsPaneExpanded] = useState(true);
  const [userText, setUserText] = useState("");
  const [isPTTActive, setIsPTTActive] = useState(false);
  const [isPTTUserSpeaking, setIsPTTUserSpeaking] = useState(false);
  const [isAudioPlaybackEnabled, setIsAudioPlaybackEnabled] = useState(true);
  const [imageResults, setImageResults] = useState<{ title: string; url: string; thumbnail: string }[]>([]);
  const [memoryKv, setMemoryKv] = useState<MemoryKV>({});
  const hasSentCustomerInfo = useRef(false);
  const lastSentVehicleId = useRef<string | null>(null);
  const { researchData, problem, setProblem, isLoading } = useResearch();

  const [chatMode, setChatMode] = useState<"system" | "eliza" | "forum">("eliza");

  const sendClientEvent = (eventObj: any, eventNameSuffix = "") => {
    if (dcRef.current && dcRef.current.readyState === "open") {
      logClientEvent(eventObj, eventNameSuffix);
      dcRef.current.send(JSON.stringify(eventObj));
    } else {
      logClientEvent({ attemptedEvent: eventObj.type }, "error.data_channel_not_open");
    }
  };

  const handleServerEventRef = useHandleServerEvent({
    setSessionStatus,
    selectedAgentName,
    selectedAgentConfigSet,
    sendClientEvent,
    setSelectedAgentName
  });

  const handleToolCall = async (data: any) => {
    const { name: toolName, arguments: toolArgs, requestId } = data;
    if (toolName === "search_images") {
      try {
        const { query, num = 5 } = toolArgs || {};
        if (!query) {
          sendClientEvent({ type: "function_call_output", requestId, name: "search_images", output: { status: "error", message: "No 'query' parameter provided." } });
          return;
        }
        const response = await axiosInstance.post("/serper/images", { query, num });
        if (response.data?.images?.length > 0) {
          const results = response.data.images.map((img: any) => ({ title: img.title, url: img.link, thumbnail: img.thumbnail }));
          setImageResults(results);
          sendClientEvent({ type: "function_call_output", requestId, name: "search_images", output: { status: "success", message: `Found ${results.length} images`, results } });
        } else {
          setImageResults([]);
          sendClientEvent({ type: "function_call_output", requestId, name: "search_images", output: { status: "error", message: `No images found for "${query}".` } });
        }
      } catch (err: any) {
        setImageResults([]);
        sendClientEvent({ type: "function_call_output", requestId, name: "search_images", output: { status: "error", message: err.message || "Unknown error" } });
      }
    }
  };

  useEffect(() => {
    if (!allAgentSets[agentSetKey]) {
      setAgentSetKey(defaultAgentSetKey);
      return;
    }
    const agents = allAgentSets[agentSetKey];
    setSelectedAgentConfigSet(agents);
    if (agents && agents[0]) {
      setSelectedAgentName(agents[0].name);
    }
  }, [agentSetKey]);

  useEffect(() => {
    if (sessionStatus === "CONNECTED" && selectedAgentConfigSet && selectedAgentName) {
      const currentAgent = selectedAgentConfigSet.find((a) => a.name === selectedAgentName);
      addTranscriptBreadcrumb("Agent: " + selectedAgentName, currentAgent);
    }
  }, [sessionStatus, selectedAgentName, selectedAgentConfigSet]);

  useEffect(() => {
    if (audioElementRef.current) {
      if (isAudioPlaybackEnabled) {
        audioElementRef.current.play().catch(() => {});
      } else {
        audioElementRef.current.pause();
      }
    }
  }, [isAudioPlaybackEnabled]);

  async function fetchEphemeralKey(): Promise<string | null> {
    try {
      const response = await axiosInstance.get("/agent/session");
      const sessionData = response.data;
      if (!sessionData?.client_secret?.value) {
        setSessionStatus("DISCONNECTED");
        return null;
      }
      return sessionData.client_secret.value;
    } catch {
      setSessionStatus("DISCONNECTED");
      return null;
    }
  }

  async function connectToRealtime() {
    if (sessionStatus !== "DISCONNECTED") return;
    setSessionStatus("CONNECTING");
    try {
      const ephemeralKey = await fetchEphemeralKey();
      if (!ephemeralKey) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const { pc, dc } = await createRealtimeConnection(ephemeralKey, audioElementRef, true);
      pcRef.current = pc;
      dcRef.current = dc;
      stream.getAudioTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
      dc.addEventListener("open", () => {
        setSessionStatus("CONNECTED");
        updateSession(true);
      });
      dc.addEventListener("close", () => {
        setSessionStatus("DISCONNECTED");
      });
      dc.addEventListener("error", () => {
        setSessionStatus("DISCONNECTED");
      });
      dc.addEventListener("message", (e: MessageEvent) => {
        const data = JSON.parse(e.data);
        if (data?.type === "tool.call") {
          handleToolCall(data);
          return;
        }
        handleServerEventRef.current(data);
      });
      if (selectedCustomer) {
        const vehicles = (selectedCustomer.vehicles || []).map((v: any) => ({ id: v._id, year: v.year, make: v.make, model: v.model, trim: v.trim, vin: v.vin }));
        const initialMemory: MemoryKV = {
          customerData: {
            id: selectedCustomer._id,
            firstName: selectedCustomer.firstName,
            lastName: selectedCustomer.lastName,
            email: selectedCustomer.email || "",
            phoneNumber: selectedCustomer.phoneNumber || "",
            vehicleVin: vehicles[0]?.vin || "",
            vehicleMake: vehicles[0]?.make || "",
            address: "",
            city: "",
            zipCode: "",
            notes: "",
            preferredContact: "email",
            vehicles
          },
          vehicleData: vehicles[0] || undefined,
          customerFullName: selectedCustomer.firstName + " " + selectedCustomer.lastName,
          customerContact: selectedCustomer.phoneNumber || ""
        };
        if (researchData) {
          const researchContext = `\nResearch Context:
           Problem: ${problem || 'No specific problem identified'}
           Research Findings: ${JSON.stringify(researchData, null, 2)}`;
          initialMemory.researchContext = researchContext;
          initialMemory.research = {
            problem,
            findings: researchData
          };
        }
        setMemoryKv(initialMemory);
      }
    } catch {
      setSessionStatus("DISCONNECTED");
    }
  }

  function disconnectFromRealtime() {
    if (pcRef.current) {
      pcRef.current.getSenders().forEach((sender) => {
        if (sender.track) sender.track.stop();
      });
      pcRef.current.close();
      pcRef.current = null;
    }
    if (dcRef.current) {
      dcRef.current.close();
      dcRef.current = null;
    }
    setSessionStatus("DISCONNECTED");
    setIsPTTUserSpeaking(false);
  }

  function updateSession(shouldTriggerResponse: boolean = false) {
    if (!dcRef.current || dcRef.current.readyState !== "open") return;
    sendClientEvent({
      type: "session.update",
      session: {
        modalities: ["text", "audio"],
        instructions: "You are a helpful AI assistant.",
        voice: "coral",
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        input_audio_transcription: { model: "whisper-1" },
        turn_detection: { type: "server_vad", threshold: 0.5, prefix_padding_ms: 300, silence_duration_ms: 200, create_response: true }
      }
    });
    if (shouldTriggerResponse) {
      sendSimulatedUserMessage("hi");
    }
  }

  function sendSimulatedUserMessage(text: string) {
    const id = uuidv4().slice(0, 32);
    addTranscriptMessage(id, "user", text, true);
    sendClientEvent({ type: "conversation.item.create", item: { id, type: "message", role: "user", content: [{ type: "input_text", text }] } });
    sendClientEvent({ type: "response.create" });
  }

  function cancelAssistantSpeech() {
    const mostRecentAssistantMessage = [...transcriptItems].reverse().find((item) => item.role === "assistant");
    if (!mostRecentAssistantMessage) return;
    if (mostRecentAssistantMessage.status === "DONE") return;
    sendClientEvent({
      type: "conversation.item.truncate",
      item_id: mostRecentAssistantMessage.itemId,
      content_index: 0,
      audio_end_ms: Date.now() - mostRecentAssistantMessage.createdAtMs
    });
    sendClientEvent({ type: "response.cancel" });
  }

  function handleSendTextMessage() {
    if (!userText.trim()) return;
    cancelAssistantSpeech();
    sendClientEvent({ type: "conversation.item.create", item: { type: "message", role: "user", content: [{ type: "input_text", text: userText.trim() }] } });
    setUserText("");
    sendClientEvent({ type: "response.create" });
  }

  function handleTalkButtonDown() {
    if (sessionStatus !== "CONNECTED" || dcRef.current?.readyState !== "open") return;
    cancelAssistantSpeech();
    setIsPTTUserSpeaking(true);
    sendClientEvent({ type: "input_audio_buffer.clear" });
  }

  function handleTalkButtonUp() {
    if (!isPTTUserSpeaking) return;
    setIsPTTUserSpeaking(false);
    sendClientEvent({ type: "input_audio_buffer.commit" });
    sendClientEvent({ type: "response.create" });
  }

  function onToggleConnection() {
    if (sessionStatus === "CONNECTED" || sessionStatus === "CONNECTING") {
      disconnectFromRealtime();
    } else {
      if (!selectedAgentName) {
        toast.error("Please select an agent first");
        return;
      }
      connectToRealtime();
    }
  }

  function sendCustomerContext() {
    if (!selectedCustomer || !dcRef.current) return;
    const vehicles = (selectedCustomer.vehicles || []).map((v: any) => ({ id: v._id, year: v.year, make: v.make, model: v.model, trim: v.trim, vin: v.vin }));
    const context = `Customer Information:
- Name: ${selectedCustomer.firstName} ${selectedCustomer.lastName}
- Email: ${selectedCustomer.email || ""}
- Phone: ${selectedCustomer.phoneNumber || ""}
Vehicle Information:
- Year: ${vehicles[0]?.year || "N/A"}
- Make: ${vehicles[0]?.make || "N/A"}
- Model: ${vehicles[0]?.model || "N/A"}
- VIN: ${vehicles[0]?.vin || "N/A"}
- Trim: ${vehicles[0]?.trim || "N/A"}
Memory Context:
${JSON.stringify(memoryKv, null, 2)}`;
    sendClientEvent({ type: "conversation.item.create", item: { type: "message", role: "user", content: [{ type: "input_text", text: context }] } });
  }

  async function fetchImagesManually(query: string) {
    try {
      const response = await axiosInstance.post("/serper/images", { query, num: 5 });
      if (response.status === 200 && response.data.images?.length > 0) {
        setImageResults(response.data.images.map((img: any) => ({ title: img.title, url: img.link, thumbnail: img.thumbnail })));
      } else {
        setImageResults([]);
      }
    } catch {
      setImageResults([]);
    }
  }

  useEffect(() => {
    if (selectedCustomer && sessionStatus === "CONNECTED" && (!hasSentCustomerInfo.current || (selectedVehicle?._id && lastSentVehicleId.current !== selectedVehicle._id))) {
      async function sendDetailedCustomerData() {
        let invoiceHistoryText = "";
        try {
          const { data } = await axiosInstance.get(`/invoices/customer/${selectedCustomer._id}`);
          const vehicleInvoices = selectedVehicle ? data.filter((inv: any) => inv.vehicleId === selectedVehicle._id) : data;
          if (vehicleInvoices.length > 0) {
            invoiceHistoryText =
              `\nInvoice History for ${
                selectedVehicle ? `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model} (VIN: ${selectedVehicle.vin})` : "all vehicles"
              }:\n` +
              vehicleInvoices
                .map((inv: any) => {
                  const date = new Date(inv.invoiceDate).toLocaleDateString();
                  return `- ${date} | Total: $${inv.total?.toFixed(2) || "0.00"} | Services: ${inv.services?.join(", ") || "N/A"}`;
                })
                .join("\n");
          }
        } catch {}
        const customerContext = `=== COMPREHENSIVE CUSTOMER AND VEHICLE DATA ===
CUSTOMER INFORMATION:
Name: ${selectedCustomer.firstName} ${selectedCustomer.lastName}
Email: ${selectedCustomer.email || "N/A"}
Phone: ${selectedCustomer.phoneNumber || "N/A"}
Address: ${selectedCustomer.address || "N/A"}
VEHICLE INFORMATION:
Vehicle: ${
          selectedVehicle ? `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}` : "N/A"
        }
VIN: ${selectedVehicle?.vin || "N/A"}
Engine: ${selectedVehicle?.engine || "N/A"}
Transmission: ${selectedVehicle?.transmission || "N/A"}
Mileage: ${selectedVehicle?.mileage || "N/A"}
${invoiceHistoryText}`;
        sendClientEvent({ type: "conversation.item.create", item: { type: "message", role: "system", content: [{ type: "input_text", text: customerContext }] } });
        hasSentCustomerInfo.current = true;
        lastSentVehicleId.current = selectedVehicle?._id || null;
      }
      sendDetailedCustomerData();
    }
  }, [selectedCustomer, selectedVehicle, sessionStatus]);

  return (
    <div className="text-base flex flex-col h-[55vh] bg-gray-900 text-black relative overflow-hidden">
      {/* Top bar */}
      <div className="p-3 md:p-5 text-lg font-semibold flex flex-wrap md:flex-nowrap justify-between items-center bg-gray-800 bg-opacity-75 gap-3">
        <div className="flex flex-wrap items-center gap-2 md:gap-4 w-full md:w-auto">
          <SendCustomerInfoButton
            onClick={sendCustomerContext}
            disabled={!selectedCustomer || sessionStatus !== "CONNECTED"}
          />
          <div className="flex items-center gap-2 flex-wrap">
            <label className="text-white whitespace-nowrap">Scenario</label>
            <select
              value={agentSetKey}
              onChange={(e) => setAgentSetKey(e.target.value)}
              className="border border-gray-700 rounded-lg px-2 py-1 bg-gray-800 text-white text-sm md:text-base min-w-[120px]"
            >
              {Object.keys(allAgentSets).map((agentKey) => (
                <option key={agentKey} value={agentKey}>
                  {agentKey}
                </option>
              ))}
            </select>
          </div>
          {agentSetKey && (
            <div className="flex items-center gap-2 flex-wrap">
              <label className="text-white whitespace-nowrap">Agent</label>
              <select
                value={selectedAgentName}
                onChange={(e) => setSelectedAgentName(e.target.value)}
                className="border border-gray-700 rounded-lg px-2 py-1 bg-gray-800 text-white text-sm md:text-base min-w-[120px]"
              >
                {selectedAgentConfigSet?.map((agent) => (
                  <option key={agent.name} value={agent.name}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
  
        <div className="flex items-center w-full md:w-auto justify-end">
          <button
            onClick={() => {
              const nextMode = {
                system: "eliza",
                eliza: "forum",
                forum: "system"
              }[chatMode] as "system" | "eliza" | "forum";
              setChatMode(nextMode);
            }}
            className="px-3 md:px-4 py-1 md:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm md:text-base whitespace-nowrap"
          >
            {`Switch to ${
              {
                system: "Eliza Chat",
                eliza: "Forum DTC Analyzer",
                forum: "System Chat"
              }[chatMode]
            }`}
          </button>
        </div>
      </div>
  
      {/* Main area with all chats always mounted */}
      <div className="flex flex-1 gap-2 px-2 bg-black overflow-hidden relative min-h-0">
        {/* SYSTEM CHAT (Transcript + Events) */}
        <div
          style={{ display: chatMode === "system" ? "flex" : "none" }}
          className="w-full gap-2 min-h-0"
        >
          <Transcript
            userText={userText}
            setUserText={setUserText}
            onSendMessage={handleSendTextMessage}
            canSend={
              sessionStatus === "CONNECTED" && dcRef.current?.readyState === "open"
            }
          />
          <Events isExpanded={isEventsPaneExpanded} />
        </div>
  
        {/* ELIZA CHAT */}
        <div
          style={{ display: chatMode === "eliza" ? "block" : "none" }}
          className="w-full text-2xl overflow-auto"
        >
          <DiagnosticProvider>
            <ElizaChat />
          </DiagnosticProvider>
        </div>

        {/* FORUM DTC ANALYZER */}
        <div
          style={{ display: chatMode === "forum" ? "block" : "none" }}
          className="w-full text-2xl overflow-auto"
        >
          <ForumDTCAnalyzer forumUrl="" />
        </div>
      </div>
  
      {/* Show "Search Results" section only for system chat */}
      {chatMode === "system" && (
        <div className="p-4 bg-gray-800 text-white overflow-x-auto">
          <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
            <h3 className="text-lg font-semibold">Search Results</h3>
            <button
              className="px-3 py-1 md:px-4 md:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm md:text-base"
              onClick={() => fetchImagesManually("car engine diagnostics")}
            >
              Fetch Images (Manual)
            </button>
          </div>
          <div className="flex flex-wrap gap-4 overflow-x-auto">
            {imageResults.length > 0 ? (
              imageResults.map((img, index) => (
                <div key={index} className="w-36 md:w-48 flex-shrink-0">
                  <img
                    src={img.thumbnail}
                    alt={img.title}
                    className="w-full h-24 md:h-32 object-cover rounded-lg"
                  />
                  <p className="text-xs md:text-sm mt-1 truncate">{img.title}</p>
                </div>
              ))
            ) : (
              <p>No images found.</p>
            )}
          </div>
        </div>
      )}
  
      <BottomToolbar
        sessionStatus={sessionStatus}
        onToggleConnection={onToggleConnection}
        isPTTActive={isPTTActive}
        setIsPTTActive={setIsPTTActive}
        isPTTUserSpeaking={isPTTUserSpeaking}
        handleTalkButtonDown={handleTalkButtonDown}
        handleTalkButtonUp={handleTalkButtonUp}
        isEventsPaneExpanded={isEventsPaneExpanded}
        setIsEventsPaneExpanded={setIsEventsPaneExpanded}
        isAudioPlaybackEnabled={isAudioPlaybackEnabled}
        setIsAudioPlaybackEnabled={setIsAudioPlaybackEnabled}
      />
      <audio ref={audioElementRef} autoPlay style={{ display: "none" }} />
    </div>
  );
  
  
}

export { App };
export default App;
