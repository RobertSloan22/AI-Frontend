import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
//import { Link } from "react-router-dom";
//import CustomerSearch from '../../components/customers/CustomerSearch';
/// import the nav bar from components 
//import Navbar from '../../components/navbar/navbar';
// import the sidebar from components
//import Sidebar from '../../components/sidebar/Sidebar';
// import the message container from components
//import MessageContainer from '../../components/messages/MessageContainer';
// import the Appointments from components
import Appointments from '../../components/appointments/Appointments';
import AppointmentsList from '../../components/appointments/AppointmentsList';
//import AppointmentModal from '../../components/appointments/AppointmentModal';
//import AppointmentForm from '../../components/appointments/AppointmentForm';
import { Grid, Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Paper } from '@mui/material';
import { Box } from '@mui/material';
import InvoiceCreate from '../../components/invoice/InvoiceCreate';
// import Item from Mui
//import AppointmentList from '../appointments/AppointmentList';
import axiosInstance from '../../utils/axiosConfig'



const Item = styled(Paper)(({ theme }) => ({

    backgroundColor: 'transparent',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.primary,
    ...theme.applyStyles('dark', {
    }),
}));



const Activant = () => {
    const [invoices, setInvoices] = useState([]);
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
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredInvoices, setFilteredInvoices] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axiosInstance.post('/invoices/create', {
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

    const fetchInvoices = async () => {
        try {
            const res = await axiosInstance.get('/invoices/all');
            const data = res.data; // Axios response data is already parsed
            
            if (data.error) throw new Error(data.error);
            setInvoices(data);
        } catch (error) {
            toast.error(error.message);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const handleViewInvoice = (invoice) => {
        setSelectedInvoice(invoice);
        setIsModalOpen(true);
    };

    // Add this new handler
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        
        const filtered = invoices.filter(invoice => 
            invoice.customerName.toLowerCase().includes(term) ||
            invoice.customerEmail.toLowerCase().includes(term) ||
            invoice.phoneNumber.includes(term)
        );
        setFilteredInvoices(filtered);
    };

    const handleCustomerSelect = (customer) => {
        setSelectedCustomer(customer);
        setIsCustomerModalOpen(true);
    };

    return (
        <>
            <div className="w-[100vw] h-[100vh] overflow-hidden bg-gray-900">

            <Box sx={{
                display: 'grid',
                // Define columns - creates 12 equal columns
                gridTemplateColumns: 'repeat(12, 1fr)',
                // Define rows - creates 3 rows with specific heights
                gridTemplateRows: '100vh  ',
                gap: 2,
                height: '100vh', // Full viewport height
                padding: 2
                }}>
                {/* Top Row - Chat Windows and Customer Info */}
                <Box sx={{ gridColumn: '1 / span 12', gridRow: '1' }}>
                    <Item>
                    </Item>
                </Box>
                <Box sx={{ gridColumn: '1 / span 6', gridRow: '1' }}>
                    <Item>
                    </Item>
                </Box>
            </Box>
            </div>
        </>
    );
};

export default Activant;
