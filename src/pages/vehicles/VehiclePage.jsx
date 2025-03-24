import { useEffect, useRef, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

import VehicleList from './VehicleList';
import VehicleDetails from './VehicleDetails';
import VehicleDetailsModal from '../../components/vehicle/VehicleDetailsModal';
import CustomerContextDisplay from '../../components/customer/CustomerContextDisplay';
import VehicleSelectionModal from '../../components/vehicles/VehicleSelectionModal';
import TechnicianList from '../technicians/TechnicianList';
import TechnicianDetails from '../technicians/TechnicianDetails';
import TechnicianDashboard from '../technicians/TechnicianDashboard';
import MessageContainer from '../../components/messages/MessageContainer';
import axiosInstance from '../../utils/axiosConfig';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: 'transparent',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.primary,
    ...theme.applyStyles('dark', {}),
}));

const VehiclePage = () => {
    const { id } = useParams();
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);

    const handleVehicleSelect = (vehicle) => {
        setSelectedVehicle(vehicle);
        setIsDetailsModalOpen(true);
    };

    const handleAddVehicle = () => {
        setIsSelectionModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsDetailsModalOpen(false);
        setIsSelectionModalOpen(false);
        setSelectedVehicle(null);
    };

    return (
        <>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
                    gridTemplateRows: 'auto',
                    gap: 2,
                    minHeight: '100vh',
                    width: '100%',
                    padding: 2,
                    overflowY: 'auto',
                    maxHeight: '100vh',
                }}
            >
                <Box sx={{ gridColumn: '1 / span 2', gridRow: '1' }}>
                    <CustomerContextDisplay />
                </Box>
                
                <Box sx={{ gridColumn: '5 / span 6', gridRow: '1 / span 1' }}>
                    <TechnicianDashboard />
                    <TechnicianList />
                    <TechnicianDetails />
                </Box>
                
                <Box sx={{ gridColumn: '3 / span 5', gridRow: '1 / span 4' }}>
                    <div className="justify-between w-[100vw] items-center mb-6">
                        <h1 className="text-base font-bold text-white">Vehicles</h1>
                        <button
                            onClick={handleAddVehicle}
                            className="bg-blue-600 text-white px-8 py-8 rounded hover:bg-blue-700 transition-colors"
                        >
                            Add Vehicle
                        </button>
                    </div>
                    
                    <VehicleList onVehicleSelect={handleVehicleSelect} />
                    
                    {isDetailsModalOpen && selectedVehicle && (
                        <VehicleDetailsModal vehicle={selectedVehicle} onClose={handleCloseModals} />
                    )}
                    
                    {isSelectionModalOpen && (
                        <VehicleSelectionModal onClose={handleCloseModals} onVehicleSelect={handleVehicleSelect} />
                    )}
                    
                    {id && <VehicleDetails />}
                </Box>
            </Box>
            
            <MessageContainer />
        </>
    );
};

export default VehiclePage;