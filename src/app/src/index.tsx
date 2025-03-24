import React from "react";
import { createRoot } from "react-dom/client";
import { TranscriptProvider } from "./app/contexts/TranscriptContext";
import { EventProvider } from "./app/contexts/EventContext";
import App from "./app/App";
import "./app/globals.css";

const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <TranscriptProvider>
      <EventProvider>
        <App />
      </EventProvider>
    </TranscriptProvider>
  </React.StrictMode>
); 