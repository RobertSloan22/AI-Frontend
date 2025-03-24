import { useState } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import { toast } from 'react-hot-toast';
import { vehicleOptions, engineOptions, colorOptions } from '../../config/vehicleOptions';

const NewCustomerForm = ({ onSuccess }) => {
    const [customerData, setCustomerData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        address: '',
        city: '',
        zipCode: '',
    });

    const [vehicleData, setVehicleData] = useState({
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

    const [availableModels, setAvailableModels] = useState([]);
    const [availableTrims, setAvailableTrims] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCustomerChange = (e) => {
        const { name, value } = e.target;
        setCustomerData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleVehicleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name === 'make') {
            const selectedMake = value.toLowerCase();
            const makeModels = vehicleOptions[selectedMake]?.models;
            
            // Handle both array and object model structures
            const models = Array.isArray(makeModels) 
                ? makeModels 
                : makeModels 
                    ? Object.keys(makeModels)
                    : [];
                    
            setAvailableModels(models);
            setVehicleData(prev => ({
                ...prev,
                [name]: value,
                model: '',
                trim: ''
            }));
            setAvailableTrims([]);
        } else if (name === 'model') {
            const selectedMake = vehicleData.make.toLowerCase();
            const makeModels = vehicleOptions[selectedMake]?.models;
            
            // Handle both array and object model structures for trims
            const trims = Array.isArray(makeModels)
                ? [] // If models is an array, there are no trims
                : makeModels?.[value] || [];
                
            setAvailableTrims(trims);
            setVehicleData(prev => ({
                ...prev,
                [name]: value,
                trim: ''
            }));
        } else {
            setVehicleData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // First create the customer
            const customerResponse = await axiosInstance.post('/customers', customerData);
            
            // Then update the customer with vehicle information
            if (customerResponse.data._id) {
                await axiosInstance.put(`/customers/${customerResponse.data._id}/with-vehicle`, {
                    vehicleData
                });
            }
            
            toast.success('Customer and vehicle created successfully');
            if (onSuccess) {
                onSuccess(customerResponse.data);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error(error.response?.data?.error || 'Error saving customer and vehicle');
        } finally {
            setIsSubmitting(false);
        }
    };

    const makes = Object.keys(vehicleOptions).map(key => ({
        value: key,
        label: vehicleOptions[key].name
    }));

    return (
        <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Information Section */}
                <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-2xl font-medium text-white mb-4">Customer Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            name="firstName"
                            placeholder="First Name"
                            value={customerData.firstName}
                            onChange={handleCustomerChange}
                            className="w-full p-2 bg-gray-700 rounded text-lg text-white"
                            required
                        />
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Last Name"
                            value={customerData.lastName}
                            onChange={handleCustomerChange}
                            className="w-full p-2 bg-gray-700 rounded text-lg text-white"
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={customerData.email}
                            onChange={handleCustomerChange}
                            className="w-full p-2 bg-gray-700 rounded text-lg text-white"
                            required
                        />
                        <input
                            type="tel"
                            name="phoneNumber"
                            placeholder="Phone Number"
                            value={customerData.phoneNumber}
                            onChange={handleCustomerChange}
                            className="w-full p-2 bg-gray-700 text-lg rounded text-white"
                            required
                        />
                        <input
                            type="text"
                            name="address"
                            placeholder="Address"
                            value={customerData.address}
                            onChange={handleCustomerChange}
                            className="w-full p-2 bg-gray-700 text-lg rounded text-white"
                            required
                        />
                        <input
                            type="text"
                            name="city"
                            placeholder="City"
                            value={customerData.city}
                            onChange={handleCustomerChange}
                            className="w-full p-2 bg-gray-700 text-lg rounded text-white"
                            required
                        />
                        <input
                            type="text"
                            name="zipCode"
                            placeholder="ZIP Code"
                            value={customerData.zipCode}
                            onChange={handleCustomerChange}
                            className="w-full p-2 bg-gray-700 text-lg rounded text-white"
                            required
                        />
                    </div>
                </div>

                {/* Vehicle Information Section */}
                <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-2xl font-medium text-white mb-4">Vehicle Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="number"
                            name="year"
                            placeholder="Year"
                            value={vehicleData.year}
                            onChange={handleVehicleChange}
                            className="w-full p-2 bg-gray-700 text-lg rounded text-white"
                        />
                        <select
                            name="make"
                            value={vehicleData.make}
                            onChange={handleVehicleChange}
                            className="w-full p-2 bg-gray-700 text-lg rounded text-white"
                        >
                            <option value="">Select Make</option>
                            {makes.map(make => (
                                <option key={make.value} value={make.value}>
                                    {make.label}
                                </option>
                            ))}
                        </select>
                        <select
                            name="model"
                            value={vehicleData.model}
                            onChange={handleVehicleChange}
                            className="w-full p-2 bg-gray-700 text-lg rounded text-white"
                        >
                            <option value="">Select Model</option>
                            {availableModels.map(model => (
                                <option key={model} value={model}>{model}</option>
                            ))}
                        </select>
                        <select
                            name="trim"
                            value={vehicleData.trim}
                            onChange={handleVehicleChange}
                            className="w-full p-2 bg-gray-700 text-lg rounded text-white"
                        >
                            <option value="">Select Trim</option>
                            {availableTrims.map(trim => (
                                <option key={trim} value={trim}>{trim}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            name="licensePlate"
                            placeholder="License Plate"
                            value={vehicleData.licensePlate}
                            onChange={handleVehicleChange}
                            className="w-full p-2 bg-gray-700 text-lg rounded text-white"
                        />
                        <input
                            type="text"
                            name="vin"
                            placeholder="VIN"
                            value={vehicleData.vin}
                            onChange={handleVehicleChange}
                            className="w-full p-2 bg-gray-700 text-lg rounded text-white"
                        />
                        <select
                            name="color"
                            value={vehicleData.color}
                            onChange={handleVehicleChange}
                            className="w-full p-2 bg-gray-700 text-lg rounded text-white"
                        >
                            <option value="">Select Color</option>
                            {colorOptions.map(color => (
                                <option key={color} value={color}>{color}</option>
                            ))}
                        </select>
                        <input
                            type="number"
                            name="mileage"
                            placeholder="Mileage"
                            value={vehicleData.mileage}
                            onChange={handleVehicleChange}
                            className="w-full p-2 bg-gray-700 text-lg rounded text-white"
                        />
                        <select
                            name="engine"
                            value={vehicleData.engine}
                            onChange={handleVehicleChange}
                            className="w-full p-2 bg-gray-700 text-lg rounded text-white"
                        >
                            <option value="">Select Engine</option>
                            {engineOptions.map(engine => (
                                <option key={engine} value={engine}>{engine}</option>
                            ))}
                        </select>
                        <select
                            name="transmission"
                            value={vehicleData.transmission}
                            onChange={handleVehicleChange}
                            className="w-full p-2 bg-gray-700 text-lg rounded text-white"
                        >
                            <option value="">Select Transmission</option>
                            {['automatic', 'manual', 'cvt'].map(trans => (
                                <option key={trans} value={trans}>
                                    {trans.charAt(0).toUpperCase() + trans.slice(1)}
                                </option>
                            ))}
                        </select>
                        <select
                            name="fuelType"
                            value={vehicleData.fuelType}
                            onChange={handleVehicleChange}
                            className="w-full p-2 bg-gray-700 text-lg rounded text-white"
                        >
                            <option value="">Select Fuel Type</option>
                            {['gasoline', 'diesel', 'electric', 'hybrid'].map(fuel => (
                                <option key={fuel} value={fuel}>
                                    {fuel.charAt(0).toUpperCase() + fuel.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <label className="flex items-center text-lg space-x-2">
                            <input
                                type="checkbox"
                                name="turbocharged"
                                checked={vehicleData.turbocharged}
                                onChange={handleVehicleChange}
                                className="w-4 h-4 bg-gray-700 text-lg rounded"
                            />
                            <span className="text-white">Turbocharged</span>
                        </label>
                        <label className="flex items-center text-lg space-x-2">
                            <input
                                type="checkbox"
                                name="isAWD"
                                checked={vehicleData.isAWD}
                                onChange={handleVehicleChange}
                                className="w-4 h-4 bg-gray-700 text-lg rounded"
                            />
                            <span className="text-white">AWD</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                name="is4x4"
                                checked={vehicleData.is4x4}
                                onChange={handleVehicleChange}
                                className="w-4 h-4 bg-gray-700 text-lg rounded"
                            />
                            <span className="text-white text-lg">4x4</span>
                        </label>
                    </div>

                    <div className="mt-4">
                        <textarea
                            name="notes"
                            placeholder="Notes"
                            value={vehicleData.notes}
                            onChange={handleVehicleChange}
                            className="w-full text-lg p-2 bg-gray-700 rounded text-white h-24"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full p-2 bg-blue-600 text-white rounded  text-lg hover:bg-blue-700 
                        ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isSubmitting ? 'Creating...' : 'Create Customer & Vehicle'}
                </button>
            </form>
        </div>
    );
};

export default NewCustomerForm;