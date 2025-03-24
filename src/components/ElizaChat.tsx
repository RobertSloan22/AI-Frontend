import React from 'react';
import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import axiosInstance from "../utils/axiosConfig";
import { useCustomer } from "../context/CustomerContext";
import { useResearch } from "../context/ResearchContext";
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { useDiagnostic, DiagnosticInfo } from '../context/DiagnosticContext';

interface Message {
  text: string;
  sender: "user" | "eliza";
}

interface ElizaResponse {
  text: string;
  attachments: any[];
  source: string;
  action?: string;
  pdfBuffer?: Buffer | null;
}

interface ItemData {
  name: string;
  brand: string;
  price: string;
}

interface CategoryInfo {
  [category: string]: ItemData[];
}

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

interface EnhancedPart {
  name: string;
  brand: string;
  price: string;
}

interface VehicleResearchData {
  diagnosticSteps: Array<{
    step: string;
    details: string;
    tools?: string[];
    expectedReadings?: string;
    componentsTested?: string[];
    testingProcedure?: string;
    notes?: string;
    estimatedTime?: string;
    skillLevel?: string;
  }>;
  possibleCauses: Array<{
    cause: string;
    likelihood: string;
    explanation: string;
  }>;
  recommendedFixes: Array<{
    fix: string;
    difficulty: "Easy" | "Moderate" | "Complex";
    estimatedCost: string;
    professionalOnly: boolean;
    parts: EnhancedPart[];
    laborTime?: string;
    specialTools?: string[];
  }>;
  technicalNotes: {
    commonIssues: string[];
    serviceIntervals?: string[];
    recalls?: string[];
    tsbs?: string[];
  };
  problem?: string;
  detailedAnalysis?: Record<string, any>;
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
  partsData?: CategoryInfo;
}

interface MessagePayload {
  text: string;
  userId?: string;
  roomId?: string;
}

interface TechnicalNotes {
  commonIssues: string[];
  recalls: string[];
  serviceIntervals: string[];
  tsbs: string[];
}

declare global {
  interface Window {
    elizaAPI: {
      sendMessage: (agentId: string, message: any) => Promise<any>;
      checkServerStatus: () => Promise<boolean>;
    }
  }
}

const isElectron = typeof window !== "undefined" && window.elizaAPI !== undefined;
let serverUrl = "";

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
      }
    );
    return response.data;
  },
  checkServerStatus: async (): Promise<string | false> => {
    if (isElectron) {
      const status = await window.elizaAPI.checkServerStatus();
      return status ? "electron://local" : false;
    }
    const ports = [3000, 3001, 3002, 3500, 3005];
    for (const port of ports) {
      const url = `http://localhost:${port}`;
      try {
        await axios.get(url);
        serverUrl = url;
        return url;
      } catch (error) {
        continue;
      }
    }
    return false;
  },
};

function parseItemsData(data: ElizaResponse[]): CategoryInfo {
  const categorizedData: CategoryInfo = {};
  data.forEach((response) => {
    const categoryMatch = response.text.match(/^(.*) Components:/);
    if (categoryMatch) {
      const category = categoryMatch[1].trim();
      categorizedData[category] = extractItemInfo(response.text);
    }
  });
  return categorizedData;
}

function extractItemInfo(text: string): ItemData[] {
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
      const name = itemMatch[1].trim();
      const price = `$${itemMatch[2].trim()}`;
      const brand = name.split(" ")[0];
      items.push({ name, brand, price });
    }
  });
  return items;
}

// Add formatting helper functions
const isStructuredContent = (content: string): boolean => {
  // Check for numbered sections (1., 2., etc) with content
  const numberedSections = content.match(/\d+\.\s+[^\d]+((?!\d+\.).)*(\n|$)/gs);
  return numberedSections ? numberedSections.length > 1 : false;
};

