import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axiosInstance from '../../utils/axiosConfig';
import PropTypes from 'prop-types';
import { useCustomer } from '../../context/CustomerContext';
import { vehicleOptions, engineOptions, colorOptions } from '../../config/vehicleOptions';

const makes = Object.keys(vehicleOptions).map(key => ({
    value: key,
    label: vehicleOptions[key].name
}));
const CustomerForm = ({ onSubmit, onVehicleSelect }) => {
    const { selectedCustomer } = useCustomer();
    const [formData, setFormData] = useState({
        customerId: selectedCustomer?._id || '',
        firstName: selectedCustomer?.firstName || '',
        lastName: selectedCustomer?.lastName || '',
        year: new Date().getFullYear(),
        make: '',
        model: '',
        trim: '',
        vin: '',
        licensePlate: '',
        color: '',
        mileage: '',
        engine: '',
        transmission: '',
        fuelType: '',
        turbocharged: false,
        isAWD: false,
        is4x4: false,
        notes: '',
        status: 'active'
    });

    useEffect(() => {
        if (selectedCustomer) {
            // Spread customer data but exclude vehicles array
            const { vehicles, ...customerData } = selectedCustomer;
            
            // Get the first vehicle if it exists
            const vehicleData = vehicles?.[0] || {};
            
            setFormData(prev => ({
                ...prev,
                ...customerData,
                // Map vehicle fields
                year: vehicleData.year || '',
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
                isAWD: vehicleData.isAWD || false,
                is4x4: vehicleData.is4x4 || false,
                vehicleNotes: vehicleData.notes || ''
            }));
        }
    }, [selectedCustomer]);

    const [availableModels, setAvailableModels] = useState([]);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name === 'make') {
            // When make changes, update the available models
            const selectedMake = value.toLowerCase();
            const makeModels = vehicleOptions[selectedMake]?.models;
            
            // Handle both array and object model structures
            const models = Array.isArray(makeModels) 
                ? makeModels 
                : makeModels 
                    ? Object.keys(makeModels)
                    : [];
                    
            setAvailableModels(models);
            // Reset model when make changes
            setFormData(prev => ({
                ...prev,
                [name]: value,
                model: ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedCustomer) {
            toast.error('Please select a customer first');
            return;
        }

        setError('');
        setIsSubmitting(true);

        try {
            // Format the data into customerData and vehicleData
            const customerData = {
                firstName: selectedCustomer.firstName,
                lastName: selectedCustomer.lastName,
                email: selectedCustomer.email,
                phoneNumber: selectedCustomer.phoneNumber,
                address: selectedCustomer.address,
                city: selectedCustomer.city,
                zipCode: selectedCustomer.zipCode
            };

            const vehicleData = {
                year: formData.year,
                make: formData.make,
                model: formData.model,
                trim: formData.trim,
                licensePlate: formData.licensePlate,
                vin: formData.vin,
                color: formData.color,
                mileage: formData.mileage,
                engine: formData.engine,
                transmission: formData.transmission,
                fuelType: formData.fuelType,
                turbocharged: formData.turbocharged,
                isAWD: formData.isAWD,
                is4x4: formData.is4x4,
                notes: formData.notes,
                status: formData.status
            };

            // Add the vehicle to the selected customer
            const response = await axiosInstance.put(`/customers/${selectedCustomer._id}/with-vehicle`, {
                customerData,
                vehicleData
            });
            
            toast.success('Vehicle added successfully');
            onVehicleSelect(response.data);
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Failed to add vehicle';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Show message if no customer selected
    if (!selectedCustomer) {
        return (
            <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">No Customer Selected</h2>
                <p className="text-gray-300">
                    Please select a customer before adding a vehicle.
                </p>
            </div>
        );
    }

    // Rest of the component remains the same
    const makes = Object.keys(vehicleOptions).map(key => ({
        value: key,
        label: vehicleOptions[key].name
    }));

    const renderField = (label, name, type = 'text', options = null) => {
        const baseClasses = "w-full bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";
        
        if (type === 'select') {
            return (
                <div className="mb-4">
                    <label className="block text-gray-300 mb-2">{label}</label>
                    <select
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        className={baseClasses}
                    >
                        <option value="">Select {label}</option>
                        {name === 'make' && makes.map(make => (
                            <option key={make.value} value={make.value}>
                                {make.label}
                            </option>
                        ))}
                        {name === 'model' && availableModels.map(model => (
                            <option key={model} value={model}>
                                {model}
                            </option>
                        ))}
                        {name !== 'make' && name !== 'model' && options?.map(option => (
                            <option key={option} value={option}>
                                {typeof option === 'string' ? option.charAt(0).toUpperCase() + option.slice(1) : option}
                            </option>
                        ))}
                    </select>
                </div>
            );
        }

        if (type === 'checkbox') {
            return (
                <div className="mb-4 flex items-center">
                    <input
                        type="checkbox"
                        name={name}
                        checked={formData[name]}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <label className="ml-2 text-gray-300">{label}</label>
                </div>
            );
        }

    return (
            <div className="mb-4">
                <label className="block text-gray-300 mb-2">{label}</label>
                <input
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    className={baseClasses}
                />
            </div>
        );
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-xl w-full">
            <div className="bg-gray-700 p-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Add New Vehicle</h2>
                    {selectedCustomer && (
                        <p className="text-gray-400 text-sm mt-1">
                            Adding vehicle for: {selectedCustomer.firstName} {selectedCustomer.lastName}
                        </p>
                    )}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
                {error && (
                    <div className="mb-4 bg-red-900 text-white p-3 rounded">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderField('Year', 'year', 'number')}
                    {renderField('Make', 'make', 'select')}
                    {renderField('Model', 'model', 'select')}
                    {renderField('Trim', 'trim')}
                    {renderField('License Plate', 'licensePlate')}
                    {renderField('VIN', 'vin')}
                    {renderField('Color', 'color', 'select', colorOptions)}
                    {renderField('Mileage', 'mileage', 'number')}
                    {renderField('Engine', 'engine', 'select', engineOptions)}
                    {renderField('Transmission', 'transmission', 'select', ['automatic', 'manual', 'cvt'])}
                    {renderField('Fuel Type', 'fuelType', 'select', ['gasoline', 'diesel', 'electric', 'hybrid'])}
                    {renderField('Turbocharged', 'turbocharged', 'checkbox')}
                    {renderField('AWD', 'isAWD', 'checkbox')}
                    {renderField('4x4', 'is4x4', 'checkbox')}
                </div>

                <div className="mt-4">
                    {renderField('Notes', 'notes', 'textarea')}
                </div>

                <div className="flex justify-end mt-6 pt-4 border-t border-gray-700">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors
                            ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? 'Adding...' : 'Add Vehicle'}
                    </button>
                </div>
            </form>
        </div>
    );
};

CustomerForm.propTypes = {
    onSubmit: PropTypes.func,
    onVehicleSelect: PropTypes.func.isRequired
};

export default CustomerForm;