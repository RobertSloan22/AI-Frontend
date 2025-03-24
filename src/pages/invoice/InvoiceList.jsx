import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
/// import the nav bar from components 
// import axios
import axiosInstance from '../../utils/axiosConfig';
import { useCustomer } from '../../context/CustomerContext';
import InvoiceModal from '../../components/invoice/InvoiceModal';


// import Appointments from components
const InvoiceList = () => {
    const [invoices, setInvoices] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { selectedCustomer } = useCustomer();
    const [selectedVehicleFilter, setSelectedVehicleFilter] = useState('all');
    const [customerVehicles, setCustomerVehicles] = useState([]);

    const fetchInvoices = async () => {
        try {
            const { data } = await axiosInstance.get('/invoices/all');
            // Ensure each invoice has a status, default to 'draft' if none exists
            const invoicesWithStatus = data.map(invoice => ({
                ...invoice,
                status: invoice.status || 'draft'
            }));
            setInvoices(invoicesWithStatus);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            toast.error('Failed to fetch invoices');
            setInvoices([]);
        }
    };

    const fetchCustomerInvoices = async (customerId) => {
        try {
            const [invoicesRes, vehiclesRes] = await Promise.all([
                axiosInstance.get(`/invoices/customer/${customerId}`),
                axiosInstance.get(`/customers/${customerId}/vehicles`)
            ]);
            
            setInvoices(invoicesRes.data);
            setCustomerVehicles(vehiclesRes.data);
            setSelectedVehicleFilter('all'); // Reset filter when customer changes
        } catch (error) {
            console.error('Error fetching customer data:', error);
            toast.error('Failed to fetch customer data');
            setInvoices([]);
            setCustomerVehicles([]);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axiosInstance.delete(`/invoices/${id}`);
            toast.success('Invoice deleted successfully');
            
            // Refresh the appropriate list
            if (selectedCustomer?._id) {
                fetchCustomerInvoices(selectedCustomer._id);
            } else {
                fetchInvoices();
            }
        } catch (error) {
            console.error('Error deleting invoice:', error);
            toast.error('Failed to delete invoice');
        }
    };

    const handleInvoiceUpdate = async (updatedInvoice) => {
        try {
            // Update the invoices list with the new data
            setInvoices(prevInvoices => 
                prevInvoices.map(invoice => 
                    invoice._id === updatedInvoice._id ? updatedInvoice : invoice
                )
            );
            
            // Refresh the list to ensure we have the latest data
            if (selectedCustomer?._id) {
                await fetchCustomerInvoices(selectedCustomer._id);
            } else {
                await fetchInvoices();
            }
        } catch (error) {
            console.error('Error updating invoice list:', error);
            toast.error('Failed to refresh invoice list');
        }
    };

    useEffect(() => {
        if (selectedCustomer?._id) {
            fetchCustomerInvoices(selectedCustomer._id);
        } else {
            fetchInvoices();
            setCustomerVehicles([]);
            setSelectedVehicleFilter('all');
        }
    }, [selectedCustomer]);

    const handleViewInvoice = (invoice) => {
        setSelectedInvoice(invoice);
        setIsModalOpen(true);
    };

    const filteredInvoices = selectedVehicleFilter === 'all' 
        ? invoices  
        : invoices.filter(invoice => invoice.vehicleId === selectedVehicleFilter);

    return (
        <div className="text-base">
            {/* Vehicle Filter */}
            {selectedCustomer && customerVehicles.length > 0 && (
                <div className="mb-4 p-4 bg-gray-800 bg-opacity-80 rounded-lg">
                    <div className="flex items-center gap-4">
                        <label className="text-gray-300 text-lg">Filter by Vehicle:</label>
                        <select
                            className="flex-1 p-2 bg-gray-700 border-gray-600 text-white rounded-lg"
                            value={selectedVehicleFilter}
                            onChange={(e) => setSelectedVehicleFilter(e.target.value)}
                        >
                            <option value="all">All Vehicles</option>
                            {customerVehicles.map((vehicle) => (
                                <option key={vehicle._id} value={vehicle._id}>
                                    {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.vin}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Invoice List */}
            <div className="space-y-4 h-[calc(100vh-12rem)] overflow-y-auto">
                {filteredInvoices.length === 0 ? (
                    <div className="text-gray-400 text-center py-4">No invoices found</div>
                ) : (
                    filteredInvoices.map((invoice) => (
                        <div 
                            key={invoice._id}
                            className="mb-4 p-4 bg-gray-800 bg-opacity-80 rounded-lg border-l-4 border-blue-500 cursor-pointer hover:bg-gray-700 transition-colors"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xl font-semibold text-white">{invoice.customerName}</p>
                                    <p className="text-sm text-gray-400">
                                        {invoice.vehicleYear} {invoice.vehicleMake} {invoice.vehicleModel}
                                    </p>
                                    <p className="text-sm text-gray-400">VIN: {invoice.vehicleVin}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-medium text-white">
                                        ${invoice.total?.toFixed(2) || '0.00'}
                                    </p>
                                    <span className={`inline-block px-2 py-1 rounded text-sm ${
                                        invoice.status === 'draft' ? 'bg-yellow-600' :
                                        invoice.status === 'completed' ? 'bg-green-600' :
                                        invoice.status === 'billed' ? 'bg-blue-600' : 'bg-gray-600'
                                    }`}>
                                        {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1)}
                                    </span>
                                    <p className="text-sm text-gray-400">
                                        {new Date(invoice.invoiceDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-3 flex gap-2 justify-end">
                                <button 
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                    onClick={() => handleViewInvoice(invoice)}
                                >
                                    View Details
                                </button>
                                <button 
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                    onClick={() => handleDelete(invoice._id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <InvoiceModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                invoice={selectedInvoice}
                onUpdate={handleInvoiceUpdate}
            />
        </div>
    );
};

export default InvoiceList;