const formatStructuredResponse = (content: string): JSX.Element => {
  // First, normalize line breaks and split into sections
  const normalizedContent = content.replace(/\r\n/g, '\n');
  
  // Split into sections based on numbered points (1., 2., etc)
  const sections = normalizedContent.match(/\d+\.\s+[^\d]+((?!\d+\.).)*(\n|$)/gs) || [];
  
  return (
    <div className="space-y-4">
      {sections.map((section, index) => {
        // Extract the number and content
        const [, num, text] = section.match(/(\d+)\.\s+(.+)/s) || [];
        
        // Split content into paragraphs
        const paragraphs = text.split('\n').filter(p => p.trim());
        
        return (
          <div key={index} className="mb-4 bg-gray-800 bg-opacity-40 rounded-lg p-4 border-l-4 border-blue-500 hover:border-blue-400 transition-colors">
            <div className="flex gap-3">
              <span className="text-blue-400 font-bold min-w-[24px]">
                {num}.
              </span>
              <div className="flex-1 text-gray-100">
                {paragraphs.map((paragraph, pIndex) => (
                  <p key={pIndex} className={pIndex > 0 ? 'mt-2' : ''}>
                    {paragraph.trim()}
                  </p>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const isCustomerInfo = (content: string): boolean => {
  return content.startsWith('Customer Information:');
};

const formatCustomerInfo = (content: string): JSX.Element => {
  // Parse different sections with proper typing
  interface Sections {
    customerInfo: Record<string, string>;
    vehicleInfo: Record<string, string>;
    invoices: string[];
    vehicleResearch: {
      commonIssues: string[];
      recalls: string[];
    };
  }

  const sections: Sections = {
    customerInfo: {},
    vehicleInfo: {},
    invoices: [],
    vehicleResearch: { commonIssues: [], recalls: [] }
  };
  
  type SectionType = 'customer' | 'vehicle' | 'invoices' | 'research' | 'research.commonIssues' | 'research.recalls' | '';
  let currentMainSection: SectionType = '';
  const lines = content.split('\n');
  
  lines.forEach(line => {
    line = line.trim();
    if (!line) return;
    
    // Handle main section headers
    if (line.includes('=== COMPREHENSIVE CUSTOMER AND VEHICLE DATA ===')) {
      return;
    } else if (line.startsWith('CUSTOMER INFORMATION:')) {
      currentMainSection = 'customer';
      return;
    } else if (line.startsWith('VEHICLE INFORMATION:')) {
      currentMainSection = 'vehicle';
      return;
    } else if (line.startsWith('INVOICE HISTORY:')) {
      currentMainSection = 'invoices';
      return;
    } else if (line.startsWith('VEHICLE RESEARCH:')) {
      currentMainSection = 'research';
      return;
    }
    
    // Parse section content
    if (currentMainSection === 'customer' || currentMainSection === 'vehicle') {
      const [key, ...valueParts] = line.split(':');
      if (valueParts.length > 0) {
        const value = valueParts.join(':').trim();
        if (currentMainSection === 'customer') {
          sections.customerInfo[key.trim()] = value;
        } else {
          sections.vehicleInfo[key.trim()] = value;
        }
      }
    } else if (currentMainSection === 'invoices' && line.startsWith('-')) {
      sections.invoices.push(line.substring(1).trim());
    } else if (currentMainSection === 'research') {
      if (line.startsWith('Common Issues:')) {
        currentMainSection = 'research.commonIssues';
      } else if (line.startsWith('Recalls:')) {
        currentMainSection = 'research.recalls';
      }
    } else if (currentMainSection === 'research.commonIssues' && line.match(/^\d+\./)) {
      sections.vehicleResearch.commonIssues.push(line);
    } else if (currentMainSection === 'research.recalls' && !line.startsWith('Recalls:')) {
      sections.vehicleResearch.recalls.push(line);
    }
  });

  return (
    <div className="space-y-4 w-full">
      {/* Customer Information Section */}
      <div className="bg-gray-800 bg-opacity-40 rounded-lg p-4 border-l-4 border-blue-500 hover:border-blue-400 transition-colors">
        <h3 className="text-blue-400 font-bold text-lg mb-3">Customer Information</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(sections.customerInfo).map(([key, value]: [string, string], index: number) => (
            <div key={index} className="flex flex-col">
              <span className="text-gray-400 text-sm">{key}</span>
              <span className="text-white font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Vehicle Information Section */}
      {Object.keys(sections.vehicleInfo).length > 0 && (
        <div className="bg-gray-800 bg-opacity-40 rounded-lg p-4 border-l-4 border-purple-500 hover:border-purple-400 transition-colors">
          <h3 className="text-purple-400 font-bold text-lg mb-3">Vehicle Information</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(sections.vehicleInfo).map(([key, value]: [string, string], index: number) => (
              <div key={index} className="flex flex-col">
                <span className="text-gray-400 text-sm">{key}</span>
                <span className="text-white font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Invoice History Section */}
      {sections.invoices.length > 0 && (
        <div className="bg-gray-800 bg-opacity-40 rounded-lg p-4 border-l-4 border-green-500 hover:border-green-400 transition-colors">
          <h3 className="text-green-400 font-bold text-lg mb-3">Invoice History</h3>
          <div className="space-y-2">
            {sections.invoices.map((invoice: string, index: number) => {
              const [date, total, status] = invoice.split('Total:').map((s: string) => s.trim());
              return (
                <div key={index} 
                  className="flex flex-col p-2 bg-gray-700 bg-opacity-40 rounded-md hover:bg-opacity-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-300">{date}</span>
                    <span className="text-green-400 font-medium">Total: {total}</span>
                  </div>
                  {status && (
                    <div className="text-gray-300 text-sm mt-1">
                      <span>Status: {status}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Vehicle Research Section */}
      {(sections.vehicleResearch.commonIssues.length > 0 || sections.vehicleResearch.recalls.length > 0) && (
        <div className="bg-gray-800 bg-opacity-40 rounded-lg p-4 border-l-4 border-yellow-500 hover:border-yellow-400 transition-colors">
          <h3 className="text-yellow-400 font-bold text-lg mb-3">Vehicle Research</h3>
          
          {sections.vehicleResearch.commonIssues.length > 0 && (
            <div className="mb-4">
              <h4 className="text-yellow-300 font-medium mb-2">Common Issues</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-200">
                {sections.vehicleResearch.commonIssues.map((issue: string, index: number) => (
                  <li key={index} className="ml-4">{issue}</li>
                ))}
              </ul>
            </div>
          )}
          
          {sections.vehicleResearch.recalls.length > 0 && (
            <div>
              <h4 className="text-yellow-300 font-medium mb-2">Recalls</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-200">
                {sections.vehicleResearch.recalls.map((recall: string, index: number) => (
                  <li key={index} className="ml-4">{recall}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export function ElizaChat() {
  const { selectedCustomer, selectedVehicle } = useCustomer();
  const { researchData, detailedData, problem } = useResearch();
  const { updateDiagnosticInfo } = useDiagnostic();

  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello, I am ATLAS. How can I help you today?", sender: "eliza" },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isServerAvailable, setIsServerAvailable] = useState(true);
  const [comprehensiveData, setComprehensiveData] = useState<ComprehensiveData>(
    {}
  );
  const [currentPdf, setCurrentPdf] = useState<string | null>(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const hasSentCustomerInfo = useRef(false);
  const lastSentVehicleId = useRef<string | null>(null);

  useEffect(() => {
    hasSentCustomerInfo.current = false;
    lastSentVehicleId.current = null;
  }, [selectedCustomer?._id]);

  useEffect(() => {
    async function checkServer() {
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
        setIsServerAvailable(false);
      }
    }
    checkServer();
  }, []);

  useEffect(() => {
    if (
      selectedCustomer &&
      isServerAvailable &&
      (!hasSentCustomerInfo.current ||
        (selectedVehicle?._id && lastSentVehicleId.current !== selectedVehicle._id))
    ) {
      async function sendCustomerDataAndInvoices() {
        let invoiceHistoryText = "";
        try {
          const { data } = await axiosInstance.get(
            `/invoices/customer/${selectedCustomer._id}`
          );
          const vehicleInvoices = selectedVehicle
            ? data.filter(
                (invoice: any) => invoice.vehicleId === selectedVehicle._id
              )
            : data;
          if (vehicleInvoices?.length > 0) {
            invoiceHistoryText =
              "\nInvoice History:\n" +
              vehicleInvoices
                .map((invoice: any) => {
                  const date = new Date(invoice.invoiceDate).toLocaleDateString();
                  return `- ${date} | ${invoice.customerName} | ${invoice.vehicleYear} ${invoice.vehicleMake} ${invoice.vehicleModel} | Total: $${
                    invoice.total?.toFixed(2) || "0.00"
                  }`;
                })
                .join("\n");
          } else {
            invoiceHistoryText =
              "\nNo invoices found for this customer/vehicle.";
          }
        } catch (error) {
          invoiceHistoryText = "\nError fetching invoice history.";
        }
        const vehicle =
          selectedVehicle ||
          (selectedCustomer.vehicles && selectedCustomer.vehicles[0]) ||
          null;
        const customerInfo = `Customer Information:
Name: ${selectedCustomer.firstName} ${selectedCustomer.lastName}
Vehicle: ${
          vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : "N/A"
        }
VIN: ${vehicle ? vehicle.vin : "N/A"}
${invoiceHistoryText}`;
        sendMessage({
          text: customerInfo,
          userId: selectedCustomer._id,
          roomId: "room",
        });
        hasSentCustomerInfo.current = true;
        lastSentVehicleId.current = vehicle?._id || null;
      }
      sendCustomerDataAndInvoices();
    }
  }, [selectedCustomer, selectedVehicle, isServerAvailable]);

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async (payload: MessagePayload) => {
      return api.sendMessage("9e32521d-d2f8-027b-a4fe-869fdadfa53e", payload);
    },
    onMutate: async (payload: MessagePayload) => {
      setMessages((prev) => [...prev, { text: payload.text, sender: "user" }]);
      setInputMessage("");
    },
    onSuccess: (data: ElizaResponse[]) => {
      const parsedItemsData = parseItemsData(data);
      if (Object.keys(parsedItemsData).length > 0) {
        setComprehensiveData((prev) => ({
          ...prev,
          partsData: parsedItemsData,
        }));
        // Update diagnostic context with parts data
        updateDiagnosticInfo({ partsData: parsedItemsData });
      }

      data.forEach((response) => {
        setMessages((prev) => [
          ...prev,
          { text: response.text, sender: "eliza" },
        ]);

        // Extract diagnostic information from the response text
        if (response.text.includes("Diagnostic Steps:") || 
            response.text.includes("Possible Causes:") ||
            response.text.includes("Recommended Fixes:") ||
            response.text.includes("Technical Notes:")) {
          
          // Initialize diagnostic info object with proper types
          const diagnosticInfo: DiagnosticInfo = {};

          // Extract Diagnostic Steps
          if (response.text.includes("Diagnostic Steps:")) {
            const stepsMatch = response.text.match(/Diagnostic Steps:([\s\S]*?)(?=\n\n|$)/);
            if (stepsMatch) {
              diagnosticInfo.diagnosticSteps = stepsMatch[1]
                .split('\n')
                .filter(line => line.trim())
                .map(step => {
                  const [stepText, details] = step.split(':').map(s => s.trim());
                  return {
                    step: stepText || '',
                    details: details || ''
                  };
                });
            }
          }

          // Extract Possible Causes
          if (response.text.includes("Possible Causes:")) {
            const causesMatch = response.text.match(/Possible Causes:([\s\S]*?)(?=\n\n|$)/);
            if (causesMatch) {
              diagnosticInfo.possibleCauses = causesMatch[1]
                .split('\n')
                .filter(line => line.trim())
                .map(cause => {
                  const [causeText, likelihood, explanation] = cause.split('|').map(s => s.trim());
                  return {
                    cause: causeText || '',
                    likelihood: likelihood || 'Unknown',
                    explanation: explanation || ''
                  };
                });
            }
          }

          // Extract Recommended Fixes
          if (response.text.includes("Recommended Fixes:")) {
            const fixesMatch = response.text.match(/Recommended Fixes:([\s\S]*?)(?=\n\n|$)/);
            if (fixesMatch) {
              diagnosticInfo.recommendedFixes = fixesMatch[1]
                .split('\n')
                .filter(line => line.trim())
                .map(fix => {
                  const [fixText, difficultyRaw, cost] = fix.split('|').map(s => s.trim());
                  const difficulty = difficultyRaw === 'Easy' ? 'Easy' :
                                   difficultyRaw === 'Complex' ? 'Complex' : 'Moderate';
                  return {
                    fix: fixText || '',
                    difficulty,
                    estimatedCost: cost || '$0.00'
                  };
                });
            }
          }

          // Extract Technical Notes
          if (response.text.includes("Technical Notes:")) {
            const technicalNotes: TechnicalNotes = {
              commonIssues: [],
              recalls: [],
              serviceIntervals: [],
              tsbs: []
            };

            // Extract Common Issues
            const commonIssuesMatch = response.text.match(/Common Issues:([\s\S]*?)(?=\n\n|$)/);
            if (commonIssuesMatch) {
              technicalNotes.commonIssues = commonIssuesMatch[1]
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
            }

            // Extract Recalls
            const recallsMatch = response.text.match(/Recalls:([\s\S]*?)(?=\n\n|$)/);
            if (recallsMatch) {
              technicalNotes.recalls = recallsMatch[1]
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
            }

            // Extract Service Intervals
            const intervalsMatch = response.text.match(/Service Intervals:([\s\S]*?)(?=\n\n|$)/);
            if (intervalsMatch) {
              technicalNotes.serviceIntervals = intervalsMatch[1]
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
            }

            // Extract TSBs
            const tsbsMatch = response.text.match(/Technical Service Bulletins:([\s\S]*?)(?=\n\n|$)/);
            if (tsbsMatch) {
              technicalNotes.tsbs = tsbsMatch[1]
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
            }

            if (technicalNotes.commonIssues.length > 0 || 
                technicalNotes.recalls.length > 0 || 
                technicalNotes.serviceIntervals.length > 0 || 
                technicalNotes.tsbs.length > 0) {
              diagnosticInfo.technicalNotes = technicalNotes;
            }
          }

          // Update diagnostic context with the extracted information
          if (Object.keys(diagnosticInfo).length > 0) {
            updateDiagnosticInfo(diagnosticInfo);
          }
        }

        // Handle PDF buffer if present
        if (response.pdfBuffer) {
          try {
            const blob = new Blob([response.pdfBuffer], { type: 'application/pdf' });
            const pdfUrl = URL.createObjectURL(blob);
            setCurrentPdf(pdfUrl);
            setShowPdfViewer(true);
          } catch (error) {
            console.error('Error processing PDF:', error);
          }
        }
      });
      setIsServerAvailable(true);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, I'm having trouble connecting to the server.",
          sender: "eliza",
        },
      ]);
      setIsServerAvailable(false);
    },
  });

  function handleSubmit() {
    if (!inputMessage.trim() || isPending || !isServerAvailable) return;
    sendMessage({
      text: inputMessage.trim(),
      userId: selectedCustomer ? selectedCustomer._id : "user",
      roomId: "room",
    });
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  async function fetchComprehensiveData() {
    if (!selectedCustomer || !selectedVehicle) return;
    try {
      let invoices = [];
      let appointments = [];
      try {
        const invoicesResponse = await axiosInstance.get(
          `/invoices/customer/${selectedCustomer._id}`
        );
        invoices = invoicesResponse.data;
      } catch {}
      try {
        const appointmentsResponse = await axiosInstance.get(
          `/appointments/customer/${selectedCustomer._id}`
        );
        appointments = appointmentsResponse.data;
      } catch {}
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
        vehicleResearch: researchData
          ? {
              diagnosticSteps: researchData.diagnosticSteps,
              possibleCauses: researchData.possibleCauses,
              recommendedFixes: researchData.recommendedFixes,
              technicalNotes: researchData.technicalNotes,
              problem,
              detailedAnalysis: detailedData,
            }
          : undefined,
      };
      setComprehensiveData(newComprehensiveData);
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
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          text: "I encountered issues gathering comprehensive data, but I'll work with what is available.",
          sender: "eliza",
        },
      ]);
    }
  }

  function formatComprehensiveDataForEliza(data: ComprehensiveData): string {
    let s = "=== COMPREHENSIVE CUSTOMER AND VEHICLE DATA ===\n\n";
    if (data.customerInfo) {
      s += "CUSTOMER INFORMATION:\n";
      s += `Name: ${data.customerInfo.firstName} ${data.customerInfo.lastName}\n`;
      if (data.customerInfo.email)
        s += `Email: ${data.customerInfo.email}\n`;
      if (data.customerInfo.phoneNumber)
        s += `Phone: ${data.customerInfo.phoneNumber}\n`;
      if (data.customerInfo.address)
        s += `Address: ${data.customerInfo.address}\n`;
      s += "\n";
    }
    if (data.vehicleInfo) {
      s += "VEHICLE INFORMATION:\n";
      s += `Vehicle: ${data.vehicleInfo.year} ${data.vehicleInfo.make} ${data.vehicleInfo.model}\n`;
      s += `VIN: ${data.vehicleInfo.vin}\n`;
      if (data.vehicleInfo.engine)
        s += `Engine: ${data.vehicleInfo.engine}\n`;
      if (data.vehicleInfo.transmission)
        s += `Transmission: ${data.vehicleInfo.transmission}\n`;
      if (data.vehicleInfo.mileage)
        s += `Mileage: ${data.vehicleInfo.mileage}\n`;
      s += "\n";
    }
    if (data.invoices && data.invoices.length > 0) {
      s += "INVOICE HISTORY:\n";
      data.invoices.forEach((invoice) => {
        s += `- Date: ${new Date(invoice.date).toLocaleDateString()}\n`;
        s += `  Total: $${invoice.total.toFixed(2)}\n`;
        s += `  Status: ${invoice.status}\n`;
        if (invoice.services.length > 0)
          s += `  Services: ${invoice.services.join(", ")}\n`;
        s += "\n";
      });
    }
    if (data.appointments && data.appointments.length > 0) {
      s += "APPOINTMENTS:\n";
      data.appointments.forEach((appointment) => {
        s += `- Date: ${new Date(appointment.date).toLocaleDateString()}\n`;
        s += `  Service: ${appointment.service}\n`;
        s += `  Status: ${appointment.status}\n`;
        if (appointment.notes) s += `  Notes: ${appointment.notes}\n`;
        s += "\n";
      });
    }
    if (data.vehicleResearch) {
      s += "VEHICLE RESEARCH:\n";
      if (data.vehicleResearch.technicalNotes?.commonIssues) {
        s += "Common Issues:\n";
        data.vehicleResearch.technicalNotes.commonIssues.forEach(
          (issue, index) => {
            s += `${index + 1}. ${issue}\n`;
          }
        );
      }
      if (data.vehicleResearch.technicalNotes?.recalls) {
        s += "\nRecalls:\n";
        data.vehicleResearch.technicalNotes.recalls.forEach((recall, index) => {
          s += `${index + 1}. ${recall}\n`;
        });
      }
      s += "\n";
    }
    return s;
  }

  function handleSendComprehensiveData() {
    fetchComprehensiveData();
  }

  async function handleGeneratePDF() {
    try {
      const response = await axiosInstance.post('/generate-pdf', {
        text: "Please generate a PDF for the two terminal canister",
        vehicleInfo: selectedVehicle,
        type: 'parts-catalog'
      });

      if (response.data && response.data.pdfBuffer) {
        console.log('PDF buffer received');
        const blob = new Blob([response.data.pdfBuffer], { type: 'application/pdf' });
        const pdfUrl = URL.createObjectURL(blob);
        setCurrentPdf(pdfUrl);
        setShowPdfViewer(true);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  }

  return (
    <div className="flex h-full w-full">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-900 bg-opacity-75 rounded-lg shadow-lg overflow-hidden">
        <Card className="flex flex-col h-full w-full bg-transparent border-none">
          {!isServerAvailable && (
            <div className="p-2 bg-red-600 text-white text-center">
              Server connection lost. Please check if your Agent is running.
            </div>
          )}

          {/* Top Header */}
          <div className="p-4 bg-gray-800 text-white flex flex-col gap-2 shrink-0">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl">Chat with HD-AUTO-AGENT</h2>
              <div className="flex gap-2">
                {selectedCustomer && selectedVehicle && (
                  <Button
                    onClick={handleSendComprehensiveData}
                    className="bg-green-600 hover:bg-green-700 text-white text-xl"
                  >
                    Send All Vehicle & Customer Data
                  </Button>
                )}
                <Button
                  onClick={handleGeneratePDF}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xl"
                >
                  Generate Parts PDF
                </Button>
              </div>
            </div>
          </div>
          <Separator className="bg-gray-700 text-2xl shrink-0" />

          {/* Middle Scrollable Area (Messages and PDF Viewer) */}
          <div className="flex-1 text-2xl overflow-y-auto p-4 space-y-4 bg-gray-900 text-white">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.sender === "user"
                    ? "text-right text-2xl"
                    : "text-left text-2xl"
                }
              >
                <div
                  className={
                    m.sender === "user"
                      ? "inline-block bg-blue-600 px-3 py-2 rounded-lg mb-2"
                      : "inline-block bg-gray-800 px-3 py-2 rounded-lg mb-2 w-full max-w-4xl"
                  }
                >
                  {m.sender === "eliza" && isCustomerInfo(m.text) ? (
                    formatCustomerInfo(m.text)
                  ) : m.sender === "eliza" && isStructuredContent(m.text) ? (
                    formatStructuredResponse(m.text)
                  ) : (
                    m.text
                  )}
                </div>
              </div>
            ))}

            {/* PDF Viewer */}
            {showPdfViewer && currentPdf && (
              <div className="relative w-full h-[600px] bg-white rounded-lg overflow-hidden">
                <div className="absolute top-2 right-2 z-10">
                  <Button
                    onClick={() => {
                      console.log('Closing PDF viewer');
                      setShowPdfViewer(false);
                      if (currentPdf) {
                        URL.revokeObjectURL(currentPdf);
                        setCurrentPdf(null);
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Close PDF
                  </Button>
                </div>
                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                  <div style={{ height: '100%' }}>
                    <Viewer 
                      fileUrl={currentPdf}
                      onDocumentLoad={() => console.log('PDF document loaded successfully')}
                    />
                  </div>
                </Worker>
              </div>
            )}
          </div>

          <Separator className="bg-gray-700 shrink-0" />

          {/* Bottom Input Bar */}
          <div className="p-4 bg-gray-800 text-2xl flex gap-2 shrink-0">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isPending || !isServerAvailable}
              className="flex-1 bg-gray-900 text-white text-2xl border-gray-700"
            />
            <Button
              onClick={handleSubmit}
              disabled={isPending || !isServerAvailable}
              className="bg-blue-600 text-2xl hover:bg-blue-700 text-white"
            >
              {isPending ? "Sending..." : "Send"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ElizaChat;
