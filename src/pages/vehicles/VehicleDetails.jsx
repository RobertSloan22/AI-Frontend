import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosConfig';
import PropTypes from 'prop-types';
import VehicleSelectionModal from '../../components/vehicles/VehicleSelectionModal';
import VehicleSearch from '../../components/vehicle/VehicleSearch';

const VehicleDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVehicle = async () => {
            try {
                const response = await axiosInstance.get(`/vehicles/${id}`);
                setVehicle(response.data);
            } catch (error) {
                console.error('Error fetching vehicle:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVehicle();
    }, [id]);

    const renderField = (label, value) => {
        if (value === undefined || value === null || value === '') return null;
        return (
            <div className="mb-4">
                <label className="text-gray-400 text-xl">{label}</label>
                <p className="text-white text-xl">
                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                </p>
            </div>
        );
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );

    if (!vehicle) return (
        <div className="bg-red-900 bg-opacity-50 border-l-4 border-red-500 text-white p-4 rounded-lg">
            Vehicle not found
        </div>
    );

    return (
        <div className="p-4 bg-gray-900 bg-opacity-75 rounded-lg shadow-lg">
            {/* Header with back button */}
            <div className="mb-4 p-4 bg-gray-800 bg-opacity-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex justify-between items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        ← Back
                    </button>
                    <h2 className="text-2xl font-bold text-white">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                        {vehicle.trim && ` ${vehicle.trim}`}
                    </h2>
                </div>
            </div>

            {/* Vehicle Info Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="p-4 bg-gray-800 bg-opacity-50 rounded-lg">
                        <h3 className="text-xl font-semibold text-blue-400 mb-4 border-b border-gray-700 pb-2">
                            Vehicle Information
                        </h3>
                        {renderField('VIN', vehicle.vin)}
                        {renderField('License Plate', vehicle.licensePlate)}
                        {renderField('Color', vehicle.color)}
                        {renderField('Mileage', vehicle.mileage && `${vehicle.mileage.toLocaleString()} miles`)}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="p-4 bg-gray-800 bg-opacity-50 rounded-lg">
                        <h3 className="text-xl font-semibold text-blue-400 mb-4 border-b border-gray-700 pb-2">
                            Technical Specifications
                        </h3>
                        {renderField('Engine', vehicle.engine)}
                        {renderField('Transmission', vehicle.transmission)}
                        {renderField('Fuel Type', vehicle.fuelType)}
                        {renderField('Turbocharged', vehicle.turbocharged)}
                        {renderField('AWD', vehicle.isAWD)}
                        {renderField('4x4', vehicle.is4x4)}
                    </div>
                </div>
            </div>

            {/* Notes Section */}
            {vehicle.notes && (
                <div className="mt-6 p-4 bg-gray-800 bg-opacity-50 rounded-lg">
                    <h3 className="text-xl font-semibold text-blue-400 mb-4 border-b border-gray-700 pb-2">
                        Notes
                    </h3>
                    <p className="text-white text-xl whitespace-pre-wrap">{vehicle.notes}</p>
                </div>
            )}
        </div>
    );
};

export default VehicleDetails;