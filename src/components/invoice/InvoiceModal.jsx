import { useState, useEffect } from 'react';
import { format, isValid } from 'date-fns';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosConfig';

const InvoiceModal = ({ isOpen, onClose, invoice, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedInvoice, setEditedInvoice] = useState(() => ({
        status: 'draft',
        customerName: '',
        customerEmail: '',
        phoneNumber: '',
        address: '',
        laborItems: [],
        partsItems: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        ...(invoice || {})
    }));
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (invoice) {
            setEditedInvoice(JSON.parse(JSON.stringify(invoice)));
        }
    }, [invoice]);

    if (!isOpen) return null;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return isValid(date) ? format(date, 'MMM dd, yyyy') : 'N/A';
    };

    const getStatusBadgeClass = (status = 'draft') => {
        switch (status?.toLowerCase()) {
            case 'draft': return 'bg-yellow-600';
            case 'completed': return 'bg-green-600';
            case 'billed': return 'bg-blue-600';
            default: return 'bg-gray-600';
        }
    };

    const formatStatus = (status = 'draft') => {
        return (status?.charAt(0)?.toUpperCase() + status?.slice(1)) || 'Draft';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedInvoice(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleStatusChange = (e) => {
        setEditedInvoice(prev => ({
            ...prev,
            status: e.target.value
        }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            if (!editedInvoice._id) {
                throw new Error('Invalid invoice ID');
            }
            
            const updateData = {
                ...editedInvoice,
                status: editedInvoice.status
            };
            
            await axiosInstance.put(`/invoices/${editedInvoice._id}`, updateData);
            toast.success('Invoice updated successfully');
            setIsEditing(false);
            if (onUpdate) onUpdate(updateData);
        } catch (error) {
            toast.error('Failed to update invoice: ' + (error.message || 'Unknown error'));
            console.error('Error updating invoice:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-gray-900 text-gray-300 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
                {/* Header */}
                <div className="sticky top-0 bg-gray-900 p-6 border-b border-gray-700 z-10">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-bold text-white">Invoice Details</h2>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(editedInvoice?.status)}`}>
                                {formatStatus(editedInvoice?.status)}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Edit
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-500"
                                    >
                                        {loading ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditedInvoice(invoice);
                                        }}
                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </>
                            )}
                            <button 
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {isEditing && (
                        <div className="mt-4">
                            <label className="block text-xl font-medium mb-2 text-gray-400">Status</label>
                            <select
                                value={editedInvoice.status}
                                onChange={handleStatusChange}
                                className="w-full p-2  text-xl bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="draft">Draft</option>
                                <option value="completed">Completed</option>
                                <option value="billed">Billed</option>
                            </select>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Customer Information */}
                        <div className="bg-gray-800 p-6 rounded-lg border-l-4 border-blue-500">
                            <h3 className="text-2xl font-semibold text-blue-400 mb-4">Customer Information</h3>
                            <div className="space-y-3">
                                {isEditing ? (
                                    <>
                                        <input
                                            type="text"
                                            name="customerName"
                                            value={editedInvoice.customerName}
                                            onChange={handleChange}
                                            placeholder="Customer Name"
                                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                        />
                                        <input
                                            type="email"
                                            name="customerEmail"
                                            value={editedInvoice.customerEmail}
                                            onChange={handleChange}
                                            placeholder="Email"
                                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                        />
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            value={editedInvoice.phoneNumber}
                                            onChange={handleChange}
                                            placeholder="Phone"
                                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                        />
                                        <input
                                            type="text"
                                            name="address"
                                            value={editedInvoice.address}
                                            onChange={handleChange}
                                            placeholder="Address"
                                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Name:</span>
                                            <span className="text-white">{editedInvoice.customerName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Email:</span>
                                            <span className="text-white">{editedInvoice.customerEmail}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Phone:</span>
                                            <span className="text-white">{editedInvoice.phoneNumber}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Address:</span>
                                            <span className="text-white">{editedInvoice.address}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Date:</span>
                                            <span className="text-white">{formatDate(editedInvoice.invoiceDate)}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Vehicle Information */}
                        <div className="bg-gray-800 p-6 rounded-lg border-l-4 border-green-500">
                            <h3 className="text-2xl font-semibold text-green-400 mb-4">Vehicle Information</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Vehicle:</span>
                                    <span className="text-white">{editedInvoice.vehicleType}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">VIN:</span>
                                    <span className="text-white">{editedInvoice.vehicleVin}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Mileage:</span>
                                    <span className="text-white">{editedInvoice.vehicleMileage}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Engine:</span>
                                    <span className="text-white">{editedInvoice.vehicleEngine}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Transmission:</span>
                                    <span className="text-white">{editedInvoice.vehicleTransmission}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Labor Items */}
                    <div className="bg-gray-800 p-6 rounded-lg border-l-4 border-yellow-500">
                        <h3 className="text-2xl font-semibold text-yellow-400 mb-4">Labor Items</h3>
                        {editedInvoice.laborItems?.length > 0 ? (
                            <div className="space-y-3">
                                {editedInvoice.laborItems.map((item, index) => (
                                    <div key={index} className="bg-gray-700 p-4 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-white">{item.description}</p>
                                                <p className="text-sm text-gray-400">
                                                    {item.hours} hrs × ${item.ratePerHour}/hr
                                                </p>
                                            </div>
                                            <p className="text-lg font-medium text-white">
                                                ${(item.hours * item.ratePerHour).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 italic">No labor items</p>
                        )}
                    </div>

                    {/* Parts Items */}
                    <div className="bg-gray-800 p-6 rounded-lg border-l-4 border-purple-500">
                        <h3 className="text-2xl font-semibold text-purple-400 mb-4">Parts</h3>
                        {editedInvoice.partsItems?.length > 0 ? (
                            <div className="space-y-3">
                                {editedInvoice.partsItems.map((item, index) => (
                                    <div key={index} className="bg-gray-700 p-4 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-white">{item.description}</p>
                                                <p className="text-sm text-gray-400">
                                                    Part #: {item.partNumber} | Qty: {item.quantity} × ${item.price}
                                                </p>
                                            </div>
                                            <p className="text-lg font-medium text-white">
                                                ${(item.quantity * item.price).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-400 italic">No parts items</p>
                        )}
                    </div>

                    {/* Totals */}
                    <div className="bg-gray-800 p-6 rounded-lg border-l-4 border-blue-500">
                        <div className="grid grid-cols-2 gap-4 text-lg">
                            <div className="text-right text-gray-400">Subtotal:</div>
                            <div className="text-white">${editedInvoice.subtotal?.toFixed(2) || '0.00'}</div>
                            <div className="text-right text-gray-400">Tax (7%):</div>
                            <div className="text-white">${editedInvoice.tax?.toFixed(2) || '0.00'}</div>
                            <div className="text-right font-bold text-gray-400">Total:</div>
                            <div className="font-bold text-white">${editedInvoice.total?.toFixed(2) || '0.00'}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceModal;