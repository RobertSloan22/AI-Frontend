import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import CustomerSearch from '../../components/customers/CustomerSearch';
import Invoice from '../invoice/invoice'
import { toast } from 'react-toastify';
import { useCustomer } from '../../context/CustomerContext';
import InvoiceList from '../invoice/InvoiceList';
import NewCustomerForm from '../../components/customers/NewCustomerForm';
import CustomerDetailsModal from '../../components/customers/CustomerDetailsModal';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { CustomerContextDisplay } from "../../components/customer/CustomerContextDisplay";



// import grid, item and gridcontainer from npm install @mui/material @emotion/react @emotion/styled
// use a grid to lay out the page
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

const CustomersPage = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const customersPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await axiosInstance.get('/customers/all');
            const filteredCustomers = response.data.filter(customer => 
                customer.firstName && customer.lastName
            );
            const sortedCustomers = filteredCustomers.sort((a, b) => 
                a.lastName.localeCompare(b.lastName)
            );
            setCustomers(sortedCustomers);
        } catch (error) {
            console.error('Error fetching customers:', error);
            toast.error('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const handleCustomerClick = (customer) => {
        setSelectedCustomer(customer);
    };

    const handleCreateCustomer = async (formData) => {
        try {
            const response = await axiosInstance.post('/customers', formData);
            setCustomers([...customers, response.data]);
            setShowNewCustomerForm(false);
            toast.success('Customer created successfully');
        } catch (error) {
            console.error('Error creating customer:', error);
            toast.error('Failed to create customer');
        }
    };

    // Calculate pagination values
    const indexOfLastCustomer = currentPage * customersPerPage;
    const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
    const currentCustomers = customers.slice(indexOfFirstCustomer, indexOfLastCustomer);
    const totalPages = Math.ceil(customers.length / customersPerPage);

    // Add pagination controls component
    const Pagination = () => (
        <div className="flex justify-center mt-6 gap-2">
            <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-700 text-white rounded disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                Previous
            </button>
            <span className="px-4 py-2 text-white">
                Page {currentPage} of {totalPages}
            </span>
            <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-700 text-white rounded disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                Next
            </button>
        </div>
    );

    return (
        <>  
    <div className="w-[100vw] h-[100vh] overflow-hidden bg-gray-700">
    <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(14, 1fr)',
                gridTemplateRows: '35vh 10vh 15vh 30vh 15vh',
                gap: 2,
                padding: 2
            }}>
            {/* Appointments Section */}
       
            <CustomerSearch />
      
            <Box sx={{ gridColumn: '1/ span 2', gridRow: '1' }}>
                    <CustomerContextDisplay/>
                </Box>

            <Box sx={{ gridColumn: '8 / span 6', gridRow: '1/ span 1' }}>
            <Item>
            <NewCustomerForm />
            {/* Customers Grid */}
            {loading ? (
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full border-b-2 border-white"></div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4  text-white">
                        {currentCustomers.map((customer) => (
                            <div
                                key={customer._id}
                                onClick={() => handleCustomerClick(customer)}
                                className="bg-gray-800  text-white rounded-lg p-4 text-xl cursor-pointer font-bold hover:bg-gray-700 transition-colors"
                            >
                                <h3 className="text-lg font-bold text-white">
                                    {customer.firstName} {customer.lastName}
                                </h3>
                                <div className="mt-2 space-y-1 text-gray-300">
                                    <p>{customer.email}</p>
                                    <p>{customer.phoneNumber}</p>
                                    <p>{customer.city}, {customer.zipCode}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Pagination />
                </>
            )}
            
            {/* New Customer Modal */}
            {showNewCustomerForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">New Customer</h2>
                            <button 
                                onClick={() => setShowNewCustomerForm(false)}
                                className="text-gray-400 hover:text-white"
                            >
                                ×
                            </button>   
                        </div>
                        <NewCustomerForm onSuccess={() => {
                            setShowNewCustomerForm(false);
                            fetchCustomers();
                        }} />
                    </div>
                </div>
            )}

            {/* Customer Details Modal */}
            {selectedCustomer && (
                <CustomerDetailsModal
                    customer={selectedCustomer}
                    onClose={() => setSelectedCustomer(null)}
                    onEdit={() => navigate(`/customers/${selectedCustomer._id}/edit`)}
                />
            )}
            </Item>
            </Box>
       </Box>
       </div>
        </>

    );
};

export default CustomersPage;


   

