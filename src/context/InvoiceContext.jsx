import { InvoiceContext } from './invoiceContextCore';
import { useCustomer } from './CustomerContext';
import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';

export const InvoiceProvider = ({ children }) => {
    const { selectedCustomer } = useCustomer();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentInvoice, setCurrentInvoice] = useState(null);

    // Fetch invoices when selected customer changes
    useEffect(() => {
        if (selectedCustomer?._id) {
            fetchCustomerInvoices(selectedCustomer._id);
        } else {
            setInvoices([]);
        }
    }, [selectedCustomer]);

    const fetchCustomerInvoices = async (customerId) => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(`/customers/${customerId}/invoices`);
            setInvoices(res.data);
        } catch (error) {
            console.error('Error fetching customer invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const createNewInvoice = () => {
        if (!selectedCustomer) return null;

        const vehicle = selectedCustomer.vehicles?.[0];
        
        return {
            customerId: selectedCustomer._id,
            customerName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
            customerEmail: selectedCustomer.email,
            customerPhone: selectedCustomer.phoneNumber,
            customerAddress: selectedCustomer.address,
            customerCity: selectedCustomer.city,
            customerZipCode: selectedCustomer.zipCode,
            vehicleYear: vehicle?.year || '',
            vehicleMake: vehicle?.make || '',
            vehicleModel: vehicle?.model || '',
            vehicleVin: vehicle?.vin || '',
            vehicleMileage: vehicle?.mileage || '',
            vehicleEngine: vehicle?.engine || '',
            vehicleTransmission: vehicle?.transmission || '',
            items: [],
            subtotal: 0,
            tax: 0,
            total: 0,
            status: 'draft',
            notes: '',
            date: new Date().toISOString()
        };
    };

    const saveInvoice = async (invoiceData) => {
        try {
            let response;
            if (invoiceData._id) {
                response = await axiosInstance.put(`/invoices/${invoiceData._id}`, invoiceData);
            } else {
                response = await axiosInstance.post('/invoices', invoiceData);
            }
            
            if (selectedCustomer?._id) {
                await fetchCustomerInvoices(selectedCustomer._id);
            }
            
            return response.data;
        } catch (error) {
            console.error('Error saving invoice:', error);
            throw error;
        }
    };

    const deleteInvoice = async (invoiceId) => {
        try {
            await axiosInstance.delete(`/invoices/${invoiceId}`);
            if (selectedCustomer?._id) {
                await fetchCustomerInvoices(selectedCustomer._id);
            }
        } catch (error) {
            console.error('Error deleting invoice:', error);
            throw error;
        }
    };

    return (
        <InvoiceContext.Provider value={{ 
            invoices, 
            loading, 
            currentInvoice,
            setCurrentInvoice,
            createNewInvoice,
            saveInvoice,
            deleteInvoice,
            fetchCustomerInvoices
        }}>
            {children}
        </InvoiceContext.Provider>
    );
};
