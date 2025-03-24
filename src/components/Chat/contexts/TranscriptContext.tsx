import React, { createContext, useContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface TranscriptItem {
  itemId: string;
  type: "MESSAGE" | "BREADCRUMB";
  role?: "user" | "assistant";
  title: string;
  data?: Record<string, any>;
  expanded: boolean;
  timestamp: string;
  createdAtMs: number;
  status?: "IN_PROGRESS" | "DONE";
  isHidden?: boolean;
}

interface TranscriptContextType {
  transcriptItems: TranscriptItem[];
  addTranscriptMessage: (message: Omit<TranscriptItem, "itemId" | "timestamp" | "createdAtMs">) => void;
  addTranscriptBreadcrumb: (breadcrumb: Omit<TranscriptItem, "itemId" | "timestamp" | "createdAtMs">) => void;
  toggleTranscriptItemExpand: (itemId: string) => void;
}

const TranscriptContext = createContext<TranscriptContextType | undefined>(undefined);

export const TranscriptProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transcriptItems, setTranscriptItems] = useState<TranscriptItem[]>([]);

  const addTranscriptMessage = (message: Omit<TranscriptItem, "itemId" | "timestamp" | "createdAtMs">) => {
    const newItem: TranscriptItem = {
      ...message,
      itemId: uuidv4(),
      timestamp: new Date().toISOString(),
      createdAtMs: Date.now(),
    };
    setTranscriptItems(prev => [...prev, newItem]);
  };

  const addTranscriptBreadcrumb = (breadcrumb: Omit<TranscriptItem, "itemId" | "timestamp" | "createdAtMs">) => {
    const newItem: TranscriptItem = {
      ...breadcrumb,
      itemId: uuidv4(),
      timestamp: new Date().toISOString(),
      createdAtMs: Date.now(),
    };
    setTranscriptItems(prev => [...prev, newItem]);
  };

  const toggleTranscriptItemExpand = (itemId: string) => {
    setTranscriptItems(prev =>
      prev.map(item =>
        item.itemId === itemId
          ? { ...item, expanded: !item.expanded }
          : item
      )
    );
  };

  return (
    <TranscriptContext.Provider value={{
      transcriptItems,
      addTranscriptMessage,
      addTranscriptBreadcrumb,
      toggleTranscriptItemExpand,
    }}>
      {children}
    </TranscriptContext.Provider>
  );
};

export const useTranscript = () => {
  const context = useContext(TranscriptContext);
  if (context === undefined) {
    throw new Error('useTranscript must be used within a TranscriptProvider');
  }
  return context;
};