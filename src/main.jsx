import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContext";
import { SocketContextProvider } from "./context/SocketContext";
import { CustomerProvider } from "./context/CustomerContext";
import { VehicleProvider } from "./context/VehicleContext";
import { InvoiceProvider } from "./context/InvoiceContext";
import { Provider } from "react-redux";
// import the TranscriptProvider
import { TranscriptProvider } from "./components/Chat/contexts/TranscriptContext";
import { store } from "./app/store";
import App from "./App";
//import the EventContextProvider
import { EventProvider } from "./components/Chat/contexts/EventContext";
// Add viewport height calculation
function setViewportHeight() {
	const vh = window.innerHeight * 0.01;
	document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Initial calculation
setViewportHeight();

// Recalculate on resize
window.addEventListener('resize', () => {
	setViewportHeight();
});

// Create a client
const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<TranscriptProvider>
				<EventProvider>
					<AuthContextProvider>
						<SocketContextProvider>
							<CustomerProvider>
								<VehicleProvider>
									<InvoiceProvider>
										<Provider store={store}>
											<BrowserRouter>
												<App />
											</BrowserRouter>
										</Provider>
									</InvoiceProvider>
								</VehicleProvider>
							</CustomerProvider>
						</SocketContextProvider>
					</AuthContextProvider>
				</EventProvider>
			</TranscriptProvider>
		</QueryClientProvider>
	</StrictMode>
);
