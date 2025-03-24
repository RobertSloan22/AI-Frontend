import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
/// import the nav bar from components 
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import InvoicePage from './InvoicePage';
//import all components needed for the chat feature
import { Link } from "react-router-dom";
import InvoiceList from './InvoiceList';
import InvoiceCreate from '../../components/invoice/InvoiceCreate';
import Grid from '@mui/material/Grid2';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import InvoiceModal from '../../components/invoice/InvoiceModal';

import StatsGrid from '../../components/dashboard/StatsGrid';
import DTCQueryInterface from '../../components/dtc/DTCQueryInterface';
import { ElizaChat } from '../../components/ElizaChat';
import LogoutButton from '../../components/sidebar/LogoutButton';
import LicensePlateSearch from '../../components/vehicles/LicensePlateSearch';
import ForumDTCAnalyzer from '../../components/dtc/ForumDTCAnalyzer';
import VehiclePage from '../vehicles/VehiclePage';
import VehicleResearch from '../../components/vehicle/VehicleResearch';
import EstimateBuilder from '../../components/invoicing/EstimateBuilder';

import ServiceForm from '../services/ServiceForm';
import ServiceList from '../services/ServiceList';
import TechnicianDashboard from '../technicians/TechnicianDashboard';
import TechnicianDetails from '../technicians/TechnicianDetails';
import TechnicianList from '../technicians/TechnicianList';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: 'transparent',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.primary,
    position: 'relative',
    '& .dtc-container': {
      position: 'relative',
      zIndex: 9999,
    },
    '& .console-container': {
      position: 'relative',
      zIndex: 1,
    },
  }));
