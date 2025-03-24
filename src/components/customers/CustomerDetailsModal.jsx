import { useNavigate } from 'react-router-dom';

const CustomerDetailsModal = ({ customer, onClose }) => {
    const navigate = useNavigate();

    if (!customer) return null;

    const handleEdit = () => {
        navigate(`/customers/${customer._id}/edit`);
        onClose();
    };

    const vehicle = customer.vehicles && customer.vehicles[0];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white">
                        Customer Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Customer Information */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium text-white mb-3">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-gray-400">Name</label>
                                <p className="text-white font-medium">
                                    {customer.firstName} {customer.lastName}
                                </p>
                            </div>
                            <div>
                                <label className="text-gray-400">Email</label>
                                <p className="text-white">{customer.email || 'Not provided'}</p>
                            </div>
                            <div>
                                <label className="text-gray-400">Phone</label>
                                <p className="text-white">{customer.phoneNumber || 'Not provided'}</p>
                            </div>
                            <div>
                                <label className="text-gray-400">Work Phone</label>
                                <p className="text-white">{customer.workphoneNumber || 'Not provided'}</p>
                            </div>
                            <div>
                                <label className="text-gray-400">Address</label>
                                <p className="text-white">{customer.address || 'Not provided'}</p>
                            </div>
                            <div>
                                <label className="text-gray-400">City</label>
                                <p className="text-white">{customer.city || 'Not provided'}</p>
                            </div>
                            <div>
                                <label className="text-gray-400">Zip Code</label>
                                <p className="text-white">{customer.zipCode || 'Not provided'}</p>
                            </div>
                            <div>
                                <label className="text-gray-400">Preferred Contact</label>
                                <p className="text-white capitalize">{customer.preferredContact || 'Not specified'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Vehicle Information */}
                    {vehicle && (
                        <div>
                            <h3 className="text-lg font-medium text-white mb-3">Vehicle Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-gray-400">Vehicle</label>
                                    <p className="text-white">
                                        {[
                                            vehicle.year,
                                            vehicle.make && vehicle.make.charAt(0).toUpperCase() + vehicle.make.slice(1),
                                            vehicle.model,
                                            vehicle.trim
                                        ].filter(Boolean).join(' ')}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-gray-400">VIN</label>
                                    <p className="text-white">{vehicle.vin || 'Not provided'}</p>
                                </div>
                                <div>
                                    <label className="text-gray-400">License Plate</label>
                                    <p className="text-white">{vehicle.licensePlate || 'Not provided'}</p>
                                </div>
                                <div>
                                    <label className="text-gray-400">Color</label>
                                    <p className="text-white capitalize">{vehicle.color || 'Not provided'}</p>
                                </div>
                                <div>
                                    <label className="text-gray-400">Mileage</label>
                                    <p className="text-white">{vehicle.mileage ? `${vehicle.mileage.toLocaleString()} miles` : 'Not provided'}</p>
                                </div>
                                <div>
                                    <label className="text-gray-400">Engine</label>
                                    <p className="text-white capitalize">{vehicle.engine || 'Not provided'}</p>
                                </div>
                                <div>
                                    <label className="text-gray-400">Transmission</label>
                                    <p className="text-white capitalize">{vehicle.transmission || 'Not provided'}</p>
                                </div>
                                <div>
                                    <label className="text-gray-400">Fuel Type</label>
                                    <p className="text-white capitalize">{vehicle.fuelType || 'Not provided'}</p>
                                </div>
                                <div>
                                    <label className="text-gray-400">Features</label>
                                    <p className="text-white">
                                        {[
                                            vehicle.turbocharged && 'Turbocharged',
                                            vehicle.isAWD && 'AWD',
                                            vehicle.is4x4 && '4x4'
                                        ].filter(Boolean).join(', ') || 'None'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-gray-400">Status</label>
                                    <p className="text-white capitalize">{vehicle.status || 'Not provided'}</p>
                                </div>
                            </div>
                            {vehicle.notes && (
                                <div className="mt-4">
                                    <label className="text-gray-400">Vehicle Notes</label>
                                    <p className="text-white">{vehicle.notes}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Customer Notes */}
                    {customer.notes && (
                        <div>
                            <h3 className="text-lg font-medium text-white mb-3">Additional Information</h3>
                            <div>
                                <label className="text-gray-400">Customer Notes</label>
                                <p className="text-white">{customer.notes}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex space-x-3">
                    <button
                        onClick={handleEdit}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Edit Customer
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetailsModal; 