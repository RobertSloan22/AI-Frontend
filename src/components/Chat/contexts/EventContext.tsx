import React, { createContext, useContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";

type LoggedEvent = {
  id: string;
  direction: "client" | "server";
  eventName: string;
  eventData: Record<string, any>;
  timestamp: string;
  expanded: boolean;
};

type EventContextValue = {
  loggedEvents: LoggedEvent[];
  logClientEvent: (eventObj: Record<string, any>, eventNameSuffix?: string) => void;
  logServerEvent: (eventObj: Record<string, any>, eventNameSuffix?: string) => void;
  toggleExpand: (id: string) => void;
};

const EventContext = createContext<EventContextValue | undefined>(undefined);

export const EventProvider = ({ children }: { children: React.ReactNode }) => {
  const [loggedEvents, setLoggedEvents] = useState<LoggedEvent[]>([]);

  const addLoggedEvent = (direction: "client" | "server", eventName: string, eventData: Record<string, any>) => {
    const id = eventData.event_id || uuidv4();
    setLoggedEvents((prev) => [
      ...prev,
      {
        id,
        direction,
        eventName,
        eventData,
        timestamp: new Date().toLocaleTimeString(),
        expanded: false,
      },
    ]);
  };

  const logClientEvent = (eventObj: Record<string, any>, eventNameSuffix = "") => {
    const name = `${eventObj.type || ""} ${eventNameSuffix || ""}`.trim();
    addLoggedEvent("client", name, eventObj);
  };

  const logServerEvent = (eventObj: Record<string, any>, eventNameSuffix = "") => {
    const name = `${eventObj.type || ""} ${eventNameSuffix || ""}`.trim();
    addLoggedEvent("server", name, eventObj);
  };

  const toggleExpand = (id: string) => {
    setLoggedEvents((prev) =>
      prev.map((log) => {
        if (log.id === id) {
          return { ...log, expanded: !log.expanded };
        }
        return log;
      })
    );
  };

  return (
    <EventContext.Provider
      value={{ loggedEvents, logClientEvent, logServerEvent, toggleExpand }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvent must be used within an EventProvider");
  }
  return context;
};