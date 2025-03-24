import { useState } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import axiosInstance from '../../utils/axiosConfig';
import { toast } from 'react-toastify';
import CustomerForm from './CustomerForm';
import EditCustomer from './EditCustomer';
import { useLogout } from '../../hooks/useLogout';
import { useNavigate } from 'react-router-dom';
import VehicleResearch from '../vehicle/VehicleResearch';
import AppointmentsDropdown from '../appointments/Appointments';

const CustomerSelectionBar = () => {
    const { 
        selectedCustomer, 
        setSelectedCustomer, 
        selectedVehicle, 
        setSelectedVehicle 
    } = useCustomer();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const { logout } = useLogout();
    const navigate = useNavigate();
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [serviceRequest, setServiceRequest] = useState({
        serviceType: '',
        description: '',
        priority: 'normal',
        preferredDate: '',
        additionalNotes: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [researchResults, setResearchResults] = useState(null);

    const handleSearch = async (value) => {
        setSearchTerm(value);
        if (!value.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await axiosInstance.get(`/customers/search?term=${value}`);
            setSearchResults(response.data);
        } catch (error) {
            toast.error('Error searching customers');
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectCustomer = (customer) => {
        setSelectedCustomer(customer);
        if (customer.vehicles && customer.vehicles.length > 0) {
            setSelectedVehicle(customer.vehicles[0]);
            setIsServiceModalOpen(true);
        } else {
            setSelectedVehicle(null);
        }
        setSearchTerm('');
        setSearchResults([]);
        toast.success(`Selected customer: ${customer.firstName} ${customer.lastName}`);
    };

    const handleVehicleSelect = (vehicle) => {
        setSelectedVehicle(vehicle);
        toast.success(`Selected vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}`);
    };

    const clearSelectedCustomer = () => {
        setSelectedCustomer(null);
        setSelectedVehicle(null);
        toast.info('Customer selection cleared');
    };

    const handleUpdateCustomer = async (updatedData) => {
        try {
            const response = await axiosInstance.put(`/customers/${selectedCustomer._id}`, updatedData);
            setSelectedCustomer(response.data);
            setIsEditing(false);
            toast.success('Customer updated successfully');
        } catch (error) {
            toast.error('Error updating customer');
            console.error('Update error:', error);
        }
    };

    const handleLogout = async () => {
        await logout();
    };

    const handleServiceSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            // First create the service request
            const response = await axiosInstance.post('/services/requests', {
                customerId: selectedCustomer._id,
                vehicleId: selectedVehicle._id,
                serviceType: serviceRequest.serviceType,
                description: serviceRequest.description,
                priority: serviceRequest.priority,
                preferredDate: serviceRequest.preferredDate,
                additionalNotes: serviceRequest.additionalNotes
            });

            if (response.data) {
                toast.success('Service request created successfully');
                
                // Then trigger AI research
                const researchResponse = await axiosInstance.post('/research/service', {
                    serviceRequest: response.data,
                    vehicle: selectedVehicle,
                    customer: selectedCustomer
                });

                if (researchResponse.data?.success) {
                    setResearchResults(researchResponse.data.result);
                    toast.success('AI research completed');
                } else {
                    toast.error('Error completing AI research');
                }
            }
        } catch (error) {
            console.error('Service request error:', error);
            const errorMessage = error.response?.data?.error || 'Error creating service request';
            toast.error(errorMessage);
            
            if (error.response?.status === 400) {
                // Handle validation errors
                const validationErrors = error.response.data.details;
                if (validationErrors) {
                    Object.entries(validationErrors).forEach(([field, message]) => {
                        toast.error(`${field}: ${message}`);
                    });
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
        <div className="bg-gray-800 border-b border-gray-700 p-4 w-full">
            <div className=" mx-auto">
                <div className="flex items-center justify-between">
                    {/* Selected Customer Display */}
                    <div className="flex items-center text-2xl space-x-4">
                        {selectedCustomer ? (
                            <>
                                <div className="flex items-center space-x-2">
                                    <span className="text-gray-400 text-2xl">Selected Customer:</span>
                                    <span className="text-white font-semibold text-2xl">
                                        {selectedCustomer.firstName} {selectedCustomer.lastName}
                                        
                                    </span>
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="text-blue-400 hover:text-blue-300 text-2xl"
                                    >
                                        View Details
                                    </button>


                                    <button
                                        onClick={clearSelectedCustomer}
                                        className="text-red-400 hover:text-red-300 text-2xl"
                                    >
                                        Clear

                                    </button>

                                </div>
                            </>
                        ) : (
                            <span className="text-white text-2xl">No customer selected</span>
                        )}
                    </div>

                    {/* Customer Search */}
                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Search customers..."
                            className="bg-gray-700 text-white text-2xl px-4 py-2 rounded-lg w-[25vw] focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        

                        {/* Search Results Dropdown */}
                        {searchTerm && (
                            <div className="absolute top-full text-2xl mt-2 w-full bg-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                                {isSearching ? (

                                    <div className="p-4 text-white text-2xl text-center">
                                        Searching...
                                    </div>

                                ) : searchResults.length > 0 ? (
                                    <div className="py-2">
                                        {searchResults.map((customer) => (
                                            <button
                                                key={customer._id}
                                                onClick={() => handleSelectCustomer(customer)}
                                                className="w-full text-left text-2xl px-4 py-2 hover:bg-gray-600 text-white"
                                            >
                                                <div>{customer.firstName} {customer.lastName}</div>
                                                <div className="text-2xl text-white">
                                                    {customer.email || customer.phoneNumber}
                                                    {customer.workphoneNumber}
                                                    {customer.address}
                                                    {customer.city}
                                                    {customer.zipCode}
                                                    {customer.notes}    
                                                    {customer.preferredContact}
                                                    

                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 text-white text-center">
                                        No customers found
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right side with logout */}
                    <div className="flex items-center space-x-4">
                        <AppointmentsDropdown />
                        {/* New logout button */}
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-xl transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Customer Details Modal */}
            {isModalOpen && !isEditing && (
                <div className="fixed text-xl inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 p-6 rounded-lg w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 max-h-[90vh] overflow-y-auto transform translate-y-0">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl text-white font-semibold">
                                Customer Details
                            </h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-blue-400 hover:text-blue-300"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setIsEditing(false);
                                    }}
                                    className="text-gray-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        
                        <div className="space-y-6 text-white">
                            {/* Personal Information */}
                            <div className="border-b border-gray-700 pb-4">
                                <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-400">Name</p>
                                        <p>{selectedCustomer.firstName} {selectedCustomer.lastName}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400">Email</p>
                                        <p>{selectedCustomer.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400">Phone Number</p>
                                        <p>{selectedCustomer.phoneNumber || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400">Work Phone</p>
                                        <p>{selectedCustomer.workphoneNumber || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400">Preferred Contact Method</p>
                                        <p>{selectedCustomer.preferredContact || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Address Information */}
                            <div className="border-b border-gray-700 pb-4">
                                <h3 className="text-lg font-semibold mb-3">Address</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-400">Street Address</p>
                                        <p>{selectedCustomer.address || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400">City</p>
                                        <p>{selectedCustomer.city || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400">State</p>
                                        <p>{selectedCustomer.state || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400">ZIP Code</p>
                                        <p>{selectedCustomer.zipCode || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Vehicles */}
                            <div className="border-b border-gray-700 pb-4 h-[50vh] overflow-y-auto ">
                                <h3 className="text-lg font-semibold mb-3">Vehicles</h3>
                                {selectedCustomer.vehicles && selectedCustomer.vehicles.length > 0 ? (
                                    <div className="space-y-4">
                                        {selectedCustomer.vehicles.map((vehicle, index) => (
                                            <div 
                                                key={vehicle._id || index} 
                                                className={`bg-gray-700 p-4 rounded-lg relative ${
                                                    selectedVehicle?._id === vehicle._id ? 'ring-2 ring-blue-500' : ''
                                                }`}
                                            >
                                                <div className="absolute top-4 right-4">
                                                    <input
                                                        type="radio"
                                                        name="selectedVehicle"
                                                        checked={selectedVehicle?._id === vehicle._id}
                                                        onChange={() => handleVehicleSelect(vehicle)}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-gray-400">Year</p>
                                                        <p>{vehicle.year}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-400">Make</p>
                                                        <p>{vehicle.make}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-400">Model</p>
                                                        <p>{vehicle.model}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-400">VIN</p>
                                                        <p>{vehicle.vin || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-400">Mileage</p>
                                                        <p>{vehicle.mileage || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-400">Last Service</p>
                                                        <p>{vehicle.lastService ? new Date(vehicle.lastService).toLocaleDateString() : 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-400">No vehicles registered</p>
                                )}
                            </div>

                            {/* Notes */}
                            {selectedCustomer.notes && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Notes</h3>
                                    <p className="text-gray-300 whitespace-pre-wrap">{selectedCustomer.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Customer Modal */}
            {isModalOpen && isEditing && (
                <div className="fixed text-xl inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 p-6 rounded-lg w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 max-h-[90vh] overflow-y-auto transform translate-y-0">
                        <div className="flex justify-between items-center mb-4">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
                            >
                                <span>←</span> Back to Details
                            </button>
                            <h2 className="text-xl text-white font-semibold">
                                Edit Customer
                            </h2>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setIsEditing(false);
                                }}
                                className="text-gray-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                        <CustomerForm 
                            customer={{
                                ...selectedCustomer,
                                vehicles: selectedVehicle ? [selectedVehicle] : selectedCustomer.vehicles
                            }}
                            onSubmit={(updatedData) => {
                                handleUpdateCustomer(updatedData);
                                setIsEditing(false);  // Return to details view after update
                            }}
                            onVehicleSelect={handleVehicleSelect}
                            isEditing={true}
                        />
                    </div>
                </div>
            )}
        </div>

        {/* Service Request Modal */}
        {isServiceModalOpen && selectedVehicle && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 p-6 rounded-lg w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-white">New Service Request</h2>
                        <button
                            onClick={() => {
                                setIsServiceModalOpen(false);
                                setResearchResults(null);
                            }}
                            className="text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>

                    <form onSubmit={handleServiceSubmit} className="space-y-6">
                        {/* Service Type */}
                        <div>
                            <label className="block text-gray-300 mb-2">Service Type</label>
                            <select
                                value={serviceRequest.serviceType}
                                onChange={(e) => setServiceRequest({...serviceRequest, serviceType: e.target.value})}
                                className="w-full bg-gray-700 text-white rounded p-2"
                                required
                            >
                                <option value="">Select Service Type</option>
                                <option value="maintenance">Regular Maintenance</option>
                                <option value="repair">Repair</option>
                                <option value="diagnostic">Diagnostic</option>
                                <option value="inspection">Inspection</option>
                            </select>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-gray-300 mb-2">Description</label>
                            <textarea
                                value={serviceRequest.description}
                                onChange={(e) => setServiceRequest({...serviceRequest, description: e.target.value})}
                                className="w-full bg-gray-700 text-white rounded p-2"
                                rows="3"
                                required
                                placeholder="Describe the service needed or issues being experienced..."
                            ></textarea>
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="block text-gray-300 mb-2">Priority</label>
                            <select
                                value={serviceRequest.priority}
                                onChange={(e) => setServiceRequest({...serviceRequest, priority: e.target.value})}
                                className="w-full bg-gray-700 text-white rounded p-2"
                            >
                                <option value="low">Low</option>
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>

                        {/* Preferred Date */}
                        <div>
                            <label className="block text-gray-300 mb-2">Preferred Service Date</label>
                            <input
                                type="date"
                                value={serviceRequest.preferredDate}
                                onChange={(e) => setServiceRequest({...serviceRequest, preferredDate: e.target.value})}
                                className="w-full bg-gray-700 text-white rounded p-2"
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        {/* Additional Notes */}
                        <div>
                            <label className="block text-gray-300 mb-2">Additional Notes</label>
                            <textarea
                                value={serviceRequest.additionalNotes}
                                onChange={(e) => setServiceRequest({...serviceRequest, additionalNotes: e.target.value})}
                                className="w-full bg-gray-700 text-white rounded p-2"
                                rows="2"
                                placeholder="Any additional information..."
                            ></textarea>
                        </div>

                        {/* Vehicle Research Component */}
                        <div className="border-t border-gray-700 pt-6">
                            <h3 className="text-xl font-semibold text-white mb-4">AI-Powered Research</h3>
                            <VehicleResearch />
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsServiceModalOpen(false);
                                    setResearchResults(null);
                                }}
                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 flex items-center space-x-2"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    'Create Service Request'
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Research Results */}
                    {researchResults && (
                        <div className="mt-8 border-t border-gray-700 pt-6">
                            <h3 className="text-xl font-semibold text-white mb-4">AI Research Results</h3>
                            <VehicleResearch initialResults={researchResults} />
                        </div>
                    )}
                </div>
            </div>
        )}

        {isEditing && (
            <EditCustomer 
                customer={selectedCustomer} 
                selectedVehicle={selectedVehicle}
                onClose={() => setIsEditing(false)}
            />
        )}
        </>
    );
};

export default CustomerSelectionBar; 