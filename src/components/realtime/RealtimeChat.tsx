import React, { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import axiosInstance from "../../utils/axiosConfig";
import { useCustomer } from "../../context/CustomerContext";
import { useResearch } from '../../context/ResearchContext';

interface Message {
  text: string;
  sender: "user" | "eliza";
}

interface ElizaResponse {
  text: string;
  attachments: any[];
  source: string;
  action?: string;
}

/**
 * ========================
 * ADDED: Parts Data Types
 * ========================
 */
interface ItemData {
  name: string;
  brand: string;
  price: string;
}

interface CategoryInfo {
  [category: string]: ItemData[];
}

/**
 * ForumDTCData, VehicleResearchData, and ComprehensiveData
 * as in your existing code
 */
interface ForumDTCData {
  diagnosticSteps?: Array<{
    step: string;
    details: string;
    tools?: string[];
    expectedReadings?: string;
  }>;
  possibleCauses?: Array<{
    cause: string;
    likelihood: string;
    explanation: string;
  }>;
  recommendedFixes?: Array<{
    fix: string;
    difficulty: string;
    estimatedCost: string;
    professionalOnly?: boolean;
    parts?: string[];
  }>;
  technicalNotes?: {
    commonIssues: string[];
    serviceIntervals?: string[];
    recalls?: string[];
    tsbs?: string[];
  };
}

interface VehicleResearchData {
  diagnosticSteps: Array<{
    step: string;
    details: string;
    tools?: string[];
    expectedReadings?: string;
  }>;
  possibleCauses: Array<{
    cause: string;
    likelihood: string;
    explanation: string;
  }>;
  recommendedFixes: Array<{
    fix: string;
    difficulty: string;
    estimatedCost: string;
    professionalOnly?: boolean;
    parts?: string[];
  }>;
  technicalNotes: {
    commonIssues: string[];
    serviceIntervals?: string[];
    recalls?: string[];
    tsbs?: string[];
  };
  problem?: string;
  detailedAnalysis?: any; // Replace with a more specific type if available
}

interface ComprehensiveData {
  customerInfo?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
  };
  vehicleInfo?: {
    id: string;
    vin: string;
    year: string;
    make: string;
    model: string;
    engine?: string;
    transmission?: string;
    mileage?: string;
  };
  invoices?: Array<{
    id: string;
    date: string;
    total: number;
    services: string[];
    status: string;
  }>;
  appointments?: Array<{
    id: string;
    date: string;
    service: string;
    status: string;
    notes?: string;
  }>;
  forumDTCData?: ForumDTCData;
  vehicleResearch?: VehicleResearchData;
  /**
   * ===========================
   * ADDED: partsData Field
   * ===========================
   */
  partsData?: CategoryInfo;
}

/**
 * Update the global Window interface if using Electron bridge
 */
declare global {
  interface Window {
    elizaAPI: {
      sendMessage: (
        agentId: string,
        message: { text: string; userId?: string; roomId?: string }
      ) => Promise<ElizaResponse[]>;
      checkServerStatus: () => Promise<string | false>;
    };
  }
}

const isElectron = window.elizaAPI !== undefined;
let serverUrl = "";

/**
 * Common API helper
 */
