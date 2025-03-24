import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthContext } from './hooks/useAuthContext';
import { VehicleProvider } from './context/VehicleContext';
import ShopDashboard from './components/layout/ShopDashboard';
import Overview from './pages/dashboard/Overview';
import Login from './pages/login/Login';
import SignUp from './pages/auth/SignUp';
import { Toaster } from "react-hot-toast";
import { CustomerProvider } from './context/CustomerContext';
import { ResearchProvider } from './context/ResearchContext';
import { DiagnosticProvider } from './context/DiagnosticContext';
import Home from './pages/home/Home';
import MessageContainer from './components/messages/MessageContainer';
import DTCQueryInterface from './components/dtc/DTCQueryInterface';
import DTCQueryInterfacePage from './pages/dtc/DTCQueryInterfacePage';
import Activant from './pages/activant/Activant';
import AppointmentRoutes from './routes/AppointmentRoutes';
import { NoteViewer } from './components/assistant/components/notes/NoteViewer';
import LocalAI from './pages/localsystem/LocalAI';
import CustomerRoutes from './routes/CustomerRoutes';
import VehicleRoutes from './routes/VehicleRoutes';
import ServiceRoutes from './routes/ServiceRoutes';
import PartsRoutes from './routes/PartsRoutes';
import TechnicianRoutes from './routes/TechnicianRoutes';
import TechnicianDashboard from './components/technicians/TechnicianDashboard';
import ReportRoutes from './routes/ReportRoutes';
import Profile from './pages/profile/Profile';
//import NewInvoice from './pages/invoice/NewInvoice';
import Invoice from './pages/invoice/Invoice';
//import EditCustomer from './components/customers/EditCustomer';
import NewCustomer from './components/customers/NewCustomer';
import QuickActions from './components/dashboard/QuickActions';
// import navbarimport 
import UnifiedDashboard from './pages/dashboard/UnifiedDashboard';
//import customers from src/pages/customers
//import Customers from './pages/customers/Customers'
//import CustomersPage from './pages/customers/CustomersPage';
import InvoicePage from './pages/invoice/InvoicePage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { InvoiceProvider } from './context/InvoiceContext';
import StatsGrid from './components/dashboard/StatsGrid';
import VehiclePage from './pages/vehicles/VehiclePage';
import AppointmentsPage from './components/assistant/AppointmentsPage';
import Agents from "./Agents";
import CustomerSelectionBar from './components/customers/CustomerSelectionBar';
import ElizaChat from './components/ElizaChat';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContextProvider } from './context/AuthContext';
import { SocketContextProvider } from './context/SocketContext';
import AptOverview from './pages/dashboard/AptOverview';
import { EventProvider } from './components/Chat/contexts/EventContext';
import { TranscriptProvider } from './components/Chat/contexts/TranscriptContext';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import BackgroundDashboard from './pages/dashboard/BackgroundDashboard';

// Create a new QueryClient instance
const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }) => {
	const { authUser } = useAuthContext();
	
	if (!authUser) {
		return <Navigate to="/login" replace />;
	}
	
	return children;
};

// Public Route Component
const PublicRoute = ({ children }) => {
	const { authUser } = useAuthContext();
	
	if (authUser) {
		return <Navigate to="/unified-dashboard" replace />;
	}
	
	return children;
};

function App() {
	return (
		<Provider store={store}>
			<QueryClientProvider client={queryClient}>
				<AuthContextProvider>
					<SocketContextProvider>
						<CustomerProvider>
							<VehicleProvider>
								<InvoiceProvider>
									<ResearchProvider>
										<DiagnosticProvider>
											<EventProvider>
												<TranscriptProvider>
													<div className='flex items-center justify-items-center'>
														<Routes>
															{/* Public Routes */}
															<Route path="/" element={
																<PublicRoute>
																	<Navigate to="/backgrounddashboard" replace />
																</PublicRoute>
															} />
															<Route path="/login" element={
																<PublicRoute>
																	<Login />
																</PublicRoute>
															} />
															<Route path="/signup" element={
																<PublicRoute>
																	<SignUp />
																</PublicRoute>
															} />

															{/* Protected Routes */}
															<Route path="/*" element={
																<ProtectedRoute>
																	<ShopDashboard>
																		<div>
																			<div className="fixed top-0 left-0 right-0 z-50">
																				<CustomerSelectionBar />
																				<QuickActions />

																			</div>
																		
																			<div className="fixed top-0 left-0 right-0 z-10">
																				<div className="pt-[64px]">
																					<StatsGrid />
																				</div>
																			</div>
																			
																			<div className="pt-[400px]">
																				<Routes>
																					<Route path="/elizachat" element={<ElizaChat />} />
																					<Route path="/backgrounddashboard" element={<BackgroundDashboard />} />
																					<Route path="/localai" element={<LocalAI />} />
																					<Route path="/unified-dashboard" element={<UnifiedDashboard />} />
																					<Route path="/invoicepage" element={<InvoicePage />} />
																					<Route path="/appointmentspage" element={<AppointmentsPage />} />
																					<Route path="/customers/*" element={<CustomerRoutes />} />
																					<Route path="/vehiclepage" element={<VehiclePage />} />
																					<Route path="/profile" element={<Profile />} />
																					<Route path="/activant" element={<Activant />} />
																					<Route path="/technician-dashboard" element={<TechnicianDashboard />} />
																					<Route path="/dashboard" element={<Overview />} />
																					<Route path="/aptoverview" element={<AptOverview />} />
																					<Route path="/appointments/*" element={<AppointmentRoutes />} />
																					<Route path="/vehicles/*" element={<VehicleRoutes />} />
																					<Route path="/invoice" element={<Invoice />} />
																					<Route path="/dtc-query-interface" element={<DTCQueryInterfacePage />} />	
																					<Route path="/service-records/*" element={<ServiceRoutes />} />
																					<Route path="/parts/*" element={<PartsRoutes />} />
																					<Route path="/technicians/*" element={<TechnicianRoutes />} />
																					<Route path="/reports/*" element={<ReportRoutes />} />
																					<Route path="/note-viewer" element={<NoteViewer />} />
																					<Route path="/home" element={<Home />} />	
																					<Route path="/agents" element={<Agents />}	/>											
																					<Route path="/messages" element={<MessageContainer />} />
																					<Route path="/dtc-query" element={<DTCQueryInterface />} />
																					<Route path="/customers/new" element={<NewCustomer />} />
																					<Route path="/customers/:id/edit" element={<Home />} />
																				</Routes>
																			</div>
																		</div>
																	</ShopDashboard>
																</ProtectedRoute>
															} />
														</Routes>
														<Toaster />
														<ToastContainer 
															position="top-right"
															autoClose={4000}
															hideProgressBar={false}
															newestOnTop
															closeOnClick
															rtl={false}
															pauseOnFocusLoss
															draggable
															pauseOnHover
															theme="dark"
														/>
													</div>
												</TranscriptProvider>
											</EventProvider>
										</DiagnosticProvider>
									</ResearchProvider>
								</InvoiceProvider>
							</VehicleProvider>
						</CustomerProvider>
					</SocketContextProvider>
				</AuthContextProvider>
			</QueryClientProvider>
		</Provider>
	);
}

export default App;