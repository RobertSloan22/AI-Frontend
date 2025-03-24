import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import axiosInstance from '../../utils/axiosConfig';
import { useCustomer } from '../../context/CustomerContext';
import { Container, Grid } from '@mui/material';
import VehicleDetailsModal from '../../components/vehicle/VehicleDetailsModal';
import { setCurrentVehicle } from '../../redux/slices/vehicleSlice';

const VehicleList = () => {
    // Redux
    const dispatch = useDispatch();
    
    // State management
    const { selectedCustomer } = useCustomer();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    
    // Fetch vehicles on component mount
    useEffect(() => {
        if (selectedCustomer?._id) {
            fetchCustomerVehicles(selectedCustomer._id);
        } else {
            fetchVehicles();
        }
    }, [selectedCustomer]);

    // Main fetch function
    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/vehicles');
            setVehicles(response.data);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
            toast.error('Failed to fetch vehicles');
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomerVehicles = async (customerId) => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/customers/${customerId}/vehicles`);
            setVehicles(response.data);
        } catch (error) {
            console.error('Error fetching customer vehicles:', error);
            toast.error('Failed to fetch vehicles');
        } finally {
            setLoading(false);
        }
    };

    // Handle vehicle selection
    const handleVehicleSelect = (vehicle) => {
        setSelectedVehicle(vehicle);
        dispatch(setCurrentVehicle(vehicle));
        setShowVehicleModal(true);
    };

    return (
        <Container>
            {/* Vehicle List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="text-center text-white py-8">Loading...</div>
                ) : (
                    <Grid container spacing={3}>
                        {vehicles.map((vehicle) => (
                            <Grid item xs={12} md={6} lg={4} key={vehicle._id}>
                                <div 
                                    className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 cursor-pointer"
                                    onClick={() => handleVehicleSelect(vehicle)}
                                >
                                    <h3 className="text-base font-semibold text-white">
                                        {vehicle.year} {vehicle.make} {vehicle.model}
                                    </h3>
                                    <p className="text-gray-400 text-base">VIN: {vehicle.vin}</p>
                                    <p className="text-gray-400 text-base">
                                        Owner: {vehicle.customerName}
                                    </p>
                                    <p className="text-gray-400 text-base">
                                        Mileage: {vehicle.mileage?.toLocaleString()}
                                    </p>
                                </div>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </div>

            {/* Modals */}
            {showVehicleModal && (
                <VehicleDetailsModal
                    vehicle={selectedVehicle}
                    onClose={() => setShowVehicleModal(false)}
                />
            )}
        </Container>
    );
};

export default VehicleList; 