const api = {
  sendMessage: async (
    agentId: string,
    message: { text: string; userId?: string; roomId?: string }
  ): Promise<ElizaResponse[]> => {
    if (isElectron) {
      return window.elizaAPI.sendMessage(agentId, message);
    }
    const response = await axios.post<ElizaResponse[]>(
      `${serverUrl}/${agentId}/message`,
      {
        text: message.text,
        userId: message.userId || "user",
        userName: "User",
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  },
  checkServerStatus: async (): Promise<string | false> => {
    if (isElectron) {
      const status = await window.elizaAPI.checkServerStatus();
      return status ? "electron://local" : false;
    }
    const ports = [3000, 3001, 3002, 3500];
    for (const port of ports) {
      const url = `http://localhost:${port}`;
      try {
        await axios.get(url);
        serverUrl = url;
        return url;
      } catch (error) {
        console.log(`Failed to connect to ${url}:`, error);
        continue;
      }
    }
    return false;
  },
};

/**
 * ======================
 * ADDED: Parsing Helpers
 * ======================
 */
const parseItemsData = (data: ElizaResponse[]): CategoryInfo => {
  const categorizedData: CategoryInfo = {};
  data.forEach((response) => {
    // Looking for lines like "BRAKE Components:" in response.text
    const categoryMatch = response.text.match(/^(.*) Components:/);
    if (categoryMatch) {
      const category = categoryMatch[1].trim();
      categorizedData[category] = extractItemInfo(response.text);
    }
  });
  return categorizedData;
};

const extractItemInfo = (text: string): ItemData[] => {
  const lines = text.split("\n");
  const items: ItemData[] = [];
  let currentCategory = "";

  lines.forEach((line) => {
    const categoryMatch = line.match(/^(OEM Parts|Aftermarket Options):$/);
    if (categoryMatch) {
      currentCategory = categoryMatch[1];
      return;
    }

    const subcategoryMatch = line.match(/^(Front|Rear):$/);
    if (subcategoryMatch) {
      currentCategory += ` ${subcategoryMatch[1]}`;
      return;
    }

    const itemMatch = line.match(/^- (.*?):\s*\$(\d+\.\d+)/);
    if (itemMatch) {
      const [_, name, price] = itemMatch;
      const brand = name.split(" ")[0];
      items.push({
        name: name.trim(),
        brand: brand.trim(),
        price: `$${price.trim()}`,
      });
    }
  });

  return items;
};

/**
 * Chat component
 */
interface MessagePayload {
  text: string;
  userId?: string;
  roomId?: string;
}

export function RealtimeChat() {
  const { selectedCustomer, selectedVehicle } = useCustomer();
  const { researchData, detailedData, problem } = useResearch();

  // Chat messages
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello, I am ATLAS. How can I help you today?", sender: "eliza" },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [isServerAvailable, setIsServerAvailable] = useState(true);

  // Prevent re-sending customer data multiple times
  const hasSentCustomerInfo = useRef(false);
  // Track last vehicle ID to only send once per vehicle selection
  const lastSentVehicleId = useRef<string | null>(null);

  // Comprehensive data state (including newly added partsData)
  const [comprehensiveData, setComprehensiveData] = useState<ComprehensiveData>({});

  // Reset hasSentCustomerInfo when customer changes
  useEffect(() => {
    hasSentCustomerInfo.current = false;
    lastSentVehicleId.current = null;
  }, [selectedCustomer?._id]);

  // Check server status on mount and periodically
  useEffect(() => {
    const checkServer = async () => {
      try {
        const available = await api.checkServerStatus();
        setIsServerAvailable(!!available);
        if (!available) {
          setMessages((prev) => [
            ...prev,
            {
              text: "Unable to connect to server. Please make sure it's running.",
              sender: "eliza",
            },
          ]);
        }
      } catch (error) {
        console.error("Error checking server status:", error);
        setIsServerAvailable(false);
      }
    };

    checkServer();
    const interval = setInterval(checkServer, 30000);
    return () => clearInterval(interval);
  }, []);

  /**
   * When a customer is selected:
   *  - fetch their invoice history
   *  - send info to the agent
   * But only once unless vehicle changes
   */
  useEffect(() => {
    if (
      selectedCustomer &&
      isServerAvailable &&
      (!hasSentCustomerInfo.current ||
        (selectedVehicle?._id && lastSentVehicleId.current !== selectedVehicle._id))
    ) {
      const sendCustomerDataAndInvoices = async () => {
        let invoiceHistoryText = "";
        try {
          const { data } = await axiosInstance.get(
            `/invoices/customer/${selectedCustomer._id}`
          );

          // Filter invoices to the selected vehicle if provided
          const vehicleInvoices = selectedVehicle
            ? data.filter((invoice: any) => invoice.vehicleId === selectedVehicle._id)
            : data;

          if (vehicleInvoices && vehicleInvoices.length > 0) {
            invoiceHistoryText =
              "\nInvoice History for " +
              (selectedVehicle
                ? `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model} (VIN: ${selectedVehicle.vin})`
                : "all vehicles") +
              ":\n" +
              vehicleInvoices
                .map((invoice: any) => {
                  const date = new Date(invoice.invoiceDate).toLocaleDateString();
                  return `- ${date} | ${invoice.customerName} | ${invoice.vehicleYear} ${invoice.vehicleMake} ${invoice.vehicleModel} | Total: $${invoice.total?.toFixed(2) || "0.00"}`;
                })
                .join("\n");
          } else {
            invoiceHistoryText = selectedVehicle
              ? `\nNo invoices found for ${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model} (VIN: ${selectedVehicle.vin}).`
              : "\nNo invoices found for this customer.";
          }
        } catch (error) {
          console.error("Error fetching invoice history:", error);
          invoiceHistoryText = "\nError fetching invoice history.";
        }

        // If no vehicle is specifically selected, pick the first one if it exists
        const vehicle =
          selectedVehicle ||
          (selectedCustomer.vehicles && selectedCustomer.vehicles.length > 0
            ? selectedCustomer.vehicles[0]
            : null);

        const customerInfo = `Customer Information:
Name: ${selectedCustomer.firstName} ${selectedCustomer.lastName}
Vehicle: ${vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "N/A"}
VIN: ${vehicle ? vehicle.vin : "N/A"}
${invoiceHistoryText}`;

        sendMessage({
          text: customerInfo,
          userId: selectedCustomer._id,
          roomId: "room",
        });
        hasSentCustomerInfo.current = true;
        lastSentVehicleId.current = vehicle?._id || null;
      };

      sendCustomerDataAndInvoices();
    }
  }, [selectedCustomer, selectedVehicle, isServerAvailable]);

  /**
   * Main "sendMessage" mutation that calls our Eliza agent
   * Now it also parses item data if present
   */
  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async (payload: MessagePayload) => {
      // Use your actual agent ID below
      return api.sendMessage("9e32521d-d2f8-027b-a4fe-869fdadfa53e", payload);
    },
    onMutate: async (payload: MessagePayload) => {
      // Immediately add the user's message to the chat
      const userMessage: Message = { text: payload.text, sender: "user" };
      setMessages((prev) => [...prev, userMessage]);
      setInputMessage("");
    },
    onSuccess: (data: ElizaResponse[]) => {
      /**
       * ======================
       * ADDED: parseItemsData
       * ======================
       */
      const parsedItemsData = parseItemsData(data);
      if (Object.keys(parsedItemsData).length > 0) {
        // Only update partsData if something was found
        setComprehensiveData((prev) => ({ ...prev, partsData: parsedItemsData }));
      }

      // Then add each Eliza response to the chat
      data.forEach((response) => {
        const elizaMessage: Message = { text: response.text, sender: "eliza" };
        setMessages((prev) => [...prev, elizaMessage]);
      });

      setIsServerAvailable(true);
    },
    onError: (error) => {
      console.error("Error communicating with ELIZA:", error);
      const errorMessage: Message = {
        text: "Sorry, I'm having trouble connecting to the server.",
        sender: "eliza",
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsServerAvailable(false);
    },
  });

  /**
   * Handle user submission from the text box
   */
  const handleSubmit = () => {
    if (!inputMessage.trim() || isPending || !isServerAvailable) return;
    sendMessage({
      text: inputMessage.trim(),
      userId: selectedCustomer ? selectedCustomer._id : "user",
      roomId: "room",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  /**
   * Gathers all data (invoices, appointments, research, etc.)
   * and sends it to the agent
   */
  const fetchComprehensiveData = async () => {
    if (!selectedCustomer || !selectedVehicle) return;

    try {
      // Fetch invoices
      let invoices = [];
      try {
        const invoicesResponse = await axiosInstance.get(
          `/invoices/customer/${selectedCustomer._id}`
        );
        invoices = invoicesResponse.data;
      } catch (error) {
        console.warn("Error fetching invoices:", error);
      }

      // Fetch appointments
      let appointments = [];
      try {
        const appointmentsResponse = await axiosInstance.get(
          `/api/appointments/customer/${selectedCustomer._id}`
        );
        appointments = appointmentsResponse.data;
      } catch (error) {
        console.warn("Error fetching appointments:", error);
      }

      // Build comprehensiveData from existing details
      const newComprehensiveData: ComprehensiveData = {
        customerInfo: {
          id: selectedCustomer._id,
          firstName: selectedCustomer.firstName,
          lastName: selectedCustomer.lastName,
          email: selectedCustomer.email,
          phoneNumber: selectedCustomer.phoneNumber,
          address: selectedCustomer.address,
        },
        vehicleInfo: {
          id: selectedVehicle._id,
          vin: selectedVehicle.vin,
          year: selectedVehicle.year,
          make: selectedVehicle.make,
          model: selectedVehicle.model,
          engine: selectedVehicle.engine,
          transmission: selectedVehicle.transmission,
          mileage: selectedVehicle.mileage,
        },
        invoices: invoices.map((invoice: any) => ({
          id: invoice._id,
          date: invoice.invoiceDate,
          total: invoice.total,
          services: invoice.services || [],
          status: invoice.status,
        })),
        appointments: appointments.map((appointment: any) => ({
          id: appointment._id,
          date: appointment.appointmentDate,
          service: appointment.serviceType,
          status: appointment.status,
          notes: appointment.notes,
        })),
        // Directly use data from ResearchContext
        vehicleResearch: researchData
          ? {
              diagnosticSteps: researchData.diagnosticSteps,
              possibleCauses: researchData.possibleCauses,
              recommendedFixes: researchData.recommendedFixes,
              technicalNotes: researchData.technicalNotes,
              problem: problem,
              detailedAnalysis: detailedData,
            }
          : undefined,
      };

      setComprehensiveData(newComprehensiveData);

      // Format it and send it off to the agent
      const formattedData = formatComprehensiveDataForEliza(newComprehensiveData);

      setMessages((prev) => [
        ...prev,
        {
          text: "Gathering and analyzing comprehensive vehicle and customer data...",
          sender: "eliza",
        },
      ]);

      sendMessage({
        text: formattedData,
        userId: selectedCustomer._id,
        roomId: "room",
      });
    } catch (error) {
      console.error("Error fetching comprehensive data:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "I encountered issues gathering comprehensive data, but I'll work with what is available.",
          sender: "eliza",
        },
      ]);
    }
  };

  /**
   * Utility to format the gathered data into a text block for the agent
   */
  const formatComprehensiveDataForEliza = (data: ComprehensiveData): string => {
    let formattedText = "=== COMPREHENSIVE CUSTOMER AND VEHICLE DATA ===\n\n";

    // Customer Information
    if (data.customerInfo) {
      formattedText += "CUSTOMER INFORMATION:\n";
      formattedText += `Name: ${data.customerInfo.firstName} ${data.customerInfo.lastName}\n`;
      if (data.customerInfo.email)
        formattedText += `Email: ${data.customerInfo.email}\n`;
      if (data.customerInfo.phoneNumber)
        formattedText += `Phone: ${data.customerInfo.phoneNumber}\n`;
      if (data.customerInfo.address)
        formattedText += `Address: ${data.customerInfo.address}\n`;
      formattedText += "\n";
    }

    // Vehicle Information
    if (data.vehicleInfo) {
      formattedText += "VEHICLE INFORMATION:\n";
      formattedText += `Vehicle: ${data.vehicleInfo.year} ${data.vehicleInfo.make} ${data.vehicleInfo.model}\n`;
      formattedText += `VIN: ${data.vehicleInfo.vin}\n`;
      if (data.vehicleInfo.engine)
        formattedText += `Engine: ${data.vehicleInfo.engine}\n`;
      if (data.vehicleInfo.transmission)
        formattedText += `Transmission: ${data.vehicleInfo.transmission}\n`;
      if (data.vehicleInfo.mileage)
        formattedText += `Mileage: ${data.vehicleInfo.mileage}\n`;
      formattedText += "\n";
    }

    // Invoice History
    if (data.invoices && data.invoices.length > 0) {
      formattedText += "INVOICE HISTORY:\n";
      data.invoices.forEach((invoice) => {
        formattedText += `- Date: ${new Date(invoice.date).toLocaleDateString()}\n`;
        formattedText += `  Total: $${invoice.total.toFixed(2)}\n`;
        formattedText += `  Status: ${invoice.status}\n`;
        if (invoice.services.length > 0) {
          formattedText += `  Services: ${invoice.services.join(", ")}\n`;
        }
        formattedText += "\n";
      });
    }

    // Appointments
    if (data.appointments && data.appointments.length > 0) {
      formattedText += "APPOINTMENTS:\n";
      data.appointments.forEach((appointment) => {
        formattedText += `- Date: ${new Date(appointment.date).toLocaleDateString()}\n`;
        formattedText += `  Service: ${appointment.service}\n`;
        formattedText += `  Status: ${appointment.status}\n`;
        if (appointment.notes) {
          formattedText += `  Notes: ${appointment.notes}\n`;
        }
        formattedText += "\n";
      });
    }

    // Forum DTC Data
    if (data.forumDTCData) {
      formattedText += "FORUM DTC ANALYSIS:\n";
      if (data.forumDTCData.diagnosticSteps) {
        formattedText += "Diagnostic Steps:\n";
        data.forumDTCData.diagnosticSteps.forEach((step, index) => {
          formattedText += `${index + 1}. ${step.step}\n   Details: ${step.details}\n`;
        });
      }
      if (data.forumDTCData.possibleCauses) {
        formattedText += "\nPossible Causes:\n";
        data.forumDTCData.possibleCauses.forEach((cause, index) => {
          formattedText += `${index + 1}. ${cause.cause} (${cause.likelihood})\n   ${cause.explanation}\n`;
        });
      }
      formattedText += "\n";
    }

    // Vehicle Research Data
    if (data.vehicleResearch) {
      formattedText += "VEHICLE RESEARCH:\n";
      if (data.vehicleResearch.technicalNotes?.commonIssues) {
        formattedText += "Common Issues:\n";
        data.vehicleResearch.technicalNotes.commonIssues.forEach(
          (issue, index) => {
            formattedText += `${index + 1}. ${issue}\n`;
          }
        );
      }
      if (data.vehicleResearch.technicalNotes?.recalls) {
        formattedText += "\nRecalls:\n";
        data.vehicleResearch.technicalNotes.recalls.forEach((recall, index) => {
          formattedText += `${index + 1}. ${recall}\n`;
        });
      }
      formattedText += "\n";
    }

    return formattedText;
  };

  /**
   * Button click to gather data and send it
   */
  const handleSendComprehensiveData = () => {
    fetchComprehensiveData();
  };

  return (
    <div className="relative h-screen w-full p-4 overflow-auto bg-gray-900 bg-opacity-80">
      {/* Chat Card */}
      <Card className="max-w-4xl mx-auto flex flex-col h-[80vh] bg-transparent border-none">
        {!isServerAvailable && (
          <div className="p-2 bg-red-500/80 text-white text-center text-xl rounded-t-lg">
            Server connection lost. Please check if HDautoAgent is running.
          </div>
        )}

        {/* Header */}
        <div className="p-4 bg-gray-800 bg-opacity-50 rounded-t-lg border-l-4 border-blue-500">
          <h2 className="text-2xl font-semibold text-blue-400">
            Chat with HD-AUTO-AGENT
          </h2>
          {selectedCustomer && selectedVehicle && (
            <button
              onClick={handleSendComprehensiveData}
              className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Send All Vehicle & Customer Data to Agent
            </button>
          )}
        </div>

        <Separator className="bg-gray-700" />

        {/* Chat messages + any special data display */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900 bg-opacity-50">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === "user"
                    ? "bg-blue-600 text-white border-l-4 border-blue-400"
                    : "bg-gray-800 text-gray-100 border-l-4 border-green-500"
                } text-xl`}
              >
                {message.text}
              </div>
            </div>
          ))}

          {/* ============================
              ADDED: Parts Data Display
          ============================ */}
          {comprehensiveData.partsData && (
            <div className="items-data mt-4">
              <h3 className="text-xl font-bold mb-2">Component Categories</h3>
              {Object.entries(comprehensiveData.partsData).map(
                ([category, items]) => (
                  <div className="items-section mb-4" key={category}>
                    <h4 className="text-lg font-semibold">
                      {category} Components
                    </h4>
                    <ul className="list-disc list-inside ml-5">
                      {items.map((item, idx) => (
                        <li key={idx} className="mb-2">
                          <strong>{item.brand}</strong> - {item.name}: {item.price}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <Separator className="bg-gray-700" />

        {/* Message Input */}
        <div className="p-4 flex gap-2 bg-gray-800 bg-opacity-50 rounded-b-lg">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isServerAvailable ? "Type your message..." : "Server unavailable..."
            }
            className="flex-1 bg-gray-900 border-gray-700 text-white text-xl placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            disabled={isPending || !isServerAvailable}
          />
          <Button
            onClick={handleSubmit}
            disabled={isPending || !isServerAvailable}
            className={`px-4 py-2 text-white ${
              isPending || !isServerAvailable
                ? "bg-gray-600"
                : "bg-blue-600 hover:bg-blue-700"
            } transition-colors text-xl`}
          >
            {isPending ? "Sending..." : "Send"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default RealtimeChat;
