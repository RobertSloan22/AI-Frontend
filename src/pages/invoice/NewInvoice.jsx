import { InvoiceForm } from '../../components/invoice/InvoiceForm';
import { useCustomer } from '../../context/CustomerContext';
import axiosInstance from '../../utils/axiosConfig';
const NewInvoice = () => {
    const { selectedCustomer } = useCustomer();

    const handleSubmit = async (formData) => {
        try {
            const response = await axiosInstance('/invoices/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                throw new Error('Failed to create invoice');
            }
        } catch (error) {
            console.error('Error creating invoice:', error);
        }
    };

    return (
        <>
      
        <div className="text-xl font-bold">
        
            <InvoiceForm 
                initialData={{
                    customerName: selectedCustomer?.name,
                    lastName: selectedCustomer?.lastName,
                    customerEmail: selectedCustomer?.email,
                    phoneNumber: selectedCustomer?.phone,
                    address: selectedCustomer?.address,
                    state: selectedCustomer?.state,
                    city: selectedCustomer?.city,
                    zipCode: selectedCustomer?.zip,
                }}
                onSubmit={handleSubmit}
            />
        </div>
        </>
    );
};

export default NewInvoice; 