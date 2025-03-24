import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import { toast } from 'react-hot-toast';
import NewCustomerForm from './NewCustomerForm';
import { Box, Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { vehicleOptions, engineOptions, colorOptions } from '../../config/vehicleOptions';

// Add this before the component
const makes = Object.keys(vehicleOptions).map(key => ({
    value: key,
    label: vehicleOptions[key].name
}));

const EditCustomer = ({ customer, selectedVehicle, onClose }) => {
    const navigate = useNavigate();
    const [customerData, setCustomerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [availableModels, setAvailableModels] = useState([]);

    useEffect(() => {
        const setupCustomerData = async () => {
            try {
                setLoading(true);
                
                if (customer && selectedVehicle) {
                    // Set available models based on the selected make
                    if (selectedVehicle.make) {
                        const models = vehicleOptions[selectedVehicle.make.toLowerCase()]?.models || [];
                        setAvailableModels(models);
                    }

                    // Combine customer and vehicle data with proper structure
                    const combinedData = {
                        // Customer fields
                        _id: customer._id,
                        firstName: customer.firstName,
                        lastName: customer.lastName,
                        email: customer.email,
                        phoneNumber: customer.phoneNumber,
                        address: customer.address,
                        city: customer.city,
                        zipCode: customer.zipCode,
                        notes: customer.notes,

                        // Vehicle fields
                        year: selectedVehicle.year || new Date().getFullYear(),
                        make: selectedVehicle.make || '',
                        model: selectedVehicle.model || '',
                        trim: selectedVehicle.trim || '',
                        vin: selectedVehicle.vin || '',
                        licensePlate: selectedVehicle.licensePlate || '',
                        color: selectedVehicle.color || '',
                        mileage: selectedVehicle.mileage || '',
                        engine: selectedVehicle.engine || '',
                        transmission: selectedVehicle.transmission || '',
                        fuelType: selectedVehicle.fuelType || '',
                        turbocharged: selectedVehicle.turbocharged || false,
                        isAWD: selectedVehicle.isAWD || false,
                        is4x4: selectedVehicle.is4x4 || false,
                        vehicleNotes: selectedVehicle.notes || ''
                    };
                    setCustomerData(combinedData);
                } else if (customer?._id) {
                    // Fetch complete data if not provided
                    const [customerRes, vehiclesRes] = await Promise.all([
                        axiosInstance.get(`/customers/${customer._id}`),
                        axiosInstance.get(`/customers/${customer._id}/vehicles`)
                    ]);

                    const vehicleData = vehiclesRes.data.length > 0 ? vehiclesRes.data[0] : {};
                    
                    // Set available models if there's a make
                    if (vehicleData.make) {
                        const models = vehicleOptions[vehicleData.make.toLowerCase()]?.models || [];
                        setAvailableModels(models);
                    }

                    const combinedData = {
                        // Customer fields
                        _id: customerRes.data._id,
                        firstName: customerRes.data.firstName,
                        lastName: customerRes.data.lastName,
                        email: customerRes.data.email,
                        phoneNumber: customerRes.data.phoneNumber,
                        address: customerRes.data.address,
                        city: customerRes.data.city,
                        zipCode: customerRes.data.zipCode,
                        notes: customerRes.data.notes,

                        // Vehicle fields
                        year: vehicleData.year || new Date().getFullYear(),
                        make: vehicleData.make || '',
                        model: vehicleData.model || '',
                        trim: vehicleData.trim || '',
                        vin: vehicleData.vin || '',
                        licensePlate: vehicleData.licensePlate || '',
                        color: vehicleData.color || '',
                        mileage: vehicleData.mileage || '',
                        engine: vehicleData.engine || '',
                        transmission: vehicleData.transmission || '',
                        fuelType: vehicleData.fuelType || '',
                        turbocharged: vehicleData.turbocharged || false,
                        isAWD: vehicleData.isAWD || false,
                        is4x4: vehicleData.is4x4 || false,
                        vehicleNotes: vehicleData.notes || ''
                    };
                    setCustomerData(combinedData);
                }
            } catch (error) {
                console.error('Error setting up customer data:', error);
                setError('Failed to load customer information');
                toast.error('Error loading customer data');
            } finally {
                setLoading(false);
            }
        };

        setupCustomerData();
    }, [customer, selectedVehicle]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name === 'make') {
            const selectedMake = value.toLowerCase();
            const models = vehicleOptions[selectedMake]?.models || [];
            setAvailableModels(models);
            setCustomerData(prev => ({
                ...prev,
                [name]: value,
                model: '' // Reset model when make changes
            }));
        } else {
            setCustomerData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    if (loading) {
        return (
            <Box className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </Box>
        );
    }

    if (error) {
        return (
            <Box className="bg-red-900 bg-opacity-50 border-l-4 border-red-500 text-white p-4 rounded-lg">
                {error}
            </Box>
        );
    }

    return (
        <Box className="w-full max-w-4xl mx-auto p-6">
            <Box className="flex items-center justify-between mb-6">
                <Button
                    onClick={onClose}
                    startIcon={<ArrowBackIcon />}
                    variant="contained"
                    color="primary"
                    className="bg-gray-600 hover:bg-gray-700"
                >
                    Back
                </Button>
                <Typography variant="h4" component="h2" className="text-white font-bold">
                   Create New Customer
                </Typography>
            </Box>

            <Box className="bg-gray-800 rounded-lg p-6">
                <NewCustomerForm 
                    initialData={customerData} 
                    onSuccess={() => {
                        toast.success('Customer updated successfully');
                        onClose();
                    }}
                    isEditing={true}
                />
            </Box>
        </Box>
    );
};

export default EditCustomer;