// import Appointments from components
const Invoice = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [appointments, setAppointments] = useState([]);
    const [serviceRecords, setServiceRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState([]);
    const [invoice, setInvoice] = useState(null);
    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        phoneNumber: '',
        address: '',
        invoiceDate: '',
        vehicleType: '',
        vehicleNumber: '',
        vehicleVin: '',
        vehicleColor: '',
        vehicleMileage: '',
        vehicleEngine: '',
        vehicleTransmission: '',
        vehicleFuelType: '',
        vehicleDescription: ''
    });
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [serviceVehicles, setServiceVehicles] = useState([]);


    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch appointments
                const { data } = await axiosInstance.get('/appointments');
                console.log('Raw appointments from API:', data);
                
                // Format appointments like in Appointments.jsx
                const formattedAppointments = data.map(apt => ({
                    _id: apt._id,
                    customerName: apt.customerName,
                    vehicle: apt.vehicle,
                    start: new Date(apt.start),
                    end: new Date(apt.end),
                    status: apt.status,
                    complaint: apt.complaint || apt.description,
                    notes: apt.notes
                }));

                // Filter for today's appointments
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                const todaysAppointments = formattedAppointments.filter(apt => 
                    apt.start >= today && apt.start < tomorrow
                );

                console.log('Today\'s appointments:', todaysAppointments);
                setAppointments(todaysAppointments);

                // Fetch recent invoices
                const { data: invoiceData } = await axiosInstance.get('/invoices/all');
                console.log('Raw invoices from API:', invoiceData);
                console.log('Invoice data type:', typeof invoiceData);
                console.log('Is array?', Array.isArray(invoiceData));
                
                const formattedInvoices = Array.isArray(invoiceData) ? invoiceData.map(invoice => ({
                    _id: invoice._id,
                    invoiceNumber: invoice.invoiceNumber || 'N/A',
                    customerName: invoice.customerName,
                    vehicle: invoice.vehicle || {},
                    total: invoice.total || 0,
                    date: invoice.date ? new Date(invoice.date) : new Date(),
                    status: invoice.status || 'draft',
                    laborItems: invoice.laborItems || [],
                    estimatedHours: invoice.estimatedHours || 0,
                    paid: invoice.paid || false,
                    description: invoice.description || ''
                })) : [];

                console.log('Formatted invoices:', formattedInvoices);

                setServiceRecords(formattedInvoices);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);
    const stats = [
        
        { 
            label: 'Pending Invoices', 
            value: serviceRecords.filter(r => r.status === 'draft').length, 
            icon: '📄' 
        },   { 
            label: 'Scheduled DTC Vehicles', 
            value: serviceRecords.filter(r => r.status === 'draft').length, 
            icon: '📄' 
        },   { 
            label: 'Scheduled LOF', 
            value: serviceRecords.filter(r => r.status === 'draft').length, 
            icon: '📄' 
        },   { 
            label: 'Brake Jobs', 
            value: serviceRecords.filter(r => r.status === 'draft').length, 
            icon: '📄' 
        },
        { 
            label: 'Inspections', 
            value: serviceRecords.filter(r => r.status === 'draft').length, 
            icon: '📄' 
        },
       
        { 
            label: 'Scheduled Hours Today', 
            value: appointments.reduce((total, appointment) => {
                // Calculate duration in milliseconds
                const duration = appointment.end - appointment.start;
                // Convert to hours
                const hours = duration / (1000 * 60 * 60);
                // Return the larger of actual duration or 1.5 hours
                return total + Math.max(hours, 1.5);
            }, 0).toFixed(1), // Round to 1 decimal place
            icon: '⏱️' 
        }
    ];
    const quickActions = [
        { label: 'New Appointment', action: () => navigate('/appointments/new'), icon: '📅' },
        { label: 'New Customer', action: () => navigate('/customers/new'), icon: '👥' },
        { label: 'New Service Record', action: () => navigate('/service-records/new'), icon: '🔧' },
        { label: 'Order Parts', action: () => navigate('/parts/order'), icon: '📦' },
        { label: 'DTC Query Interface', action: () => navigate('/dtc-query-interface'), icon: '🔍' },
        { label: 'Activant', action: () => navigate('/activant'), icon: '📅🔧' }
    ];
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/invoices/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            toast.success('Invoice created successfully!');
            fetchInvoices(); // Refresh the list
            // Reset form
            setFormData({
                customerName: '',
                customerEmail: '',
                phoneNumber: '',
                address: '',
                invoiceDate: '',
                vehicleType: '',
                vehicleNumber: '',
                vehicleVin: '',
                vehicleColor: '',
                vehicleMileage: '',
                vehicleEngine: '',
                vehicleTransmission: '',
                vehicleFuelType: '',
                vehicleDescription: ''
            });
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleDelete = async (id) => {
        try {
            await axiosInstance.delete(`/invoices/${id}`);
            fetchInvoices();
        } catch (error) {
            console.error('Error deleting invoice:', error);
        }
    };



    const fetchInvoices = async () => {
        try {
            const { data } = await axiosInstance.get('/invoices/all');
            
            // Ensure data is an array
            if (!Array.isArray(data)) {
                console.error('Expected array but got:', typeof data);
                setInvoices([]);
                return;
            }
            
            // Map the data to ensure all required fields exist
            const formattedInvoices = data.map(invoice => ({
                _id: invoice._id,
                invoiceDate: invoice.invoiceDate || new Date(),
                customerName: invoice.customerName || 'N/A',
                vehicleType: invoice.vehicleType || 'N/A',
                // Add other fields as needed
            }));
            
            setInvoices(formattedInvoices);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            toast.error('Failed to fetch invoices');
            setInvoices([]); // Set to empty array on error
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const handleViewInvoice = (invoice) => {
        setSelectedInvoice(invoice);
        setIsModalOpen(true);
    };

    useEffect(() => {
        const fetchInvoice = async () => {
            try {
                const response = await axiosInstance(`/invoices/${id || 'recent'}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch invoice');
                }
                const data = await response.json();
                setInvoice(data);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching invoice:', err);
            }
        };

        fetchInvoice();
    }, [id]);

    // Add this helper function at the component level
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'draft': return 'text-yellow-400';
            case 'completed': return 'text-green-400';
            case 'billed': return 'text-blue-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <>
            <div className="w-[100vw] h-[100vh] overflow-hidden bg-gray-900">

        <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gridTemplateRows: '35vh 20vh 100vh',
            gap: 2,
            padding: 2
          }}>
          
            {/* Appointments Section */}
            <Box sx={{ gridColumn: '1 / span 12', gridRow: '1' }}>
            
                    <div className=" w-[22vw] h-[30vh] top-10 mb-4 text-xl  bg-opacity-50  border-l-4 border-blue-500 cursor-pointer  transition-colors ">
                        <h2 className="text-xl font-bold text-white mb-4 ">Today's Appointments</h2>
                        <div className="space-y-4 h-[25vh]  overflow-y-auto">
                            {loading ? (
                                <div className="text-gray-400 ">Loading appointments...</div>
                            ) : appointments.length === 0 ? (
                                <div className="text-gray-400">No appointments scheduled for today</div>
                            ) : (
                                appointments.map(appointment => (
                                    <div 
                                        key={appointment._id}
                                        className="bg-gray-700 p-4  rounded-lg cursor-pointer hover:bg-gray-600"
                                        onClick={() => navigate(`/appointments/${appointment._id}`)}
                                    >
                                        <div className="flex justify-between items-start ">
                                            <div>
                                                <p className="text-white font-medium text-xl">
                                                    {format(new Date(appointment.start), 'h:mm a')} - {appointment.customerName}
                                                </p>
                                                <p className="text-gray-400 text-xl">{appointment.vehicle}</p>
                                                {appointment.notes && (
                                                    <p className="text-gray-400 mt-1 text-xl">Notes: {appointment.notes}</p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <span className="text-base text-blue-400">
                                                    {appointment.status || 'scheduled'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    
                 
            </Box>
              

        

            {/* Stats Grid Section */}
   

            {/* Invoice List Section */}
            <Box sx={{ gridColumn: '4 / span 4', gridRow: '1' }}>
                <InvoiceList />
            
            </Box>
            {/* Invoice Form Section */}
       

            {/* Modal */}
            {isModalOpen && selectedInvoice && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-gray-800 text-gray-300 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Invoice Details</h2>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold mb-2">Customer Information</h3>
                                <p><span className="font-medium text-xl">Name:</span> {selectedInvoice.customerName}</p>
                                <p><span className="font-medium text-xl">Email:</span> {selectedInvoice.customerEmail}</p>
                                <p><span className="font-medium text-xl">Phone:</span> {selectedInvoice.phoneNumber}</p>
                                <p><span className="font-medium text-xl">Address:</span> {selectedInvoice.address}</p>
                                <p><span className="font-medium text-xl">Date:</span> {new Date(selectedInvoice.invoiceDate).toLocaleDateString()}</p>
                            </div>
                            
                            <div>
                                <h3 className="font-semibold mb-2">Vehicle Information</h3>
                                <p><span className="font-medium">Type:</span> {selectedInvoice.vehicleType}</p>
                                <p><span className="font-medium">Number:</span> {selectedInvoice.vehicleNumber}</p>
                                <p><span className="font-medium">VIN:</span> {selectedInvoice.vehicleVin}</p>
                                <p><span className="font-medium">Color:</span> {selectedInvoice.vehicleColor}</p>
                                <p><span className="font-medium">Mileage:</span> {selectedInvoice.vehicleMileage}</p>
                            </div>
                            
                            <div className="col-span-2">
                                <h3 className="font-semibold mb-2">Additional Details</h3>
                                <p><span className="font-medium">Engine:</span> {selectedInvoice.vehicleEngine}</p>
                                <p><span className="font-medium">Transmission:</span> {selectedInvoice.vehicleTransmission}</p>
                                <p><span className="font-medium">Fuel Type:</span> {selectedInvoice.vehicleFuelType}</p>
                                <p><span className="font-medium">Description:</span> {selectedInvoice.vehicleDescription}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
       
        </Box>
        <InvoiceModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            invoice={selectedInvoice}
        
            
        />
        </div>
</>
    );
};

export default Invoice;
